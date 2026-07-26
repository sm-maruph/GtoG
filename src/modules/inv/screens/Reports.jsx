import { useMemo,useState } from 'react';
import { AlertTriangle, Download, FileBarChart, WalletCards } from 'lucide-react';
import { useInventory } from '../InvContext';
import { formatMoney, monthValue, number } from '../../utl/format';
import { InvCard, InvPage, InvStat, Status } from '../components/InvUI';

function csv(rows){
  if(!rows.length)return;
  const keys=Object.keys(rows[0]);
  const body=[keys.join(','),...rows.map(r=>keys.map(k=>`"${String(r[k]??'').replaceAll('"','""')}"`).join(','))].join('\n');
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([body],{type:'text/csv'}));
  a.download='inventory-report.csv';
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function Reports(){
  const {state,centerStock,branchStock,requests,isProcurement,ownBranchId}=useInventory();
  const [kind,setKind]=useState('requisitions');
  const [month,setMonth]=useState(monthValue());
  const scopedBranchStock=useMemo(()=>branchStock(isProcurement?undefined:ownBranchId),[branchStock,isProcurement,ownBranchId,state]);
  const scopedConsumption=useMemo(()=>state.consumption.filter(x=>(isProcurement||x.branchId===ownBranchId)&&(!month||String(x.date).slice(0,7)===month)),[state.consumption,isProcurement,ownBranchId,month]);
  const monthRequests=useMemo(()=>requests.filter(r=>!month||r.month===month),[requests,month]);
  const lowRows=useMemo(()=>isProcurement
    ? centerStock.filter(x=>x.stock<=x.minStock).map(x=>({scope:'Centre',itemId:x.id,itemName:x.name,unit:x.unit,stock:x.stock,minStock:x.minStock,position:x.stock<=0?'OUT':'LOW'}))
    : scopedBranchStock.filter(x=>x.stock<=x.minStock).map(x=>({scope:x.branchName,itemId:x.itemId,itemName:x.itemName,unit:x.unit,stock:x.stock,minStock:x.minStock,position:x.stock<=0?'OUT':'LOW'})),[isProcurement,centerStock,scopedBranchStock]);

  const rows=useMemo(()=>{
    if(kind==='center') return centerStock.map(x=>({itemId:x.id,itemName:x.name,category:x.category,stock:x.stock,minStock:x.minStock,avgCost:x.avgCost,totalValue:x.totalValue}));
    if(kind==='branch') return scopedBranchStock.map(x=>({branch:x.branchName,itemId:x.itemId,itemName:x.itemName,stock:x.stock,avgCost:x.avgCost,totalValue:x.totalValue}));
    if(kind==='consumption') return scopedConsumption;
    if(kind==='low') return lowRows;
    return monthRequests.map(r=>({requestNo:r.no,month:r.month,requester:r.requesterName,unit:r.deptName||r.branchName,purpose:r.purpose,status:r.status,requested:r.items.reduce((a,x)=>a+x.requestedQty,0),approved:r.items.reduce((a,x)=>a+x.approvedQty,0),supplied:r.items.reduce((a,x)=>a+x.suppliedQty,0)}));
  },[kind,centerStock,scopedBranchStock,scopedConsumption,lowRows,monthRequests]);

  const total=isProcurement?centerStock.reduce((a,x)=>a+x.totalValue,0):scopedBranchStock.reduce((a,x)=>a+x.totalValue,0);
  return <InvPage title="Inventory Reports" subtitle="Month-end requisition, stock, consumption and low/out-of-stock reporting." actions={<button className="inv-primary" onClick={()=>csv(rows)}><Download size={14}/> Export CSV</button>}>
    <div className="inv-stat-grid inv-stat-grid-four">
      <InvStat icon={<FileBarChart size={18}/>} label="Requisitions in Month" value={monthRequests.length}/>
      <InvStat icon={<WalletCards size={18}/>} label={isProcurement?'Centre Stock Value':'Branch Stock Value'} value={formatMoney(total)} tone="green"/>
      <InvStat icon={<AlertTriangle size={18}/>} label="Low / Out Items" value={lowRows.length} tone="red"/>
      <InvStat icon={<AlertTriangle size={18}/>} label="Consumption Rows" value={scopedConsumption.length} tone="orange"/>
    </div>
    <div className="inv-filter">
      <div className="inv-page-actions">
        <select value={kind} onChange={e=>setKind(e.target.value)}>
          <option value="requisitions">Month-End Requisition Report</option>
          {isProcurement&&<option value="center">Centre Stock Report</option>}
          <option value="branch">Branch Stock Report</option>
          <option value="consumption">Consumption Report</option>
          <option value="low">Low / Out-of-Stock Report</option>
        </select>
        <input className="inv-search" type="month" value={month} onChange={e=>setMonth(e.target.value)}/>
      </div>
      <span>{rows.length} row(s)</span>
    </div>
    <InvCard title="Report Preview"><div className="inv-json-table">
      {kind==='requisitions'?<table className="inv-table"><thead><tr><th>Request</th><th>Month</th><th>Requester</th><th>Unit</th><th>Purpose</th><th>Requested</th><th>Approved</th><th>Supplied</th><th>Status</th></tr></thead><tbody>{monthRequests.map(r=><tr key={r.id}><td>{r.no}</td><td>{r.month}</td><td>{r.requesterName}</td><td>{r.deptName||r.branchName}</td><td>{r.purpose}</td><td>{r.items.reduce((a,x)=>a+x.requestedQty,0)}</td><td>{r.items.reduce((a,x)=>a+x.approvedQty,0)}</td><td>{r.items.reduce((a,x)=>a+x.suppliedQty,0)}</td><td><Status value={r.status}/></td></tr>)}</tbody></table>
      :<table className="inv-table"><thead><tr>{rows[0]&&Object.keys(rows[0]).map(k=><th key={k}>{k}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={i}>{Object.values(r).map((v,j)=><td key={j}>{typeof v==='number'?number(v,2):String(v)}</td>)}</tr>)}</tbody></table>}
    </div></InvCard>
  </InvPage>;
}
