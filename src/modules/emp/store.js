import { recordAudit } from '../../core/audit/store';

const STORAGE_KEY = 'cbc.portal.employee-directory.v1';

const seed = [
  { id: 1, bnglId: 'BNGL0171', systemId: 'BD0171', name: 'Shakir Khasru', designation: 'Senior Officer', branch: 'Head Office — Gulshan', department: 'Information Technology', reportingTo: 'Head of IT', email: 'shakir.khasru@combankbd.com', pabx: '2117', mobile: '01711000001' },
  { id: 2, bnglId: 'BNGL0611', systemId: 'BD0611', name: 'Farhana Islam', designation: 'Officer', branch: 'Head Office — Gulshan', department: 'Information Technology', reportingTo: 'Shakir Khasru', email: 'farhana.islam@combankbd.com', pabx: '2119', mobile: '01711000002' },
  { id: 3, bnglId: 'BNGL0442', systemId: 'BD0442', name: 'Nusrat Jahan', designation: 'Branch Manager', branch: 'Gulshan Branch', department: 'Branch Administration', reportingTo: 'Head of Branches', email: 'nusrat.jahan@combankbd.com', pabx: '3201', mobile: '01711000003' },
  { id: 4, bnglId: 'BNGL0610', systemId: 'BD0610', name: 'Rakib Hasan', designation: 'Officer', branch: 'Gulshan Branch', department: 'Operations', reportingTo: 'Nusrat Jahan', email: 'rakib.hasan@combankbd.com', pabx: '3214', mobile: '01711000004' },
];

function read() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(parsed?.employees)) return parsed;
  } catch { /* use seed */ }
  const initial = { employees: seed, sequence: seed.length + 1 };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

function save(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent('cbc:employee-directory-changed'));
}

function clean(payload) {
  return Object.fromEntries(Object.entries(payload).map(([key, value]) => [key, String(value ?? '').trim()]));
}

function validate(state, payload, currentId) {
  if (!payload.bnglId || !payload.systemId || !payload.name || !payload.designation || !payload.branch || !payload.department || !payload.email) {
    throw new Error('Complete all required employee fields.');
  }
  if (!/^BNGL[0-9A-Z-]+$/i.test(payload.bnglId)) throw new Error('BNGL ID must start with BNGL.');
  if (!/^BD[0-9A-Z-]+$/i.test(payload.systemId)) throw new Error('System ID must start with BD.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) throw new Error('Enter a valid email address.');
  const duplicate = (field) => state.employees.some((row) => row.id !== currentId && row[field].toLowerCase() === payload[field].toLowerCase());
  if (duplicate('bnglId')) throw new Error('BNGL ID already exists.');
  if (duplicate('systemId')) throw new Error('System ID already exists.');
  if (duplicate('email')) throw new Error('Email address already exists.');
}

export function listEmployees() {
  return read().employees.map((row) => ({ ...row }));
}

export function addEmployee(payload, actor) {
  const state = read();
  const values = clean(payload);
  values.bnglId = values.bnglId.toUpperCase();
  values.systemId = values.systemId.toUpperCase();
  validate(state, values);
  const row = { id: state.sequence++, ...values };
  state.employees.push(row);
  save(state);
  recordAudit({ moduleCode: 'emp', action: 'EMPLOYEE_ADD', detail: `Added employee ${row.bnglId} — ${row.name}.`, actor });
  return { ...row };
}

export function updateEmployee(id, payload, actor) {
  const state = read();
  const row = state.employees.find((item) => item.id === Number(id));
  if (!row) throw new Error('Employee not found.');
  const values = clean(payload);
  values.bnglId = values.bnglId.toUpperCase();
  values.systemId = values.systemId.toUpperCase();
  validate(state, values, row.id);
  Object.assign(row, values);
  save(state);
  recordAudit({ moduleCode: 'emp', action: 'EMPLOYEE_UPDATE', detail: `Updated employee ${row.bnglId} — ${row.name}.`, actor });
  return { ...row };
}

export function deleteEmployee(id, actor) {
  const state = read();
  const index = state.employees.findIndex((item) => item.id === Number(id));
  if (index < 0) throw new Error('Employee not found.');
  const [row] = state.employees.splice(index, 1);
  save(state);
  recordAudit({ moduleCode: 'emp', action: 'EMPLOYEE_DELETE', detail: `Deleted employee ${row.bnglId} — ${row.name}.`, actor });
}
