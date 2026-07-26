import { useState } from 'react';
import { PlugZap, Gauge, Banknote } from 'lucide-react';
import { useUtility } from '../UtlContext';
import { formatMoney, formatMonth, monthValue, number } from '../format';
import MiniBars from '../components/MiniBars';
import { Field, UtlCard, UtlPage, UtlStat } from '../components/UtlUI';

export default function Electricity(){
  const {state,stats,actions,isAdmin,branchFilter,ownCode}=useUtility();
  const [form,setForm]=useState({billMonth:monthValue(),branchCode:branchFilter==='ALL'?ownCode:branchFilter,kwh:'',rate:'11.25',remarks:''});
  function submit(e){e.preventDefault();actions.addElectricBill(form);setForm({...form,kwh:'',remarks:''});}
  return <UtlPage title="Electricity Tracking" subtitle="Monthly consumption, tariff and billing trends.">
    <div className="utl-stat-grid utl-stat-grid-three"><UtlStat icon={<Banknote size={18}/>} label="Latest Bill" value={formatMoney(stats.electricity.lastBill)}/><UtlStat icon={<Gauge size={18}/>} label="Total Consumption" value={`${number(stats.electricity.totalKwh,0)} kWh`} tone="green"/><UtlStat icon={<PlugZap size={18}/>} label="Average Rate" value={`${formatMoney(stats.electricity.avgRate)} / kWh`} tone="orange"/></div>
    <div className="utl-two-col"><UtlCard title="Record Electric Bill"><form className="utl-form-grid" onSubmit={submit}><Field label="Bill Month"><input type="month" required value={form.billMonth} onChange={e=>setForm({...form,billMonth:e.target.value})}/></Field><Field label="Branch"><select value={form.branchCode} disabled={!isAdmin} onChange={e=>setForm({...form,branchCode:e.target.value})}>{state.branches.map(b=><option key={b.code} value={b.code}>{b.name}</option>)}</select></Field><Field label="Consumption (kWh)"><input type="number" required min="0" value={form.kwh} onChange={e=>setForm({...form,kwh:e.target.value})}/></Field><Field label="Rate per kWh"><input type="number" required min="0" step="0.01" value={form.rate} onChange={e=>setForm({...form,rate:e.target.value})}/></Field><Field label="Remarks"><input value={form.remarks} onChange={e=>setForm({...form,remarks:e.target.value})}/></Field><button className="utl-primary" type="submit">Save Electric Bill</button></form></UtlCard><UtlCard title="12-Month Billing Trend"><MiniBars labels={stats.months.map(m=>m.slice(5))} values={stats.electricTrend} format={formatMoney}/></UtlCard></div>
    <UtlCard title="Recent Electric Bills"><div className="utl-table-wrap"><table className="utl-table"><thead><tr><th>Month</th><th>Branch</th><th>Consumption</th><th>Rate</th><th>Amount</th><th>Remarks</th></tr></thead><tbody>{stats.elec.slice(0,30).map(r=><tr key={r.id}><td>{formatMonth(r.billMonth)}</td><td>{r.branchName}</td><td>{number(r.kwh,0)} kWh</td><td>{formatMoney(r.rate)}</td><td>{formatMoney(r.amount)}</td><td>{r.remarks||'—'}</td></tr>)}</tbody></table></div></UtlCard>
  </UtlPage>;
}
