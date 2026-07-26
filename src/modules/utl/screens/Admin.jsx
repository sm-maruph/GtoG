import { useState } from 'react';
import { Pencil, RotateCcw, Trash2, UserPlus, X } from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';
import { useUtility } from '../UtlContext';
import { formatDate } from '../format';
import { Field, UtlCard, UtlPage } from '../components/UtlUI';

const emptyUser={name:'',email:'',employeeId:'',role:'Branch User',branchCode:'801',active:true};

export default function Admin(){
  const {state,actions}=useUtility();
  const {user}=useAuth();
  const [form,setForm]=useState(emptyUser);
  const editing=Boolean(form.id);

  function submit(e){
    e.preventDefault();
    actions.saveUser(form);
    setForm(emptyUser);
  }
  function remove(u){
    if(u.email===user?.email){alert('You cannot delete your own active account.');return;}
    if(confirm(`Delete ${u.name}'s Utility assignment?`)) actions.deleteUser(u.id);
  }

  return <UtlPage title="Utility Administration" subtitle="Manage user-to-branch assignments and review the audit trail." actions={<button className="utl-secondary" onClick={()=>{if(confirm('Reset Utility demo data?'))actions.reset()}}><RotateCcw size={15}/> Reset Demo</button>}>
    <div className="utl-two-col">
      <UtlCard title={editing?'Edit User / Role':'Add User / Role'} action={editing&&<button className="utl-secondary" onClick={()=>setForm(emptyUser)}><X size={14}/> Cancel Edit</button>}><form className="utl-form-grid" onSubmit={submit}>
        <Field label="Full Name"><input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></Field>
        <Field label="Email"><input type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></Field>
        <Field label="Employee ID"><input required disabled={editing} value={form.employeeId} onChange={e=>setForm({...form,employeeId:e.target.value})}/></Field>
        <Field label="Role"><select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}><option>Admin</option><option>Branch User</option><option>Viewer</option></select></Field>
        <Field label="Branch"><select value={form.branchCode} onChange={e=>setForm({...form,branchCode:e.target.value})}>{state.branches.map(b=><option key={b.code} value={b.code}>{b.name}</option>)}</select></Field>
        <Field label="Active"><select value={String(form.active)} onChange={e=>setForm({...form,active:e.target.value==='true'})}><option value="true">Yes</option><option value="false">No</option></select></Field>
        <button className="utl-primary" type="submit"><UserPlus size={15}/> {editing?'Update User':'Save User'}</button>
      </form></UtlCard>
      <UtlCard title="System Info"><dl className="utl-def"><div><dt>Branches</dt><dd>{state.branches.length}</dd></div><div><dt>Users</dt><dd>{state.users.length}</dd></div><div><dt>Generator records</dt><dd>{state.generatorRuns.length}</dd></div><div><dt>Electric bills</dt><dd>{state.electricBills.length}</dd></div></dl></UtlCard>
    </div>
    <UtlCard title="User Management"><div className="utl-table-wrap"><table className="utl-table"><thead><tr><th>Name</th><th>Email</th><th>Employee ID</th><th>Role</th><th>Branch</th><th>Active</th><th>Actions</th></tr></thead><tbody>{state.users.map(u=><tr key={u.id}><td>{u.name}</td><td>{u.email}</td><td>{u.employeeId}</td><td>{u.role}</td><td>{u.branchName}</td><td>{u.active?'Yes':'No'}</td><td><div className="utl-row-actions"><button className="utl-icon-edit" onClick={()=>setForm({...u})}><Pencil size={14}/></button><button className="utl-icon-danger" onClick={()=>remove(u)}><Trash2 size={14}/></button></div></td></tr>)}</tbody></table></div></UtlCard>
    <UtlCard title="Audit Log"><div className="utl-table-wrap"><table className="utl-table"><thead><tr><th>Time</th><th>User</th><th>Action</th><th>Detail</th></tr></thead><tbody>{state.audit.slice(0,100).map(a=><tr key={a.id}><td>{formatDate(a.timestamp)}</td><td>{a.user}</td><td><code>{a.action}</code></td><td>{a.detail}</td></tr>)}</tbody></table></div></UtlCard>
  </UtlPage>;
}
