import { resolveManagedUser } from '../admin/accessStore';
/**
 * MOCK API  —  THIS FILE IS THE API CONTRACT.
 * ---------------------------------------------------------------------------
 * Enabled with VITE_USE_MOCK=true so the frontend is buildable before the
 * backend exists. Every response shape below is what the real Express API must
 * return, field for field. When you build the backend, read this file — don't
 * reinvent the shapes and then reconcile.
 *
 * Delete this file the day the real API is live. Do not let it drift: a mock
 * that disagrees with production is worse than no mock.
 *
 * ===========================================================================
 * CONTRACT
 * ===========================================================================
 * POST /api/auth/login    { username, password }
 *      200 -> { accessToken, expiresIn }        + Set-Cookie: refreshToken (httpOnly), csrfToken (readable)
 *      401 -> { error: 'Invalid username or password' }      <- NEVER distinguish
 *             the two. "User not found" vs "wrong password" is user enumeration
 *             and hands an attacker a list of valid AD accounts.
 *
 * POST /api/auth/refresh  {}  (refresh cookie + X-CSRF-Token header)
 *      200 -> { accessToken, expiresIn }        + rotated refresh cookie
 *      401 -> { error: 'Session expired' }
 *
 * POST /api/auth/logout   -> 204, clears cookies, revokes the token family
 *
 * GET  /api/me
 *      200 -> {
 *        user:        { userId, samAccountName, displayName, email, employeeId,
 *                       branch: { branchId, code, name } | null,
 *                       dept:   { deptId, code, name }   | null },
 *        roles:       ['BRANCH_MANAGER', ...],
 *        isSuperAdmin: boolean,
 *        modules:     [ { moduleId, code, name, icon, routePath, sortOrder } ],
 *                     // <- straight from core.fn_EffectiveModules. Already
 *                     //    gated + sorted. The client does NOT filter this.
 *        permissions: { 'vbs.request.view': { scopeType, branchIds, deptIds } }
 *                     // <- flattened core.fn_EffectivePermissions, keyed by code
 *      }
 * ===========================================================================
 */

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/* --------------------------------------------------------------------------
   DUMMY USERS  —  the six personas of the VBS two-stage approval flow.
   All share password 'demo'. Each carries the permission map + scope that the
   real /api/me will return from core.fn_EffectivePermissions.

   Persona            Role            VBS scope   Lands on
   -----------------  --------------  ----------  ---------------------------
   branch.user        BRANCH_USER     SELF        employee dashboard
   dept.user          DEPT_USER       SELF        employee dashboard
   branch.manager     BRANCH_MANAGER  BRANCH      approver dashboard (1st level)
   dept.head          DEPT_HEAD       DEPT        approver dashboard (1st level)
   procurement.admin  ADMIN           GLOBAL      admin dashboard (final + assign)
   shakir.khasru      SUPER_ADMIN     (bypass)    admin dashboard (everything)

   The fork lives in VbsModule.jsx:
     can('vbs.assign.create')  -> AdminDashboard  (procurement / super admin)
     can('vbs.request.approve')-> ApproverDashboard(branch mgr / dept head)
     else                      -> Dashboard       (employee)
   -------------------------------------------------------------------------- */
const VBS_MODULE = { moduleId: 1, code: 'vbs', name: 'Vehicle Booking System', icon: 'car', routePath: '/vehicle-booking', sortOrder: 20 };

const USERS = {
  'branch.user': {
    password: 'demo',
    me: {
      user: {
        userId: 10, samAccountName: 'branch.user', displayName: 'Rakib Hasan',
        email: 'rakib.hasan@combankbd.com', employeeId: 'BNGL0610',
        branch: { branchId: 2, code: 'GLSHN', name: 'Gulshan Branch' },
        dept: { deptId: 3, code: 'OPS', name: 'Operations' },
      },
      roles: ['BRANCH_USER'], isSuperAdmin: false, modules: [VBS_MODULE],
      permissions: {
        'vbs.request.create': { scopeType: 'SELF', branchIds: [], deptIds: [] },
        'vbs.request.view':   { scopeType: 'SELF', branchIds: [], deptIds: [] },
        'vbs.request.cancel': { scopeType: 'SELF', branchIds: [], deptIds: [] },
      },
    },
  },

  'dept.user': {
    password: 'demo',
    me: {
      user: {
        userId: 11, samAccountName: 'dept.user', displayName: 'Farhana Islam',
        email: 'farhana.islam@combankbd.com', employeeId: 'BNGL0611',
        branch: { branchId: 1, code: 'HQ', name: 'Head Office — Gulshan' },
        dept: { deptId: 1, code: 'IT', name: 'Information Technology' },
      },
      roles: ['DEPT_USER'], isSuperAdmin: false, modules: [VBS_MODULE],
      permissions: {
        'vbs.request.create': { scopeType: 'SELF', branchIds: [], deptIds: [] },
        'vbs.request.view':   { scopeType: 'SELF', branchIds: [], deptIds: [] },
        'vbs.request.cancel': { scopeType: 'SELF', branchIds: [], deptIds: [] },
      },
    },
  },

  'branch.manager': {
    password: 'demo',
    me: {
      user: {
        userId: 2, samAccountName: 'branch.manager', displayName: 'Nusrat Jahan',
        email: 'nusrat.jahan@combankbd.com', employeeId: 'BNGL0442',
        branch: { branchId: 2, code: 'GLSHN', name: 'Gulshan Branch' },
        dept: { deptId: 3, code: 'OPS', name: 'Operations' },
      },
      roles: ['BRANCH_MANAGER'], isSuperAdmin: false, modules: [VBS_MODULE],
      permissions: {
        'vbs.request.create':  { scopeType: 'SELF',   branchIds: [], deptIds: [] },
        'vbs.request.view':    { scopeType: 'BRANCH', branchIds: [2], deptIds: [] },
        'vbs.request.approve': { scopeType: 'BRANCH', branchIds: [2], deptIds: [] },
        'vbs.request.reject':  { scopeType: 'BRANCH', branchIds: [2], deptIds: [] },
        'vbs.request.cancel':  { scopeType: 'SELF',   branchIds: [], deptIds: [] },
      },
    },
  },

  'dept.head': {
    password: 'demo',
    me: {
      user: {
        userId: 12, samAccountName: 'dept.head', displayName: 'Kamrul Ahsan',
        email: 'kamrul.ahsan@combankbd.com', employeeId: 'BNGL0333',
        branch: { branchId: 1, code: 'HQ', name: 'Head Office — Gulshan' },
        dept: { deptId: 1, code: 'IT', name: 'Information Technology' },
      },
      roles: ['DEPT_HEAD'], isSuperAdmin: false, modules: [VBS_MODULE],
      permissions: {
        'vbs.request.create':  { scopeType: 'SELF', branchIds: [], deptIds: [] },
        'vbs.request.view':    { scopeType: 'DEPT', branchIds: [], deptIds: [1] },
        'vbs.request.approve': { scopeType: 'DEPT', branchIds: [], deptIds: [1] },
        'vbs.request.reject':  { scopeType: 'DEPT', branchIds: [], deptIds: [1] },
        'vbs.request.cancel':  { scopeType: 'SELF', branchIds: [], deptIds: [] },
      },
    },
  },

  'procurement.admin': {
    password: 'demo',
    me: {
      user: {
        userId: 3, samAccountName: 'procurement.admin', displayName: 'Tanzila Rahman',
        email: 'tanzila.rahman@combankbd.com', employeeId: 'BNGL0200',
        branch: { branchId: 1, code: 'HQ', name: 'Head Office — Gulshan' },
        dept: { deptId: 5, code: 'PROC', name: 'Procurement' },
      },
      roles: ['ADMIN'], isSuperAdmin: false, modules: [VBS_MODULE],
      permissions: {
        'vbs.request.create':  { scopeType: 'SELF',   branchIds: [], deptIds: [] },
        'vbs.request.view':    { scopeType: 'GLOBAL', branchIds: [], deptIds: [] },
        'vbs.request.reject':  { scopeType: 'GLOBAL', branchIds: [], deptIds: [] },
        'vbs.assign.create':   { scopeType: 'GLOBAL', branchIds: [], deptIds: [] },
        'vbs.assign.cancel':   { scopeType: 'GLOBAL', branchIds: [], deptIds: [] },
        'vbs.vehicle.view':    { scopeType: 'GLOBAL', branchIds: [], deptIds: [] },
        'vbs.vehicle.manage':  { scopeType: 'GLOBAL', branchIds: [], deptIds: [] },
        'vbs.driver.view':     { scopeType: 'GLOBAL', branchIds: [], deptIds: [] },
        'vbs.driver.manage':   { scopeType: 'GLOBAL', branchIds: [], deptIds: [] },
        'vbs.report.view':     { scopeType: 'GLOBAL', branchIds: [], deptIds: [] },
      },
    },
  },

  'shakir.khasru': {
    password: 'demo',
    me: {
      user: {
        userId: 1, samAccountName: 'shakir.khasru', displayName: 'Shakir Khasru',
        email: 'shakir.khasru@combankbd.com', employeeId: 'BNGL0171',
        branch: { branchId: 1, code: 'HQ', name: 'Head Office — Gulshan' },
        dept: { deptId: 1, code: 'IT', name: 'Information Technology' },
      },
      roles: ['SUPER_ADMIN'], isSuperAdmin: true, modules: [VBS_MODULE],
      permissions: {}, // super admin bypasses every check; see Can.jsx
    },
  },
};

/* Inventory module access. Kept next to the mock personas so every demo login
   can exercise the new monthly requisition workflow. */
const INS_MODULE = { moduleId: 6, code: 'ins', name: 'Insurance Management Tracker', icon: 'clipboard-list', routePath: '/insurance', sortOrder: 10 };
const INV_MODULE = { moduleId: 2, code: 'inv', name: 'Stationery Inventory Management', icon: 'boxes', routePath: '/inventory', sortOrder: 30 };
const PRC_MODULE = { moduleId: 8, code: 'prc', name: 'Procurement & Asset Inventory', icon: 'package-search', routePath: '/procurement-inventory', sortOrder: 35 };
const UTL_MODULE = { moduleId: 3, code: 'utl', name: 'Utility Tracker', icon: 'gauge', routePath: '/utility', sortOrder: 40 };

function addInventoryPermissions() {
  const selfPermissions = {
    'inv.requisition.create': { scopeType: 'SELF', branchIds: [], deptIds: [] },
    'inv.requisition.view': { scopeType: 'SELF', branchIds: [], deptIds: [] },
    'inv.requisition.edit': { scopeType: 'SELF', branchIds: [], deptIds: [] },
    'inv.requisition.submit': { scopeType: 'SELF', branchIds: [], deptIds: [] },
    'inv.requisition.cancel': { scopeType: 'SELF', branchIds: [], deptIds: [] },
    'inv.item.view': { scopeType: 'GLOBAL', branchIds: [], deptIds: [] },
  };

  for (const record of Object.values(USERS)) {
    record.me.modules = [INS_MODULE, VBS_MODULE, INV_MODULE, PRC_MODULE, UTL_MODULE];
  }

  Object.assign(USERS['branch.user'].me.permissions, selfPermissions);
  Object.assign(USERS['dept.user'].me.permissions, selfPermissions);

  Object.assign(USERS['branch.manager'].me.permissions, selfPermissions, {
    'inv.requisition.view': { scopeType: 'BRANCH', branchIds: [2], deptIds: [] },
    'inv.requisition.approve': { scopeType: 'BRANCH', branchIds: [2], deptIds: [] },
    'inv.requisition.return': { scopeType: 'BRANCH', branchIds: [2], deptIds: [] },
    'inv.requisition.reject': { scopeType: 'BRANCH', branchIds: [2], deptIds: [] },
  });

  Object.assign(USERS['dept.head'].me.permissions, selfPermissions, {
    'inv.requisition.view': { scopeType: 'DEPT', branchIds: [], deptIds: [1] },
    'inv.requisition.approve': { scopeType: 'DEPT', branchIds: [], deptIds: [1] },
    'inv.requisition.return': { scopeType: 'DEPT', branchIds: [], deptIds: [1] },
    'inv.requisition.reject': { scopeType: 'DEPT', branchIds: [], deptIds: [1] },
  });

  Object.assign(USERS['procurement.admin'].me.permissions, selfPermissions, {
    'inv.requisition.view': { scopeType: 'GLOBAL', branchIds: [], deptIds: [] },
    'inv.requisition.issue': { scopeType: 'GLOBAL', branchIds: [], deptIds: [] },
    'inv.requisition.decline': { scopeType: 'GLOBAL', branchIds: [], deptIds: [] },
    'inv.item.manage': { scopeType: 'GLOBAL', branchIds: [], deptIds: [] },
    'inv.stock.view': { scopeType: 'GLOBAL', branchIds: [], deptIds: [] },
    'inv.stock.manage': { scopeType: 'GLOBAL', branchIds: [], deptIds: [] },
    'inv.report.view': { scopeType: 'GLOBAL', branchIds: [], deptIds: [] },
  });
}

addInventoryPermissions();


function addInsurancePermissions() {
  const unitPermissions = {
    'ins.policy.view': { scopeType: 'BRANCH', branchIds: [], deptIds: [] },
    'ins.policy.manage': { scopeType: 'BRANCH', branchIds: [], deptIds: [] },
    'ins.followup.manage': { scopeType: 'BRANCH', branchIds: [], deptIds: [] },
    'ins.stats.view': { scopeType: 'BRANCH', branchIds: [], deptIds: [] },
  };

  for (const name of ['branch.user', 'dept.user', 'branch.manager', 'dept.head']) {
    const record = USERS[name];
    const branchId = record.me.user.branch?.branchId;
    const scoped = Object.fromEntries(Object.entries(unitPermissions).map(([code, value]) => [code, { ...value, branchIds: branchId ? [branchId] : [] }]));
    Object.assign(record.me.permissions, scoped);
  }

  Object.assign(USERS['procurement.admin'].me.permissions, {
    'ins.policy.view': { scopeType: 'GLOBAL', branchIds: [], deptIds: [] },
    'ins.policy.manage': { scopeType: 'GLOBAL', branchIds: [], deptIds: [] },
    'ins.followup.manage': { scopeType: 'GLOBAL', branchIds: [], deptIds: [] },
    'ins.stats.view': { scopeType: 'GLOBAL', branchIds: [], deptIds: [] },
    'ins.alert.send': { scopeType: 'GLOBAL', branchIds: [], deptIds: [] },
    'ins.user.manage': { scopeType: 'GLOBAL', branchIds: [], deptIds: [] },
    'ins.audit.view': { scopeType: 'GLOBAL', branchIds: [], deptIds: [] },
  });
}

addInsurancePermissions();

function addUtilityPermissions() {
  for (const name of ['branch.user', 'dept.user', 'branch.manager', 'dept.head']) {
    const record = USERS[name];
    const branchId = record.me.user.branch?.branchId;
    Object.assign(record.me.permissions, {
      'utl.dashboard.view': { scopeType: 'BRANCH', branchIds: branchId ? [branchId] : [], deptIds: [] },
      'utl.record.view': { scopeType: 'BRANCH', branchIds: branchId ? [branchId] : [], deptIds: [] },
      'utl.record.create': { scopeType: 'BRANCH', branchIds: branchId ? [branchId] : [], deptIds: [] },
    });
  }

  Object.assign(USERS['procurement.admin'].me.permissions, {
    'utl.dashboard.view': { scopeType: 'GLOBAL', branchIds: [], deptIds: [] },
    'utl.record.view': { scopeType: 'GLOBAL', branchIds: [], deptIds: [] },
    'utl.record.create': { scopeType: 'GLOBAL', branchIds: [], deptIds: [] },
    'utl.report.view': { scopeType: 'GLOBAL', branchIds: [], deptIds: [] },
    'utl.user.manage': { scopeType: 'GLOBAL', branchIds: [], deptIds: [] },
    'utl.audit.view': { scopeType: 'GLOBAL', branchIds: [], deptIds: [] },
  });
}

addUtilityPermissions();

let session = null;

/* In-memory VBS store, seeded across all four statuses so status colour coding
   is visible the moment you open the module. Resets on page reload. */
let nextVbsId = 104;
/* Each request carries:
     status: PENDING (awaiting 1st-level) | PENDING_ADMIN (awaiting procurement)
           | CONFIRMED | REJECTED (by manager) | DECLINED (by admin) | AUTO_CANCELLED | CANCELLED
     route: 'BRANCH' | 'DEPT'  — who does 1st-level approval
     routeBranchId / routeDeptId — the branch/dept that first-level belongs to
     requesterEmployeeId — to match "my requests"
     firstApproval: { by, decidedUtc } | null  — set when manager/head forwards
*/
/* --------------------------------------------------------------------------
   EVENT TIMELINE
   Each request gets an ordered list of lifecycle events: created -> first-level
   decision -> final decision. The detail page renders this as a visual timeline,
   and the report/analytics compute durations from it. Seeds derive their events
   from existing fields; new actions push events live.
   -------------------------------------------------------------------------- */
function buildTimeline(r) {
  const ev = [{
    type: 'CREATED', at: r.submittedUtc,
    by: r.employee.displayName, label: 'Request submitted',
  }];
  // Edits made by managers/heads/admins while in their queue.
  for (const e of (r.edits ?? [])) {
    ev.push({ type: 'EDITED', at: e.at, by: e.by, label: e.label });
  }
  if (r.firstApproval) {
    ev.push({
      type: 'FIRST_APPROVED', at: r.firstApproval.decidedUtc,
      by: r.firstApproval.by, label: 'Approved by manager / head — forwarded to Procurement',
    });
  }
  if (r.status === 'REJECTED') {
    ev.push({
      type: 'FIRST_REJECTED', at: r.decidedUtc ?? r.submittedUtc,
      by: r.rejectedBy ?? 'Manager / head', label: 'Rejected at first level',
    });
  }
  if (r.status === 'CONFIRMED') {
    ev.push({
      type: 'CONFIRMED', at: r.confirmedUtc ?? r.firstApproval?.decidedUtc ?? r.submittedUtc,
      by: r.confirmedBy ?? 'Procurement', label: 'Confirmed & vehicle assigned by Procurement',
    });
  }
  if (r.status === 'DECLINED') {
    ev.push({
      type: 'DECLINED', at: r.decidedUtc ?? r.firstApproval?.decidedUtc ?? r.submittedUtc,
      by: r.declinedBy ?? 'Procurement', label: 'Declined by Procurement',
    });
  }
  if (r.status === 'AUTO_CANCELLED') {
    ev.push({ type: 'AUTO_CANCELLED', at: r.decidedUtc ?? r.submittedUtc, by: 'System', label: 'Auto-cancelled (trip window expired)' });
  }
  if (r.status === 'CANCELLED') {
    ev.push({ type: 'CANCELLED', at: r.decidedUtc ?? r.submittedUtc, by: r.employee.displayName, label: 'Withdrawn by requester' });
  }
  return ev.sort((a, b) => new Date(a.at) - new Date(b.at));
}

/* Attach the derived timeline onto a request object for responses. */
const withTimeline = (r) => ({ ...r, timeline: buildTimeline(r) });

const vbsStore = [
  {
    // Raised by branch.user (Rakib) -> awaiting Gulshan BRANCH manager
    requestId: 101, requestNo: 'VBS-2026-000101', status: 'PENDING',
    route: 'BRANCH', routeBranchId: 2, routeDeptId: null,
    requesterEmployeeId: 'BNGL0610',
    submittedUtc: new Date(Date.now() - 3600e3).toISOString(),
    tripDate: '2026-07-22', startTime: '09:00', endTime: '12:00',
    purpose: 'Branch audit visit', destination: 'DEPZ Branch, Savar',
    notes: 'Two auditors travelling.',
    employee: { displayName: 'Rakib Hasan', employeeId: 'BNGL0610', department: 'Operations' },
    branch: { branchId: 2, name: 'Gulshan Branch' },
    firstApproval: null, vehicle: null, driver: null, adminNotes: null, declineReason: null,
  },
  {
    // Raised by dept.user (Farhana) -> awaiting IT DEPT head
    requestId: 104, requestNo: 'VBS-2026-000104', status: 'PENDING',
    route: 'DEPT', routeBranchId: null, routeDeptId: 1,
    requesterEmployeeId: 'BNGL0611',
    submittedUtc: new Date(Date.now() - 2 * 3600e3).toISOString(),
    tripDate: '2026-07-23', startTime: '11:00', endTime: '13:00',
    purpose: 'Data centre site inspection', destination: 'Uttara DR Site',
    notes: null,
    employee: { displayName: 'Farhana Islam', employeeId: 'BNGL0611', department: 'Information Technology' },
    branch: { branchId: 1, name: 'Head Office — Gulshan' },
    firstApproval: null, vehicle: null, driver: null, adminNotes: null, declineReason: null,
  },
  {
    // Forwarded by branch manager -> now awaiting PROCUREMENT (admin)
    requestId: 100, requestNo: 'VBS-2026-000100', status: 'PENDING_ADMIN',
    route: 'BRANCH', routeBranchId: 2, routeDeptId: null,
    requesterEmployeeId: 'BNGL0388',
    submittedUtc: new Date(Date.now() - 5 * 3600e3).toISOString(),
    tripDate: '2026-07-22', startTime: '09:30', endTime: '11:30',
    purpose: 'Vendor pickup', destination: 'Tejgaon Industrial Area',
    notes: 'Fragile equipment — needs the van.',
    employee: { displayName: 'Tanvir Ahmed', employeeId: 'BNGL0388', department: 'Operations' },
    branch: { branchId: 2, name: 'Gulshan Branch' },
    firstApproval: { by: 'Nusrat Jahan', decidedUtc: new Date(Date.now() - 4 * 3600e3).toISOString() },
    vehicle: null, driver: null, adminNotes: null, declineReason: null,
  },
  {
    // Confirmed end-to-end
    requestId: 102, requestNo: 'VBS-2026-000102', status: 'CONFIRMED',
    route: 'BRANCH', routeBranchId: 2, routeDeptId: null,
    requesterEmployeeId: 'BNGL0610',
    submittedUtc: new Date(Date.now() - 26 * 3600e3).toISOString(),
    tripDate: '2026-07-20', startTime: '14:00', endTime: '17:00',
    purpose: 'Client meeting', destination: 'Motijheel Corporate Office',
    notes: null,
    employee: { displayName: 'Rakib Hasan', employeeId: 'BNGL0610', department: 'Operations' },
    branch: { branchId: 2, name: 'Gulshan Branch' },
    firstApproval: { by: 'Nusrat Jahan', decidedUtc: new Date(Date.now() - 25 * 3600e3).toISOString() },
    vehicle: { regNo: 'DHAKA-METRO-GA-11-2345', make: 'Toyota', model: 'Premio' },
    driver: { fullName: 'Md. Karim Uddin', phone: '+8801711-223344' },
    adminNotes: 'Driver will wait at the lobby by 13:45.', declineReason: null,
  },
  {
    // Rejected by the branch manager at first level
    requestId: 103, requestNo: 'VBS-2026-000103', status: 'REJECTED',
    route: 'BRANCH', routeBranchId: 2, routeDeptId: null,
    requesterEmployeeId: 'BNGL0610',
    submittedUtc: new Date(Date.now() - 50 * 3600e3).toISOString(),
    tripDate: '2026-07-19', startTime: '10:00', endTime: '13:00',
    purpose: 'Personal errand', destination: 'Bashundhara City',
    notes: null,
    employee: { displayName: 'Rakib Hasan', employeeId: 'BNGL0610', department: 'Operations' },
    branch: { branchId: 2, name: 'Gulshan Branch' },
    firstApproval: null, vehicle: null, driver: null, adminNotes: null,
    declineReason: 'Official vehicles are for business trips only.',
  },
  {
    // Declined by procurement after forwarding
    requestId: 98, requestNo: 'VBS-2026-000098', status: 'DECLINED',
    route: 'DEPT', routeBranchId: null, routeDeptId: 1,
    requesterEmployeeId: 'BNGL0611',
    submittedUtc: new Date(Date.now() - 96 * 3600e3).toISOString(),
    tripDate: '2026-07-18', startTime: '10:00', endTime: '12:00',
    purpose: 'Document delivery', destination: 'Bangladesh Bank',
    notes: null,
    employee: { displayName: 'Farhana Islam', employeeId: 'BNGL0611', department: 'Information Technology' },
    branch: { branchId: 1, name: 'Head Office — Gulshan' },
    firstApproval: { by: 'Kamrul Ahsan', decidedUtc: new Date(Date.now() - 95 * 3600e3).toISOString() },
    vehicle: null, driver: null, adminNotes: null,
    declineReason: 'No vehicles free for that slot; use a courier.',
  },
];

/* Fleet + availability, so the Confirm modal has real dropdowns to filter.
   The availability endpoint mimics the SQL fn_AvailableVehicles/Drivers: it
   hides anything with an overlapping booking, maintenance window, or leave. */
const vbsVehicles = [
  { vehicleId: 1, regNo: 'DHAKA-METRO-GA-11-2345', make: 'Toyota', model: 'Premio', seatCapacity: 4, status: 'AVAILABLE' },
  { vehicleId: 2, regNo: 'DHAKA-METRO-KHA-22-6677', make: 'Toyota', model: 'HiAce', seatCapacity: 12, status: 'AVAILABLE' },
  { vehicleId: 3, regNo: 'DHAKA-METRO-GA-33-9012', make: 'Mitsubishi', model: 'Pajero', seatCapacity: 6, status: 'MAINTENANCE' },
];
const vbsDrivers = [
  { driverId: 1, fullName: 'Md. Karim Uddin', phone: '+8801711-223344', licenseNo: 'DL-DHK-1001', licenseExpiry: '2027-05-01', status: 'ACTIVE' },
  { driverId: 2, fullName: 'Abdul Malek', phone: '+8801811-556677', licenseNo: 'DL-DHK-1002', licenseExpiry: '2026-11-15', status: 'ACTIVE' },
  { driverId: 3, fullName: 'Rafiqul Islam', phone: '+8801911-889900', licenseNo: 'DL-DHK-1003', licenseExpiry: '2028-02-20', status: 'ACTIVE' },
];
/* Pretend conflicts: vehicle 2 and driver 2 are busy 2026-07-22 morning. */
const vbsConflicts = {
  vehicles: [{ vehicleId: 2, date: '2026-07-22', start: '08:00', end: '11:00' }],
  drivers: [{ driverId: 2, date: '2026-07-22', start: '08:00', end: '13:00' }],
};

function overlaps(a, b) { return a.start < b.end && a.end > b.start; }

function availableFor(tripDate, startTime, endTime) {
  const slot = { start: startTime, end: endTime };
  const vehicles = vbsVehicles.filter((v) => {
    if (v.status !== 'AVAILABLE') return false;
    const busy = vbsConflicts.vehicles.some(
      (c) => c.vehicleId === v.vehicleId && c.date === tripDate && overlaps(c, slot));
    return !busy;
  });
  const drivers = vbsDrivers.filter((d) => {
    const busy = vbsConflicts.drivers.some(
      (c) => c.driverId === d.driverId && c.date === tripDate && overlaps(c, slot));
    return !busy;
  });
  return { vehicles, drivers };
}

/* --------------------------------------------------------------------------
   INVENTORY REQUISITION MOCK STORE
   -------------------------------------------------------------------------- */
const inventoryItems = [
  { itemId: 101, itemCode: 'STA-A4-001', itemName: 'A4 Paper', category: 'Stationery', unit: 'Ream', stockQty: 75, reorderLevel: 20, isActive: true },
  { itemId: 102, itemCode: 'PRN-TNR-085', itemName: 'HP 85A Toner Cartridge', category: 'Printer supplies', unit: 'Piece', stockQty: 12, reorderLevel: 5, isActive: true },
  { itemId: 103, itemCode: 'STA-PEN-010', itemName: 'Ball Pen', category: 'Stationery', unit: 'Box', stockQty: 45, reorderLevel: 10, isActive: true },
  { itemId: 104, itemCode: 'STA-FLD-020', itemName: 'File Folder', category: 'Stationery', unit: 'Piece', stockQty: 120, reorderLevel: 30, isActive: true },
  { itemId: 105, itemCode: 'STA-STP-005', itemName: 'Stapler', category: 'Stationery', unit: 'Piece', stockQty: 18, reorderLevel: 5, isActive: true },
  { itemId: 106, itemCode: 'STA-LGL-002', itemName: 'Legal-size Paper', category: 'Stationery', unit: 'Ream', stockQty: 30, reorderLevel: 10, isActive: true },
  { itemId: 107, itemCode: 'IT-KBD-001', itemName: 'USB Keyboard', category: 'IT accessories', unit: 'Piece', stockQty: 10, reorderLevel: 4, isActive: true },
  { itemId: 108, itemCode: 'IT-MSE-001', itemName: 'USB Mouse', category: 'IT accessories', unit: 'Piece', stockQty: 16, reorderLevel: 5, isActive: true },
  { itemId: 109, itemCode: 'HYG-TIS-001', itemName: 'Cleaning Tissue', category: 'Hygiene', unit: 'Box', stockQty: 40, reorderLevel: 12, isActive: true },
  { itemId: 110, itemCode: 'HYG-SAN-001', itemName: 'Hand Sanitizer', category: 'Hygiene', unit: 'Bottle', stockQty: 24, reorderLevel: 8, isActive: true },
];

let nextInvId = 209;
let nextInvLineId = 3020;
const ago = (hours) => new Date(Date.now() - hours * 3600e3).toISOString();
const invEvent = (type, hours, by, label, note = null) => ({ type, at: ago(hours), by, label, note });
const invLine = (requisitionItemId, itemId, requestedQty, approvedQty = null, suppliedQty = 0, notes = {}) => ({
  requisitionItemId, itemId, requestedQty, approvedQty, suppliedQty,
  requesterNote: notes.requesterNote ?? null,
  managerNote: notes.managerNote ?? null,
  procurementNote: notes.procurementNote ?? null,
});

const inventoryRequisitions = [
  {
    requisitionId: 201, requisitionNo: 'REQ-2026-000201', status: 'PENDING', requisitionMonth: '2026-08-01',
    route: 'BRANCH', routeBranchId: 2, routeDeptId: null, requesterEmployeeId: 'BNGL0610',
    createdUtc: ago(5), submittedUtc: ago(4), purpose: 'Monthly branch stationery', notes: 'Required before the first working day.',
    employee: { displayName: 'Rakib Hasan', employeeId: 'BNGL0610', department: 'Operations' },
    branch: { branchId: 2, name: 'Gulshan Branch' },
    items: [invLine(3001, 101, 20), invLine(3002, 103, 8), invLine(3003, 104, 25)],
    managerNotes: null, managerApprovedBy: null, managerApprovedUtc: null,
    procurementNotes: null, procurementProcessedBy: null, procurementProcessedUtc: null,
    returnReason: null, declineReason: null,
    timeline: [invEvent('CREATED', 5, 'Rakib Hasan', 'Draft created'), invEvent('SUBMITTED', 4, 'Rakib Hasan', 'Submitted for branch manager approval')],
  },
  {
    requisitionId: 202, requisitionNo: 'REQ-2026-000202', status: 'PENDING', requisitionMonth: '2026-08-01',
    route: 'DEPT', routeBranchId: null, routeDeptId: 1, requesterEmployeeId: 'BNGL0611',
    createdUtc: ago(8), submittedUtc: ago(7), purpose: 'Monthly IT consumables', notes: 'Toner is required for the service desk printer.',
    employee: { displayName: 'Farhana Islam', employeeId: 'BNGL0611', department: 'Information Technology' },
    branch: { branchId: 1, name: 'Head Office — Gulshan' },
    items: [invLine(3004, 102, 5, null, 0, { requesterNote: 'HP LaserJet P1102' }), invLine(3005, 101, 10), invLine(3006, 108, 3)],
    managerNotes: null, managerApprovedBy: null, managerApprovedUtc: null,
    procurementNotes: null, procurementProcessedBy: null, procurementProcessedUtc: null,
    returnReason: null, declineReason: null,
    timeline: [invEvent('CREATED', 8, 'Farhana Islam', 'Draft created'), invEvent('SUBMITTED', 7, 'Farhana Islam', 'Submitted for department head approval')],
  },
  {
    requisitionId: 203, requisitionNo: 'REQ-2026-000203', status: 'PENDING_ADMIN', requisitionMonth: '2026-08-01',
    route: 'BRANCH', routeBranchId: 2, routeDeptId: null, requesterEmployeeId: 'BNGL0388',
    createdUtc: ago(30), submittedUtc: ago(29), purpose: 'Customer service desk supplies', notes: null,
    employee: { displayName: 'Tanvir Ahmed', employeeId: 'BNGL0388', department: 'Operations' },
    branch: { branchId: 2, name: 'Gulshan Branch' },
    items: [invLine(3007, 101, 15, 15), invLine(3008, 103, 6, 5, 0, { managerNote: 'Reduced based on prior usage.' }), invLine(3009, 105, 2, 2)],
    managerNotes: 'Approved with adjusted pen quantity.', managerApprovedBy: 'Nusrat Jahan', managerApprovedUtc: ago(25),
    procurementNotes: null, procurementProcessedBy: null, procurementProcessedUtc: null,
    returnReason: null, declineReason: null,
    timeline: [invEvent('CREATED', 30, 'Tanvir Ahmed', 'Draft created'), invEvent('SUBMITTED', 29, 'Tanvir Ahmed', 'Submitted for branch manager approval'), invEvent('MANAGER_APPROVED', 25, 'Nusrat Jahan', 'Approved and forwarded to Procurement', 'Approved with adjusted pen quantity.')],
  },
  {
    requisitionId: 204, requisitionNo: 'REQ-2026-000204', status: 'PARTIALLY_ISSUED', requisitionMonth: '2026-07-01',
    route: 'DEPT', routeBranchId: null, routeDeptId: 1, requesterEmployeeId: 'BNGL0611',
    createdUtc: ago(120), submittedUtc: ago(118), purpose: 'IT accessories replacement', notes: null,
    employee: { displayName: 'Farhana Islam', employeeId: 'BNGL0611', department: 'Information Technology' },
    branch: { branchId: 1, name: 'Head Office — Gulshan' },
    items: [invLine(3010, 107, 4, 4, 2, { procurementNote: 'Two keyboards supplied; two pending.' }), invLine(3011, 108, 4, 4, 4)],
    managerNotes: 'Approved.', managerApprovedBy: 'Kamrul Ahsan', managerApprovedUtc: ago(110),
    procurementNotes: 'Partial supply due to keyboard stock allocation.', procurementProcessedBy: 'Tanzila Rahman', procurementProcessedUtc: ago(96),
    returnReason: null, declineReason: null,
    timeline: [invEvent('CREATED', 120, 'Farhana Islam', 'Draft created'), invEvent('SUBMITTED', 118, 'Farhana Islam', 'Submitted for department head approval'), invEvent('MANAGER_APPROVED', 110, 'Kamrul Ahsan', 'Approved and forwarded to Procurement'), invEvent('PARTIALLY_ISSUED', 96, 'Tanzila Rahman', 'Items partially supplied', 'Partial supply due to keyboard stock allocation.')],
  },
  {
    requisitionId: 205, requisitionNo: 'REQ-2026-000205', status: 'ISSUED', requisitionMonth: '2026-07-01',
    route: 'BRANCH', routeBranchId: 2, routeDeptId: null, requesterEmployeeId: 'BNGL0610',
    createdUtc: ago(240), submittedUtc: ago(238), purpose: 'July stationery requirement', notes: null,
    employee: { displayName: 'Rakib Hasan', employeeId: 'BNGL0610', department: 'Operations' },
    branch: { branchId: 2, name: 'Gulshan Branch' },
    items: [invLine(3012, 101, 12, 12, 12), invLine(3013, 104, 20, 20, 20), invLine(3014, 109, 6, 6, 6)],
    managerNotes: 'Approved.', managerApprovedBy: 'Nusrat Jahan', managerApprovedUtc: ago(220),
    procurementNotes: 'Delivered to branch dispatch desk.', procurementProcessedBy: 'Tanzila Rahman', procurementProcessedUtc: ago(200),
    returnReason: null, declineReason: null,
    timeline: [invEvent('CREATED', 240, 'Rakib Hasan', 'Draft created'), invEvent('SUBMITTED', 238, 'Rakib Hasan', 'Submitted for branch manager approval'), invEvent('MANAGER_APPROVED', 220, 'Nusrat Jahan', 'Approved and forwarded to Procurement'), invEvent('ISSUED', 200, 'Tanzila Rahman', 'All items supplied', 'Delivered to branch dispatch desk.')],
  },
  {
    requisitionId: 206, requisitionNo: 'REQ-2026-000206', status: 'RETURNED', requisitionMonth: '2026-08-01',
    route: 'DEPT', routeBranchId: null, routeDeptId: 1, requesterEmployeeId: 'BNGL0611',
    createdUtc: ago(18), submittedUtc: ago(16), purpose: 'Additional printer supplies', notes: null,
    employee: { displayName: 'Farhana Islam', employeeId: 'BNGL0611', department: 'Information Technology' },
    branch: { branchId: 1, name: 'Head Office — Gulshan' },
    items: [invLine(3015, 102, 8)],
    managerNotes: null, managerApprovedBy: null, managerApprovedUtc: null,
    procurementNotes: null, procurementProcessedBy: null, procurementProcessedUtc: null,
    returnReason: 'Please specify the printer models and reduce duplicate toner demand.', declineReason: null,
    timeline: [invEvent('CREATED', 18, 'Farhana Islam', 'Draft created'), invEvent('SUBMITTED', 16, 'Farhana Islam', 'Submitted for department head approval'), invEvent('RETURNED', 12, 'Kamrul Ahsan', 'Returned for correction', 'Please specify the printer models and reduce duplicate toner demand.')],
  },
  {
    requisitionId: 207, requisitionNo: 'REQ-2026-000207', status: 'REJECTED', requisitionMonth: '2026-07-01',
    route: 'BRANCH', routeBranchId: 2, routeDeptId: null, requesterEmployeeId: 'BNGL0388',
    createdUtc: ago(170), submittedUtc: ago(168), purpose: 'Non-standard decorative supplies', notes: null,
    employee: { displayName: 'Tanvir Ahmed', employeeId: 'BNGL0388', department: 'Operations' },
    branch: { branchId: 2, name: 'Gulshan Branch' },
    items: [invLine(3016, 103, 20)],
    managerNotes: null, managerApprovedBy: null, managerApprovedUtc: null,
    procurementNotes: null, procurementProcessedBy: null, procurementProcessedUtc: null,
    returnReason: null, declineReason: 'Not part of the approved monthly operating requirement.',
    timeline: [invEvent('CREATED', 170, 'Tanvir Ahmed', 'Draft created'), invEvent('SUBMITTED', 168, 'Tanvir Ahmed', 'Submitted for branch manager approval'), invEvent('MANAGER_REJECTED', 160, 'Nusrat Jahan', 'Rejected by branch manager', 'Not part of the approved monthly operating requirement.')],
  },
  {
    requisitionId: 208, requisitionNo: 'REQ-2026-000208', status: 'DECLINED', requisitionMonth: '2026-07-01',
    route: 'DEPT', routeBranchId: null, routeDeptId: 1, requesterEmployeeId: 'BNGL0599',
    createdUtc: ago(300), submittedUtc: ago(298), purpose: 'Specialized legacy printer toner', notes: null,
    employee: { displayName: 'Sadia Noor', employeeId: 'BNGL0599', department: 'Information Technology' },
    branch: { branchId: 1, name: 'Head Office — Gulshan' },
    items: [invLine(3017, 102, 2, 2)],
    managerNotes: 'Approved.', managerApprovedBy: 'Kamrul Ahsan', managerApprovedUtc: ago(290),
    procurementNotes: null, procurementProcessedBy: 'Tanzila Rahman', procurementProcessedUtc: ago(280),
    returnReason: null, declineReason: 'The requested legacy toner is discontinued; submit an equipment replacement request.',
    timeline: [invEvent('CREATED', 300, 'Sadia Noor', 'Draft created'), invEvent('SUBMITTED', 298, 'Sadia Noor', 'Submitted for department head approval'), invEvent('MANAGER_APPROVED', 290, 'Kamrul Ahsan', 'Approved and forwarded to Procurement'), invEvent('PROCUREMENT_DECLINED', 280, 'Tanzila Rahman', 'Declined by Procurement', 'The requested legacy toner is discontinued; submit an equipment replacement request.')],
  },
];

function decorateInv(r) {
  return {
    ...r,
    items: r.items.map((line) => {
      const item = inventoryItems.find((candidate) => candidate.itemId === line.itemId);
      return { ...line, ...item };
    }),
    timeline: [...(r.timeline ?? [])].sort((a, b) => new Date(a.at) - new Date(b.at)),
  };
}

function pushInvEvent(r, type, by, label, note = null) {
  r.timeline = r.timeline ?? [];
  r.timeline.push({ type, at: new Date().toISOString(), by, label, note });
}

function invTotals(r) {
  return r.items.reduce((totals, line) => ({
    requestedQty: totals.requestedQty + Number(line.requestedQty ?? 0),
    approvedQty: totals.approvedQty + Number(line.approvedQty ?? 0),
    suppliedQty: totals.suppliedQty + Number(line.suppliedQty ?? 0),
  }), { requestedQty: 0, approvedQty: 0, suppliedQty: 0 });
}

const ok = (config, data, status = 200) => ({
  data, status, statusText: 'OK', headers: {}, config,
});

const fail = (config, status, error) => {
  const err = new Error(error);
  err.response = { data: { error }, status, headers: {}, config };
  err.config = config;
  return Promise.reject(err);
};

export function installMock(api) {
  // eslint-disable-next-line no-console
  console.warn('[mock] API mock is ACTIVE. Set VITE_USE_MOCK=false for the real backend.');

  api.defaults.adapter = async (config) => {
    await wait(220); // enough latency that your loading states are real, not theoretical

    const url = (config.url ?? '').replace(config.baseURL ?? '', '');
    const method = (config.method ?? 'get').toLowerCase();
    const body = config.data ? JSON.parse(config.data) : {};

    // Axios passes { params } as an OBJECT on config.params — it isn't serialized
    // into the URL until the request is actually sent, which is AFTER this mock
    // adapter runs. So read params from config.params first, and only fall back
    // to any query string already on the URL. (This was the search/sort bug:
    // reading url.split('?')[1] always came back empty.)
    const queryParams = () => {
      if (config.params && typeof config.params === 'object') {
        return Object.fromEntries(
          Object.entries(config.params).filter(([, v]) => v != null && v !== '')
        );
      }
      return Object.fromEntries(new URLSearchParams((config.url.split('?')[1]) || ''));
    };

    if (url === '/auth/login' && method === 'post') {
      const record = resolveManagedUser(body.username) ?? USERS[body.username?.toLowerCase?.()];
      if (!record || record.password !== body.password) {
        return fail(config, 401, 'Invalid username or password');
      }
      session = body.username.toLowerCase();
      document.cookie = 'csrfToken=mock-csrf-token; path=/; SameSite=Strict';
      return ok(config, { accessToken: `mock.${session}.token`, expiresIn: 900 });
    }

    if (url === '/auth/refresh' && method === 'post') {
      if (!session) return fail(config, 401, 'Session expired');
      return ok(config, { accessToken: `mock.${session}.token`, expiresIn: 900 });
    }

    if (url === '/auth/logout' && method === 'post') {
      session = null;
      return ok(config, null, 204);
    }

    if (url === '/me' && method === 'get') {
      if (!session) return fail(config, 401, 'Unauthorized');
      const record = resolveManagedUser(session) ?? USERS[session];
      if (!record) return fail(config, 401, 'Unauthorized');
      return ok(config, record.me);
    }

    /* ---- VBS requests -------------------------------------------------- */
    if (url.startsWith('/vbs/requests') || url.startsWith('/vbs/availability') || url.startsWith('/vbs/stats') || url.startsWith('/vbs/report') || url.startsWith('/vbs/fleet') || url.startsWith('/vbs/vehicles') || url.startsWith('/vbs/drivers')) {
      if (!session) return fail(config, 401, 'Unauthorized');
      const sessionRecord = resolveManagedUser(session) ?? USERS[session];
      if (!sessionRecord) return fail(config, 401, 'Unauthorized');
      const meFull = sessionRecord.me;
      const me = meFull.user;
      const perms = meFull.permissions;
      const isSuper = meFull.isSuperAdmin;

      // What "all" means for THIS caller, from their permission scope.
      // Procurement/super -> everything. Branch mgr -> their branch's requests.
      // Dept head -> their department's requests. Mirrors req.scope in SQL.
      const scopeAll = (r) => {
        if (isSuper) return true;
        const view = perms['vbs.request.view'];
        if (!view) return false;
        if (view.scopeType === 'GLOBAL') return true;
        if (view.scopeType === 'BRANCH') return view.branchIds.includes(r.branch?.branchId);
        if (view.scopeType === 'DEPT') return r.route === 'DEPT' && view.deptIds.includes(r.routeDeptId);
        return false;
      };

      if (url === '/vbs/fleet' && method === 'get') {
        if (!(isSuper || perms['vbs.vehicle.view'] || perms['vbs.driver.view'])) return fail(config, 403, 'Forbidden');
        return ok(config, { vehicles: vbsVehicles.slice(), drivers: vbsDrivers.slice() });
      }
      if (url === '/vbs/vehicles' && method === 'post') {
        if (!(isSuper || perms['vbs.vehicle.manage'])) return fail(config, 403, 'Forbidden');
        if (!body.regNo?.trim() || !body.make?.trim() || !body.model?.trim()) return fail(config, 422, 'Registration, make and model are required');
        if (vbsVehicles.some((v) => v.regNo.toLowerCase() === body.regNo.trim().toLowerCase())) return fail(config, 409, 'Vehicle registration already exists');
        const row = { vehicleId: Math.max(0, ...vbsVehicles.map((v) => v.vehicleId)) + 1, regNo: body.regNo.trim().toUpperCase(), make: body.make.trim(), model: body.model.trim(), seatCapacity: Number(body.seatCapacity) || 4, status: body.status || 'AVAILABLE' };
        vbsVehicles.push(row); return ok(config, row, 201);
      }
      const vehicleMatch = url.match(/^\/vbs\/vehicles\/(\d+)$/);
      if (vehicleMatch && method === 'put') {
        if (!(isSuper || perms['vbs.vehicle.manage'])) return fail(config, 403, 'Forbidden');
        const row = vbsVehicles.find((v) => v.vehicleId === Number(vehicleMatch[1])); if (!row) return fail(config, 404, 'Vehicle not found');
        Object.assign(row, { regNo: body.regNo?.trim().toUpperCase() || row.regNo, make: body.make?.trim() || row.make, model: body.model?.trim() || row.model, seatCapacity: Number(body.seatCapacity) || row.seatCapacity, status: body.status || row.status }); return ok(config, row);
      }
      if (vehicleMatch && method === 'delete') {
        if (!(isSuper || perms['vbs.vehicle.manage'])) return fail(config, 403, 'Forbidden');
        const index = vbsVehicles.findIndex((v) => v.vehicleId === Number(vehicleMatch[1])); if (index < 0) return fail(config, 404, 'Vehicle not found'); const [row] = vbsVehicles.splice(index, 1); return ok(config, row);
      }
      if (url === '/vbs/drivers' && method === 'post') {
        if (!(isSuper || perms['vbs.driver.manage'])) return fail(config, 403, 'Forbidden');
        if (!body.fullName?.trim() || !body.phone?.trim() || !body.licenseExpiry) return fail(config, 422, 'Driver name, phone and licence expiry are required');
        const row = { driverId: Math.max(0, ...vbsDrivers.map((d) => d.driverId)) + 1, fullName: body.fullName.trim(), phone: body.phone.trim(), licenseNo: body.licenseNo?.trim() || '', licenseExpiry: body.licenseExpiry, status: body.status || 'ACTIVE' };
        vbsDrivers.push(row); return ok(config, row, 201);
      }
      const driverMatch = url.match(/^\/vbs\/drivers\/(\d+)$/);
      if (driverMatch && method === 'put') {
        if (!(isSuper || perms['vbs.driver.manage'])) return fail(config, 403, 'Forbidden');
        const row = vbsDrivers.find((d) => d.driverId === Number(driverMatch[1])); if (!row) return fail(config, 404, 'Driver not found');
        Object.assign(row, { fullName: body.fullName?.trim() || row.fullName, phone: body.phone?.trim() || row.phone, licenseNo: body.licenseNo?.trim() ?? row.licenseNo, licenseExpiry: body.licenseExpiry || row.licenseExpiry, status: body.status || row.status }); return ok(config, row);
      }
      if (driverMatch && method === 'delete') {
        if (!(isSuper || perms['vbs.driver.manage'])) return fail(config, 403, 'Forbidden');
        const index = vbsDrivers.findIndex((d) => d.driverId === Number(driverMatch[1])); if (index < 0) return fail(config, 404, 'Driver not found'); const [row] = vbsDrivers.splice(index, 1); return ok(config, row);
      }

      // GET /vbs/stats — counts, scoped to what this caller can see.
      if (url === '/vbs/stats' && method === 'get') {
        const now = new Date();
        const mine = vbsStore.filter(scopeAll);
        const canFinal = isSuper || !!perms['vbs.assign.create'];
        return ok(config, {
          // "pending" = what THIS role needs to action:
          //   approver -> awaiting first-level (PENDING); admin -> awaiting procurement (PENDING_ADMIN)
          pending: canFinal
            ? mine.filter((r) => r.status === 'PENDING_ADMIN').length
            : mine.filter((r) => r.status === 'PENDING').length,
          awaitingManager: mine.filter((r) => r.status === 'PENDING').length,
          awaitingProcurement: mine.filter((r) => r.status === 'PENDING_ADMIN').length,
          confirmed: mine.filter((r) => r.status === 'CONFIRMED').length,
          declined: mine.filter((r) => r.status === 'DECLINED' || r.status === 'REJECTED').length,
          autoCancelled: mine.filter((r) => r.status === 'AUTO_CANCELLED').length,
          confirmedThisMonth: mine.filter((r) =>
            r.status === 'CONFIRMED' && new Date(r.submittedUtc).getMonth() === now.getMonth()).length,
          fleetSize: vbsVehicles.filter((v) => v.status === 'AVAILABLE').length,
        });
      }

      // GET /vbs/availability?tripDate&startTime&endTime — for the Confirm modal
      if (url.startsWith('/vbs/availability') && method === 'get') {
        const q = queryParams();
        return ok(config, availableFor(q.tripDate, q.startTime, q.endTime));
      }

      // POST /vbs/requests/:id/edit — manager/head/admin edits trip details.
      // Allowed while the request is still actionable (not closed). Every change
      // is diffed and appended to the timeline as an EDITED event.
      const editMatch = url.match(/^\/vbs\/requests\/(\d+)\/edit$/);
      if (editMatch && method === 'post') {
        const r = vbsStore.find((x) => x.requestId === Number(editMatch[1]));
        if (!r) return fail(config, 404, 'Request not found');
        const canApprove = isSuper || perms['vbs.request.approve'];
        const canAssign = isSuper || perms['vbs.assign.create'];
        if (!canApprove && !canAssign) return fail(config, 403, 'Forbidden');
        if (!isSuper && !scopeAll(r)) return fail(config, 403, 'Outside your scope');
        if (!['PENDING', 'PENDING_ADMIN'].includes(r.status)) {
          return fail(config, 409, 'This request can no longer be edited');
        }

        const fields = ['tripDate', 'startTime', 'endTime', 'destination', 'purpose'];
        const changes = [];
        for (const f of fields) {
          if (body[f] != null && String(body[f]) !== String(r[f])) {
            changes.push(`${f}: "${r[f]}" → "${body[f]}"`);
            r[f] = body[f];
          }
        }
        if (changes.length === 0) return ok(config, withTimeline(r));

        r.edits = r.edits ?? [];
        r.edits.push({ by: me.displayName, at: new Date().toISOString(), label: `Edited ${changes.join('; ')}` });
        return ok(config, withTimeline(r));
      }

      // POST /vbs/requests/:id/approve — FIRST-LEVEL (branch mgr / dept head).
      // PENDING -> PENDING_ADMIN (forwarded to procurement).
      const approveMatch = url.match(/^\/vbs\/requests\/(\d+)\/approve$/);
      if (approveMatch && method === 'post') {
        const r = vbsStore.find((x) => x.requestId === Number(approveMatch[1]));
        if (!r) return fail(config, 404, 'Request not found');
        if (!(isSuper || perms['vbs.request.approve'])) return fail(config, 403, 'Forbidden');
        if (r.status !== 'PENDING') return fail(config, 409, 'Only first-level pending requests can be approved');
        if (!isSuper && !scopeAll(r)) return fail(config, 403, 'Outside your scope');
        r.status = 'PENDING_ADMIN';
        r.firstApproval = { by: me.displayName, decidedUtc: new Date().toISOString() };
        return ok(config, withTimeline(r));
      }

      // POST /vbs/requests/:id/reject — FIRST-LEVEL reject { reason }. -> REJECTED
      const rejectMatch = url.match(/^\/vbs\/requests\/(\d+)\/reject$/);
      if (rejectMatch && method === 'post') {
        const r = vbsStore.find((x) => x.requestId === Number(rejectMatch[1]));
        if (!r) return fail(config, 404, 'Request not found');
        if (!(isSuper || perms['vbs.request.reject'])) return fail(config, 403, 'Forbidden');
        if (r.status !== 'PENDING') return fail(config, 409, 'Only first-level pending requests can be rejected');
        if (!body.reason?.trim()) return fail(config, 422, 'A reason is required');
        r.status = 'REJECTED';
        r.declineReason = body.reason.trim();
        r.rejectedBy = me.displayName;
        r.decidedUtc = new Date().toISOString();
        return ok(config, withTimeline(r));
      }

      // POST /vbs/requests/:id/confirm — FINAL (procurement/admin). PENDING_ADMIN -> CONFIRMED.
      const confirmMatch = url.match(/^\/vbs\/requests\/(\d+)\/confirm$/);
      if (confirmMatch && method === 'post') {
        const r = vbsStore.find((x) => x.requestId === Number(confirmMatch[1]));
        if (!r) return fail(config, 404, 'Request not found');
        if (!(isSuper || perms['vbs.assign.create'])) return fail(config, 403, 'Forbidden');
        if (r.status !== 'PENDING_ADMIN') return fail(config, 409, 'Only requests awaiting procurement can be confirmed');
        const v = vbsVehicles.find((x) => x.vehicleId === Number(body.vehicleId));
        const d = vbsDrivers.find((x) => x.driverId === Number(body.driverId));
        if (!v || !d) return fail(config, 422, 'Select an available vehicle and driver');
        if (body.tripDate) r.tripDate = body.tripDate;
        if (body.startTime) r.startTime = body.startTime;
        if (body.endTime) r.endTime = body.endTime;
        r.status = 'CONFIRMED';
        r.vehicle = { regNo: v.regNo, make: v.make, model: v.model };
        r.driver = { fullName: d.fullName, phone: d.phone };
        r.adminNotes = body.adminNotes?.trim() || null;
        r.confirmedBy = me.displayName;
        r.confirmedUtc = new Date().toISOString();
        return ok(config, withTimeline(r));
      }

      // POST /vbs/requests/:id/decline — FINAL decline by procurement { reason } -> DECLINED
      const declineMatch = url.match(/^\/vbs\/requests\/(\d+)\/decline$/);
      if (declineMatch && method === 'post') {
        const r = vbsStore.find((x) => x.requestId === Number(declineMatch[1]));
        if (!r) return fail(config, 404, 'Request not found');
        if (!(isSuper || perms['vbs.request.reject'])) return fail(config, 403, 'Forbidden');
        if (r.status !== 'PENDING_ADMIN') return fail(config, 409, 'Only requests awaiting procurement can be declined');
        if (!body.reason?.trim()) return fail(config, 422, 'A decline reason is required');
        r.status = 'DECLINED';
        r.declineReason = body.reason.trim();
        r.declinedBy = me.displayName;
        r.decidedUtc = new Date().toISOString();
        return ok(config, withTimeline(r));
      }

      // POST /vbs/requests/:id/cancel — requester withdraws while still early
      const cancelMatch = url.match(/^\/vbs\/requests\/(\d+)\/cancel$/);
      if (cancelMatch && method === 'post') {
        const r = vbsStore.find((x) => x.requestId === Number(cancelMatch[1]));
        if (!r) return fail(config, 404, 'Request not found');
        if (r.requesterEmployeeId !== me.employeeId) return fail(config, 403, 'You can only cancel your own request');
        if (!['PENDING', 'PENDING_ADMIN'].includes(r.status)) return fail(config, 409, 'This request can no longer be cancelled');
        r.status = 'CANCELLED';
        return ok(config, r);
      }

      // GET /vbs/requests/:id
      const idMatch = url.match(/^\/vbs\/requests\/(\d+)$/);
      if (idMatch && method === 'get') {
        const r = vbsStore.find((x) => x.requestId === Number(idMatch[1]));
        return r ? ok(config, withTimeline(r)) : fail(config, 404, 'Request not found');
      }

      // POST /vbs/requests — create. Routing decided by the requester's role.
      if (url === '/vbs/requests' && method === 'post') {
        const seq = 1000 + vbsStore.length + 1;
        const roles = meFull.roles;
        const isManager = roles.includes('BRANCH_MANAGER') || roles.includes('DEPT_HEAD')
          || roles.includes('ADMIN') || isSuper;
        const isDeptUser = roles.includes('DEPT_USER') || roles.includes('DEPT_HEAD');

        // A manager/head/admin creating their own request skips first-level and
        // goes straight to procurement. Everyone else routes to their approver.
        const route = isDeptUser ? 'DEPT' : 'BRANCH';
        const created = {
          requestId: nextVbsId++,
          requestNo: `VBS-2026-${String(seq).padStart(6, '0')}`,
          status: isManager ? 'PENDING_ADMIN' : 'PENDING',
          route,
          routeBranchId: route === 'BRANCH' ? (me.branch?.branchId ?? null) : null,
          routeDeptId: route === 'DEPT' ? (me.dept?.deptId ?? null) : null,
          requesterEmployeeId: me.employeeId,
          submittedUtc: new Date().toISOString(),
          tripDate: body.tripDate, startTime: body.startTime, endTime: body.endTime,
          purpose: body.purpose, destination: body.destination, notes: body.notes || null,
          employee: { displayName: me.displayName, employeeId: me.employeeId, department: me.dept?.name ?? null },
          branch: me.branch ? { branchId: me.branch.branchId, name: me.branch.name } : null,
          firstApproval: isManager ? { by: me.displayName, decidedUtc: new Date().toISOString() } : null,
          vehicle: null, driver: null, adminNotes: null, declineReason: null,
        };
        vbsStore.unshift(created);
        return ok(config, created, 201);
      }

      // GET /vbs/requests?scope=mine|all&status=..&q=..&from=..&to=..&sort=..
      if (url.startsWith('/vbs/requests') && method === 'get') {
        const q = queryParams();
        let items = vbsStore.slice();

        if (q.scope === 'mine') {
          items = items.filter((r) => r.requesterEmployeeId === me.employeeId);
        } else if (q.scope === 'all') {
          items = items.filter(scopeAll);
        }

        if (q.status) {
          const wanted = q.status.split(',');
          items = items.filter((r) => wanted.includes(r.status));
        }

        // Free-text search across booking no, employee, destination, purpose.
        if (q.q) {
          const needle = q.q.toLowerCase();
          items = items.filter((r) =>
            [r.requestNo, r.employee.displayName, r.employee.employeeId, r.destination, r.purpose]
              .filter(Boolean).some((v) => v.toLowerCase().includes(needle)));
        }

        // Date range on TRIP date (inclusive). from/to are 'YYYY-MM-DD'.
        if (q.from) items = items.filter((r) => r.tripDate >= q.from);
        if (q.to)   items = items.filter((r) => r.tripDate <= q.to);

        if (q.schedule === 'true') {
          const today = new Date(); today.setHours(0, 0, 0, 0);
          items = items
            .filter((r) => r.status === 'CONFIRMED' && new Date(`${r.tripDate}T00:00:00`) >= today)
            .sort((a, b) => (a.tripDate + a.startTime).localeCompare(b.tripDate + b.startTime));
        } else {
          // Sort: 'submitted_desc'(default) | 'submitted_asc' | 'trip_asc' | 'trip_desc' | 'status'
          const sort = q.sort || 'submitted_desc';
          const cmp = {
            submitted_desc: (a, b) => new Date(b.submittedUtc) - new Date(a.submittedUtc),
            submitted_asc:  (a, b) => new Date(a.submittedUtc) - new Date(b.submittedUtc),
            trip_asc:  (a, b) => (a.tripDate + a.startTime).localeCompare(b.tripDate + b.startTime),
            trip_desc: (a, b) => (b.tripDate + b.startTime).localeCompare(a.tripDate + a.startTime),
            status:    (a, b) => a.status.localeCompare(b.status),
          }[sort] ?? null;
          if (cmp) items = items.slice().sort(cmp);
        }

        return ok(config, { items, total: items.length });
      }

      // GET /vbs/report?scope=all&from=&to=  — time-range aggregation for reports.
      if (url.startsWith('/vbs/report') && method === 'get') {
        const q = queryParams();
        let items = isSuper ? vbsStore.slice() : vbsStore.filter(scopeAll);
        if (q.from) items = items.filter((r) => r.tripDate >= q.from);
        if (q.to)   items = items.filter((r) => r.tripDate <= q.to);

        const byStatus = {};
        for (const r of items) byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;

        // Average hours from submission to final decision, where a decision exists.
        const decided = items.filter((r) => r.confirmedUtc || r.decidedUtc);
        const avgDecisionHrs = decided.length
          ? Math.round(decided.reduce((sum, r) => {
              const end = new Date(r.confirmedUtc || r.decidedUtc);
              return sum + (end - new Date(r.submittedUtc)) / 3600e3;
            }, 0) / decided.length * 10) / 10
          : null;

        // Per-branch and per-day-of-week counts for charts.
        const byBranch = {};
        for (const r of items) {
          const b = r.branch?.name ?? 'Unknown';
          byBranch[b] = (byBranch[b] ?? 0) + 1;
        }

        return ok(config, {
          range: { from: q.from ?? null, to: q.to ?? null },
          total: items.length,
          byStatus,
          byBranch,
          avgDecisionHrs,
          confirmed: byStatus.CONFIRMED ?? 0,
          rejectedOrDeclined: (byStatus.REJECTED ?? 0) + (byStatus.DECLINED ?? 0),
          rows: items.map((r) => ({
            requestNo: r.requestNo, status: r.status,
            employee: r.employee.displayName, employeeId: r.employee.employeeId,
            department: r.employee.department, branch: r.branch?.name ?? '',
            tripDate: r.tripDate, startTime: r.startTime, endTime: r.endTime,
            destination: r.destination, purpose: r.purpose,
            submittedUtc: r.submittedUtc,
            vehicle: r.vehicle?.regNo ?? '', driver: r.driver?.fullName ?? '',
          })),
        });
      }
    }

    /* ---- Inventory requisitions ----------------------------------------- */
    if (url.startsWith('/inv/')) {
      if (!session) return fail(config, 401, 'Unauthorized');
      const sessionRecord = resolveManagedUser(session) ?? USERS[session];
      if (!sessionRecord) return fail(config, 401, 'Unauthorized');
      const meFull = sessionRecord.me;
      const me = meFull.user;
      const perms = meFull.permissions;
      const isSuper = meFull.isSuperAdmin;
      const can = (permission) => isSuper || Boolean(perms[permission]);

      const scopeAll = (r) => {
        if (isSuper) return true;
        const view = perms['inv.requisition.view'];
        if (!view) return false;
        if (view.scopeType === 'GLOBAL') return true;
        if (view.scopeType === 'SELF') return r.requesterEmployeeId === me.employeeId;
        if (view.scopeType === 'BRANCH') {
          return r.route === 'BRANCH' && view.branchIds.includes(r.routeBranchId);
        }
        if (view.scopeType === 'DEPT') {
          return r.route === 'DEPT' && view.deptIds.includes(r.routeDeptId);
        }
        return false;
      };

      const findRequest = (id) => inventoryRequisitions.find((r) => r.requisitionId === Number(id));
      const validatePayload = (payload) => {
        if (!payload.requisitionMonth) return 'Requisition month is required';
        if (!payload.purpose?.trim()) return 'Purpose is required';
        if (!Array.isArray(payload.items) || payload.items.length === 0) return 'Add at least one item';
        const ids = payload.items.map((line) => Number(line.itemId));
        if (new Set(ids).size !== ids.length) return 'The same item cannot be added twice';
        for (const line of payload.items) {
          if (!inventoryItems.some((item) => item.itemId === Number(line.itemId) && item.isActive)) return 'Select a valid active inventory item';
          if (!Number.isFinite(Number(line.requestedQty)) || Number(line.requestedQty) <= 0) return 'Requested quantity must be greater than zero';
        }
        return null;
      };

      const requesterRoute = () => {
        const roles = meFull.roles;
        const isDept = roles.includes('DEPT_USER') || roles.includes('DEPT_HEAD') || me.dept?.code === 'PROC';
        return {
          route: isDept ? 'DEPT' : 'BRANCH',
          routeBranchId: isDept ? null : (me.branch?.branchId ?? null),
          routeDeptId: isDept ? (me.dept?.deptId ?? null) : null,
        };
      };

      const isFirstLevelApprover = () => {
        const roles = meFull.roles;
        return isSuper || roles.includes('BRANCH_MANAGER') || roles.includes('DEPT_HEAD') || roles.includes('ADMIN');
      };

      const applySubmittedState = (r, resubmitted = false) => {
        r.submittedUtc = new Date().toISOString();
        r.returnReason = null;
        if (isFirstLevelApprover()) {
          r.status = 'PENDING_ADMIN';
          r.managerApprovedBy = me.displayName;
          r.managerApprovedUtc = new Date().toISOString();
          r.managerNotes = 'Submitted by an authorized manager/head and forwarded directly to Procurement.';
          pushInvEvent(r, resubmitted ? 'RESUBMITTED' : 'SUBMITTED', me.displayName, resubmitted ? 'Corrected requisition resubmitted' : 'Submitted');
          pushInvEvent(r, 'MANAGER_APPROVED', me.displayName, 'Forwarded directly to Procurement', r.managerNotes);
        } else {
          r.status = 'PENDING';
          pushInvEvent(r, resubmitted ? 'RESUBMITTED' : 'SUBMITTED', me.displayName,
            resubmitted ? 'Corrected requisition resubmitted for approval' : 'Submitted for manager/head approval');
        }
      };

      // GET /inv/items
      if (url === '/inv/items' && method === 'get') {
        if (!(can('inv.item.view') || can('inv.requisition.create') || can('inv.requisition.issue'))) return fail(config, 403, 'Forbidden');
        const q = queryParams();
        let items = inventoryItems.slice();
        if (q.q) {
          const needle = String(q.q).toLowerCase();
          items = items.filter((item) => [item.itemCode, item.itemName, item.category].some((value) => value.toLowerCase().includes(needle)));
        }
        return ok(config, { items, total: items.length });
      }

      // GET /inv/stats
      if (url === '/inv/stats' && method === 'get') {
        const visible = inventoryRequisitions.filter(scopeAll);
        return ok(config, {
          awaitingManager: visible.filter((r) => r.status === 'PENDING').length,
          awaitingProcurement: visible.filter((r) => r.status === 'PENDING_ADMIN').length,
          partiallyIssued: visible.filter((r) => r.status === 'PARTIALLY_ISSUED').length,
          issued: visible.filter((r) => r.status === 'ISSUED').length,
          returned: visible.filter((r) => r.status === 'RETURNED').length,
          rejectedOrDeclined: visible.filter((r) => ['REJECTED', 'DECLINED'].includes(r.status)).length,
          lowStockItems: inventoryItems.filter((item) => item.stockQty <= item.reorderLevel).length,
        });
      }

      // POST /inv/requisitions/:id/submit
      const submitMatch = url.match(/^\/inv\/requisitions\/(\d+)\/submit$/);
      if (submitMatch && method === 'post') {
        const r = findRequest(submitMatch[1]);
        if (!r) return fail(config, 404, 'Requisition not found');
        if (r.requesterEmployeeId !== me.employeeId) return fail(config, 403, 'You can only submit your own requisition');
        if (!(can('inv.requisition.submit') || isSuper)) return fail(config, 403, 'Forbidden');
        if (!['DRAFT', 'RETURNED'].includes(r.status)) return fail(config, 409, 'Only draft or returned requisitions can be submitted');
        applySubmittedState(r, r.status === 'RETURNED');
        return ok(config, decorateInv(r));
      }

      // POST /inv/requisitions/:id/approve
      const approveMatch = url.match(/^\/inv\/requisitions\/(\d+)\/approve$/);
      if (approveMatch && method === 'post') {
        const r = findRequest(approveMatch[1]);
        if (!r) return fail(config, 404, 'Requisition not found');
        if (!can('inv.requisition.approve')) return fail(config, 403, 'Forbidden');
        if (!scopeAll(r)) return fail(config, 403, 'Outside your approval scope');
        if (r.status !== 'PENDING') return fail(config, 409, 'Only requisitions awaiting manager/head approval can be approved');

        const decisions = new Map((body.items ?? []).map((line) => [Number(line.requisitionItemId), line]));
        let positive = false;
        for (const line of r.items) {
          const decision = decisions.get(line.requisitionItemId);
          if (!decision) return fail(config, 422, 'Provide an approval quantity for every item');
          const qty = Number(decision.approvedQty);
          if (!Number.isFinite(qty) || qty < 0 || qty > line.requestedQty) return fail(config, 422, 'Approved quantity must be between zero and the requested quantity');
          if (qty > 0) positive = true;
        }
        if (!positive) return fail(config, 422, 'At least one item must be approved');

        for (const line of r.items) {
          const decision = decisions.get(line.requisitionItemId);
          line.approvedQty = Number(decision.approvedQty);
          line.managerNote = decision.managerNote?.trim() || null;
        }
        r.status = 'PENDING_ADMIN';
        r.managerNotes = body.notes?.trim() || null;
        r.managerApprovedBy = me.displayName;
        r.managerApprovedUtc = new Date().toISOString();
        r.returnReason = null;
        pushInvEvent(r, 'MANAGER_APPROVED', me.displayName, 'Approved and forwarded to Procurement', r.managerNotes);
        return ok(config, decorateInv(r));
      }

      // POST /inv/requisitions/:id/return
      const returnMatch = url.match(/^\/inv\/requisitions\/(\d+)\/return$/);
      if (returnMatch && method === 'post') {
        const r = findRequest(returnMatch[1]);
        if (!r) return fail(config, 404, 'Requisition not found');
        if (!can('inv.requisition.return')) return fail(config, 403, 'Forbidden');
        if (!scopeAll(r)) return fail(config, 403, 'Outside your approval scope');
        if (r.status !== 'PENDING') return fail(config, 409, 'Only pending requisitions can be returned');
        if (!body.reason?.trim()) return fail(config, 422, 'A return reason is required');
        r.status = 'RETURNED';
        r.returnReason = body.reason.trim();
        pushInvEvent(r, 'RETURNED', me.displayName, 'Returned for correction', r.returnReason);
        return ok(config, decorateInv(r));
      }

      // POST /inv/requisitions/:id/reject
      const rejectMatch = url.match(/^\/inv\/requisitions\/(\d+)\/reject$/);
      if (rejectMatch && method === 'post') {
        const r = findRequest(rejectMatch[1]);
        if (!r) return fail(config, 404, 'Requisition not found');
        if (!can('inv.requisition.reject')) return fail(config, 403, 'Forbidden');
        if (!scopeAll(r)) return fail(config, 403, 'Outside your approval scope');
        if (r.status !== 'PENDING') return fail(config, 409, 'Only pending requisitions can be rejected');
        if (!body.reason?.trim()) return fail(config, 422, 'A rejection reason is required');
        r.status = 'REJECTED';
        r.declineReason = body.reason.trim();
        pushInvEvent(r, 'MANAGER_REJECTED', me.displayName, 'Rejected by manager/head', r.declineReason);
        return ok(config, decorateInv(r));
      }

      // POST /inv/requisitions/:id/issue
      const issueMatch = url.match(/^\/inv\/requisitions\/(\d+)\/issue$/);
      if (issueMatch && method === 'post') {
        const r = findRequest(issueMatch[1]);
        if (!r) return fail(config, 404, 'Requisition not found');
        if (!can('inv.requisition.issue')) return fail(config, 403, 'Forbidden');
        if (!['PENDING_ADMIN', 'PARTIALLY_ISSUED'].includes(r.status)) return fail(config, 409, 'This requisition is not available for supply');

        const issues = new Map((body.items ?? []).map((line) => [Number(line.requisitionItemId), line]));
        const planned = [];
        let anyIssued = false;
        for (const line of r.items) {
          const action = issues.get(line.requisitionItemId) ?? { issueQty: 0 };
          const qty = Number(action.issueQty ?? 0);
          const item = inventoryItems.find((candidate) => candidate.itemId === line.itemId);
          const remaining = Number(line.approvedQty ?? 0) - Number(line.suppliedQty ?? 0);
          if (!Number.isFinite(qty) || qty < 0 || qty > remaining) return fail(config, 422, `Invalid issue quantity for ${item.itemName}`);
          if (qty > item.stockQty) return fail(config, 422, `Insufficient stock for ${item.itemName}`);
          if (qty > 0) anyIssued = true;
          planned.push({ line, action, item, qty });
        }
        if (!anyIssued) return fail(config, 422, 'Enter a quantity for at least one item');

        for (const { line, action, item, qty } of planned) {
          if (qty <= 0) continue;
          item.stockQty -= qty;
          line.suppliedQty = Number(line.suppliedQty ?? 0) + qty;
          if (action.procurementNote?.trim()) line.procurementNote = action.procurementNote.trim();
        }

        const complete = r.items.every((line) => Number(line.suppliedQty ?? 0) >= Number(line.approvedQty ?? 0));
        r.status = complete ? 'ISSUED' : 'PARTIALLY_ISSUED';
        r.procurementNotes = body.procurementNotes?.trim() || r.procurementNotes || null;
        r.procurementProcessedBy = me.displayName;
        r.procurementProcessedUtc = new Date().toISOString();
        pushInvEvent(r, complete ? 'ISSUED' : 'PARTIALLY_ISSUED', me.displayName,
          complete ? 'All approved items supplied' : 'Items partially supplied', r.procurementNotes);
        return ok(config, decorateInv(r));
      }

      // POST /inv/requisitions/:id/decline
      const declineMatch = url.match(/^\/inv\/requisitions\/(\d+)\/decline$/);
      if (declineMatch && method === 'post') {
        const r = findRequest(declineMatch[1]);
        if (!r) return fail(config, 404, 'Requisition not found');
        if (!can('inv.requisition.decline')) return fail(config, 403, 'Forbidden');
        if (r.status !== 'PENDING_ADMIN') return fail(config, 409, 'Only requisitions awaiting supply can be declined');
        if (!body.reason?.trim()) return fail(config, 422, 'A decline reason is required');
        r.status = 'DECLINED';
        r.declineReason = body.reason.trim();
        r.procurementProcessedBy = me.displayName;
        r.procurementProcessedUtc = new Date().toISOString();
        pushInvEvent(r, 'PROCUREMENT_DECLINED', me.displayName, 'Declined by Procurement', r.declineReason);
        return ok(config, decorateInv(r));
      }

      // POST /inv/requisitions/:id/cancel
      const cancelMatch = url.match(/^\/inv\/requisitions\/(\d+)\/cancel$/);
      if (cancelMatch && method === 'post') {
        const r = findRequest(cancelMatch[1]);
        if (!r) return fail(config, 404, 'Requisition not found');
        if (r.requesterEmployeeId !== me.employeeId) return fail(config, 403, 'You can only cancel your own requisition');
        if (!can('inv.requisition.cancel')) return fail(config, 403, 'Forbidden');
        if (!['DRAFT', 'RETURNED', 'PENDING'].includes(r.status)) return fail(config, 409, 'This requisition can no longer be cancelled');
        r.status = 'CANCELLED';
        pushInvEvent(r, 'CANCELLED', me.displayName, 'Cancelled by requester', body.reason?.trim() || null);
        return ok(config, decorateInv(r));
      }

      // GET /inv/requisitions/:id
      const idMatch = url.match(/^\/inv\/requisitions\/(\d+)$/);
      if (idMatch && method === 'get') {
        const r = findRequest(idMatch[1]);
        if (!r) return fail(config, 404, 'Requisition not found');
        if (!scopeAll(r) && r.requesterEmployeeId !== me.employeeId) return fail(config, 403, 'Outside your scope');
        return ok(config, decorateInv(r));
      }

      // PUT /inv/requisitions/:id
      if (idMatch && method === 'put') {
        const r = findRequest(idMatch[1]);
        if (!r) return fail(config, 404, 'Requisition not found');
        if (r.requesterEmployeeId !== me.employeeId) return fail(config, 403, 'You can only edit your own requisition');
        if (!can('inv.requisition.edit')) return fail(config, 403, 'Forbidden');
        if (!['DRAFT', 'RETURNED'].includes(r.status)) return fail(config, 409, 'Only draft or returned requisitions can be edited');
        const validationError = validatePayload(body);
        if (validationError) return fail(config, 422, validationError);

        const wasReturned = r.status === 'RETURNED';
        r.requisitionMonth = body.requisitionMonth;
        r.purpose = body.purpose.trim();
        r.notes = body.notes?.trim() || null;
        r.items = body.items.map((line) => ({
          requisitionItemId: Number(line.requisitionItemId) || nextInvLineId++,
          itemId: Number(line.itemId), requestedQty: Number(line.requestedQty),
          approvedQty: null, suppliedQty: 0,
          requesterNote: line.requesterNote?.trim() || null,
          managerNote: null, procurementNote: null,
        }));
        pushInvEvent(r, 'EDITED', me.displayName, 'Requisition details updated');
        if (body.submit) applySubmittedState(r, wasReturned);
        else if (!wasReturned) pushInvEvent(r, 'DRAFT_SAVED', me.displayName, 'Draft saved');
        return ok(config, decorateInv(r));
      }

      // POST /inv/requisitions
      if (url === '/inv/requisitions' && method === 'post') {
        if (!can('inv.requisition.create')) return fail(config, 403, 'Forbidden');
        const validationError = validatePayload(body);
        if (validationError) return fail(config, 422, validationError);
        const route = requesterRoute();
        const now = new Date();
        const seq = String(nextInvId).padStart(6, '0');
        const created = {
          requisitionId: nextInvId++, requisitionNo: `REQ-${now.getFullYear()}-${seq}`,
          status: 'DRAFT', requisitionMonth: body.requisitionMonth,
          ...route, requesterEmployeeId: me.employeeId,
          createdUtc: new Date().toISOString(), submittedUtc: null,
          purpose: body.purpose.trim(), notes: body.notes?.trim() || null,
          employee: { displayName: me.displayName, employeeId: me.employeeId, department: me.dept?.name ?? null },
          branch: me.branch ? { branchId: me.branch.branchId, name: me.branch.name } : null,
          items: body.items.map((line) => ({
            requisitionItemId: nextInvLineId++, itemId: Number(line.itemId), requestedQty: Number(line.requestedQty),
            approvedQty: null, suppliedQty: 0, requesterNote: line.requesterNote?.trim() || null,
            managerNote: null, procurementNote: null,
          })),
          managerNotes: null, managerApprovedBy: null, managerApprovedUtc: null,
          procurementNotes: null, procurementProcessedBy: null, procurementProcessedUtc: null,
          returnReason: null, declineReason: null,
          timeline: [],
        };
        pushInvEvent(created, 'CREATED', me.displayName, 'Draft created');
        if (body.submit) applySubmittedState(created, false);
        else pushInvEvent(created, 'DRAFT_SAVED', me.displayName, 'Draft saved');
        inventoryRequisitions.unshift(created);
        return ok(config, decorateInv(created), 201);
      }

      // GET /inv/requisitions
      if (url === '/inv/requisitions' && method === 'get') {
        const q = queryParams();
        let rows = inventoryRequisitions.slice();
        if (q.scope === 'mine') rows = rows.filter((r) => r.requesterEmployeeId === me.employeeId);
        else rows = rows.filter(scopeAll);

        if (q.status) {
          const wanted = String(q.status).split(',');
          rows = rows.filter((r) => wanted.includes(r.status));
        }
        if (q.month) rows = rows.filter((r) => r.requisitionMonth.startsWith(String(q.month)));
        if (q.q) {
          const needle = String(q.q).toLowerCase();
          rows = rows.filter((r) => [r.requisitionNo, r.employee.displayName, r.employee.employeeId, r.purpose, r.branch?.name, r.employee.department]
            .filter(Boolean).some((value) => value.toLowerCase().includes(needle)));
        }

        const sort = q.sort || 'created_desc';
        const comparator = {
          created_desc: (a, b) => new Date(b.createdUtc) - new Date(a.createdUtc),
          created_asc: (a, b) => new Date(a.createdUtc) - new Date(b.createdUtc),
          month_asc: (a, b) => a.requisitionMonth.localeCompare(b.requisitionMonth),
          month_desc: (a, b) => b.requisitionMonth.localeCompare(a.requisitionMonth),
          status: (a, b) => a.status.localeCompare(b.status),
        }[sort];
        if (comparator) rows.sort(comparator);
        return ok(config, { items: rows.map(decorateInv), total: rows.length });
      }

      // GET /inv/report
      if (url === '/inv/report' && method === 'get') {
        if (!(can('inv.report.view') || can('inv.requisition.issue'))) return fail(config, 403, 'Forbidden');
        const q = queryParams();
        let rows = inventoryRequisitions.filter(scopeAll);
        if (q.from) rows = rows.filter((r) => r.requisitionMonth.slice(0, 7) >= String(q.from));
        if (q.to) rows = rows.filter((r) => r.requisitionMonth.slice(0, 7) <= String(q.to));
        const byStatus = {};
        for (const r of rows) byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;
        return ok(config, {
          total: rows.length,
          byStatus,
          rows: rows.map((r) => {
            const totals = invTotals(r);
            return {
              requisitionNo: r.requisitionNo, requisitionMonth: r.requisitionMonth, status: r.status,
              employee: r.employee.displayName, employeeId: r.employee.employeeId,
              department: r.employee.department, branch: r.branch?.name ?? '', purpose: r.purpose,
              ...totals,
            };
          }),
        });
      }
    }

    return fail(config, 404, `No mock handler for ${method.toUpperCase()} ${url}`);
  };
}
