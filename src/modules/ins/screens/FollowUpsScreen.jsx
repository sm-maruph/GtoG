import { useMemo, useState } from 'react';
import { BellPlus, Edit3, Trash2 } from 'lucide-react';
import { PageHeader, Panel } from '../../../core/ui';
import { useInsurance } from '../InsContext';
import { daysToExpiry, formatDate } from '../format';
import FollowUpModal from '../components/FollowUpModal';

export default function FollowUpsScreen(){
  const {policies,followUps,actions,can}=useInsurance(); const [selected,setSelected]=useState(null); const [editing,setEditing]=useState(null);
  const requiring=useMemo(()=>policies.filter((p)=>{const d=daysToExpiry(p.maturityDate);return d!=null&&d<=30}).sort((a,b)=>a.maturityDate.localeCompare(b.maturityDate)),[policies]);
  const canCreate=can('ins.followup.create')||can('ins.followup.manage'); const canEdit=can('ins.followup.edit')||can('ins.followup.manage'); const canDelete=can('ins.followup.delete')||can('ins.followup.manage');
  const remove=(row)=>{if(window.confirm(`Delete follow-up ${row.followUpId}?`)){try{actions.deleteFollowUp(row.followUpId)}catch(e){window.alert(e.message)}}};
  return <div><PageHeader title="Follow-Up Tracker" subtitle="Record renewal reminders, contact activity, status, and next actions."/>
    <Panel title="Policies Requiring Follow-Up" padded={false}><div className="ins-table-wrap"><table className="ui-table"><thead><tr><th>AC No</th><th>Borrower</th><th>Policy</th><th>Maturity</th><th>Days</th><th>Policy Status</th><th>Action</th></tr></thead><tbody>{requiring.map((p)=>{const d=daysToExpiry(p.maturityDate);return <tr key={p.policyId}><td className="code">{p.acNo}</td><td>{p.borrowerName}</td><td>{p.policyNo||'—'}</td><td>{formatDate(p.maturityDate)}</td><td>{d<0?`${Math.abs(d)} overdue`:d}</td><td><span className={`ins-policy-status ins-policy-${String(p.status).toLowerCase()}`}>{p.status}</span></td><td>{canCreate&&<button className="btn btn-secondary btn-small" onClick={()=>setSelected(p)}><BellPlus size={14}/>Add Follow-Up</button>}</td></tr>})}</tbody></table></div></Panel>
    <Panel title="Follow-Up Log" padded={false}><div className="ins-table-wrap"><table className="ui-table"><thead><tr><th>FU ID</th><th>Borrower</th><th>Policy ID</th><th>Date</th><th>Type</th><th>Contact</th><th>Summary</th><th>Next follow-up</th><th>Status</th><th>Email To</th><th>Actions</th></tr></thead><tbody>{followUps.map((f)=><tr key={f.followUpId}><td className="code">{f.followUpId}</td><td>{f.borrowerName}</td><td>{f.policyNo||'—'}</td><td>{formatDate(f.followUpDate)}</td><td>{f.type}</td><td>{f.contactMode}</td><td>{f.summary}</td><td>{formatDate(f.nextFollowUpDate)}</td><td><span className={`ins-follow-status ins-follow-${f.status.toLowerCase()}`}>{f.status}</span></td><td>{f.emailTo||'—'}</td><td><div className="ins-row-actions">{canEdit&&<button className="icon-btn" title="Edit follow-up" onClick={()=>setEditing(f)}><Edit3 size={14}/></button>}{canDelete&&<button className="icon-btn danger" title="Delete follow-up" onClick={()=>remove(f)}><Trash2 size={14}/></button>}</div></td></tr>)}</tbody></table></div></Panel>
    {selected&&<FollowUpModal policy={selected} onClose={()=>setSelected(null)}/>} {editing&&<FollowUpModal followUp={editing} onClose={()=>setEditing(null)}/>} 
  </div>;
}
