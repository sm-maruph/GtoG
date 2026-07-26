import { useMemo,useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useInventory } from '../InvContext';
import { formatDate, formatMoney, isoDate, number } from '../../utl/format';
import { Field, InvCard, InvPage } from '../components/InvUI';

export default function Consumption(){
  const {state,actions,isProcurement,ownBranchId,branchStock}=useInventory();
  const [form,setForm]=useState({date:isoDate(),branchId:isProcurement?'802':ownBranchId,itemId:'',qty:'',purpose:''});
  const available=useMemo(()=>branchStock(form.branchId),[branchStock,form.branchId,state]);
  const log=useMemo(()=>isProcurement?state.consumption:state.consumption.filter(x=>x.branchId===ownBranchId),[state.consumption,isProcurement,ownBranchId]);
  function submit(e){e.preventDefault();try{actions.recordConsumption(form);setForm({...form,itemId:'',qty:'',purpose:''})}catch(x){alert(x.message)}}
  return <InvPage title="Record Consumption" subtitle="Issue stationery for actual use and reduce branch stock at recorded cost.">
    <div className="inv-grid-two">
      <InvCard title="New Consumption"><form className="inv-form-grid" onSubmit={submit}>
        <Field label="Date"><input type="date" required value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></Field>
        <Field label="Branch"><select value={form.branchId} disabled={!isProcurement} onChange={e=>setForm({...form,branchId:e.target.value,itemId:''})}>{state.branches.filter(b=>b.id!=='801').map(b=><option key={b.id} value={b.id}>{b.name}</option>)}</select></Field>
        <Field label="Item"><select required value={form.itemId} onChange={e=>setForm({...form,itemId:e.target.value})}><option value="">Select available item</option>{available.filter(x=>x.stock>0).map(x=><option key={x.itemId} value={x.itemId}>{x.itemName} — Available {x.stock}</option>)}</select></Field>
        <Field label="Quantity Used"><input type="number" min="1" required value={form.qty} onChange={e=>setForm({...form,qty:e.target.value})}/></Field>
        <Field label="Purpose" full><input required value={form.purpose} onChange={e=>setForm({...form,purpose:e.target.value})}/></Field>
        <button className="inv-primary" type="submit"><ShoppingCart size={15}/> Record Consumption</button>
      </form></InvCard>
      <InvCard title="Available Branch Stock"><div className="inv-alert-list">{available.map(x=><div key={x.itemId}><span><strong>{x.itemName}</strong><small>{x.itemId} · {x.unit}</small></span><b>{x.stock}</b></div>)}</div></InvCard>
    </div>
    <InvCard title="Consumption Log"><div className="inv-table-wrap"><table className="inv-table"><thead><tr><th>Con ID</th><th>Date</th><th>Branch</th><th>Item</th><th>Qty Used</th><th>Avg Cost</th><th>Total Value</th><th>Purpose</th><th>Recorded By</th></tr></thead><tbody>{log.map(x=><tr key={x.id}><td><code>{x.id}</code></td><td>{formatDate(x.date)}</td><td>{x.branchName}</td><td>{x.itemName}</td><td>{number(x.qty,0)}</td><td>{formatMoney(x.avgCost)}</td><td>{formatMoney(x.total)}</td><td>{x.purpose}</td><td>{x.recordedBy}</td></tr>)}</tbody></table></div></InvCard>
  </InvPage>;
}
