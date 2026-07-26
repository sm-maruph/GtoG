import { useMemo, useState } from 'react';
import { BellPlus, Edit3, Trash2 } from 'lucide-react';
import { PageHeader, Panel } from '../../../core/ui';
import { useInsurance } from '../InsContext';
import { formatDate, formatMoney, maturityBand } from '../format';
import PolicyModal from '../components/PolicyModal';
import FollowUpModal from '../components/FollowUpModal';

export default function ExpiredScreen(){
  const { policies, actions, can }=useInsurance(); const [edit,setEdit]=useState(null); const [follow,setFollow]=useState(null);
  const rows=useMemo(()=>policies.filter(p=>maturityBand(p.maturityDate).code==='EXPIRED').sort((a,b)=>a.maturityDate.localeCompare(b.maturityDate)),[policies]);
  const remove=(p)=>{if(window.confirm(`Delete expired policy ${p.acNo}?`)){try{actions.deletePolicy(p.policyId)}catch(e){window.alert(e.message)}}};
  const canEdit=can('ins.policy.edit')||can('ins.policy.manage'); const canDelete=can('ins.policy.delete')||can('ins.policy.manage'); const canFollow=can('ins.followup.create')||can('ins.followup.manage');
  return <div><PageHeader title="Expired Policies" subtitle="Maturity date has passed — immediate follow-up and status update required."/><Panel padded={false}><div className="ins-table-wrap"><table className="ui-table"><thead><tr><th>AC No</th><th>Borrower</th><th>Unit</th><th>Policy</th><th>Company</th><th>Amount</th><th>Maturity</th><th>Status</th><th>Actions</th></tr></thead><tbody>{rows.map(p=><tr key={p.policyId}><td className="code">{p.acNo}</td><td>{p.borrowerName}</td><td>{p.unitName}</td><td>{p.policyNo||'—'}</td><td>{p.company}</td><td>{formatMoney(p.amount)}</td><td>{formatDate(p.maturityDate)}</td><td><span className={`ins-policy-status ins-policy-${String(p.status).toLowerCase()}`}>{p.status}</span></td><td><div className="ins-row-actions">{canEdit&&<button className="icon-btn" title="Edit" onClick={()=>setEdit(p)}><Edit3 size={14}/></button>}{canFollow&&<button className="icon-btn" title="Follow-up" onClick={()=>setFollow(p)}><BellPlus size={14}/></button>}{canDelete&&<button className="icon-btn danger" title="Delete" onClick={()=>remove(p)}><Trash2 size={14}/></button>}</div></td></tr>)}</tbody></table></div></Panel>{edit&&<PolicyModal policy={edit} onClose={()=>setEdit(null)}/>} {follow&&<FollowUpModal policy={follow} onClose={()=>setFollow(null)}/>}</div>;
}
