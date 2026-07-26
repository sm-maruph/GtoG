import { recordAudit } from '../audit/store';

const STORAGE_KEY = 'cbc.portal.access.v3';

export const MODULE_DEFINITIONS = [
  { moduleId: 1, code: 'ins', name: 'Insurance Management Tracker', icon: 'clipboard-list', routePath: '/insurance', sortOrder: 10 },
  { moduleId: 2, code: 'vbs', name: 'Vehicle Booking System', icon: 'car', routePath: '/vehicle-booking', sortOrder: 20 },
  { moduleId: 3, code: 'inv', name: 'Stationery Inventory Management', icon: 'boxes', routePath: '/inventory', sortOrder: 30 },
  { moduleId: 4, code: 'utl', name: 'Utility Tracker', icon: 'gauge', routePath: '/utility', sortOrder: 40 },
  { moduleId: 5, code: 'ppr', name: 'Paper Usage Tracker', icon: 'file-stack', routePath: '/paper-tracker', sortOrder: 50 },
  { moduleId: 99, code: 'adm', name: 'Super Admin Portal', icon: 'shield-check', routePath: '/super-admin', sortOrder: 99 },
];

export const PERMISSION_DEFINITIONS = [
  { module: 'ins', code: 'ins.policy.create', label: 'Create policies' },
  { module: 'ins', code: 'ins.policy.view', label: 'View policies' },
  { module: 'ins', code: 'ins.policy.edit', label: 'Edit policies' },
  { module: 'ins', code: 'ins.policy.delete', label: 'Delete policies' },
  { module: 'ins', code: 'ins.followup.create', label: 'Create follow-ups' },
  { module: 'ins', code: 'ins.followup.edit', label: 'Edit follow-ups' },
  { module: 'ins', code: 'ins.followup.delete', label: 'Delete follow-ups' },
  { module: 'ins', code: 'ins.stats.view', label: 'View insurance analytics' },
  { module: 'ins', code: 'ins.alert.send', label: 'Send expiry alerts' },
  { module: 'ins', code: 'ins.user.manage', label: 'Manage insurance users' },
  { module: 'ins', code: 'ins.audit.view', label: 'View audit log' },

  { module: 'vbs', code: 'vbs.request.create', label: 'Create vehicle requests' },
  { module: 'vbs', code: 'vbs.request.view', label: 'View vehicle requests' },
  { module: 'vbs', code: 'vbs.request.cancel', label: 'Cancel own requests' },
  { module: 'vbs', code: 'vbs.request.approve', label: 'Approve requests' },
  { module: 'vbs', code: 'vbs.request.reject', label: 'Reject requests' },
  { module: 'vbs', code: 'vbs.assign.create', label: 'Assign vehicle and driver' },
  { module: 'vbs', code: 'vbs.assign.cancel', label: 'Cancel assignments' },
  { module: 'vbs', code: 'vbs.vehicle.view', label: 'View fleet' },
  { module: 'vbs', code: 'vbs.vehicle.manage', label: 'Manage vehicles' },
  { module: 'vbs', code: 'vbs.driver.view', label: 'View drivers' },
  { module: 'vbs', code: 'vbs.driver.manage', label: 'Manage drivers' },
  { module: 'vbs', code: 'vbs.report.view', label: 'View vehicle reports' },

  { module: 'inv', code: 'inv.requisition.create', label: 'Create requisitions' },
  { module: 'inv', code: 'inv.requisition.view', label: 'View requisitions' },
  { module: 'inv', code: 'inv.requisition.edit', label: 'Edit requisitions' },
  { module: 'inv', code: 'inv.requisition.submit', label: 'Submit requisitions' },
  { module: 'inv', code: 'inv.requisition.cancel', label: 'Cancel requisitions' },
  { module: 'inv', code: 'inv.requisition.approve', label: 'Approve requisitions' },
  { module: 'inv', code: 'inv.requisition.return', label: 'Return requisitions' },
  { module: 'inv', code: 'inv.requisition.reject', label: 'Reject requisitions' },
  { module: 'inv', code: 'inv.requisition.issue', label: 'Issue stationery' },
  { module: 'inv', code: 'inv.requisition.decline', label: 'Decline requisitions' },
  { module: 'inv', code: 'inv.item.view', label: 'View stationery items' },
  { module: 'inv', code: 'inv.item.manage', label: 'Manage stationery items' },
  { module: 'inv', code: 'inv.stock.view', label: 'View stock' },
  { module: 'inv', code: 'inv.stock.manage', label: 'Manage stock' },
  { module: 'inv', code: 'inv.report.view', label: 'View inventory reports' },

  { module: 'utl', code: 'utl.dashboard.view', label: 'View utility dashboard' },
  { module: 'utl', code: 'utl.record.view', label: 'View utility records' },
  { module: 'utl', code: 'utl.record.create', label: 'Create utility records' },
  { module: 'utl', code: 'utl.record.edit', label: 'Edit utility records' },
  { module: 'utl', code: 'utl.record.delete', label: 'Delete utility records' },
  { module: 'utl', code: 'utl.report.view', label: 'View utility reports' },
  { module: 'utl', code: 'utl.user.manage', label: 'Manage utility users' },
  { module: 'utl', code: 'utl.audit.view', label: 'View utility audit' },

  { module: 'ppr', code: 'ppr.entry.create', label: 'Create paper usage entries' },
  { module: 'ppr', code: 'ppr.entry.view', label: 'View paper usage entries' },
  { module: 'ppr', code: 'ppr.entry.edit', label: 'Edit paper usage entries' },
  { module: 'ppr', code: 'ppr.entry.delete', label: 'Delete paper usage entries' },
  { module: 'ppr', code: 'ppr.report.view', label: 'Generate paper reports' },
  { module: 'ppr', code: 'ppr.master.manage', label: 'Manage paper types and printers' },
  { module: 'ppr', code: 'ppr.audit.view', label: 'View paper tracker audit' },

  { module: 'adm', code: 'adm.directory.manage', label: 'Manage branches and departments' },
  { module: 'adm', code: 'adm.role.manage', label: 'Manage roles' },
  { module: 'adm', code: 'adm.user.manage', label: 'Manage portal users' },
  { module: 'adm', code: 'adm.access.manage', label: 'Assign granular access' },
  { module: 'adm', code: 'adm.audit.view', label: 'View global audit log' },
];

const P = (code, scopeType = 'SELF') => ({ code, scopeType });

function seedState() {
  const branches = [
    { branchId: 1, code: 'HQ', name: 'Head Office — Gulshan', type: 'HEAD_OFFICE', status: 'ACTIVE' },
    { branchId: 2, code: 'GLSHN', name: 'Gulshan Branch', type: 'BRANCH', status: 'ACTIVE' },
    { branchId: 3, code: 'CTG', name: 'Chattogram Branch', type: 'BRANCH', status: 'ACTIVE' },
    { branchId: 4, code: 'DEPZ', name: 'DEPZ Branch', type: 'BRANCH', status: 'ACTIVE' },
  ];
  const departments = [
    { deptId: 1, code: 'IT', name: 'Information Technology', branchId: 1, status: 'ACTIVE' },
    { deptId: 2, code: 'PROC', name: 'Procurement', branchId: 1, status: 'ACTIVE' },
    { deptId: 3, code: 'OPS-HQ', name: 'Operations', branchId: 1, status: 'ACTIVE' },
    { deptId: 4, code: 'OPS-GL', name: 'Operations', branchId: 2, status: 'ACTIVE' },
    { deptId: 5, code: 'GB-ADM', name: 'Branch Administration', branchId: 2, status: 'ACTIVE' },
  ];

  const employeeBase = [
    P('ins.policy.create'), P('ins.policy.view'), P('ins.policy.edit'), P('ins.followup.create'), P('ins.stats.view'),
    P('vbs.request.create'), P('vbs.request.view'), P('vbs.request.cancel'),
    P('inv.requisition.create'), P('inv.requisition.view'), P('inv.requisition.edit'), P('inv.requisition.submit'), P('inv.requisition.cancel'), P('inv.item.view', 'GLOBAL'),
    P('utl.dashboard.view', 'BRANCH'), P('utl.record.view', 'BRANCH'), P('utl.record.create', 'BRANCH'),
    P('ppr.entry.create'), P('ppr.entry.view'),
  ];

  const roles = [
    { roleId: 1, code: 'EMPLOYEE', name: 'Employee', description: 'Create and view own operational records.', isSystem: true, permissions: employeeBase },
    { roleId: 2, code: 'BRANCH_MANAGER', name: 'Branch Manager', description: 'Approve and view records in the assigned branch.', isSystem: true, permissions: [
      ...employeeBase,
      P('vbs.request.view', 'BRANCH'), P('vbs.request.approve', 'BRANCH'), P('vbs.request.reject', 'BRANCH'),
      P('inv.requisition.view', 'BRANCH'), P('inv.requisition.approve', 'BRANCH'), P('inv.requisition.return', 'BRANCH'), P('inv.requisition.reject', 'BRANCH'),
      P('ppr.entry.view', 'BRANCH'), P('ppr.report.view', 'BRANCH'),
    ] },
    { roleId: 3, code: 'DEPT_HEAD', name: 'Department Head', description: 'Approve and view records in the assigned department.', isSystem: true, permissions: [
      ...employeeBase,
      P('vbs.request.view', 'DEPT'), P('vbs.request.approve', 'DEPT'), P('vbs.request.reject', 'DEPT'),
      P('inv.requisition.view', 'DEPT'), P('inv.requisition.approve', 'DEPT'), P('inv.requisition.return', 'DEPT'), P('inv.requisition.reject', 'DEPT'),
      P('ppr.entry.view', 'DEPT'), P('ppr.report.view', 'DEPT'),
    ] },
    { roleId: 4, code: 'PROCUREMENT_ADMIN', name: 'Procurement Administrator', description: 'Global procurement, fleet, stock, and reporting access.', isSystem: true, permissions: [
      P('ins.policy.create', 'GLOBAL'), P('ins.policy.view', 'GLOBAL'), P('ins.policy.edit', 'GLOBAL'), P('ins.policy.delete', 'GLOBAL'),
      P('ins.followup.create', 'GLOBAL'), P('ins.followup.edit', 'GLOBAL'), P('ins.followup.delete', 'GLOBAL'), P('ins.stats.view', 'GLOBAL'), P('ins.alert.send', 'GLOBAL'), P('ins.user.manage', 'GLOBAL'), P('ins.audit.view', 'GLOBAL'),
      P('vbs.request.create'), P('vbs.request.view', 'GLOBAL'), P('vbs.assign.create', 'GLOBAL'), P('vbs.assign.cancel', 'GLOBAL'), P('vbs.vehicle.view', 'GLOBAL'), P('vbs.vehicle.manage', 'GLOBAL'), P('vbs.driver.view', 'GLOBAL'), P('vbs.driver.manage', 'GLOBAL'), P('vbs.report.view', 'GLOBAL'),
      P('inv.requisition.create'), P('inv.requisition.view', 'GLOBAL'), P('inv.requisition.issue', 'GLOBAL'), P('inv.requisition.decline', 'GLOBAL'), P('inv.item.view', 'GLOBAL'), P('inv.item.manage', 'GLOBAL'), P('inv.stock.view', 'GLOBAL'), P('inv.stock.manage', 'GLOBAL'), P('inv.report.view', 'GLOBAL'),
      P('utl.dashboard.view', 'GLOBAL'), P('utl.record.view', 'GLOBAL'), P('utl.record.create', 'GLOBAL'), P('utl.record.edit', 'GLOBAL'), P('utl.record.delete', 'GLOBAL'), P('utl.report.view', 'GLOBAL'), P('utl.user.manage', 'GLOBAL'), P('utl.audit.view', 'GLOBAL'),
      P('ppr.entry.create', 'GLOBAL'), P('ppr.entry.view', 'GLOBAL'), P('ppr.entry.edit', 'GLOBAL'), P('ppr.entry.delete', 'GLOBAL'), P('ppr.report.view', 'GLOBAL'), P('ppr.master.manage', 'GLOBAL'), P('ppr.audit.view', 'GLOBAL'),
    ] },
    { roleId: 5, code: 'INSURANCE_SELF_SERVICE', name: 'Insurance Self Service', description: 'Create insurance records and view only own records.', isSystem: false, permissions: [P('ins.policy.create'), P('ins.policy.view'), P('ins.followup.create')] },
  ];

  const users = [
    { userId: 1, username: 'shakir.khasru', password: 'demo', displayName: 'Shakir Khasru', email: 'shakir.khasru@combankbd.com', employeeId: 'BNGL0171', branchId: 1, deptId: 1, status: 'ACTIVE', isSuperAdmin: true, roleIds: [], directPermissions: [] },
    { userId: 2, username: 'branch.user', password: 'demo', displayName: 'Rakib Hasan', email: 'rakib.hasan@combankbd.com', employeeId: 'BNGL0610', branchId: 2, deptId: 4, status: 'ACTIVE', isSuperAdmin: false, roleIds: [1], directPermissions: [] },
    { userId: 3, username: 'branch.manager', password: 'demo', displayName: 'Nusrat Jahan', email: 'nusrat.jahan@combankbd.com', employeeId: 'BNGL0442', branchId: 2, deptId: 5, status: 'ACTIVE', isSuperAdmin: false, roleIds: [2], directPermissions: [] },
    { userId: 4, username: 'dept.user', password: 'demo', displayName: 'Farhana Islam', email: 'farhana.islam@combankbd.com', employeeId: 'BNGL0611', branchId: 1, deptId: 1, status: 'ACTIVE', isSuperAdmin: false, roleIds: [1], directPermissions: [] },
    { userId: 5, username: 'dept.head', password: 'demo', displayName: 'Kamrul Ahsan', email: 'kamrul.ahsan@combankbd.com', employeeId: 'BNGL0333', branchId: 1, deptId: 1, status: 'ACTIVE', isSuperAdmin: false, roleIds: [3], directPermissions: [] },
    { userId: 6, username: 'procurement.admin', password: 'demo', displayName: 'Tanzila Rahman', email: 'tanzila.rahman@combankbd.com', employeeId: 'BNGL0444', branchId: 1, deptId: 2, status: 'ACTIVE', isSuperAdmin: false, roleIds: [4], directPermissions: [] },
  ];

  return { branches, departments, roles, users, sequence: { branch: 5, dept: 6, role: 6, user: 7 } };
}

function clone(value) { return JSON.parse(JSON.stringify(value)); }
function loadRaw() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = seedState();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw);
  } catch {
    const seeded = seedState();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
}
function saveRaw(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent('cbc:access-changed'));
  return clone(state);
}

export function loadAccessState() { return clone(loadRaw()); }
export function resetAccessState(actor) {
  const seeded = seedState();
  saveRaw(seeded);
  recordAudit({ moduleCode: 'adm', action: 'ACCESS_RESET', detail: 'Portal access directory reset to demonstration defaults.', actor });
  return clone(seeded);
}

function branchOf(state, id) { return state.branches.find((x) => x.branchId === Number(id)) ?? null; }
function deptOf(state, id) { return state.departments.find((x) => x.deptId === Number(id)) ?? null; }

function normalizePermission(permission, user) {
  const scopeType = permission.scopeType || 'SELF';
  return {
    scopeType,
    branchIds: permission.branchIds?.length ? permission.branchIds.map(Number) : (scopeType === 'BRANCH' && user.branchId ? [Number(user.branchId)] : []),
    deptIds: permission.deptIds?.length ? permission.deptIds.map(Number) : (scopeType === 'DEPT' && user.deptId ? [Number(user.deptId)] : []),
  };
}

export function resolveManagedUser(username) {
  const state = loadRaw();
  const user = state.users.find((x) => x.username.toLowerCase() === String(username ?? '').toLowerCase());
  if (!user || user.status !== 'ACTIVE') return null;
  const branch = branchOf(state, user.branchId);
  const dept = deptOf(state, user.deptId);
  const assignedRoles = state.roles.filter((role) => user.roleIds.includes(role.roleId));
  const permissionMap = new Map();
  for (const role of assignedRoles) {
    for (const permission of role.permissions ?? []) permissionMap.set(permission.code, normalizePermission(permission, user));
  }
  for (const permission of user.directPermissions ?? []) {
    if (permission.allowed === false) permissionMap.delete(permission.code);
    else permissionMap.set(permission.code, normalizePermission(permission, user));
  }
  if (user.isSuperAdmin) {
    for (const def of PERMISSION_DEFINITIONS) permissionMap.set(def.code, { scopeType: 'GLOBAL', branchIds: [], deptIds: [] });
  }
  const moduleCodes = new Set([...permissionMap.keys()].map((code) => code.split('.')[0]));
  if (user.isSuperAdmin) moduleCodes.add('adm');
  const modules = MODULE_DEFINITIONS.filter((module) => moduleCodes.has(module.code));
  return {
    password: user.password,
    me: {
      user: {
        userId: user.userId,
        samAccountName: user.username,
        displayName: user.displayName,
        email: user.email,
        employeeId: user.employeeId,
        branch: branch ? { branchId: branch.branchId, code: branch.code, name: branch.name } : null,
        dept: dept ? { deptId: dept.deptId, code: dept.code, name: dept.name } : null,
      },
      roles: user.isSuperAdmin ? ['SUPER_ADMIN'] : assignedRoles.map((r) => r.code),
      isSuperAdmin: Boolean(user.isSuperAdmin),
      modules,
      permissions: Object.fromEntries(permissionMap.entries()),
    },
  };
}

export function addBranch(payload, actor) {
  const state = loadRaw();
  if (state.branches.some((x) => x.code.toLowerCase() === payload.code.trim().toLowerCase())) throw new Error('Branch code already exists.');
  const row = { branchId: state.sequence.branch++, code: payload.code.trim().toUpperCase(), name: payload.name.trim(), type: payload.type || 'BRANCH', status: payload.status || 'ACTIVE' };
  state.branches.push(row); saveRaw(state);
  recordAudit({ moduleCode: 'adm', action: 'BRANCH_ADD', detail: `Added branch ${row.code} — ${row.name}.`, actor });
  return clone(row);
}
export function updateBranch(id, payload, actor) {
  const state = loadRaw(); const row = state.branches.find((x) => x.branchId === Number(id)); if (!row) throw new Error('Branch not found.');
  Object.assign(row, { code: payload.code.trim().toUpperCase(), name: payload.name.trim(), type: payload.type, status: payload.status }); saveRaw(state);
  recordAudit({ moduleCode: 'adm', action: 'BRANCH_UPDATE', detail: `Updated branch ${row.code}.`, actor }); return clone(row);
}
export function deleteBranch(id, actor) {
  const state = loadRaw();
  if (state.users.some((x) => x.branchId === Number(id)) || state.departments.some((x) => x.branchId === Number(id))) throw new Error('Remove assigned users and departments before deleting this branch.');
  const index = state.branches.findIndex((x) => x.branchId === Number(id)); if (index < 0) throw new Error('Branch not found.'); const [row] = state.branches.splice(index, 1); saveRaw(state);
  recordAudit({ moduleCode: 'adm', action: 'BRANCH_DELETE', detail: `Deleted branch ${row.code}.`, actor }); return clone(row);
}

export function addDepartment(payload, actor) {
  const state = loadRaw();
  const row = { deptId: state.sequence.dept++, code: payload.code.trim().toUpperCase(), name: payload.name.trim(), branchId: Number(payload.branchId), status: payload.status || 'ACTIVE' };
  state.departments.push(row); saveRaw(state); recordAudit({ moduleCode: 'adm', action: 'DEPARTMENT_ADD', detail: `Added department ${row.code} — ${row.name}.`, actor }); return clone(row);
}
export function updateDepartment(id, payload, actor) {
  const state = loadRaw(); const row = state.departments.find((x) => x.deptId === Number(id)); if (!row) throw new Error('Department not found.'); Object.assign(row, { code: payload.code.trim().toUpperCase(), name: payload.name.trim(), branchId: Number(payload.branchId), status: payload.status }); saveRaw(state); recordAudit({ moduleCode: 'adm', action: 'DEPARTMENT_UPDATE', detail: `Updated department ${row.code}.`, actor }); return clone(row);
}
export function deleteDepartment(id, actor) {
  const state = loadRaw(); if (state.users.some((x) => x.deptId === Number(id))) throw new Error('Remove assigned users before deleting this department.'); const index = state.departments.findIndex((x) => x.deptId === Number(id)); if (index < 0) throw new Error('Department not found.'); const [row] = state.departments.splice(index, 1); saveRaw(state); recordAudit({ moduleCode: 'adm', action: 'DEPARTMENT_DELETE', detail: `Deleted department ${row.code}.`, actor }); return clone(row);
}

export function addRole(payload, actor) {
  const state = loadRaw(); if (state.roles.some((x) => x.code.toLowerCase() === payload.code.trim().toLowerCase())) throw new Error('Role code already exists.'); const row = { roleId: state.sequence.role++, code: payload.code.trim().toUpperCase(), name: payload.name.trim(), description: payload.description?.trim() || '', isSystem: false, permissions: payload.permissions ?? [] }; state.roles.push(row); saveRaw(state); recordAudit({ moduleCode: 'adm', action: 'ROLE_ADD', detail: `Added role ${row.code}.`, actor }); return clone(row);
}
export function updateRole(id, payload, actor) {
  const state = loadRaw(); const row = state.roles.find((x) => x.roleId === Number(id)); if (!row) throw new Error('Role not found.'); Object.assign(row, { name: payload.name.trim(), description: payload.description?.trim() || '', permissions: payload.permissions ?? [] }); saveRaw(state); recordAudit({ moduleCode: 'adm', action: 'ROLE_UPDATE', detail: `Updated role ${row.code} with ${row.permissions.length} permission(s).`, actor }); return clone(row);
}
export function deleteRole(id, actor) {
  const state = loadRaw(); const row = state.roles.find((x) => x.roleId === Number(id)); if (!row) throw new Error('Role not found.'); if (row.isSystem) throw new Error('System roles cannot be deleted.'); if (state.users.some((x) => x.roleIds.includes(row.roleId))) throw new Error('Remove this role from users before deleting it.'); state.roles = state.roles.filter((x) => x.roleId !== row.roleId); saveRaw(state); recordAudit({ moduleCode: 'adm', action: 'ROLE_DELETE', detail: `Deleted role ${row.code}.`, actor }); return clone(row);
}

export function addUser(payload, actor) {
  const state = loadRaw(); if (state.users.some((x) => x.username.toLowerCase() === payload.username.trim().toLowerCase())) throw new Error('Username already exists.');
  const row = { userId: state.sequence.user++, username: payload.username.trim().toLowerCase(), password: payload.password || 'demo', displayName: payload.displayName.trim(), email: payload.email.trim().toLowerCase(), employeeId: payload.employeeId.trim().toUpperCase(), branchId: payload.branchId ? Number(payload.branchId) : null, deptId: payload.deptId ? Number(payload.deptId) : null, status: payload.status || 'ACTIVE', isSuperAdmin: Boolean(payload.isSuperAdmin), roleIds: (payload.roleIds ?? []).map(Number), directPermissions: payload.directPermissions ?? [] };
  state.users.push(row); saveRaw(state); recordAudit({ moduleCode: 'adm', action: 'PORTAL_USER_ADD', detail: `Added portal user ${row.username}.`, actor }); return clone(row);
}
export function updateUser(id, payload, actor) {
  const state = loadRaw(); const row = state.users.find((x) => x.userId === Number(id)); if (!row) throw new Error('User not found.');
  Object.assign(row, { displayName: payload.displayName.trim(), email: payload.email.trim().toLowerCase(), employeeId: payload.employeeId.trim().toUpperCase(), branchId: payload.branchId ? Number(payload.branchId) : null, deptId: payload.deptId ? Number(payload.deptId) : null, status: payload.status, isSuperAdmin: Boolean(payload.isSuperAdmin), roleIds: (payload.roleIds ?? []).map(Number) }); if (payload.password) row.password = payload.password; saveRaw(state); recordAudit({ moduleCode: 'adm', action: 'PORTAL_USER_UPDATE', detail: `Updated portal user ${row.username}.`, actor }); return clone(row);
}
export function updateUserPermissions(id, directPermissions, actor) {
  const state = loadRaw(); const row = state.users.find((x) => x.userId === Number(id)); if (!row) throw new Error('User not found.'); row.directPermissions = directPermissions; saveRaw(state); recordAudit({ moduleCode: 'adm', action: 'ACCESS_ASSIGN', detail: `Updated granular access for ${row.username}: ${directPermissions.filter((x) => x.allowed !== false).length} direct permission(s).`, actor }); return clone(row);
}
export function deleteUser(id, actor) {
  const state = loadRaw(); const index = state.users.findIndex((x) => x.userId === Number(id)); if (index < 0) throw new Error('User not found.'); const row = state.users[index]; if (row.isSuperAdmin && state.users.filter((x) => x.isSuperAdmin && x.status === 'ACTIVE').length <= 1) throw new Error('At least one active Super Admin must remain.'); state.users.splice(index, 1); saveRaw(state); recordAudit({ moduleCode: 'adm', action: 'PORTAL_USER_DELETE', detail: `Deleted portal user ${row.username}.`, actor }); return clone(row);
}
