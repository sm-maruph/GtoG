import { useState } from 'react';
import { Factory, Fuel, Clock3 } from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';
import { useUtility } from '../UtlContext';
import { formatDate, formatMoney, isoDate, number } from '../format';
import MiniBars from '../components/MiniBars';
import { Field, UtlCard, UtlPage, UtlStat } from '../components/UtlUI';

export default function Generator(){
  const { state, stats, actions, isAdmin, branchFilter, ownCode } = useUtility(); const { user }=useAuth();
  const defaultBranch = branchFilter==='ALL'?ownCode:branchFilter;
  const [run,setRun]=useState({date:isoDate(),branchCode:defaultBranch,start:'09:00',end:'10:00',fuelActual:'',remarks:''});
  const [fuel,setFuel]=useState({date:isoDate(),branchCode:defaultBranch,qty:'',rate:'',vendor:'',remarks:''});
  const days=[]; const vals=[]; for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);const iso=isoDate(d);days.push(iso.slice(5)); vals.push(stats.runs.filter(r=>r.date===iso).reduce((a,r)=>a+Number(r.runHours||0),0));}
  function submitRun(e){e.preventDefault(); actions.addGeneratorRun(run); setRun({...run,start:'09:00',end:'10:00',fuelActual:'',remarks:''});}
  function submitFuel(e){e.preventDefault(); actions.addFuelPurchase(fuel); setFuel({...fuel,qty:'',rate:'',vendor:'',remarks:''});}
  const branchOptions=state.branches;
  return <UtlPage title="Generator Tracking" subtitle="Run-time, estimated/actual fuel consumption and purchases.">
    <div className="utl-stat-grid">
      <UtlStat icon={<Clock3 size={18}/>} label="Weekly run hours" value={`${number(stats.generator.weeklyHours)} h`}/>
      <UtlStat icon={<Factory size={18}/>} label="Monthly run hours" value={`${number(stats.generator.monthlyHours)} h`} tone="green"/>
      <UtlStat icon={<Fuel size={18}/>} label="Fuel used this month" value={`${number(stats.generator.monthlyFuel)} L`} tone="orange"/>
      <UtlStat icon={<Fuel size={18}/>} label="Estimated fuel in hand" value={`${number(stats.generator.fuelInHand)} L`} tone="purple"/>
    </div>
    <div className="utl-two-col">
      <UtlCard title="Last 7 days — run hours"><MiniBars labels={days} values={vals} format={v=>`${number(v)}h`}/></UtlCard>
      <UtlCard title="Log Generator Run"><form className="utl-form-grid" onSubmit={submitRun}>
        <Field label="Date"><input type="date" required value={run.date} onChange={e=>setRun({...run,date:e.target.value})}/></Field>
        <Field label="Branch"><select value={run.branchCode} disabled={!isAdmin} onChange={e=>setRun({...run,branchCode:e.target.value})}>{branchOptions.map(b=><option key={b.code} value={b.code}>{b.name}</option>)}</select></Field>
        <Field label="Start Time"><input type="time" required value={run.start} onChange={e=>setRun({...run,start:e.target.value})}/></Field>
        <Field label="End Time"><input type="time" required value={run.end} onChange={e=>setRun({...run,end:e.target.value})}/></Field>
        <Field label="Actual Fuel Used (L)"><input type="number" step="0.01" min="0" value={run.fuelActual} onChange={e=>setRun({...run,fuelActual:e.target.value})}/></Field>
        <Field label="Remarks"><input value={run.remarks} onChange={e=>setRun({...run,remarks:e.target.value})}/></Field>
        <button className="utl-primary" type="submit">Save Generator Run</button>
      </form></UtlCard>
    </div>
    <div className="utl-two-col">
      <UtlCard title="Record Fuel Purchase"><form className="utl-form-grid" onSubmit={submitFuel}>
        <Field label="Date"><input type="date" required value={fuel.date} onChange={e=>setFuel({...fuel,date:e.target.value})}/></Field>
        <Field label="Branch"><select value={fuel.branchCode} disabled={!isAdmin} onChange={e=>setFuel({...fuel,branchCode:e.target.value})}>{branchOptions.map(b=><option key={b.code} value={b.code}>{b.name}</option>)}</select></Field>
        <Field label="Quantity (L)"><input type="number" required min="0.01" step="0.01" value={fuel.qty} onChange={e=>setFuel({...fuel,qty:e.target.value})}/></Field>
        <Field label="Price per Liter"><input type="number" required min="0.01" step="0.01" value={fuel.rate} onChange={e=>setFuel({...fuel,rate:e.target.value})}/></Field>
        <Field label="Vendor"><input required value={fuel.vendor} onChange={e=>setFuel({...fuel,vendor:e.target.value})}/></Field>
        <Field label="Entered By"><input disabled value={user?.displayName||''}/></Field>
        <button className="utl-primary" type="submit">Record Purchase</button>
      </form></UtlCard>
      <UtlCard title="Recent Fuel Purchases"><div className="utl-table-wrap"><table className="utl-table"><thead><tr><th>Date</th><th>Branch</th><th>Qty</th><th>Rate</th><th>Amount</th><th>Vendor</th></tr></thead><tbody>{stats.fuel.slice(0,10).map(r=><tr key={r.id}><td>{formatDate(r.date)}</td><td>{r.branchName}</td><td>{number(r.qty)} L</td><td>{formatMoney(r.rate)}</td><td>{formatMoney(r.amount)}</td><td>{r.vendor}</td></tr>)}</tbody></table></div></UtlCard>
    </div>
    <UtlCard title="Recent Generator Runs"><div className="utl-table-wrap"><table className="utl-table"><thead><tr><th>Date</th><th>Branch</th><th>Start</th><th>End</th><th>Hours</th><th>Fuel Est.</th><th>Fuel Actual</th><th>Remarks</th></tr></thead><tbody>{stats.runs.slice(0,20).map(r=><tr key={r.id}><td>{formatDate(r.date)}</td><td>{r.branchName}</td><td>{r.start}</td><td>{r.end}</td><td>{number(r.runHours)}</td><td>{number(r.fuelEst)} L</td><td>{number(r.fuelActual)} L</td><td>{r.remarks||'—'}</td></tr>)}</tbody></table></div></UtlCard>
  </UtlPage>;
}
