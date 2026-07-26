import { Navigate,Route,Routes } from 'react-router-dom';
import { AdminProvider } from './AdmContext';
import AdmNav from './components/AdmNav';
import Dashboard from './screens/Dashboard';
import Organization from './screens/Organization';
import Users from './screens/Users';
import Roles from './screens/Roles';
import Access from './screens/Access';
import Audit from './screens/Audit';
import './adm.css';
function Shell(){return <div className="adm-module"><AdmNav/><main className="adm-main"><div className="adm-top"><div><strong>Commercial Bank of Ceylon PLC</strong><span>Bangladesh Operation · Portal Governance</span></div><span>SECURE ADMINISTRATION</span></div><div className="adm-page"><Routes><Route index element={<Dashboard/>}/><Route path="organization" element={<Organization/>}/><Route path="users" element={<Users/>}/><Route path="roles" element={<Roles/>}/><Route path="access" element={<Access/>}/><Route path="audit" element={<Audit/>}/><Route path="*" element={<Navigate to="/super-admin" replace/>}/></Routes></div></main></div>}
export default function AdmModule(){return <AdminProvider><Shell/></AdminProvider>}
