import { useMemo, useState } from 'react';
import { Edit3, Plus, Search, Trash2 } from 'lucide-react';
import { PageHeader, Panel, FormField, FormGrid } from '../../../core/ui';
import Modal from '../../../core/ui/Modal';
import { useAdmin } from '../AdmContext';

export default function Users() {
  const { state, actions } = useAdmin();
  const [modal, setModal] = useState(null);
  const [q, setQ] = useState('');
  const rows = useMemo(() => state.users.filter((user) => !q || [user.username, user.displayName, user.email, user.employeeId].some((value) => String(value).toLowerCase().includes(q.toLowerCase()))), [state.users, q]);
  const branch = (id) => state.branches.find((row) => row.branchId === id)?.name || '—';
  const dept = (id) => state.departments.find((row) => row.deptId === id)?.name || '—';
  const assignedRoles = (user) => state.roles.filter((role) => user.roleIds.includes(role.roleId)).map((role) => role.name).join(', ') || 'Direct access only';
  const assignedGroups = (user) => state.groups.filter((group) => user.groupIds?.includes(group.groupId) || group.userIds.includes(user.userId)).map((group) => group.name).join(', ') || '—';
  const remove = (user) => {
    if (window.confirm(`Delete portal user ${user.username}?`)) {
      try { actions.deleteUser(user.userId); } catch (error) { window.alert(error.message); }
    }
  };

  return <div>
    <PageHeader title="Portal Users" subtitle="Create users and combine organisation scope, roles, groups, direct overrides, and Super Admin access.">
      <button className="btn btn-primary" onClick={() => setModal({})}><Plus size={15}/>Add user</button>
    </PageHeader>
    <Panel padded={false}>
      <div className="adm-filter"><label><Search size={15}/><input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Search users…"/></label></div>
      <div className="adm-table-wrap"><table className="ui-table">
        <thead><tr><th>Username</th><th>User</th><th>Branch / Department</th><th>Roles</th><th>Groups</th><th>Status</th><th>Overrides</th><th>Actions</th></tr></thead>
        <tbody>{rows.map((user) => <tr key={user.userId}>
          <td className="code">{user.username}</td>
          <td><strong>{user.displayName}</strong><small>{user.employeeId} · {user.email}</small></td>
          <td>{branch(user.branchId)}<small>{dept(user.deptId)}</small></td>
          <td>{user.isSuperAdmin ? <span className="adm-super">SUPER ADMIN</span> : assignedRoles(user)}</td>
          <td>{user.isSuperAdmin ? 'All groups' : assignedGroups(user)}</td>
          <td><span className={`adm-status ${user.status.toLowerCase()}`}>{user.status}</span></td>
          <td>{user.directPermissions?.length || 0}</td>
          <td><div className="adm-actions"><button onClick={() => setModal(user)} title="Edit user"><Edit3 size={14}/></button><button className="danger" onClick={() => remove(user)} title="Delete user"><Trash2 size={14}/></button></div></td>
        </tr>)}</tbody>
      </table></div>
    </Panel>
    {modal && <UserModal row={modal} state={state} onClose={() => setModal(null)} onSave={(payload) => {
      try {
        if (modal.userId) actions.updateUser(modal.userId, payload);
        else actions.addUser(payload);
        setModal(null);
      } catch (error) { window.alert(error.message); }
    }}/>}
  </div>;
}

function UserModal({ row, state, onClose, onSave }) {
  const editing = Boolean(row.userId);
  const [form, setForm] = useState({
    username: row.username || '', password: '', displayName: row.displayName || '',
    email: row.email || '', employeeId: row.employeeId || '',
    branchId: row.branchId || state.branches[0]?.branchId, deptId: row.deptId || '',
    status: row.status || 'ACTIVE', isSuperAdmin: Boolean(row.isSuperAdmin),
    roleIds: row.roleIds || [], groupIds: row.groupIds || [],
  });
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const toggle = (key, id) => set(key, form[key].includes(id) ? form[key].filter((value) => value !== id) : [...form[key], id]);
  const departments = state.departments.filter((department) => department.branchId === Number(form.branchId));

  return <Modal title={`${editing ? 'Edit' : 'Add'} Portal User`} size="xl" onClose={onClose} footer={<><button className="btn btn-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={() => onSave(form)}>Save user</button></>}>
    <FormGrid>
      <FormField label="Username" required><input disabled={editing} value={form.username} onChange={(event) => set('username', event.target.value)}/></FormField>
      <FormField label={editing ? 'New password (optional)' : 'Password'} required={!editing}><input type="password" value={form.password} placeholder={editing ? 'Leave blank to keep current password' : 'Default: demo'} onChange={(event) => set('password', event.target.value)}/></FormField>
      <FormField label="Display Name" required><input value={form.displayName} onChange={(event) => set('displayName', event.target.value)}/></FormField>
      <FormField label="Employee ID" required><input value={form.employeeId} onChange={(event) => set('employeeId', event.target.value)}/></FormField>
      <FormField label="Email" required><input type="email" value={form.email} onChange={(event) => set('email', event.target.value)}/></FormField>
      <FormField label="Status"><select value={form.status} onChange={(event) => set('status', event.target.value)}><option>ACTIVE</option><option>INACTIVE</option></select></FormField>
      <FormField label="Branch / Office"><select value={form.branchId} onChange={(event) => { set('branchId', event.target.value); set('deptId', ''); }}><option value="">Unassigned</option>{state.branches.map((branch) => <option key={branch.branchId} value={branch.branchId}>{branch.name}</option>)}</select></FormField>
      <FormField label="Department"><select value={form.deptId} onChange={(event) => set('deptId', event.target.value)}><option value="">Unassigned</option>{departments.map((department) => <option key={department.deptId} value={department.deptId}>{department.name}</option>)}</select></FormField>
    </FormGrid>
    <label className="adm-check"><input type="checkbox" checked={form.isSuperAdmin} onChange={(event) => set('isSuperAdmin', event.target.checked)}/><span>Super Admin — full global access to all modules and governance functions</span></label>
    {!form.isSuperAdmin && <div className="adm-group-columns">
      <section><h3>Direct roles</h3><div className="adm-check-list">{state.roles.map((role) => <label key={role.roleId}><input type="checkbox" checked={form.roleIds.includes(role.roleId)} onChange={() => toggle('roleIds', role.roleId)}/><span><b>{role.name}</b><small>{role.description}</small></span></label>)}</div></section>
      <section><h3>Access groups</h3><div className="adm-check-list">{state.groups.map((group) => <label key={group.groupId}><input type="checkbox" checked={form.groupIds.includes(group.groupId)} onChange={() => toggle('groupIds', group.groupId)}/><span><b>{group.name}</b><small>{group.description || `${group.roleIds.length} inherited role(s)`}</small></span></label>)}</div></section>
    </div>}
    <p className="adm-note">Effective access combines direct roles, group roles, group permissions, and individual overrides. Individual deny rules take final precedence.</p>
  </Modal>;
}
