import { useMemo, useState } from 'react';
import { BellPlus, Edit3 } from 'lucide-react';
import { PageHeader, Panel } from '../../../core/ui';
import { useInsurance } from '../InsContext';
import { formatDate, formatMoney, maturityBand } from '../format';
import FollowUpModal from '../components/FollowUpModal';
import PolicyModal from '../components/PolicyModal';
const BANDS=[{code:'EXPIRED',title:'Expired',description:'Past maturity date — immediate action required.'},{code:'DAYS_0_15',title:'0–15 Days',description:'Urgent renewal and follow-up window.'},{code:'DAYS_16_30',title:'16–30 Days',description:'Follow-up should be initiated.'},{code:'DAYS_31_60',title:'31–60 Days',description:'Monitor and plan ahead.'}];
export default function MaturityScreen(){
  const {policies,can}=useInsurance(); const [follow,setFollow]=useState(null);const [edit,setEdit]=useState(null);
  const grouped=useMemo(()=>Object.fromEntries(BANDS.map((b)=>[b.code,policies.filter((p)=>maturityBand(p.maturityDate).code===b.code).sort((a,b)=>a.maturityDate.localeCompare(b.maturityDate))])),[policies]);
  const canEdit=can('ins.policy.edit')||can('ins.policy.manage'); const canFollow=can('ins.followup.create')||can('ins.followup.manage');
  return <div><PageHeader title="Maturity Tracker" subtitle="Policies grouped into urgency bands, nearest maturity first."/><div className="ins-maturity-grid">{BANDS.map((band)=><Panel key={band.code} title={`${band.title} (${grouped[band.code].length})`}><p className="ins-muted">{band.description}</p>{!grouped[band.code].length?<div className="ins-empty-small">No policy in this band.</div>:<div className="ins-table-wrap"><table className="ui-table"><thead><tr><th>AC No</th><th>Borrower</th><th>Company</th><th>Amount</th><th>Maturity</th><th>Status</th><th>Actions</th></tr></thead><tbody>{grouped[band.code].map((p)=><tr key={p.policyId}><td className="code">{p.acNo}</td><td>{p.borrowerName}</td><td>{p.company}</td><td>{formatMoney(p.amount)}</td><td>{formatDate(p.maturityDate)}</td><td><span className={`ins-policy-status ins-policy-${String(p.status).toLowerCase()}`}>{p.status}</span></td><td><div className="ins-row-actions">{canEdit&&<button className="icon-btn" title="Edit policy" onClick={()=>setEdit(p)}><Edit3 size={15}/></button>}{canFollow&&<button className="icon-btn" title="Add follow-up" onClick={()=>setFollow(p)}><BellPlus size={15}/></button>}</div></td></tr>)}</tbody></table></div>}</Panel>)}</div>{follow&&<FollowUpModal policy={follow} onClose={()=>setFollow(null)}/>} {edit&&<PolicyModal policy={edit} onClose={()=>setEdit(null)}/>}</div>;
}
