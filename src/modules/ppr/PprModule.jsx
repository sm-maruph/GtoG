import { Navigate, Route, Routes } from 'react-router-dom';
import { PaperProvider, usePaper } from './PprContext';
import PprNav from './components/PprNav';
import Dashboard from './screens/Dashboard';
import Entries from './screens/Entries';
import Reports from './screens/Reports';
import Masters from './screens/Masters';
import Audit from './screens/Audit';
import './ppr.css';
function Shell(){const {can}=usePaper();return <div className="ppr-module"><PprNav/><main className="ppr-main"><header className="ppr-topbar"><div><strong>Commercial Bank of Ceylon PLC</strong><span>Bangladesh Operation · Paper Usage Tracker</span></div><span className="ppr-version">Monthly Control · v1.0</span></header><div className="ppr-content"><Routes><Route index element={<Dashboard/>}/><Route path="entries" element={<Entries/>}/><Route path="reports" element={can('ppr.report.view')?<Reports/>:<Navigate to="/paper-tracker" replace/>}/><Route path="masters" element={can('ppr.master.manage')?<Masters/>:<Navigate to="/paper-tracker" replace/>}/><Route path="audit" element={can('ppr.audit.view')?<Audit/>:<Navigate to="/paper-tracker" replace/>}/><Route path="*" element={<Navigate to="/paper-tracker" replace/>}/></Routes></div></main></div>}
export default function PprModule(){return <PaperProvider><Shell/></PaperProvider>}
