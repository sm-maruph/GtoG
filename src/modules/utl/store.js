import { recordAudit } from '../../core/audit/store';
import { hoursBetween, isoDate, monthValue } from './format.js';
import { lineAmount, REAL_UTILITY_CATALOG } from './archetypes.js';

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

const DEFAULT_FUEL_STATIONS=[
  {id:'sikder',name:'Sikder Filling Station'},
  {id:'gulshan',name:'Gulshan Service Station'},
  {id:'city',name:'City Filling Station'},
];
const DEFAULT_FUEL_ASSETS=[
  ['Chief Executive Officer','0163','No Limit'],['Dy. CEO & Chief Operating Officer','9099','No Limit'],['Dy. CEO & Head of Corporate Banking','0846','350 L'],['Chief Risk & Investment Strategy Officer','9112','No Limit'],['Shakir Khusru (SAGM)','6471/1392/4374/9532/0941/9531','300 L'],['Zafrul Hasan (Chief Manager)','2099','250 L'],['Md. Iftekher Hossain (Chief Manager)','3727/3394','250 L'],['Pool Micro (L300) Dhaka (Diesel)','5750','No Limit'],['Pool Pajero','8551','No Limit'],['Pool Car (Toyota)','5217','No Limit'],['Pool Car (Lancer)','4907','No Limit'],['Pool Car (Micro)','3636','No Limit'],['Chittagong (Micro)','9177','No Limit'],['Generator — Tejgaon','GEN-TEJ','No Limit'],
].map((row,index)=>({id:index+1,name:row[0],vehicleNo:row[1],usageLimit:row[2],active:true}));

function seedUnifiedBills(branches) {
  const bills=[]; let id=1;
  for (const type of REAL_UTILITY_CATALOG) {
    for (const [branchIndex, branch] of branches.entries()) {
      if(type.code==='FUEL'&&branch.code!=='801') continue;
      let previous=0;
      for (let offset=-8; offset<=0; offset++) {
        if(type.code==='REUTERS'&&(offset+8)%3!==0)continue;
        const d=new Date();d.setDate(1);d.setMonth(d.getMonth()+offset);const periodStart=isoDate(d);const end=new Date(d.getFullYear(),d.getMonth()+(type.code==='REUTERS'?3:1),0);const periodEnd=isoDate(end);const trend=(offset+9)*1750,base=18500+(branchIndex*6200)+(type.code.length*950)+trend;
        let lines;
        if(type.archetype==='METERED') lines=['Level-1','Level-2','Level-3','Server Room'].map((label,i)=>{const previousReading=18000+i*2700+(offset+9)*1100+branchIndex*350,presentReading=previousReading+900+i*125+branchIndex*80;return{label,meterNo:`${branch.code}-${274015+i}`,previousReading,presentReading,unitPrice:17.49};});
        else if(type.archetype==='ASSET') lines=(type.code==='FUEL'?DEFAULT_FUEL_ASSETS:[{name:'Executive User',vehicleNo:`${type.code.slice(0,3)}-${branch.code}-1`,usageLimit:'No Limit'},{name:'Operations User',vehicleNo:`${type.code.slice(0,3)}-${branch.code}-2`,usageLimit:'2,500'},{name:'Pool Asset',vehicleNo:`${type.code.slice(0,3)}-${branch.code}-3`,usageLimit:'1,500'}]).map((asset,i)=>{const stationTotal=base/(type.code==='FUEL'?DEFAULT_FUEL_ASSETS.length:3)+i*240,userExpense=i===4?(offset+9)*225:0;return{label:asset.name,assetNo:asset.vehicleNo,usageLimit:asset.usageLimit,consumption:125+i*18,station_sikder:stationTotal*.35,station_gulshan:stationTotal*.45,station_city:stationTotal*.2,userExpense};});
        else if(type.archetype==='SERVICE') lines=['Corporate route','Embassy route','Branch transfer'].map((label,i)=>({label,rate:2100+branchIndex*125,quantity:8+i*3+(offset+9),group:branch.name}));
        else if(type.archetype==='COMPOSITE') lines=[['Electricity',base*.55],['Service Charge',13200],['Water & Sewerage',6100],['Generator Fuel',(offset+9)*700]].map(([label,amount],i)=>({label,amount,units:i===0?2500+(offset+9)*150:0}));
        else lines=[{label:type.code==='REUTERS'?'Quarterly service charge':`${type.name} monthly bill`,amount:type.currency==='USD'?8500+(offset+9)*95:base}];
        lines=lines.map(line=>({...line,amount:Math.round(lineAmount(type.archetype,line)*100)/100}));const subtotal=lines.reduce((s,l)=>s+l.amount,0),vatAmount=subtotal*type.defaultVatRate/100,grandTotal=subtotal+vatAmount,conversionRate=type.currency==='BDT'?1:122.5+(offset+9)*.22,grandTotalBdt=grandTotal*conversionRate;
        bills.push({id:id++,branchCode:branch.code,branchName:branch.name,utilityTypeId:type.id,archetype:type.archetype,periodType:type.code==='REUTERS'?'QUARTER':'MONTH',periodStart,periodEnd,currency:type.currency,conversionRate,subtotal,vatRate:type.defaultVatRate,vatAmount,otherCharges:0,grandTotal,grandTotalBdt,previousAmount:previous,deltaAmount:previous?grandTotalBdt-previous:0,source:(offset+branchIndex)%2===0?'IMPORT':'MANUAL',referenceNo:`${type.code}-${branch.code}-${periodStart.slice(0,7)}`,remarks:'Demo visualization data',attachment:{name:`${type.code.toLowerCase()}-${periodStart.slice(0,7)}.pdf`,size:125000,type:'application/pdf'},lines,createdBy:'Demo Data',createdAt:now(),updatedAt:now()});previous=grandTotalBdt;
      }
    }
  }
  return bills;
}

const CANONICAL_BRANCHES = [
  { id:1, code:'803', name:'Agrabad Branch', region:'Chattogram', fuelRate:3.8 },
  { id:2, code:'822', name:'CEPZ Sub Branch', region:'Chattogram', fuelRate:3.7 },
  { id:3, code:'823', name:'Corporate Branch', region:'Dhaka', fuelRate:3.5 },
  { id:4, code:'824', name:'DEPZ Sub Branch', region:'Dhaka', fuelRate:3.6 },
  { id:5, code:'805', name:'Dhanmondi Branch', region:'Dhaka', fuelRate:3.4 },
  { id:6, code:'802', name:'Gulshan Branch', region:'Dhaka', fuelRate:3.2 },
  { id:7, code:'801', name:'Head Office BD', region:'Dhaka', fuelRate:3.5 },
  { id:8, code:'809', name:'Mirpur Branch', region:'Dhaka', fuelRate:3.4 },
  { id:9, code:'804', name:'Motijheel Branch', region:'Dhaka', fuelRate:3.3 },
  { id:10, code:'808', name:'Narayanganj Branch', region:'Dhaka', fuelRate:3.4 },
  { id:11, code:'807', name:'Panthapath Branch', region:'Dhaka', fuelRate:3.6 },
  { id:12, code:'825', name:'SME CDA Avenue', region:'Chattogram', fuelRate:3.6 },
  { id:13, code:'826', name:'SME Jubilee Road', region:'Chattogram', fuelRate:3.6 },
  { id:14, code:'827', name:'SME Old Dhaka', region:'Dhaka', fuelRate:3.5 },
  { id:15, code:'828', name:'SME Pragati Sharani', region:'Dhaka', fuelRate:3.5 },
  { id:16, code:'829', name:'SME Shantinagar', region:'Dhaka', fuelRate:3.5 },
  { id:17, code:'830', name:'SME Tongi', region:'Dhaka', fuelRate:3.6 },
  { id:18, code:'812', name:'Sylhet Branch', region:'Sylhet', fuelRate:3.8 },
  { id:19, code:'810', name:'Tejgaon Branch', region:'Dhaka', fuelRate:3.7 },
  { id:20, code:'831', name:'US Embassy Sub Branch', region:'Dhaka', fuelRate:3.4 },
  { id:21, code:'806', name:'Uttara Branch', region:'Dhaka', fuelRate:3.5 },
];

function seedBranches() {
  return CANONICAL_BRANCHES.map((branch)=>({...branch}));
  /* Legacy demo branch list retained below only for migration history.
    { code: '801', name: 'Head Office — Gulshan', region: 'Dhaka', fuelRate: 3.5 },
    { code: '802', name: 'Gulshan Branch', region: 'Dhaka', fuelRate: 3.2 },
    { code: '803', name: 'Agrabad Branch', region: 'Chattogram', fuelRate: 3.8 },
    { code: '808', name: 'Narayanganj Branch', region: 'Dhaka', fuelRate: 3.4 },
    { code: '804', name: 'Motijheel Branch', region: 'Dhaka', fuelRate: 3.3 },
    { code: '805', name: 'Dhanmondi Branch', region: 'Dhaka', fuelRate: 3.4 },
    { code: '806', name: 'Uttara Branch', region: 'Dhaka', fuelRate: 3.5 },
    { code: '807', name: 'Panthapath Branch', region: 'Dhaka', fuelRate: 3.6 },
    { code: '809', name: 'Mirpur Branch', region: 'Dhaka', fuelRate: 3.4 },
    { code: '810', name: 'Tejgaon Branch', region: 'Dhaka', fuelRate: 3.7 },
    { code: '811', name: 'Banani Branch', region: 'Dhaka', fuelRate: 3.2 },
    { code: '812', name: 'Sylhet Branch', region: 'Sylhet', fuelRate: 3.8 },
    { code: '813', name: 'Khulna Branch', region: 'Khulna', fuelRate: 3.7 },
    { code: '814', name: 'Rajshahi Branch', region: 'Rajshahi', fuelRate: 3.6 },
    { code: '815', name: 'Barishal Branch', region: 'Barishal', fuelRate: 3.8 },
    { code: '816', name: 'Comilla Branch', region: 'Chattogram', fuelRate: 3.6 },
    { code: '817', name: 'Bogra Branch', region: 'Rajshahi', fuelRate: 3.7 },
    { code: '818', name: 'Mymensingh Branch', region: 'Mymensingh', fuelRate: 3.7 },
    { code: '819', name: 'Cox’s Bazar Branch', region: 'Chattogram', fuelRate: 3.9 },
    { code: '820', name: 'Jessore Branch', region: 'Khulna', fuelRate: 3.7 },
    { code: '821', name: 'Rangpur Branch', region: 'Rangpur', fuelRate: 3.8 },
  ]; */
}

function seedState() {
  const branches = seedBranches();
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
  const bills = seedUnifiedBills(branches);
  return {
    demoDataVersion: 7,
    branches, generatorRuns, fuelPurchases, electricBills, wasaBills, waterDeliveries, waterBills,
    utilityTypes: clone(REAL_UTILITY_CATALOG),
    fuelStations: clone(DEFAULT_FUEL_STATIONS),
    fuelAssets: clone(DEFAULT_FUEL_ASSETS),
    bills,
    utilityRecords: [],
    users: [
      { id: 1, email: 'shakir.khasru@combankbd.com', employeeId: 'BNGL0171', name: 'Shakir Khasru', role: 'Admin', branchCode: '801', branchName: branches.find(b=>b.code==='801').name, active: true, lastLogin: now() },
      { id: 2, email: 'rakib.hasan@combankbd.com', employeeId: 'BNGL0610', name: 'Rakib Hasan', role: 'Data Entry', branchCode: '802', branchName: branches.find(b=>b.code==='802').name, active: true, lastLogin: now() },
      { id: 3, email: 'samira.chowdhury@combankbd.com', employeeId: 'BNGL0901', name: 'Samira Chowdhury', role: 'Data Entry', branchCode: '803', branchName: branches.find(b=>b.code==='803').name, active: true, lastLogin: now() },
    ],
    audit: [{ id: 1, timestamp: now(), action: 'MODULE_INITIALISED', user: 'system', detail: 'Utility Tracker demo data created.' }],
    seq: { generator: 6, fuel: 4, electric: 100, wasa: 100, delivery: 4, waterBill: 3, utilityRecord: 1, bill: bills.length + 1, fuelAsset:DEFAULT_FUEL_ASSETS.length+1, fuelStation:4, user: 4, audit: 2 },
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const state = JSON.parse(raw);
      state.branches = seedBranches();
      state.users = (state.users||[]).map((user)=>({...user,branchName:state.branches.find((b)=>b.code===user.branchCode)?.name||user.branchName}));
      state.utilityTypes ||= [];
      state.fuelStations ||= clone(DEFAULT_FUEL_STATIONS);
      state.fuelAssets ||= clone(DEFAULT_FUEL_ASSETS);
      for (const type of REAL_UTILITY_CATALOG) if (!state.utilityTypes.some((t) => t.code === type.code || t.id === type.id)) state.utilityTypes.push(clone(type));
      state.utilityTypes = state.utilityTypes.map((t) => t.archetype ? t : { ...t, code: (t.code || t.name).toUpperCase().replace(/[^A-Z0-9]+/g,'_'), archetype:'SIMPLE', defaultVatRate:0, currency:'BDT', requiresConversion:false, owningDepartment:'Administration' });
      state.bills ||= [];
      if ((state.demoDataVersion || 0) < 7) {
        state.bills = state.bills.filter((b) => b.createdBy !== 'Demo Data');
        state.bills.push(...seedUnifiedBills(state.branches));
        state.demoDataVersion = 7;
      } else if (!state.bills.length) state.bills = seedUnifiedBills(state.branches);
      state.utilityRecords ||= [];
      state.seq ||= {};
      state.seq.fuelAsset ||= Math.max(0,...state.fuelAssets.map((asset)=>Number(asset.id)||0))+1;
      state.seq.fuelStation ||= state.fuelStations.length+1;
      state.seq.utilityRecord ||= Math.max(0, ...state.utilityRecords.map((r) => Number(r.id) || 0)) + 1;
      state.seq.bill = Math.max(Number(state.seq.bill)||1, Math.max(0, ...state.bills.map((r) => Number(r.id) || 0)) + 1);
      return state;
    }
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
export function saveUtilityType(payload, actor) { return update((s) => {
  s.utilityTypes ||= [];
  const clean = { ...payload, name: payload.name.trim(), code: payload.code.trim().toUpperCase().replace(/[^A-Z0-9]+/g,'_'), defaultVatRate:Number(payload.defaultVatRate)||0, currency:payload.currency||'BDT', requiresConversion:payload.currency!=='BDT', active: payload.active !== false };
  if (payload.id) { const i = s.utilityTypes.findIndex((t) => t.id === payload.id); s.utilityTypes[i] = clean; }
  else { clean.id = `${clean.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${Date.now().toString(36)}`; s.utilityTypes.push(clean); }
  audit(s, payload.id ? 'UTILITY_TYPE_UPDATE' : 'UTILITY_TYPE_ADD', actor, clean.name);
}); }
export function deleteUtilityType(id, actor) { return update((s) => { const type = s.utilityTypes.find((t) => t.id === id); s.utilityTypes = s.utilityTypes.filter((t) => t.id !== id); audit(s, 'UTILITY_TYPE_DELETE', actor, type?.name || id); }); }
export function importUtilityRecords(typeId, rows, actor) { return update((s) => {
  const type = s.utilityTypes.find((t) => t.id === typeId); if (!type) throw new Error('Utility type not found.');
  const createdAt = now(); s.utilityRecords ||= [];
  rows.forEach((row) => s.utilityRecords.unshift({ id: s.seq.utilityRecord++, typeId, branchCode: row.branchCode, branchName: branchOf(s, row.branchCode)?.name || row.branchName || '', values: row.values, sourceFile: row.sourceFile || '', enteredBy: actor?.displayName || 'User', createdAt }));
  audit(s, 'UTILITY_BULK_IMPORT', actor, `${type.name}: ${rows.length} row(s)`);
}); }
export function saveBill(payload, actor) { return update((s) => {
  const type=s.utilityTypes.find(t=>t.id===payload.utilityTypeId); if(!type) throw new Error('Utility type not found.');
  const prior=(s.bills||[]).filter(b=>!b.deletedAt&&b.branchCode===payload.branchCode&&b.utilityTypeId===payload.utilityTypeId&&b.periodStart<payload.periodStart).sort((a,b)=>b.periodStart.localeCompare(a.periodStart))[0];
  const lines=(payload.lines||[]).map(line=>{const amount=Math.round(lineAmount(type.archetype,line)*100)/100,previousLine=prior?.lines?.find(old=>(old.assetNo&&old.assetNo===line.assetNo)||old.label===line.label),previousAmount=Number(previousLine?.amount||0),deltaAmount=amount-previousAmount;return{...line,amount,previousAmount,deltaAmount,deltaPercentage:previousAmount?deltaAmount/previousAmount*100:0};});
  const subtotal=lines.reduce((sum,line)=>sum+Number(line.amount||0),0), vatRate=Number(payload.vatRate??type.defaultVatRate)||0, vatAmount=subtotal*vatRate/100, otherCharges=Number(payload.otherCharges)||0;
  const grandTotal=subtotal+vatAmount+otherCharges, conversionRate=payload.currency==='BDT'?1:Number(payload.conversionRate)||1, grandTotalBdt=grandTotal*conversionRate;
  const bill={...payload,id:s.seq.bill++,archetype:type.archetype,lines,subtotal,vatRate,vatAmount,otherCharges,grandTotal,conversionRate,grandTotalBdt,previousAmount:prior?.grandTotalBdt||0,deltaAmount:grandTotalBdt-(prior?.grandTotalBdt||0),branchName:branchOf(s,payload.branchCode)?.name||'',source:payload.source||'MANUAL',createdBy:actor?.displayName||'User',createdAt:now(),updatedAt:now()};
  s.bills ||= []; s.bills.unshift(bill); audit(s,'UTILITY_BILL_ADD',actor,`${type.name} • ${bill.branchName} • BDT ${grandTotalBdt.toFixed(2)}`);
}); }
export function deleteBill(id, actor) { return update((s)=>{const bill=s.bills.find(b=>b.id===id);if(bill)bill.deletedAt=now();audit(s,'UTILITY_BILL_DELETE',actor,String(id));}); }
export function saveFuelAsset(payload,actor){return update((s)=>{s.fuelAssets||=[];s.fuelAssets.push({id:s.seq.fuelAsset++,...payload,active:true});audit(s,'FUEL_ASSET_ADD',actor,`${payload.name} • ${payload.vehicleNo}`);});}
export function saveFuelStation(name,actor){return update((s)=>{s.fuelStations||=[];const id=`station-${s.seq.fuelStation++}`;s.fuelStations.push({id,name:name.trim()});audit(s,'FUEL_STATION_ADD',actor,name);});}
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
    runs, fuel, elec, wasaBills: wasa, deliveries: del, waterBills: wb,
    generator: { weeklyHours: runs.filter((r) => daysAgo(r.date) <= 7).reduce((a,r)=>a+Number(r.runHours||0),0), monthlyHours: monthlyRuns.reduce((a,r)=>a+Number(r.runHours||0),0), yearlyHours: runs.filter((r)=>daysAgo(r.date)<=365).reduce((a,r)=>a+Number(r.runHours||0),0), monthlyFuel: monthlyRuns.reduce((a,r)=>a+(Number(r.fuelActual)||Number(r.fuelEst)||0),0), fuelInHand: Math.max(0,bought90-used90) },
    electricity: { lastBill: elec[0]?.amount || 0, totalKwh: elec.reduce((a,r)=>a+Number(r.kwh||0),0), avgRate: elec.length?elec.reduce((a,r)=>a+Number(r.rate||0),0)/elec.length:0 },
    wasa: { lastBill: wasa[0]?.amount || 0, totalUnits: wasa.reduce((a,r)=>a+Number(r.units||0),0), avgRate: wasa.length?wasa.reduce((a,r)=>a+Number(r.rate||0),0)/wasa.length:0 },
    water: { delivered: del.reduce((a,r)=>a+Number(r.qty||0),0), billed: wb.reduce((a,r)=>a+Number(r.qty||0),0), amount: wb.reduce((a,r)=>a+Number(r.amount||0),0) },
    months, fuelTrend: byMonth(fuel,'qty','date'), electricTrend: byMonth(elec,'amount','billMonth'), electricKwh: byMonth(elec,'kwh','billMonth'), wasaTrend: byMonth(wasa,'amount','billMonth'), waterDeliveryTrend: byMonth(del,'qty','date'), waterBillTrend: byMonth(wb,'amount','billMonth'),
  };
}
