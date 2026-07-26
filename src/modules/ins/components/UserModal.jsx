import { useMemo, useState } from 'react';
import Modal from '../../../core/ui/Modal';
import { FormField, FormGrid } from '../../../core/ui';
import { useInsurance } from '../InsContext';

export default function UserModal({ record, onClose }) {
  const { units, actions } = useInsurance();
  const initial = useMemo(() => ({
    employeeId: record?.employeeId ?? '', fullName: record?.fullName ?? '',
    email: record?.email ?? '', role: record?.role ?? 'User',
    branchId: record?.branchId === 'ALL' ? '' : record?.branchId ?? '',
    branchName: record?.branchName === 'All Units' ? '' : record?.branchName ?? '',
    status: record?.status ?? 'Active',
  }), [record]);
  const [form, setForm] = useState(initial);
  const [error, setError] = useState('');
  function setField(name, value) { setForm((old) => ({ ...old, [name]: value })); }
  function chooseUnit(code) { const unit = units.find((u) => u.code === code); setForm((old) => ({ ...old, branchId: code, branchName: unit?.name ?? code })); }
  function submit(e) {
    e.preventDefault(); setError('');
    if (!form.employeeId.trim() || !form.fullName.trim() || !form.email.trim() || !form.role || !form.status || (form.role === 'User' && !form.branchId)) { setError('Complete all required fields.'); return; }
    if (!form.email.toLowerCase().endsWith('@combankbd.com')) { setError('Email must end with @combankbd.com.'); return; }
    try { if (record) actions.updateUser(record.rowId, form); else actions.addUser(form); onClose(); } catch (err) { setError(err.message); }
  }
  return (
    <Modal title={record ? `Edit ${record.employeeId}` : 'Add User / Role'} size="lg" onClose={onClose}
      footer={<><button className="btn btn-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" type="submit" form="ins-user-form">Save User</button></>}>
      <form id="ins-user-form" onSubmit={submit}>
        {error && <div className="alert-error">{error}</div>}
        <FormGrid>
          <FormField label="Employee ID" required><input value={form.employeeId} disabled={Boolean(record)} onChange={(e) => setField('employeeId', e.target.value)} placeholder="BNGL0171" /></FormField>
          <FormField label="Full Name" required><input value={form.fullName} onChange={(e) => setField('fullName', e.target.value)} /></FormField>
          <FormField label="Email" required><input type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} placeholder="name@combankbd.com" /></FormField>
          <FormField label="Role" required><select value={form.role} onChange={(e) => setField('role', e.target.value)}><option>Admin</option><option>User</option></select></FormField>
          <FormField label="Branch / Unit" required={form.role === 'User'}><select value={form.role === 'Admin' ? '' : form.branchId} disabled={form.role === 'Admin'} onChange={(e) => chooseUnit(e.target.value)}><option value="">{form.role === 'Admin' ? 'All Units' : 'Select unit'}</option>{units.map((u) => <option key={u.code} value={u.code}>{u.name}</option>)}</select></FormField>
          <FormField label="Status" required><select value={form.status} onChange={(e) => setField('status', e.target.value)}><option>Active</option><option>Inactive</option></select></FormField>
        </FormGrid>
      </form>
    </Modal>
  );
}
