import { useMemo, useState } from 'react';
import Modal from '../../../core/ui/Modal';
import { FormField, FormGrid } from '../../../core/ui';
import { useInsurance } from '../InsContext';
function today(){return new Date().toISOString().slice(0,10)}
export default function FollowUpModal({policy,followUp,onClose}){
  const {users,actions}=useInsurance(); const editing=Boolean(followUp);
  const [form,setForm]=useState(()=>editing?{
    policyId:followUp.policyId,followUpDate:followUp.followUpDate,type:followUp.type,contactMode:followUp.contactMode,summary:followUp.summary,actionTaken:followUp.actionTaken||'',nextFollowUpDate:followUp.nextFollowUpDate||'',status:followUp.status,emailTo:followUp.emailTo||''
  }:{policyId:policy.policyId,followUpDate:today(),type:'Reminder',contactMode:'Phone',summary:'',actionTaken:'',nextFollowUpDate:'',status:'Open',emailTo:''});
  const [error,setError]=useState(''); const recipients=useMemo(()=>users.filter((u)=>u.status==='Active'),[users]); const currentPolicy=policy||{acNo:followUp.acNo,borrowerName:followUp.borrowerName,policyNo:followUp.policyNo};
  const setField=(name,value)=>setForm((old)=>({...old,[name]:value}));
  function submit(e){e.preventDefault();setError('');if(!form.followUpDate||!form.type||!form.contactMode||!form.summary.trim()||!form.status){setError('Complete all required fields.');return}try{if(editing)actions.updateFollowUp(followUp.followUpId,form);else actions.addFollowUp(form);onClose()}catch(err){setError(err.message)}}
  return <Modal title={`${editing?'Edit':'Add'} Follow-Up — ${currentPolicy.acNo}`} size="lg" onClose={onClose} footer={<><button className="btn btn-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" form="ins-followup-form" type="submit">{editing?'Save Changes':'Save Follow-Up'}</button></>}>
    <div className="ui-modal-summary"><div className="ui-modal-summary-row"><span>Borrower</span><span>{currentPolicy.borrowerName}</span></div><div className="ui-modal-summary-row"><span>Policy</span><span>{currentPolicy.policyNo||'—'}</span></div></div>
    <form id="ins-followup-form" onSubmit={submit}>{error&&<div className="alert-error">{error}</div>}<FormGrid>
      <FormField label="Follow-Up Date" required><input type="date" value={form.followUpDate} onChange={(e)=>setField('followUpDate',e.target.value)}/></FormField>
      <FormField label="Type" required><select value={form.type} onChange={(e)=>setField('type',e.target.value)}>{['Reminder','Renewal','Complaint','General'].map((v)=><option key={v}>{v}</option>)}</select></FormField>
      <FormField label="Contact Mode" required><select value={form.contactMode} onChange={(e)=>setField('contactMode',e.target.value)}>{['Phone','Email','In Person','WhatsApp'].map((v)=><option key={v}>{v}</option>)}</select></FormField>
      <FormField label="Status" required><select value={form.status} onChange={(e)=>setField('status',e.target.value)}>{['Open','Pending','Closed'].map((v)=><option key={v}>{v}</option>)}</select></FormField>
      <FormField label="Summary" required><textarea rows="3" value={form.summary} onChange={(e)=>setField('summary',e.target.value)}/></FormField>
      <FormField label="Action Taken"><textarea rows="3" value={form.actionTaken} onChange={(e)=>setField('actionTaken',e.target.value)}/></FormField>
      <FormField label="Next Follow-Up Date"><input type="date" value={form.nextFollowUpDate} onChange={(e)=>setField('nextFollowUpDate',e.target.value)}/></FormField>
      <FormField label="Email To"><select value={form.emailTo} onChange={(e)=>setField('emailTo',e.target.value)}><option value="">No notification</option>{recipients.map((u)=><option key={u.rowId} value={u.email}>{u.fullName} — {u.email}</option>)}</select></FormField>
    </FormGrid></form>
  </Modal>;
}
