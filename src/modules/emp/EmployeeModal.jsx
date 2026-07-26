import { useState } from 'react';
import Modal from '../../core/ui/Modal';
import { FormField, FormGrid } from '../../core/ui';

export default function EmployeeModal({ employee = {}, employees, branches, departments, onClose, onSave }) {
  const [form, setForm] = useState({
    bnglId: employee.bnglId || '', systemId: employee.systemId || '', name: employee.name || '',
    designation: employee.designation || '', branch: employee.branch || '', department: employee.department || '',
    reportingTo: employee.reportingTo || '', email: employee.email || '', pabx: employee.pabx || '', mobile: employee.mobile || '',
  });
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const availableDepartments = departments.filter((item) => !form.branch || item.branchName === form.branch);

  return <Modal title={`${employee.id ? 'Edit' : 'Add'} Employee`} size="lg" onClose={onClose} footer={<>
    <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
    <button className="btn btn-primary" onClick={() => onSave(form)}>Save employee</button>
  </>}>
    <FormGrid>
      <FormField label="BNGL ID" required><input value={form.bnglId} placeholder="BNGL0001" onChange={(event) => set('bnglId', event.target.value)}/></FormField>
      <FormField label="System ID" required><input value={form.systemId} placeholder="BD0001" onChange={(event) => set('systemId', event.target.value)}/></FormField>
      <FormField label="Name" required><input value={form.name} onChange={(event) => set('name', event.target.value)}/></FormField>
      <FormField label="Designation" required><input value={form.designation} onChange={(event) => set('designation', event.target.value)}/></FormField>
      <FormField label="Branch" required><select value={form.branch} onChange={(event) => { set('branch', event.target.value); set('department', ''); }}><option value="">Select branch</option>{branches.map((item) => <option key={item.branchId} value={item.name}>{item.name}</option>)}</select></FormField>
      <FormField label="Department" required><select value={form.department} onChange={(event) => set('department', event.target.value)}><option value="">Select department</option>{availableDepartments.map((item) => <option key={item.deptId} value={item.name}>{item.name}</option>)}</select></FormField>
      <FormField label="Reporting To"><input list="employee-reporting-options" value={form.reportingTo} onChange={(event) => set('reportingTo', event.target.value)}/><datalist id="employee-reporting-options">{employees.filter((item) => item.id !== employee.id).map((item) => <option key={item.id} value={item.name}/>)}</datalist></FormField>
      <FormField label="Email" required><input type="email" value={form.email} onChange={(event) => set('email', event.target.value)}/></FormField>
      <FormField label="PABX Extension"><input value={form.pabx} onChange={(event) => set('pabx', event.target.value)}/></FormField>
      <FormField label="Mobile Number"><input type="tel" value={form.mobile} onChange={(event) => set('mobile', event.target.value)}/></FormField>
    </FormGrid>
  </Modal>;
}
