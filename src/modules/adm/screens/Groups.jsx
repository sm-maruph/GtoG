import { useMemo, useState } from 'react';
import { Edit3, Plus, Trash2, UsersRound } from 'lucide-react';
import { FormField, FormGrid, PageHeader, Panel } from '../../../core/ui';
import Modal from '../../../core/ui/Modal';
import { useAdmin } from '../AdmContext';

export default function Groups() {
  const { state, actions, permissionDefinitions, moduleDefinitions } = useAdmin();
  const [modal,setModal] = useState(null);
  function remove(group) {
    if (!window.confirm(`Delete access group ${group.name}?`)) return;
    try { actions.deleteGroup(group.groupId); } catch (error) { window.alert(error.message); }
  }
  return <div>
    <PageHeader title="Access Groups" subtitle="Group users, attach reusable roles, and grant function-level permissions with record scope.">
      <button className="btn btn-primary" onClick={()=>setModal({})}><Plus size={15}/>Create group</button>
    </PageHeader>
    <Panel padded={false}><div className="adm-table-wrap"><table className="ui-table">
      <thead><tr><th>Code</th><th>Group</th><th>Members</th><th>Roles</th><th>Direct Functions</th><th>Status</th><th>Actions</th></tr></thead>
      <tbody>{state.groups.map((group)=><tr key={group.groupId}>
        <td className="code">{group.code}</td>
        <td><strong>{group.name}</strong><small>{group.description}</small></td>
        <td>{group.userIds.length}</td><td>{group.roleIds.length}</td><td>{group.permissions.length}</td>
        <td><span className={`adm-status ${group.status.toLowerCase()}`}>{group.status}</span></td>
        <td><div className="adm-actions"><button title="Edit group" onClick={()=>setModal(group)}><Edit3 size={14}/></button><button className="danger" title="Delete group" onClick={()=>remove(group)}><Trash2 size={14}/></button></div></td>
      </tr>)}</tbody>
    </table></div></Panel>
    {modal&&<GroupModal row={modal} state={state} permissionDefinitions={permissionDefinitions} moduleDefinitions={moduleDefinitions} onClose={()=>setModal(null)} onSave={(payload)=>{try{if(modal.groupId)actions.updateGroup(modal.groupId,payload);else actions.addGroup(payload);setModal(null)}catch(error){window.alert(error.message)}}}/>}
  </div>;
}

function GroupModal({ row, state, permissionDefinitions, moduleDefinitions, onClose, onSave }) {
  const editing = Boolean(row.groupId);
  const [form,setForm] = useState({ code:row.code||'', name:row.name||'', description:row.description||'', status:row.status||'ACTIVE', roleIds:row.roleIds||[], userIds:row.userIds||[], permissions:row.permissions||[] });
  const grouped = useMemo(()=>moduleDefinitions.map((module)=>({...module,permissions:permissionDefinitions.filter((permission)=>permission.module===module.code)})).filter((module)=>module.permissions.length),[moduleDefinitions,permissionDefinitions]);
  const set=(key,value)=>setForm((current)=>({...current,[key]:value}));
  const toggleId=(key,id)=>set(key,form[key].includes(id)?form[key].filter((value)=>value!==id):[...form[key],id]);
  const current=(code)=>form.permissions.find((permission)=>permission.code===code);
  const togglePermission=(code)=>set('permissions',current(code)?form.permissions.filter((permission)=>permission.code!==code):[...form.permissions,{code,allowed:true,scopeType:'SELF',branchIds:[],deptIds:[]}]);
  const scope=(code,scopeType)=>set('permissions',form.permissions.map((permission)=>permission.code===code?{...permission,scopeType,branchIds:[],deptIds:[]}:permission));
  return <Modal title={`${editing?'Edit':'Create'} Access Group`} size="xl" onClose={onClose} footer={<><button className="btn btn-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={()=>onSave(form)}>Save group</button></>}>
    <FormGrid>
      <FormField label="Group Code" required><input disabled={editing} value={form.code} onChange={(event)=>set('code',event.target.value)}/></FormField>
      <FormField label="Group Name" required><input value={form.name} onChange={(event)=>set('name',event.target.value)}/></FormField>
      <FormField label="Status"><select value={form.status} onChange={(event)=>set('status',event.target.value)}><option>ACTIVE</option><option>INACTIVE</option></select></FormField>
      <FormField label="Description"><textarea value={form.description} onChange={(event)=>set('description',event.target.value)}/></FormField>
    </FormGrid>
    <div className="adm-group-columns">
      <section><h3><UsersRound size={15}/> Members</h3><div className="adm-check-list">{state.users.filter((user)=>!user.isSuperAdmin).map((user)=><label key={user.userId}><input type="checkbox" checked={form.userIds.includes(user.userId)} onChange={()=>toggleId('userIds',user.userId)}/><span><strong>{user.displayName}</strong><small>{user.username}</small></span></label>)}</div></section>
      <section><h3>Inherited Roles</h3><div className="adm-check-list">{state.roles.map((role)=><label key={role.roleId}><input type="checkbox" checked={form.roleIds.includes(role.roleId)} onChange={()=>toggleId('roleIds',role.roleId)}/><span><strong>{role.name}</strong><small>{role.description}</small></span></label>)}</div></section>
    </div>
    <h3 className="adm-group-permission-title">Additional Function Permissions</h3>
    <div className="adm-permission-groups">{grouped.map((group)=><section key={group.code}><h3>{group.name}</h3>{group.permissions.map((definition)=>{const selected=current(definition.code);return <div className="adm-permission-row" key={definition.code}><label><input type="checkbox" checked={Boolean(selected)} onChange={()=>togglePermission(definition.code)}/><span><strong>{definition.label}</strong><small className="code">{definition.code}</small></span></label><select disabled={!selected} value={selected?.scopeType||'SELF'} onChange={(event)=>scope(definition.code,event.target.value)}><option>SELF</option><option>BRANCH</option><option>DEPT</option><option>GLOBAL</option></select></div>})}</section>)}</div>
  </Modal>;
}
