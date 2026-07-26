import { recordAudit } from '../../core/audit/store';
import { daysToExpiry, maturityBand, normaliseText } from './format.js';

const STORAGE_KEY = 'cbc.insurance.module.v1';

function dateOffset(days) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function nowIso() {
  return new Date().toISOString();
}

function seedState() {
  const createdAt = nowIso();
  return {
    policies: [
      { policyId: 1, createdByEmployeeId: 'BNGL0171', createdBy: 'Shakir Khasru', acNo: 'CBC-2024-001', borrowerName: 'Mitali Trading Ltd.', unitCode: 'HQ', unitName: 'Head Office — Gulshan', policyNo: 'PIC/CBC/24001', company: 'Pioneer Insurance Company Ltd.', amount: 12500000, maturityDate: dateOffset(-8), status: 'Expired', createdAt, updatedAt: createdAt },
      { policyId: 2, createdByEmployeeId: 'BNGL0611', createdBy: 'Farhana Islam', acNo: 'CBC-2024-002', borrowerName: 'Greenfield Garments Ltd.', unitCode: 'HQ', unitName: 'Head Office — Gulshan', policyNo: 'GIC/FG/8852', company: 'Green Delta Insurance PLC', amount: 22000000, maturityDate: dateOffset(7), status: 'Active', createdAt, updatedAt: createdAt },
      { policyId: 3, createdByEmployeeId: 'BNGL0610', createdBy: 'Rakib Hasan', acNo: 'CBC-2025-013', borrowerName: 'Nahar Distribution', unitCode: 'GLSHN', unitName: 'Gulshan Branch', policyNo: 'PRG/55271', company: 'Pragati Insurance PLC', amount: 7800000, maturityDate: dateOffset(14), status: 'Active', createdAt, updatedAt: createdAt },
      { policyId: 4, createdByEmployeeId: 'BNGL0610', createdBy: 'Rakib Hasan', acNo: 'CBC-2025-019', borrowerName: 'Eastern Engineering', unitCode: 'GLSHN', unitName: 'Gulshan Branch', policyNo: 'RELI/99125', company: 'Reliance Insurance Limited', amount: 15600000, maturityDate: dateOffset(24), status: 'Active', createdAt, updatedAt: createdAt },
      { policyId: 5, createdByEmployeeId: 'BNGL0611', createdBy: 'Farhana Islam', acNo: 'CBC-2025-025', borrowerName: 'Delta Agro Foods', unitCode: 'HQ', unitName: 'Head Office — Gulshan', policyNo: 'GD/DAF/10081', company: 'Green Delta Insurance PLC', amount: 9300000, maturityDate: dateOffset(43), status: 'Active', createdAt, updatedAt: createdAt },
      { policyId: 6, createdByEmployeeId: 'BNGL0902', createdBy: 'Mahmudul Hasan', acNo: 'CBC-2025-031', borrowerName: 'Savar Packaging Industries', unitCode: 'DEPZ', unitName: 'DEPZ Branch', policyNo: 'PIC/DEPZ/9088', company: 'Pioneer Insurance Company Ltd.', amount: 18500000, maturityDate: dateOffset(91), status: 'Active', createdAt, updatedAt: createdAt },
      { policyId: 7, createdByEmployeeId: 'BNGL0901', createdBy: 'Samira Chowdhury', acNo: 'CBC-2024-077', borrowerName: 'Chattogram Steel Works', unitCode: 'CTG', unitName: 'Chattogram Branch', policyNo: 'PRG/CTG/7781', company: 'Pragati Insurance PLC', amount: 28000000, maturityDate: dateOffset(-32), status: 'Renewed', createdAt, updatedAt: createdAt },
      { policyId: 8, createdByEmployeeId: 'BNGL0610', createdBy: 'Rakib Hasan', acNo: 'CBC-2026-004', borrowerName: 'North Star Logistics', unitCode: 'GLSHN', unitName: 'Gulshan Branch', policyNo: 'RELI/NSL/2604', company: 'Reliance Insurance Limited', amount: 6400000, maturityDate: dateOffset(185), status: 'Active', createdAt, updatedAt: createdAt },
    ],
    followUps: [
      { followUpId: 'FU-0001', policyId: 2, acNo: 'CBC-2024-002', borrowerName: 'Greenfield Garments Ltd.', policyNo: 'GIC/FG/8852', unitCode: 'HQ', followUpDate: dateOffset(-1), type: 'Renewal', contactMode: 'Phone', summary: 'Borrower confirmed that renewed cover note will be submitted.', actionTaken: 'Requested scanned copy by email.', nextFollowUpDate: dateOffset(3), status: 'Pending', emailTo: 'kamrul.ahsan@combankbd.com', createdBy: 'Farhana Islam', createdByEmployeeId: 'BNGL0611', createdAt },
      { followUpId: 'FU-0002', policyId: 3, acNo: 'CBC-2025-013', borrowerName: 'Nahar Distribution', policyNo: 'PRG/55271', unitCode: 'GLSHN', followUpDate: dateOffset(-2), type: 'Reminder', contactMode: 'Email', summary: 'Renewal reminder sent to borrower.', actionTaken: 'Copied relationship manager.', nextFollowUpDate: dateOffset(4), status: 'Open', emailTo: 'nusrat.jahan@combankbd.com', createdBy: 'Rakib Hasan', createdByEmployeeId: 'BNGL0610', createdAt },
    ],
    users: [
      { rowId: 1, employeeId: 'BNGL0171', fullName: 'Shakir Khasru', email: 'shakir.khasru@combankbd.com', role: 'Admin', branchId: 'ALL', branchName: 'All Units', status: 'Active' },
      { rowId: 2, employeeId: 'BNGL0611', fullName: 'Farhana Islam', email: 'farhana.islam@combankbd.com', role: 'User', branchId: 'HQ', branchName: 'Head Office — Gulshan', status: 'Active' },
      { rowId: 3, employeeId: 'BNGL0610', fullName: 'Rakib Hasan', email: 'rakib.hasan@combankbd.com', role: 'User', branchId: 'GLSHN', branchName: 'Gulshan Branch', status: 'Active' },
      { rowId: 4, employeeId: 'BNGL0442', fullName: 'Nusrat Jahan', email: 'nusrat.jahan@combankbd.com', role: 'User', branchId: 'GLSHN', branchName: 'Gulshan Branch', status: 'Active' },
      { rowId: 5, employeeId: 'BNGL0333', fullName: 'Kamrul Ahsan', email: 'kamrul.ahsan@combankbd.com', role: 'User', branchId: 'HQ', branchName: 'Head Office — Gulshan', status: 'Active' },
      { rowId: 6, employeeId: 'BNGL0901', fullName: 'Samira Chowdhury', email: 'samira.chowdhury@combankbd.com', role: 'User', branchId: 'CTG', branchName: 'Chattogram Branch', status: 'Active' },
      { rowId: 7, employeeId: 'BNGL0902', fullName: 'Mahmudul Hasan', email: 'mahmudul.hasan@combankbd.com', role: 'User', branchId: 'DEPZ', branchName: 'DEPZ Branch', status: 'Active' },
    ],
    audit: [
      { auditId: 1, timestamp: createdAt, user: 'system', action: 'MODULE_INITIALISED', detail: 'Insurance Management Tracker demo data created.' },
    ],
    alerts: [],
    sequence: { policy: 9, followUp: 3, user: 8, audit: 2, alert: 1 },
  };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function migrateState(input) {
  const seed = seedState();
  const state = input && typeof input === 'object' ? input : {};
  let changed = false;

  for (const key of ['policies', 'followUps', 'users', 'audit', 'alerts']) {
    if (!Array.isArray(state[key])) {
      state[key] = clone(seed[key]);
      changed = true;
    }
  }

  if (!state.sequence || typeof state.sequence !== 'object') {
    state.sequence = clone(seed.sequence);
    changed = true;
  }

  const seedPolicyByAc = new Map(seed.policies.map((row) => [normaliseText(row.acNo), row]));
  const fallbackOwnerByUnit = {
    HQ: { employeeId: 'BNGL0611', displayName: 'Farhana Islam' },
    GLSHN: { employeeId: 'BNGL0610', displayName: 'Rakib Hasan' },
    CTG: { employeeId: 'BNGL0901', displayName: 'Samira Chowdhury' },
    DEPZ: { employeeId: 'BNGL0902', displayName: 'Mahmudul Hasan' },
  };

  state.policies = state.policies.map((policy) => {
    const seededPolicy = seedPolicyByAc.get(normaliseText(policy.acNo));
    const fallback = fallbackOwnerByUnit[policy.unitCode] || {
      employeeId: 'BNGL0171',
      displayName: 'Shakir Khasru',
    };
    const next = { ...policy };
    if (!next.createdByEmployeeId) {
      next.createdByEmployeeId = seededPolicy?.createdByEmployeeId || fallback.employeeId;
      changed = true;
    }
    if (!next.createdBy) {
      next.createdBy = seededPolicy?.createdBy || fallback.displayName;
      changed = true;
    }
    if (!next.createdAt) {
      next.createdAt = next.updatedAt || nowIso();
      changed = true;
    }
    if (!next.updatedAt) {
      next.updatedAt = next.createdAt;
      changed = true;
    }
    return next;
  });

  const policyById = new Map(state.policies.map((policy) => [Number(policy.policyId), policy]));
  state.followUps = state.followUps.map((followUp) => {
    const policy = policyById.get(Number(followUp.policyId));
    const next = { ...followUp };
    if (!next.createdByEmployeeId) {
      next.createdByEmployeeId = policy?.createdByEmployeeId || 'BNGL0171';
      changed = true;
    }
    if (!next.createdBy) {
      next.createdBy = policy?.createdBy || 'Shakir Khasru';
      changed = true;
    }
    if (!next.createdAt) {
      next.createdAt = nowIso();
      changed = true;
    }
    return next;
  });

  const maxima = {
    policy: Math.max(0, ...state.policies.map((row) => Number(row.policyId) || 0)) + 1,
    followUp: Math.max(0, ...state.followUps.map((row) => Number(String(row.followUpId || '').replace(/\D/g, '')) || 0)) + 1,
    user: Math.max(0, ...state.users.map((row) => Number(row.rowId) || 0)) + 1,
    audit: Math.max(0, ...state.audit.map((row) => Number(row.auditId) || 0)) + 1,
    alert: Math.max(0, ...state.alerts.map((row) => Number(row.alertId) || 0)) + 1,
  };
  for (const [key, value] of Object.entries(maxima)) {
    if (!Number.isFinite(Number(state.sequence[key])) || Number(state.sequence[key]) < value) {
      state.sequence[key] = value;
      changed = true;
    }
  }

  return { state, changed };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = seedState();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const { state, changed } = migrateState(JSON.parse(raw));
    if (changed) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return state;
  } catch {
    const seeded = seedState();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  return clone(state);
}

function addAudit(state, actor, action, detail, status = 'SUCCESS') {
  state.audit.unshift({
    auditId: state.sequence.audit++,
    timestamp: nowIso(),
    user: actor?.email || actor?.displayName || 'unknown',
    action,
    detail,
    status,
  });
  state.audit = state.audit.slice(0, 500);
  recordAudit({ moduleCode: 'ins', action, detail, status, actor });
}

export function resetDemoData(actor) {
  const seeded = seedState();
  const saved = saveState(seeded);
  recordAudit({ moduleCode: 'ins', action: 'DEMO_RESET', detail: 'Insurance demonstration data reset.', actor });
  return saved;
}

export function listUnits(state = loadState()) {
  const map = new Map();
  for (const user of state.users) {
    if (user.branchId && user.branchId !== 'ALL') map.set(user.branchId, user.branchName);
  }
  for (const policy of state.policies) map.set(policy.unitCode, policy.unitName);
  return [...map.entries()].map(([code, name]) => ({ code, name })).sort((a, b) => a.name.localeCompare(b.name));
}

export function addPolicy(payload, actor) {
  const state = loadState();
  const duplicate = state.policies.some((p) => normaliseText(p.acNo) === normaliseText(payload.acNo));
  if (duplicate) throw new Error('AC No already exists. Search for the existing policy or use a different AC No.');

  const policy = {
    policyId: state.sequence.policy++,
    acNo: payload.acNo.trim(),
    borrowerName: payload.borrowerName.trim(),
    unitCode: payload.unitCode,
    unitName: payload.unitName,
    policyNo: payload.policyNo?.trim() || '',
    company: payload.company.trim(),
    amount: Number(payload.amount),
    maturityDate: payload.maturityDate,
    status: payload.status || 'Active',
    createdAt: nowIso(),
    updatedAt: nowIso(),
    createdByEmployeeId: actor?.employeeId || '',
    createdBy: actor?.displayName || actor?.email || 'Unknown',
  };
  state.policies.unshift(policy);
  addAudit(state, actor, 'ADD_POLICY', `Added ${policy.acNo} for ${policy.borrowerName}.`);
  saveState(state);
  return clone(policy);
}

export function updatePolicy(policyId, payload, actor) {
  const state = loadState();
  const policy = state.policies.find((p) => p.policyId === Number(policyId));
  if (!policy) throw new Error('Policy not found.');
  Object.assign(policy, {
    borrowerName: payload.borrowerName.trim(),
    unitCode: payload.unitCode,
    unitName: payload.unitName,
    policyNo: payload.policyNo?.trim() || '',
    company: payload.company.trim(),
    amount: Number(payload.amount),
    maturityDate: payload.maturityDate,
    status: payload.status,
    updatedAt: nowIso(),
  });
  addAudit(state, actor, 'UPDATE', `Updated policy ${policy.acNo}.`);
  saveState(state);
  return clone(policy);
}

export function deletePolicy(policyId, actor) {
  const state = loadState();
  const index = state.policies.findIndex((p) => p.policyId === Number(policyId));
  if (index < 0) throw new Error('Policy not found.');
  const [removed] = state.policies.splice(index, 1);
  addAudit(state, actor, 'DELETE', `Deleted policy ${removed.acNo} (${removed.borrowerName}).`);
  saveState(state);
  return clone(removed);
}

export function addFollowUp(payload, actor) {
  const state = loadState();
  const policy = state.policies.find((p) => p.policyId === Number(payload.policyId));
  if (!policy) throw new Error('Policy not found.');
  const followUp = {
    followUpId: `FU-${String(state.sequence.followUp++).padStart(4, '0')}`,
    policyId: policy.policyId,
    acNo: policy.acNo,
    borrowerName: policy.borrowerName,
    policyNo: policy.policyNo,
    unitCode: policy.unitCode,
    followUpDate: payload.followUpDate,
    type: payload.type,
    contactMode: payload.contactMode,
    summary: payload.summary.trim(),
    actionTaken: payload.actionTaken?.trim() || '',
    nextFollowUpDate: payload.nextFollowUpDate || '',
    status: payload.status,
    emailTo: payload.emailTo || '',
    createdBy: actor?.displayName || actor?.email || 'Unknown',
    createdByEmployeeId: actor?.employeeId || '',
    createdAt: nowIso(),
  };
  state.followUps.unshift(followUp);
  addAudit(state, actor, 'FOLLOWUP', `Added ${followUp.followUpId} for ${policy.acNo}.`);
  saveState(state);
  return clone(followUp);
}

export function updateFollowUp(followUpId, payload, actor) {
  const state = loadState();
  const row = state.followUps.find((f) => f.followUpId === followUpId);
  if (!row) throw new Error('Follow-up not found.');
  Object.assign(row, {
    followUpDate: payload.followUpDate,
    type: payload.type,
    contactMode: payload.contactMode,
    summary: payload.summary.trim(),
    actionTaken: payload.actionTaken?.trim() || '',
    nextFollowUpDate: payload.nextFollowUpDate || '',
    status: payload.status,
    emailTo: payload.emailTo || '',
    updatedAt: nowIso(),
  });
  addAudit(state, actor, 'FOLLOWUP_UPDATE', `Updated ${row.followUpId} for ${row.acNo}.`);
  saveState(state);
  return clone(row);
}

export function deleteFollowUp(followUpId, actor) {
  const state = loadState();
  const index = state.followUps.findIndex((f) => f.followUpId === followUpId);
  if (index < 0) throw new Error('Follow-up not found.');
  const [row] = state.followUps.splice(index, 1);
  addAudit(state, actor, 'FOLLOWUP_DELETE', `Deleted ${row.followUpId} for ${row.acNo}.`);
  saveState(state);
  return clone(row);
}

export function addUser(payload, actor) {
  const state = loadState();
  const duplicate = state.users.some((u) =>
    normaliseText(u.employeeId) === normaliseText(payload.employeeId)
    && normaliseText(u.branchId) === normaliseText(payload.branchId));
  if (duplicate) throw new Error('This Employee ID and Branch/Unit combination already exists.');
  const user = {
    rowId: state.sequence.user++,
    employeeId: payload.employeeId.trim().toUpperCase(),
    fullName: payload.fullName.trim(),
    email: payload.email.trim().toLowerCase(),
    role: payload.role,
    branchId: payload.role === 'Admin' ? 'ALL' : payload.branchId,
    branchName: payload.role === 'Admin' ? 'All Units' : payload.branchName,
    status: payload.status,
  };
  state.users.push(user);
  addAudit(state, actor, 'USER_ADD', `Added ${user.employeeId} for ${user.branchName}.`);
  saveState(state);
  return clone(user);
}

export function updateUser(rowId, payload, actor) {
  const state = loadState();
  const user = state.users.find((u) => u.rowId === Number(rowId));
  if (!user) throw new Error('User row not found.');
  Object.assign(user, {
    fullName: payload.fullName.trim(),
    email: payload.email.trim().toLowerCase(),
    role: payload.role,
    branchId: payload.role === 'Admin' ? 'ALL' : payload.branchId,
    branchName: payload.role === 'Admin' ? 'All Units' : payload.branchName,
    status: payload.status,
  });
  addAudit(state, actor, 'USER_UPDATE', `Updated ${user.employeeId} for ${user.branchName}.`);
  saveState(state);
  return clone(user);
}

export function deleteUser(rowId, actor) {
  const state = loadState();
  const index = state.users.findIndex((u) => u.rowId === Number(rowId));
  if (index < 0) throw new Error('User row not found.');
  const user = state.users[index];
  if (normaliseText(user.employeeId) === normaliseText(actor?.employeeId)) {
    throw new Error('You cannot delete your own user row while signed in.');
  }
  state.users.splice(index, 1);
  addAudit(state, actor, 'USER_DELETE', `Deleted ${user.employeeId} access for ${user.branchName}.`);
  saveState(state);
  return clone(user);
}

export function previewAlerts(unitCode = 'ALL') {
  const state = loadState();
  const policies = state.policies.filter((p) => {
    const days = daysToExpiry(p.maturityDate);
    return days != null && days >= 0 && days <= 15 && p.status === 'Active'
      && (unitCode === 'ALL' || p.unitCode === unitCode);
  });
  const grouped = new Map();
  for (const policy of policies) {
    if (!grouped.has(policy.unitCode)) {
      const recipients = state.users.filter((u) => u.status === 'Active' && u.branchId === policy.unitCode);
      grouped.set(policy.unitCode, {
        unitCode: policy.unitCode,
        unitName: policy.unitName,
        policies: [],
        recipients,
      });
    }
    grouped.get(policy.unitCode).policies.push(policy);
  }
  const admins = state.users.filter((u) => u.status === 'Active' && u.role === 'Admin');
  return { units: [...grouped.values()], admins };
}

export function sendAlerts(selection, actor) {
  const state = loadState();
  const preview = previewAlerts('ALL');
  const selectedUnits = preview.units.filter((unit) => selection.unitCodes.includes(unit.unitCode));
  const recipientEmails = new Set(selection.recipients || []);
  const policyCount = selectedUnits.reduce((sum, unit) => sum + unit.policies.length, 0);
  const alert = {
    alertId: state.sequence.alert++,
    sentAt: nowIso(),
    sentBy: actor?.email || actor?.displayName || 'unknown',
    units: selectedUnits.map((u) => u.unitCode),
    recipients: [...recipientEmails],
    policyCount,
  };
  state.alerts.unshift(alert);
  addAudit(state, actor, 'EMAIL_ALERT', `Prepared expiry alert for ${selectedUnits.length} unit(s), ${recipientEmails.size} recipient(s), and ${policyCount} policy/policies.`);
  saveState(state);
  return clone(alert);
}

export function policyMetrics(policies) {
  const byBand = { EXPIRED: 0, DAYS_0_15: 0, DAYS_16_30: 0, DAYS_31_60: 0, LONG_TERM: 0 };
  let totalInsured = 0;
  for (const policy of policies) {
    totalInsured += Number(policy.amount) || 0;
    const band = maturityBand(policy.maturityDate).code;
    if (band in byBand) byBand[band] += 1;
  }
  return { totalPolicies: policies.length, totalInsured, ...byBand };
}
