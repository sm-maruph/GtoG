import { useEffect, useMemo, useState } from 'react';
import { Building2, Edit3, Eye, Mail, Phone, Plus, Search, Trash2, UsersRound } from 'lucide-react';
import { useAuth } from '../../core/auth/AuthContext';
import { loadAccessState } from '../../core/admin/accessStore';
import { EmptyState, PageHeader, Panel } from '../../core/ui';
import EmployeeModal from './EmployeeModal';
import Modal from '../../core/ui/Modal';
import { addEmployee, deleteEmployee, listEmployees, updateEmployee } from './store';
import './emp.css';

export default function EmpModule() {
  const auth = useAuth();
  const [employees, setEmployees] = useState(() => listEmployees());
  const [modal, setModal] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [query, setQuery] = useState('');
  const [branch, setBranch] = useState('ALL');
  const [department, setDepartment] = useState('ALL');
  const [designation, setDesignation] = useState('ALL');
  const [sort, setSort] = useState('name-asc');
  const directory = useMemo(() => loadAccessState(), []);
  const canManage = auth.isSuperAdmin || auth.can('emp.employee.manage');

  useEffect(() => {
    const refresh = () => setEmployees(listEmployees());
    window.addEventListener('cbc:employee-directory-changed', refresh);
    return () => window.removeEventListener('cbc:employee-directory-changed', refresh);
  }, []);

  const departments = useMemo(() => directory.departments.map((item) => ({
    ...item, branchName: directory.branches.find((branchItem) => branchItem.branchId === item.branchId)?.name || '',
  })), [directory]);
  const branchOptions = [...new Set(employees.map((item) => item.branch))].sort();
  const departmentOptions = [...new Set(employees.filter((item) => branch === 'ALL' || item.branch === branch).map((item) => item.department))].sort();
  const designationOptions = [...new Set(employees.map((item) => item.designation))].sort();
  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = employees.filter((item) =>
      (branch === 'ALL' || item.branch === branch) &&
      (department === 'ALL' || item.department === department) &&
      (designation === 'ALL' || item.designation === designation) &&
      (!needle || Object.values(item).some((value) => String(value).toLowerCase().includes(needle)))
    );
    const [key, direction] = sort.split('-');
    return filtered.sort((a, b) => String(a[key] || '').localeCompare(String(b[key] || '')) * (direction === 'desc' ? -1 : 1));
  }, [employees, query, branch, department, designation, sort]);

  function remove(employee) {
    if (!window.confirm(`Delete ${employee.name} (${employee.bnglId})?`)) return;
    try { deleteEmployee(employee.id, auth.user); } catch (error) { window.alert(error.message); }
  }

  return <div className="emp-module">
    <main className="emp-content">
      <PageHeader title="Employee Directory" subtitle="Search employee contact details, organisation placement, and reporting lines.">
        {canManage && <button className="btn btn-primary" onClick={() => setModal({})}><Plus size={15}/>Add employee</button>}
      </PageHeader>
      <div className="emp-summary"><div><UsersRound size={19}/><span><strong>{employees.length}</strong>Total employees</span></div><div><Building2 size={19}/><span><strong>{branchOptions.length}</strong>Branches</span></div></div>
      <Panel padded={false}>
        <div className="emp-filters">
          <label className="emp-search"><Search size={15}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search ID, name, email, mobile, designation…"/></label>
          <select value={branch} onChange={(event) => { setBranch(event.target.value); setDepartment('ALL'); }}><option value="ALL">All branches</option>{branchOptions.map((item) => <option key={item}>{item}</option>)}</select>
          <select value={department} onChange={(event) => setDepartment(event.target.value)}><option value="ALL">All departments</option>{departmentOptions.map((item) => <option key={item}>{item}</option>)}</select>
          <select value={designation} onChange={(event) => setDesignation(event.target.value)}><option value="ALL">All designations</option>{designationOptions.map((item) => <option key={item}>{item}</option>)}</select>
          <select value={sort} onChange={(event) => setSort(event.target.value)}><option value="name-asc">Name A–Z</option><option value="name-desc">Name Z–A</option><option value="bnglId-asc">BNGL ID</option><option value="branch-asc">Branch</option><option value="department-asc">Department</option><option value="designation-asc">Designation</option></select>
        </div>
        {!rows.length ? <EmptyState icon={UsersRound} title="No employees found" body="Change the search or filter criteria."/> : <div className="emp-table-wrap"><table className="ui-table emp-table">
          <thead><tr><th>Employee IDs</th><th>Employee</th><th>Designation</th><th>Branch / Department</th><th>Reporting To</th><th>Contact</th><th>Actions</th></tr></thead>
          <tbody>{rows.map((employee) => <tr key={employee.id}>
            <td><span className="code">{employee.bnglId}</span><small className="code">{employee.systemId}</small></td>
            <td><strong>{employee.name}</strong><small><Mail size={12}/><a href={`mailto:${employee.email}`}>{employee.email}</a></small></td>
            <td>{employee.designation}</td>
            <td><strong>{employee.branch}</strong><small>{employee.department}</small></td>
            <td>{employee.reportingTo || '—'}</td>
            <td><span className="emp-contact"><Phone size={12}/>{employee.mobile || '—'}</span><small>PABX: {employee.pabx || '—'}</small></td>
            <td><div className="emp-actions"><button title="View employee details" onClick={() => setViewing(employee)}><Eye size={14}/></button>{canManage && <><button title="Edit employee" onClick={() => setModal(employee)}><Edit3 size={14}/></button><button className="danger" title="Delete employee" onClick={() => remove(employee)}><Trash2 size={14}/></button></>}</div></td>
          </tr>)}</tbody>
        </table></div>}
      </Panel>
      {viewing && <EmployeeDetails employee={viewing} onClose={() => setViewing(null)}/>}
      {modal && <EmployeeModal employee={modal} employees={employees} branches={directory.branches.filter((item) => item.status === 'ACTIVE')} departments={departments.filter((item) => item.status === 'ACTIVE')} onClose={() => setModal(null)} onSave={(payload) => {
        try {
          if (modal.id) updateEmployee(modal.id, payload, auth.user);
          else addEmployee(payload, auth.user);
          setModal(null);
        } catch (error) { window.alert(error.message); }
      }}/>}
    </main>
  </div>;
}

function EmployeeDetails({ employee, onClose }) {
  const fields = [
    ['BNGL ID', employee.bnglId], ['System ID', employee.systemId],
    ['Name', employee.name], ['Designation', employee.designation],
    ['Branch', employee.branch], ['Department', employee.department],
    ['Reporting To', employee.reportingTo || '—'], ['Email', employee.email],
    ['PABX Extension', employee.pabx || '—'], ['Mobile Number', employee.mobile || '—'],
  ];
  return <Modal title="Employee Details" size="lg" onClose={onClose} footer={<button className="btn btn-secondary" onClick={onClose}>Close</button>}>
    <div className="emp-detail-head"><span><UsersRound size={24}/></span><div><h3>{employee.name}</h3><p>{employee.designation}</p></div></div>
    <dl className="emp-detail-grid">{fields.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{label === 'Email' ? <a href={`mailto:${value}`}>{value}</a> : label === 'Mobile Number' && value !== '—' ? <a href={`tel:${value}`}>{value}</a> : value}</dd></div>)}</dl>
  </Modal>;
}
