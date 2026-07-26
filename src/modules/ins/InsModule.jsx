import { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { InsuranceProvider, useInsurance } from './InsContext';
import InsNav from './components/InsNav';
import AlertModal from './components/AlertModal';
import Dashboard from './screens/Dashboard';
import PoliciesScreen from './screens/PoliciesScreen';
import ExpiredScreen from './screens/ExpiredScreen';
import MaturityScreen from './screens/MaturityScreen';
import StatsScreen from './screens/StatsScreen';
import FollowUpsScreen from './screens/FollowUpsScreen';
import UsersScreen from './screens/UsersScreen';
import AuditScreen from './screens/AuditScreen';
import './ins.css';
function Shell(){const {isAdmin}=useInsurance();const [showAlert,setShowAlert]=useState(false);return <div className="ins-module"><InsNav isAdmin={isAdmin} onAlert={()=>setShowAlert(true)}/><main className="ins-main"><header className="ins-topbar"><div><strong>Commercial Bank of Ceylon PLC</strong><span>Bangladesh Operation · Insurance Management Tracker</span></div><div className="ins-version">v5.0</div></header><div className="ins-content"><Routes><Route index element={<Dashboard/>}/><Route path="policies" element={<PoliciesScreen/>}/><Route path="expired" element={<ExpiredScreen/>}/><Route path="maturity" element={<MaturityScreen/>}/><Route path="stats" element={<StatsScreen/>}/><Route path="follow-ups" element={<FollowUpsScreen/>}/><Route path="users" element={isAdmin?<UsersScreen/>:<Navigate to="/insurance" replace/>}/><Route path="audit" element={isAdmin?<AuditScreen/>:<Navigate to="/insurance" replace/>}/><Route path="*" element={<Navigate to="/insurance" replace/>}/></Routes></div></main>{showAlert&&<AlertModal onClose={()=>setShowAlert(false)}/>}</div>}
export default function InsModule(){return <InsuranceProvider><Shell/></InsuranceProvider>}
