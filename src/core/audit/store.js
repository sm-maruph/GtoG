const STORAGE_KEY = 'cbc.portal.audit.v2';
const ACTOR_KEY = 'cbc.portal.audit.actor.v1';
const LIMIT = 3000;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function safeParse(raw, fallback) {
  try { return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
}

export function setAuditActor(actor) {
  if (!actor) {
    sessionStorage.removeItem(ACTOR_KEY);
    return;
  }
  sessionStorage.setItem(ACTOR_KEY, JSON.stringify({
    userId: actor.userId ?? null,
    username: actor.samAccountName ?? actor.username ?? '',
    displayName: actor.displayName ?? '',
    email: actor.email ?? '',
    employeeId: actor.employeeId ?? '',
  }));
}

export function getAuditActor() {
  return safeParse(sessionStorage.getItem(ACTOR_KEY), null);
}

export function listAudit() {
  return safeParse(localStorage.getItem(STORAGE_KEY), []);
}

export function recordAudit({
  moduleCode = 'core',
  action,
  detail = '',
  status = 'SUCCESS',
  actor = null,
  route = '',
  metadata = null,
}) {
  const current = actor ?? getAuditActor() ?? {};
  const rows = listAudit();
  const entry = {
    auditId: `AUD-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    userId: current.userId ?? null,
    username: current.samAccountName ?? current.username ?? '',
    displayName: current.displayName ?? current.fullName ?? '',
    email: current.email ?? '',
    employeeId: current.employeeId ?? '',
    moduleCode,
    action,
    detail,
    status,
    route,
    metadata,
  };
  rows.unshift(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rows.slice(0, LIMIT)));
  window.dispatchEvent(new CustomEvent('cbc:audit-changed', { detail: clone(entry) }));
  return clone(entry);
}

export function clearAudit(actor = null) {
  localStorage.removeItem(STORAGE_KEY);
  recordAudit({ moduleCode: 'adm', action: 'AUDIT_CLEARED', detail: 'Global audit history was cleared.', actor });
}

export function exportAuditCsv(rows = listAudit()) {
  const headers = ['Timestamp', 'Status', 'Module', 'Action', 'Username', 'Display Name', 'Employee ID', 'Detail', 'Route'];
  const escape = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
  const lines = [headers.map(escape).join(',')];
  for (const row of rows) {
    lines.push([
      row.timestamp, row.status, row.moduleCode, row.action, row.username,
      row.displayName, row.employeeId, row.detail, row.route,
    ].map(escape).join(','));
  }
  return lines.join('\n');
}
