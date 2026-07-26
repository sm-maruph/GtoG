import { recordAudit } from '../../core/audit/store';
import { loadAccessState } from '../../core/admin/accessStore';

const STORAGE_KEY = 'cbc.paper.tracker.v1';
const clone = (value) => JSON.parse(JSON.stringify(value));
const now = () => new Date().toISOString();

const SAMPLE_ROWS = [
  ['2025-07','Statement Paper',8620,11679,3059,440,'Sheet',10,'Rim',''],
  ['2025-07','A4 Paper',1,2435,2435,0,'Sheet',3,'Rim','Utilized rough page and saved 435 pages'],
  ['2025-08','Statement Paper',11680,16715,5035,2,'Rim',7,'Rim',''],
  ['2025-08','A4 Paper',2436,4873,2437,0,'Sheet',4,'Rim',''],
  ['2025-09','Statement Paper',16716,18370,1654,6,'Rim',2,'Rim',''],
  ['2025-09','A4 Paper',4874,8205,3331,0,'Sheet',5,'Rim',''],
  ['2025-10','Statement Paper',1,1687,1687,4,'Rim',3,'Rim','New toner installed'],
  ['2025-10','A4 Paper',8206,10148,1942,1,'Rim',4,'Rim',''],
  ['2025-11','Statement Paper',1688,3328,1640,4,'Rim',5,'Rim',''],
  ['2025-11','A4 Paper',8206,10148,1942,1,'Rim',5,'Rim',''],
  ['2025-12','Statement Paper',1,3585,3585,1,'Rim',70,'Rim','Statement Paper needed in a large number due to Year End Statement purpose'],
  ['2025-12','A4 Paper',1,7932,7932,1,'Rim',5,'Rim','New toner installed'],
  ['2026-01','Statement Paper',3586,17506,13920,10,'Rim',0,'Rim',''],
  ['2026-01','A4 Paper',7933,17894,9961,1,'Rim',5,'Rim',''],
  ['2026-02','Statement Paper',17895,21665,3770,4,'Rim',0,'Rim',''],
  ['2026-02','A4 Paper',1,3273,3273,1,'Rim',5,'Rim','New toner installed'],
  ['2026-03','Statement Paper',21666,22716,1050,2,'Rim',0,'Rim',''],
  ['2026-03','A4 Paper',3274,6855,3581,1,'Rim',5,'Rim',''],
  ['2026-04','Statement Paper',1,2072,2071,1,'Rim',3,'Rim','New toner installed'],
  ['2026-04','A4 Paper',6856,10182,3326,1,'Rim',5,'Rim',''],
  ['2026-05','Statement Paper',2073,4564,2491,1,'Rim',3,'Rim',''],
  ['2026-05','A4 Paper',1,668,667,1,'Rim',5,'Rim','New toner installed'],
  ['2026-06','Statement Paper',4565,8179,3614,1,'Rim',5,'Rim',''],
  ['2026-06','A4 Paper',669,3591,2922,1,'Rim',5,'Rim',''],
];

function seedState() {
  const directory = loadAccessState();
  const paperTypes = [
    { paperTypeId: 1, code: 'STATEMENT', name: 'Statement Paper', defaultUnit: 'Rim', sheetsPerRim: 500, status: 'ACTIVE' },
    { paperTypeId: 2, code: 'A4', name: 'A4 Paper', defaultUnit: 'Rim', sheetsPerRim: 500, status: 'ACTIVE' },
    { paperTypeId: 3, code: 'LEGAL', name: 'Legal Paper', defaultUnit: 'Rim', sheetsPerRim: 500, status: 'ACTIVE' },
  ];
  const printers = [
    { printerId: 1, code: 'HQ-IT-PRN-01', name: 'IT Department Main Printer', branchId: 1, deptId: 1, location: 'IT Department', status: 'ACTIVE' },
    { printerId: 2, code: 'HQ-OPS-PRN-01', name: 'Operations Printer', branchId: 1, deptId: 3, location: 'Operations Floor', status: 'ACTIVE' },
    { printerId: 3, code: 'GLSHN-PRN-01', name: 'Gulshan Branch Printer', branchId: 2, deptId: 4, location: 'Operations Desk', status: 'ACTIVE' },
  ];
  const entries = SAMPLE_ROWS.map((row, index) => {
    const [month, paperTypeName, startingPageCount, endingPageCount, totalPagesUsed, paperInHandQty, paperInHandUnit, requisitionQty, requisitionUnit, remarks] = row;
    const paper = paperTypes.find((p) => p.name === paperTypeName);
    return {
      entryId: index + 1,
      month,
      scopeType: 'HEAD_OFFICE_DEPARTMENT',
      branchId: 1,
      branchName: directory.branches.find((b) => b.branchId === 1)?.name || 'Head Office — Gulshan',
      deptId: 1,
      deptName: directory.departments.find((d) => d.deptId === 1)?.name || 'Information Technology',
      printerId: 1,
      printerCode: 'HQ-IT-PRN-01',
      printerName: 'IT Department Main Printer',
      paperTypeId: paper.paperTypeId,
      paperTypeName,
      startingPageCount,
      endingPageCount,
      totalPagesUsed,
      paperInHandQty,
      paperInHandUnit,
      requisitionQty,
      requisitionUnit,
      remarks,
      status: 'SUBMITTED',
      recordedByEmployeeId: 'BNGL0171',
      recordedByName: 'Shakir Khasru',
      createdAt: new Date(`${month}-28T10:00:00`).toISOString(),
      updatedAt: new Date(`${month}-28T10:00:00`).toISOString(),
    };
  });
  return {
    paperTypes,
    printers,
    entries,
    sequence: { entry: entries.length + 1, paperType: 4, printer: 4 },
  };
}

function readRaw() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value) return JSON.parse(value);
  } catch { /* use seed */ }
  const seeded = seedState();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
  return seeded;
}
function writeRaw(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new CustomEvent('cbc:paper-changed'));
  return clone(state);
}
function actorName(actor) { return actor?.displayName || actor?.samAccountName || actor?.email || 'Portal User'; }
function audit(action, detail, actor, status = 'SUCCESS') {
  recordAudit({ moduleCode: 'ppr', action, detail, actor, status });
}

export function loadState() { return clone(readRaw()); }
export function resetState(actor) {
  const state = seedState();
  writeRaw(state);
  audit('DEMO_RESET', 'Paper Tracker demonstration data was reset.', actor);
  return clone(state);
}

function directoryNames(branchId, deptId) {
  const directory = loadAccessState();
  return {
    branchName: directory.branches.find((b) => b.branchId === Number(branchId))?.name || 'Unassigned',
    deptName: directory.departments.find((d) => d.deptId === Number(deptId))?.name || 'Whole Branch',
  };
}

export function visibleEntries(state, auth) {
  if (auth.isSuperAdmin) return state.entries;
  const scope = auth.scopeOf('ppr.entry.view');
  if (!scope) return [];
  if (scope.scopeType === 'GLOBAL') return state.entries;
  if (scope.scopeType === 'BRANCH') {
    const ids = scope.branchIds?.length ? scope.branchIds : [auth.user?.branch?.branchId].filter(Boolean);
    return state.entries.filter((row) => ids.includes(Number(row.branchId)));
  }
  if (scope.scopeType === 'DEPT') {
    const ids = scope.deptIds?.length ? scope.deptIds : [auth.user?.dept?.deptId].filter(Boolean);
    return state.entries.filter((row) => ids.includes(Number(row.deptId)));
  }
  return state.entries.filter((row) => row.recordedByEmployeeId === auth.user?.employeeId);
}

function normalizePayload(payload, actor, current = null) {
  const state = readRaw();
  const printer = state.printers.find((p) => p.printerId === Number(payload.printerId));
  const paper = state.paperTypes.find((p) => p.paperTypeId === Number(payload.paperTypeId));
  const branchId = Number(payload.branchId || printer?.branchId || actor?.branch?.branchId || 0) || null;
  const deptId = payload.scopeType === 'WHOLE_BRANCH' ? null : (Number(payload.deptId || printer?.deptId || actor?.dept?.deptId || 0) || null);
  const names = directoryNames(branchId, deptId);
  return {
    ...current,
    month: payload.month,
    scopeType: payload.scopeType || (deptId ? 'HEAD_OFFICE_DEPARTMENT' : 'WHOLE_BRANCH'),
    branchId,
    branchName: names.branchName,
    deptId,
    deptName: deptId ? names.deptName : 'Whole Branch',
    printerId: printer?.printerId || null,
    printerCode: printer?.code || payload.printerCode || '',
    printerName: printer?.name || payload.printerName || '',
    paperTypeId: paper?.paperTypeId || null,
    paperTypeName: paper?.name || payload.paperTypeName || '',
    startingPageCount: Number(payload.startingPageCount || 0),
    endingPageCount: Number(payload.endingPageCount || 0),
    totalPagesUsed: Number(payload.totalPagesUsed || 0),
    paperInHandQty: Number(payload.paperInHandQty || 0),
    paperInHandUnit: payload.paperInHandUnit || 'Rim',
    requisitionQty: Number(payload.requisitionQty || 0),
    requisitionUnit: payload.requisitionUnit || 'Rim',
    remarks: String(payload.remarks || '').trim(),
    status: payload.status || current?.status || 'SUBMITTED',
    recordedByEmployeeId: current?.recordedByEmployeeId || actor?.employeeId || '',
    recordedByName: current?.recordedByName || actorName(actor),
    updatedAt: now(),
  };
}

export function addEntry(payload, actor) {
  const state = readRaw();
  if (!payload.month || !payload.paperTypeId || !payload.printerId) throw new Error('Month, printer, and paper type are required.');
  if (Number(payload.endingPageCount) < Number(payload.startingPageCount)) throw new Error('Ending page count cannot be lower than starting page count.');
  const duplicate = state.entries.some((row) => row.month === payload.month && row.printerId === Number(payload.printerId) && row.paperTypeId === Number(payload.paperTypeId));
  if (duplicate) throw new Error('An entry already exists for this month, printer, and paper type. Edit the existing row instead.');
  const row = normalizePayload(payload, actor);
  row.entryId = state.sequence.entry++;
  row.createdAt = now();
  state.entries.unshift(row);
  writeRaw(state);
  audit('PAPER_ENTRY_ADD', `Added ${row.paperTypeName} usage for ${row.month}, ${row.branchName} / ${row.deptName}: ${row.totalPagesUsed.toLocaleString()} pages.`, actor);
  return clone(row);
}

export function updateEntry(id, payload, actor) {
  const state = readRaw();
  const index = state.entries.findIndex((row) => row.entryId === Number(id));
  if (index < 0) throw new Error('Paper usage entry not found.');
  const current = state.entries[index];
  const duplicate = state.entries.some((row) => row.entryId !== Number(id) && row.month === payload.month && row.printerId === Number(payload.printerId) && row.paperTypeId === Number(payload.paperTypeId));
  if (duplicate) throw new Error('Another entry already exists for this month, printer, and paper type.');
  const row = normalizePayload(payload, actor, current);
  state.entries[index] = row;
  writeRaw(state);
  audit('PAPER_ENTRY_UPDATE', `Updated entry #${row.entryId}: ${row.paperTypeName}, ${row.month}.`, actor);
  return clone(row);
}

export function deleteEntry(id, actor) {
  const state = readRaw();
  const index = state.entries.findIndex((row) => row.entryId === Number(id));
  if (index < 0) throw new Error('Paper usage entry not found.');
  const [row] = state.entries.splice(index, 1);
  writeRaw(state);
  audit('PAPER_ENTRY_DELETE', `Deleted entry #${row.entryId}: ${row.paperTypeName}, ${row.month}, ${row.branchName}.`, actor);
  return clone(row);
}

export function savePaperType(payload, actor) {
  const state = readRaw();
  let row;
  if (payload.paperTypeId) {
    row = state.paperTypes.find((p) => p.paperTypeId === Number(payload.paperTypeId));
    if (!row) throw new Error('Paper type not found.');
    Object.assign(row, { code: payload.code.trim().toUpperCase(), name: payload.name.trim(), defaultUnit: payload.defaultUnit || 'Rim', sheetsPerRim: Number(payload.sheetsPerRim || 500), status: payload.status || 'ACTIVE' });
  } else {
    row = { paperTypeId: state.sequence.paperType++, code: payload.code.trim().toUpperCase(), name: payload.name.trim(), defaultUnit: payload.defaultUnit || 'Rim', sheetsPerRim: Number(payload.sheetsPerRim || 500), status: payload.status || 'ACTIVE' };
    state.paperTypes.push(row);
  }
  writeRaw(state);
  audit(payload.paperTypeId ? 'PAPER_TYPE_UPDATE' : 'PAPER_TYPE_ADD', `${payload.paperTypeId ? 'Updated' : 'Added'} paper type ${row.code} — ${row.name}.`, actor);
  return clone(row);
}

export function deletePaperType(id, actor) {
  const state = readRaw();
  if (state.entries.some((row) => row.paperTypeId === Number(id))) throw new Error('This paper type is already used in tracker entries and cannot be deleted. Set it inactive instead.');
  const index = state.paperTypes.findIndex((row) => row.paperTypeId === Number(id));
  if (index < 0) throw new Error('Paper type not found.');
  const [row] = state.paperTypes.splice(index, 1);
  writeRaw(state);
  audit('PAPER_TYPE_DELETE', `Deleted paper type ${row.code}.`, actor);
  return clone(row);
}

export function savePrinter(payload, actor) {
  const state = readRaw();
  let row;
  if (payload.printerId) {
    row = state.printers.find((p) => p.printerId === Number(payload.printerId));
    if (!row) throw new Error('Printer not found.');
    Object.assign(row, { code: payload.code.trim().toUpperCase(), name: payload.name.trim(), branchId: Number(payload.branchId), deptId: payload.deptId ? Number(payload.deptId) : null, location: payload.location?.trim() || '', status: payload.status || 'ACTIVE' });
  } else {
    row = { printerId: state.sequence.printer++, code: payload.code.trim().toUpperCase(), name: payload.name.trim(), branchId: Number(payload.branchId), deptId: payload.deptId ? Number(payload.deptId) : null, location: payload.location?.trim() || '', status: payload.status || 'ACTIVE' };
    state.printers.push(row);
  }
  writeRaw(state);
  audit(payload.printerId ? 'PRINTER_UPDATE' : 'PRINTER_ADD', `${payload.printerId ? 'Updated' : 'Added'} printer ${row.code} — ${row.name}.`, actor);
  return clone(row);
}

export function deletePrinter(id, actor) {
  const state = readRaw();
  if (state.entries.some((row) => row.printerId === Number(id))) throw new Error('This printer has usage history and cannot be deleted. Set it inactive instead.');
  const index = state.printers.findIndex((row) => row.printerId === Number(id));
  if (index < 0) throw new Error('Printer not found.');
  const [row] = state.printers.splice(index, 1);
  writeRaw(state);
  audit('PRINTER_DELETE', `Deleted printer ${row.code}.`, actor);
  return clone(row);
}

export function summarize(entries) {
  const pages = entries.reduce((sum, row) => sum + Number(row.totalPagesUsed || 0), 0);
  const requisitionRims = entries.reduce((sum, row) => sum + (String(row.requisitionUnit).toLowerCase().startsWith('rim') ? Number(row.requisitionQty || 0) : 0), 0);
  const paperTypes = new Set(entries.map((row) => row.paperTypeName)).size;
  const printers = new Set(entries.map((row) => row.printerId)).size;
  const months = [...new Set(entries.map((row) => row.month))].sort();
  return { pages, requisitionRims, paperTypes, printers, months, latestMonth: months.at(-1) || '—' };
}

export function monthlyTrend(entries) {
  const map = new Map();
  for (const row of entries) map.set(row.month, (map.get(row.month) || 0) + Number(row.totalPagesUsed || 0));
  return [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([month, pages]) => ({ month, pages }));
}

export function exportEntriesCsv(entries) {
  const headers = ['Month','Branch','Department / Scope','Printer Code','Printer','Paper Type','Starting Page Count','Ending Page Count','Total Pages Used','Paper In Hand Qty','Paper In Hand Unit','Requisition Qty','Requisition Unit','Status','Recorded By','Remarks'];
  const quote = (value) => `"${String(value ?? '').replaceAll('"','""')}"`;
  return [headers, ...entries.map((row) => [row.month,row.branchName,row.deptName,row.printerCode,row.printerName,row.paperTypeName,row.startingPageCount,row.endingPageCount,row.totalPagesUsed,row.paperInHandQty,row.paperInHandUnit,row.requisitionQty,row.requisitionUnit,row.status,row.recordedByName,row.remarks])].map((line) => line.map(quote).join(',')).join('\n');
}
