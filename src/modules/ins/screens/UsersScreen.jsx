import { useState } from 'react';
import { Edit3, Plus, Trash2 } from 'lucide-react';
import { PageHeader, Panel } from '../../../core/ui';
import { useAuth } from '../../../core/auth/AuthContext';
import { useInsurance } from '../InsContext';
import UserModal from '../components/UserModal';

export default function UsersScreen() {
  const { users, actions } = useInsurance();
  const { user } = useAuth();
  const [modal, setModal] = useState(null);
  function remove(record) {
    if (!window.confirm(`Delete ${record.employeeId} access for ${record.branchName}?`)) return;
    try { actions.deleteUser(record.rowId); } catch (err) { window.alert(err.message); }
  }
  return <div>
    <PageHeader title="User Management" subtitle="Manage Admin and Unit User role assignments."><button className="btn btn-primary" onClick={() => setModal({ type: 'new' })}><Plus size={15} /> Add User</button></PageHeader>
    <Panel padded={false}><div className="ins-table-wrap"><table className="ui-table"><thead><tr><th>Employee ID</th><th>Full Name</th><th>Email</th><th>Role</th><th>Branch / Unit</th><th>Status</th><th>Actions</th></tr></thead><tbody>{users.map((record) => <tr key={record.rowId}><td className="code">{record.employeeId}</td><td>{record.fullName}</td><td>{record.email}</td><td>{record.role}</td><td>{record.branchName}</td><td><span className={`ins-user-status ${record.status === 'Active' ? 'active' : 'inactive'}`}>{record.status}</span></td><td><div className="ins-row-actions"><button className="icon-btn" onClick={() => setModal({ type: 'edit', record })}><Edit3 size={15} /></button><button className="icon-btn danger" disabled={record.employeeId === user?.employeeId} onClick={() => remove(record)}><Trash2 size={15} /></button></div></td></tr>)}</tbody></table></div></Panel>
    {modal && <UserModal record={modal.record} onClose={() => setModal(null)} />}
  </div>;
}
