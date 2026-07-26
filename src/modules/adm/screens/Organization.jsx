import { useState } from 'react';
import { Edit3, Plus, Trash2 } from 'lucide-react';
import { PageHeader, Panel, FormField, FormGrid } from '../../../core/ui';
import Modal from '../../../core/ui/Modal';
import { useAdmin } from '../AdmContext';

const ORGANIZATION_TYPES = [
  { value: 'HEAD_OFFICE', label: 'Head Office' },
  { value: 'BRANCH', label: 'Branch' },
  { value: 'SUB_BRANCH', label: 'Sub Branch' },
  { value: 'SME', label: 'SME' },
];

const organizationTypeLabel = (type) => ORGANIZATION_TYPES.find((item) => item.value === type)?.label || type;

export default function Organization() {
  const { state, actions } = useAdmin();
  const [branch, setBranch] = useState(null);
  const [dept, setDept] = useState(null);
  const branchName = (id) => state.branches.find((item) => item.branchId === id)?.name || '—';
  const delBranch = (row) => {
    if (window.confirm(`Delete ${row.name}?`)) {
      try { actions.deleteBranch(row.branchId); } catch (error) { window.alert(error.message); }
    }
  };
  const delDept = (row) => {
    if (window.confirm(`Delete ${row.name}?`)) {
      try { actions.deleteDepartment(row.deptId); } catch (error) { window.alert(error.message); }
    }
  };

  return <div>
    <PageHeader title="Organisation Directory" subtitle="Maintain Head Office, Branch, Sub Branch, SME, and department records." />
    <div className="adm-grid">
      <Panel title={`Organisations (${state.branches.length})`} action={<button className="btn btn-primary" onClick={() => setBranch({})}><Plus size={14} />Add organisation</button>} padded={false}>
        <div className="adm-table-wrap"><table className="ui-table">
          <thead><tr><th>Code</th><th>Name</th><th>Type</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>{state.branches.map((row) => <tr key={row.branchId}>
            <td className="code">{row.code}</td><td><strong>{row.name}</strong></td><td>{organizationTypeLabel(row.type)}</td>
            <td><span className={`adm-status ${row.status.toLowerCase()}`}>{row.status}</span></td>
            <td><div className="adm-actions"><button onClick={() => setBranch(row)}><Edit3 size={14} /></button><button className="danger" onClick={() => delBranch(row)}><Trash2 size={14} /></button></div></td>
          </tr>)}</tbody>
        </table></div>
      </Panel>
      <Panel title={`Departments (${state.departments.length})`} action={<button className="btn btn-primary" onClick={() => setDept({})}><Plus size={14} />Add department</button>} padded={false}>
        <div className="adm-table-wrap"><table className="ui-table">
          <thead><tr><th>Code</th><th>Name</th><th>Branch</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>{state.departments.map((row) => <tr key={row.deptId}>
            <td className="code">{row.code}</td><td><strong>{row.name}</strong></td><td>{branchName(row.branchId)}</td>
            <td><span className={`adm-status ${row.status.toLowerCase()}`}>{row.status}</span></td>
            <td><div className="adm-actions"><button onClick={() => setDept(row)}><Edit3 size={14} /></button><button className="danger" onClick={() => delDept(row)}><Trash2 size={14} /></button></div></td>
          </tr>)}</tbody>
        </table></div>
      </Panel>
    </div>
    {branch && <BranchModal row={branch} onClose={() => setBranch(null)} onSave={(payload) => {
      try {
        branch.branchId ? actions.updateBranch(branch.branchId, payload) : actions.addBranch(payload);
        setBranch(null);
      } catch (error) { window.alert(error.message); }
    }} />}
    {dept && <DeptModal row={dept} branches={state.branches} onClose={() => setDept(null)} onSave={(payload) => {
      try {
        dept.deptId ? actions.updateDepartment(dept.deptId, payload) : actions.addDepartment(payload);
        setDept(null);
      } catch (error) { window.alert(error.message); }
    }} />}
  </div>;
}

function BranchModal({ row, onClose, onSave }) {
  const [form, setForm] = useState({ code: row.code || '', name: row.name || '', type: row.type || 'BRANCH', status: row.status || 'ACTIVE' });
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  return <Modal title={`${row.branchId ? 'Edit' : 'Add'} Organisation`} onClose={onClose} footer={<><button className="btn btn-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={() => onSave(form)}>Save</button></>}>
    <FormGrid>
      <FormField label="Code" required><input value={form.code} onChange={(event) => set('code', event.target.value)} /></FormField>
      <FormField label="Name" required><input value={form.name} onChange={(event) => set('name', event.target.value)} /></FormField>
      <FormField label="Type"><select value={form.type} onChange={(event) => set('type', event.target.value)}>{ORGANIZATION_TYPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></FormField>
      <FormField label="Status"><select value={form.status} onChange={(event) => set('status', event.target.value)}><option>ACTIVE</option><option>INACTIVE</option></select></FormField>
    </FormGrid>
  </Modal>;
}

function DeptModal({ row, branches, onClose, onSave }) {
  const [form, setForm] = useState({ code: row.code || '', name: row.name || '', branchId: row.branchId || branches[0]?.branchId, status: row.status || 'ACTIVE' });
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  return <Modal title={`${row.deptId ? 'Edit' : 'Add'} Department`} onClose={onClose} footer={<><button className="btn btn-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={() => onSave(form)}>Save</button></>}>
    <FormGrid>
      <FormField label="Code" required><input value={form.code} onChange={(event) => set('code', event.target.value)} /></FormField>
      <FormField label="Name" required><input value={form.name} onChange={(event) => set('name', event.target.value)} /></FormField>
      <FormField label="Branch / Office" required><select value={form.branchId} onChange={(event) => set('branchId', event.target.value)}>{branches.map((item) => <option key={item.branchId} value={item.branchId}>{item.name}</option>)}</select></FormField>
      <FormField label="Status"><select value={form.status} onChange={(event) => set('status', event.target.value)}><option>ACTIVE</option><option>INACTIVE</option></select></FormField>
    </FormGrid>
  </Modal>;
}
