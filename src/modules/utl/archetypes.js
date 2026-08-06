export const ARCHETYPES = {
  SIMPLE: { label:'Simple total', fields:[['label','Description','text'],['amount','Amount','number']] },
  METERED: { label:'Metered', fields:[['label','Floor / Location','text'],['meterNo','Meter No.','text'],['previousReading','Previous Reading','number'],['presentReading','Present Reading','number'],['unitPrice','Unit Price','number']] },
  ASSET: { label:'Asset / User', fields:[['label','User / Asset','text'],['assetNo','Vehicle / Mobile No.','text'],['limit','Usage Limit','number'],['consumption','Consumption','number'],['station1','Station / Provider 1','number'],['station2','Station / Provider 2','number'],['station3','Station / Provider 3','number'],['bankExpense','Bank Expense','number'],['userExpense','User Expense','number']] },
  SERVICE: { label:'Service', fields:[['label','Service / Location','text'],['rate','Rate','number'],['quantity','Quantity / Trips','number'],['group','Branch / Group','text']] },
  COMPOSITE: { label:'Composite bundle', fields:[['label','Component','text'],['amount','Amount','number'],['units','Units','number']] },
};

export const REAL_UTILITY_CATALOG = [
  ['SECURITY','Security Cash Carrying','SERVICE',15,'BDT',false,'Procurement & Logistics'],
  ['FUEL','Fuel','ASSET',0,'BDT',false,'Procurement & Logistics'],
  ['COURIER','Courier (ARAMEX / DHL)','SIMPLE',0,'USD',true,'Procurement & Logistics'],
  ['TELEPHONE','Telephone (PABX)','ASSET',0,'BDT',false,'Operations & Logistics'],
  ['MOBILE','Mobile (Grameen Phone)','ASSET',15,'BDT',false,'Procurement & Logistics'],
  ['INTERNET','Internet (Link-3)','SIMPLE',0,'BDT',false,'Procurement & Logistics'],
  ['ELECTRICITY','Electricity','METERED',5,'BDT',false,'Operations & Logistics'],
  ['WATER','Water & Sewerage','SIMPLE',0,'BDT',false,'Operations & Logistics'],
  ['NEWSPAPER','Newspaper','SIMPLE',0,'BDT',false,'Procurement & Logistics'],
  ['MAINTENANCE','Maintenance Charge','SIMPLE',0,'BDT',false,'Procurement & Logistics'],
  ['REUTERS','Reuters Service Charge','SIMPLE',15,'USD',true,'Procurement & Logistics'],
  ['BRANCH_BUNDLE','Composite Branch Bundle','COMPOSITE',0,'BDT',false,'Procurement & Logistics'],
].map(([code,name,archetype,defaultVatRate,currency,requiresConversion,owningDepartment])=>({id:code.toLowerCase(),code,name,archetype,defaultVatRate,currency,requiresConversion,owningDepartment,active:true}));

export function lineAmount(archetype,line){
  if(archetype==='METERED') return Math.max(0,Number(line.presentReading||0)-Number(line.previousReading||0))*Number(line.unitPrice||0);
  if(archetype==='SERVICE') return Number(line.rate||0)*Number(line.quantity||0);
  if(archetype==='ASSET') { const stationTotal=Number(line.stationAmount||0)+Object.entries(line).filter(([key])=>key.startsWith('station_')||/^station\d+$/.test(key)).reduce((sum,[,value])=>sum+Number(value||0),0); return (line.bankExpense!==undefined&&line.bankExpense!=='')?Number(line.bankExpense||0)+Number(line.userExpense||0):stationTotal+Number(line.userExpense||0); }
  return Number(line.amount||0);
}
