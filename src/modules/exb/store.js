import { recordAudit } from '../../core/audit/store';

const STORAGE_KEY = 'cbc.portal.eximbill-roster.v1';
const DEFAULT_MEMBERS = [
  { id: 1, name: 'S.M. Shahriar Rahman Maruph', systemId: 'BD6653', designation: 'Trainee Officer', group: 'PRIMARY', username: 'maruph', active: true },
  { id: 2, name: 'Raiyan Ahmed', systemId: 'BD6654', designation: 'Trainee Officer', group: 'PRIMARY', username: 'raiyan.ahmed', active: true },
  { id: 3, name: 'Jahidul Balat', systemId: '', designation: 'Senior Officer', group: 'PARTNER', username: 'jahidul.balat', active: true },
  { id: 4, name: 'Supriya Das Gupta', systemId: '', designation: 'Senior Officer', group: 'PARTNER', username: 'supriya.dasgupta', active: true },
  { id: 5, name: 'Sifat Nur Billah', systemId: 'BD0654', designation: 'Senior Officer', group: 'PARTNER', username: 'sifat.nur', active: true },
  { id: 6, name: 'Shah Mohammad Al Noor', systemId: 'BD6619', designation: 'Officer', group: 'PARTNER', username: 'al.noor', active: true },
  { id: 7, name: 'Abu Bakar Siddiq', systemId: 'BD0608', designation: 'Officer', group: 'PARTNER', username: 'abu.bakar', active: true },
];

function initialState() {
  return { members: DEFAULT_MEMBERS, overrides: {}, completions: {}, sequence: 8, supportAvailable: true };
}

function read() {
  try {
    const state = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(state?.members)) return state;
  } catch { /* use defaults */ }
  const state = initialState();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  return state;
}

function save(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent('cbc:eximbill-roster-changed'));
}

export const monthKey = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
export const dateKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
export const parseMonth = (value) => { const [year, month] = value.split('-').map(Number); return new Date(year, month - 1, 1); };
export const monthLabel = (value) => parseMonth(value).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

export function loadRosterState() {
  const state = read();
  if (typeof state.supportAvailable !== 'boolean') state.supportAvailable = true;
  return structuredClone(state);
}

export function setSupportAvailability(available, actor) {
  const state = read();
  state.supportAvailable = Boolean(available);
  state.supportAvailabilityUpdatedAt = new Date().toISOString();
  state.supportAvailabilityUpdatedBy = actor?.displayName || actor?.samAccountName || 'IT team';
  save(state);
  recordAudit({
    moduleCode: 'exb',
    action: 'IT_SUPPORT_AVAILABILITY',
    detail: `IT support marked ${state.supportAvailable ? 'available' : 'unavailable'}.`,
    actor,
  });
}

export function generateMonth(value) {
  const state = read();
  const base = parseMonth(value);
  const year = base.getFullYear();
  const month = base.getMonth();
  const monthIndex = (year - 2026) * 12 + month;
  const primaries = state.members.filter((member) => member.active && member.group === 'PRIMARY');
  const partners = state.members.filter((member) => member.active && member.group === 'PARTNER');
  const days = new Date(year, month + 1, 0).getDate();
  const indexAt = (valueToWrap, length) => ((valueToWrap % length) + length) % length;
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(year, month, index + 1);
    const key = dateKey(date);
    const generated = [
      primaries.length ? primaries[indexAt(index + monthIndex, primaries.length)]?.id : null,
      partners.length ? partners[indexAt(index + monthIndex, partners.length)]?.id : null,
    ].filter(Boolean);
    const memberIds = state.overrides[key]?.memberIds || generated;
    return {
      date: key, day: index + 1, isWeekend: [5, 6].includes(date.getDay()),
      memberIds, members: memberIds.map((id) => state.members.find((member) => member.id === id)).filter(Boolean),
      override: state.overrides[key] || null, completions: state.completions[key] || [],
    };
  });
}

export function replaceDuty(date, memberIds, note, actor) {
  const state = read();
  state.overrides[date] = { memberIds: memberIds.map(Number), note: String(note || '').trim(), updatedAt: new Date().toISOString(), updatedBy: actor?.displayName || actor?.samAccountName || 'Roster manager' };
  save(state);
  recordAudit({ moduleCode: 'exb', action: 'ROSTER_OVERRIDE', detail: `Changed EximBill duty for ${date}. ${note || ''}`.trim(), actor });
}

export function completeDuty(date, memberId, actor) {
  const state = read();
  const member = state.members.find((item) => item.id === Number(memberId));
  if (!member) throw new Error('Roster member not found.');
  const assignment = generateMonth(date.slice(0, 7)).find((item) => item.date === date);
  if (!assignment?.memberIds.includes(member.id)) throw new Error('This employee is not assigned on the selected date.');
  state.completions[date] ||= [];
  if (state.completions[date].some((item) => item.memberId === member.id)) throw new Error('Departure time is already recorded.');
  const completedAt = new Date().toISOString();
  state.completions[date].push({ memberId: member.id, completedAt, recordedBy: actor?.displayName || actor?.samAccountName || member.name });
  save(state);
  recordAudit({ moduleCode: 'exb', action: 'DUTY_COMPLETE', detail: `${member.name} completed EximBill processing for ${date} at ${new Date(completedAt).toLocaleTimeString()}.`, actor });
}

export function addMember(payload, actor) {
  const state = read();
  const row = {
    id: state.sequence++, name: String(payload.name || '').trim(), systemId: String(payload.systemId || '').trim().toUpperCase(),
    designation: String(payload.designation || '').trim(), username: String(payload.username || '').trim().toLowerCase(),
    group: payload.group === 'PRIMARY' ? 'PRIMARY' : 'PARTNER', active: true,
  };
  if (!row.name || !row.designation) throw new Error('Name and designation are required.');
  state.members.push(row); save(state);
  recordAudit({ moduleCode: 'exb', action: 'ROSTER_MEMBER_ADD', detail: `Added ${row.name} to the EximBill roster.`, actor });
}

export function updateMember(id, payload, actor) {
  const state = read();
  const row = state.members.find((item) => item.id === Number(id));
  if (!row) throw new Error('Roster member not found.');
  Object.assign(row, {
    name: String(payload.name || '').trim(), systemId: String(payload.systemId || '').trim().toUpperCase(),
    designation: String(payload.designation || '').trim(), username: String(payload.username || '').trim().toLowerCase(),
    group: payload.group === 'PRIMARY' ? 'PRIMARY' : 'PARTNER', active: payload.active !== false,
  });
  if (!row.name || !row.designation) throw new Error('Name and designation are required.');
  save(state);
  recordAudit({ moduleCode: 'exb', action: 'ROSTER_MEMBER_UPDATE', detail: `Updated roster member ${row.name}.`, actor });
}

export function removeMember(id, actor) {
  const state = read();
  const row = state.members.find((item) => item.id === Number(id));
  if (!row) throw new Error('Roster member not found.');
  row.active = false; save(state);
  recordAudit({ moduleCode: 'exb', action: 'ROSTER_MEMBER_REMOVE', detail: `Removed ${row.name} from future EximBill duties.`, actor });
}

export function matchesActor(member, actor) {
  const values = [actor?.samAccountName, actor?.employeeId, actor?.displayName].filter(Boolean).map((value) => String(value).toLowerCase());
  return values.includes(member.username.toLowerCase()) || (member.systemId && values.includes(member.systemId.toLowerCase())) || values.includes(member.name.toLowerCase());
}

export function rollingTwelveMonths(reference = new Date()) {
  return Array.from({ length: 12 }, (_, offset) => {
    const date = new Date(reference.getFullYear(), reference.getMonth() - 11 + offset, 1);
    return monthKey(date);
  });
}
