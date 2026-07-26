import { recordAudit } from '../../core/audit/store';
import { hoursBetween, isoDate, monthValue } from './format.js';

const KEY = 'cbc.utility.module.v1';

function dateOffset(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return isoDate(d);
}
function monthOffset(delta) {
  const d = new Date();
  d.setDate(1); d.setMonth(d.getMonth() + delta);
  return monthValue(d);
}
function now() { return new Date().toISOString(); }
function clone(v) { return JSON.parse(JSON.stringify(v)); }

function seedState() {
  const branches = [
    { code: '801', name: 'Head Office — Gulshan', region: 'Dhaka', fuelRate: 3.5 },
    { code: '802', name: 'Gulshan Branch', region: 'Dhaka', fuelRate: 3.2 },
    { code: '803', name: 'Agrabad Branch', region: 'Chattogram', fuelRate: 3.8 },
    { code: '808', name: 'Narayanganj Branch', region: 'Dhaka', fuelRate: 3.4 },
  ];
  const generatorRuns = [
    { id: 1, date: dateOffset(-1), branchCode: '801', branchName: branches[0].name, start: '10:00', end: '12:30', runHours: 2.5, fuelEst: 8.75, fuelActual: 8.4, remarks: 'Scheduled load-shedding', enteredBy: 'Shakir Khasru' },
    { id: 2, date: dateOffset(-2), branchCode: '802', branchName: branches[1].name, start: '14:10', end: '16:05', runHours: 1.92, fuelEst: 6.14, fuelActual: 6.2, remarks: 'Grid outage', enteredBy: 'Rakib Hasan' },
    { id: 3, date: dateOffset(-3), branchCode: '803', branchName: branches[2].name, start: '11:00', end: '13:20', runHours: 2.33, fuelEst: 8.85, fuelActual: 8.6, remarks: '', enteredBy: 'Samira Chowdhury' },
    { id: 4, date: dateOffset(-5), branchCode: '801', branchName: branches[0].name, start: '09:05', end: '10:25', runHours: 1.33, fuelEst: 4.66, fuelActual: 4.5, remarks: 'Maintenance test', enteredBy: 'Shakir Khasru' },
    { id: 5, date: dateOffset(-8), branchCode: '808', branchName: branches[3].name, start: '15:00', end: '17:15', runHours: 2.25, fuelEst: 7.65, fuelActual: 7.5, remarks: '', enteredBy: 'Mahmudul Hasan' },
  ];
  const fuelPurchases = [
    { id: 1, date: dateOffset(-4), branchCode: '801', branchName: branches[0].name, qty: 100, rate: 110, amount: 11000, vendor: 'Padma Oil', remarks: '', enteredBy: 'Shakir Khasru' },
    { id: 2, date: dateOffset(-12), branchCode: '802', branchName: branches[1].name, qty: 75, rate: 111, amount: 8325, vendor: 'Meghna Petroleum', remarks: '', enteredBy: 'Rakib Hasan' },
    { id: 3, date: dateOffset(-35), branchCode: '803', branchName: branches[2].name, qty: 120, rate: 109, amount: 13080, vendor: 'Jamuna Oil', remarks: '', enteredBy: 'Samira Chowdhury' },
  ];
  const electricBills = branches.flatMap((b, bi) => [-5, -4, -3, -2, -1, 0].map((m, i) => ({
    id: bi * 10 + i + 1, billMonth: monthOffset(m), branchCode: b.code, branchName: b.name,
    kwh: 4100 + bi * 620 + i * 150, rate: 11.25 + bi * .15,
    amount: Math.round((4100 + bi * 620 + i * 150) * (11.25 + bi * .15)), remarks: '', enteredBy: 'Utility User',
  })));
  const wasaBills = branches.flatMap((b, bi) => [-5, -4, -3, -2, -1, 0].map((m, i) => ({
    id: bi * 10 + i + 1, billMonth: monthOffset(m), branchCode: b.code, branchName: b.name,
    units: 280 + bi * 45 + i * 12, rate: 15 + bi, amount: Math.round((280 + bi * 45 + i * 12) * (15 + bi)), remarks: '', enteredBy: 'Utility User',
  })));
  const waterDeliveries = [
    { id: 1, date: dateOffset(-2), branchCode: '801', branchName: branches[0].name, qty: 2000, vendor: 'Fresh Water Supply', remarks: '', enteredBy: 'Shakir Khasru' },
    { id: 2, date: dateOffset(-6), branchCode: '802', branchName: branches[1].name, qty: 1200, vendor: 'Blue Drop', remarks: '', enteredBy: 'Rakib Hasan' },
    { id: 3, date: dateOffset(-15), branchCode: '803', branchName: branches[2].name, qty: 1800, vendor: 'Port City Water', remarks: '', enteredBy: 'Samira Chowdhury' },
  ];
  const waterBills = [
    { id: 1, billMonth: monthOffset(0), branchCode: '801', branchName: branches[0].name, qty: 4000, amount: 7200, remarks: '', enteredBy: 'Shakir Khasru' },
    { id: 2, billMonth: monthOffset(0), branchCode: '802', branchName: branches[1].name, qty: 2400, amount: 4560, remarks: '', enteredBy: 'Rakib Hasan' },
  ];
  return {
    branches, generatorRuns, fuelPurchases, electricBills, wasaBills, waterDeliveries, waterBills,
    users: [
      { id: 1, email: 'shakir.khasru@combankbd.com', employeeId: 'BNGL0171', name: 'Shakir Khasru', role: 'Admin', branchCode: '801', branchName: branches[0].name, active: true, lastLogin: now() },
      { id: 2, email: 'rakib.hasan@combankbd.com', employeeId: 'BNGL0610', name: 'Rakib Hasan', role: 'Branch User', branchCode: '802', branchName: branches[1].name, active: true, lastLogin: now() },
      { id: 3, email: 'samira.chowdhury@combankbd.com', employeeId: 'BNGL0901', name: 'Samira Chowdhury', role: 'Branch User', branchCode: '803', branchName: branches[2].name, active: true, lastLogin: now() },
    ],
    audit: [{ id: 1, timestamp: now(), action: 'MODULE_INITIALISED', user: 'system', detail: 'Utility Tracker demo data created.' }],
    seq: { generator: 6, fuel: 4, electric: 100, wasa: 100, delivery: 4, waterBill: 3, user: 4, audit: 2 },
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignored */ }
  const seeded = seedState(); saveState(seeded); return seeded;
}
export function saveState(state) { localStorage.setItem(KEY, JSON.stringify(state)); return state; }
function update(mutator) { const state = loadState(); mutator(state); return saveState(state); }
function audit(state, action, actor, detail) {
  state.audit.unshift({ id: state.seq.audit++, timestamp: now(), action, user: actor?.email || actor?.displayName || 'unknown', detail });
  recordAudit({ moduleCode: 'utl', action, detail, actor });
}
function branchOf(state, code) { return state.branches.find((b) => b.code === code); }

export function addGeneratorRun(payload, actor) {
  return update((s) => { const b = branchOf(s, payload.branchCode); const runHours = hoursBetween(payload.start, payload.end); const fuelEst = Number(payload.fuelEst || (runHours * Number(b?.fuelRate || 3.5)));
    s.generatorRuns.unshift({ id: s.seq.generator++, ...payload, branchName: b?.name || payload.branchName, runHours, fuelEst: Math.round(fuelEst * 100) / 100, fuelActual: Number(payload.fuelActual) || 0, enteredBy: actor?.displayName || 'User' });
    audit(s, 'GENERATOR_RUN_ADD', actor, `${b?.name}: ${runHours} hour(s)`); });
}
export function addFuelPurchase(payload, actor) { return update((s) => { const b = branchOf(s, payload.branchCode); const qty = Number(payload.qty), rate = Number(payload.rate); s.fuelPurchases.unshift({ id: s.seq.fuel++, ...payload, branchName: b?.name, qty, rate, amount: qty * rate, enteredBy: actor?.displayName || 'User' }); audit(s, 'FUEL_PURCHASE_ADD', actor, `${b?.name}: ${qty} L`); }); }
export function addElectricBill(payload, actor) { return update((s) => { const b = branchOf(s, payload.branchCode); const kwh = Number(payload.kwh), rate = Number(payload.rate); s.electricBills.unshift({ id: s.seq.electric++, ...payload, branchName: b?.name, kwh, rate, amount: kwh * rate, enteredBy: actor?.displayName || 'User' }); audit(s, 'ELECTRIC_BILL_ADD', actor, `${b?.name}: ${payload.billMonth}`); }); }
export function addWasaBill(payload, actor) { return update((s) => { const b = branchOf(s, payload.branchCode); const units = Number(payload.units), rate = Number(payload.rate); s.wasaBills.unshift({ id: s.seq.wasa++, ...payload, branchName: b?.name, units, rate, amount: units * rate, enteredBy: actor?.displayName || 'User' }); audit(s, 'WASA_BILL_ADD', actor, `${b?.name}: ${payload.billMonth}`); }); }
export function addWaterDelivery(payload, actor) { return update((s) => { const b = branchOf(s, payload.branchCode); s.waterDeliveries.unshift({ id: s.seq.delivery++, ...payload, branchName: b?.name, qty: Number(payload.qty), enteredBy: actor?.displayName || 'User' }); audit(s, 'WATER_DELIVERY_ADD', actor, `${b?.name}: ${payload.qty} L`); }); }
export function addWaterBill(payload, actor) { return update((s) => { const b = branchOf(s, payload.branchCode); s.waterBills.unshift({ id: s.seq.waterBill++, ...payload, branchName: b?.name, qty: Number(payload.qty), amount: Number(payload.amount), enteredBy: actor?.displayName || 'User' }); audit(s, 'WATER_BILL_ADD', actor, `${b?.name}: ${payload.billMonth}`); }); }
export function saveUser(payload, actor) { return update((s) => { const b = branchOf(s, payload.branchCode); if (payload.id) { const i = s.users.findIndex((u) => u.id === payload.id); s.users[i] = { ...s.users[i], ...payload, branchName: b?.name || '' }; } else s.users.push({ ...payload, id: s.seq.user++, branchName: b?.name || '', lastLogin: null }); audit(s, payload.id ? 'USER_UPDATE' : 'USER_ADD', actor, payload.email); }); }
export function deleteUser(id, actor) { return update((s) => { const u = s.users.find((x) => x.id === id); s.users = s.users.filter((x) => x.id !== id); audit(s, 'USER_DELETE', actor, u?.email || String(id)); }); }
export function reset(actor) { const s = seedState(); saveState(s); recordAudit({ moduleCode: 'utl', action: 'DEMO_RESET', detail: 'Utility Tracker demonstration data reset.', actor }); return clone(s); }

export function scopedRows(rows, branchCode) { return !branchCode || branchCode === 'ALL' ? rows : rows.filter((r) => r.branchCode === branchCode); }

function lastMonths(count = 12) {
  const out = [];
  for (let i = count - 1; i >= 0; i--) { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i); out.push(monthValue(d)); }
  return out;
}
export function analytics(state, branchCode = 'ALL') {
  const runs = scopedRows(state.generatorRuns, branchCode); const fuel = scopedRows(state.fuelPurchases, branchCode); const elec = scopedRows(state.electricBills, branchCode); const wasa = scopedRows(state.wasaBills, branchCode); const del = scopedRows(state.waterDeliveries, branchCode); const wb = scopedRows(state.waterBills, branchCode);
  const today = new Date(); today.setHours(0,0,0,0); const daysAgo = (v) => Math.floor((today - new Date(`${v}T00:00:00`)) / 86400000);
  const monthlyRuns = runs.filter((r) => daysAgo(r.date) <= 30); const used90 = runs.filter((r) => daysAgo(r.date) <= 90).reduce((a,r) => a + (Number(r.fuelActual) || Number(r.fuelEst) || 0), 0); const bought90 = fuel.filter((r) => daysAgo(r.date) <= 90).reduce((a,r) => a + Number(r.qty || 0), 0);
  const months = lastMonths();
  const byMonth = (rows, valueKey, dateKey) => months.map((m) => rows.filter((r) => String(r[dateKey]).slice(0,7) === m).reduce((a,r) => a + Number(r[valueKey] || 0), 0));
  return {
    runs, fuel, elec, wasa, deliveries: del, waterBills: wb,
    generator: { weeklyHours: runs.filter((r) => daysAgo(r.date) <= 7).reduce((a,r)=>a+Number(r.runHours||0),0), monthlyHours: monthlyRuns.reduce((a,r)=>a+Number(r.runHours||0),0), yearlyHours: runs.filter((r)=>daysAgo(r.date)<=365).reduce((a,r)=>a+Number(r.runHours||0),0), monthlyFuel: monthlyRuns.reduce((a,r)=>a+(Number(r.fuelActual)||Number(r.fuelEst)||0),0), fuelInHand: Math.max(0,bought90-used90) },
    electricity: { lastBill: elec[0]?.amount || 0, totalKwh: elec.reduce((a,r)=>a+Number(r.kwh||0),0), avgRate: elec.length?elec.reduce((a,r)=>a+Number(r.rate||0),0)/elec.length:0 },
    wasa: { lastBill: wasa[0]?.amount || 0, totalUnits: wasa.reduce((a,r)=>a+Number(r.units||0),0), avgRate: wasa.length?wasa.reduce((a,r)=>a+Number(r.rate||0),0)/wasa.length:0 },
    water: { delivered: del.reduce((a,r)=>a+Number(r.qty||0),0), billed: wb.reduce((a,r)=>a+Number(r.qty||0),0), amount: wb.reduce((a,r)=>a+Number(r.amount||0),0) },
    months, fuelTrend: byMonth(fuel,'qty','date'), electricTrend: byMonth(elec,'amount','billMonth'), electricKwh: byMonth(elec,'kwh','billMonth'), wasaTrend: byMonth(wasa,'amount','billMonth'), waterDeliveryTrend: byMonth(del,'qty','date'), waterBillTrend: byMonth(wb,'amount','billMonth'),
  };
}
