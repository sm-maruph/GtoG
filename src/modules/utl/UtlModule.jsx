import { Navigate, Route, Routes } from 'react-router-dom';
import { UtilityProvider, useUtility } from './UtlContext';
import UtlNav from './components/UtlNav';
import Dashboard from './screens/Dashboard';
import Generator from './screens/Generator';
import Electricity from './screens/Electricity';
import Wasa from './screens/Wasa';
import Water from './screens/Water';
import Admin from './screens/Admin';
import './utl.css';
function Shell(){const {isAdmin}=useUtility();return <div className="utl-module"><UtlNav/><div className="utl-main"><div className="utl-bank-header"><div><strong>Commercial Bank of Ceylon PLC — Bangladesh Operations</strong><span>CBC Utility Tracker</span></div><div className="utl-bank-mark">CBC</div></div><Routes><Route index element={<Dashboard/>}/><Route path="generator" element={<Generator/>}/><Route path="electricity" element={<Electricity/>}/><Route path="wasa" element={<Wasa/>}/><Route path="water" element={<Water/>}/><Route path="admin" element={isAdmin?<Admin/>:<Navigate to="/utility" replace/>}/><Route path="*" element={<Navigate to="/utility" replace/>}/></Routes></div></div>}
export default function UtlModule(){return <UtilityProvider><Shell/></UtilityProvider>}
