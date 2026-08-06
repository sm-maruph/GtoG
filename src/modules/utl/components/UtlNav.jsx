import { NavLink } from 'react-router-dom';
import { Gauge, LogOut, UsersRound, ReceiptText, ChartNoAxesCombined } from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';
import { useUtility } from '../UtlContext';
import logo from '../../../assets/small_logo.jpg';

const links = [
  { to:'/utility', end:true, label:'Dashboard', icon:Gauge },
];
export default function UtlNav(){
  const { isAdmin, state, branchFilter, setBranchFilter } = useUtility();
  const { user, logout } = useAuth();
  const custom=(state.utilityTypes||[]).filter(t=>t.active||isAdmin).map(t=>({to:`/utility/register/${t.id}`,label:t.name,icon:ReceiptText}));
  const reports={to:'/utility/reports',label:'Management Reports',icon:ChartNoAxesCombined};
  const all = isAdmin ? [...links,...custom,reports,{to:'/utility/admin',label:'Admin',icon:UsersRound}] : [...links,...custom,reports];
  return <aside className="utl-sidebar">
    <div className="utl-brand"><span className="utl-brand-icon"><img src={logo} alt="CBC logo" /></span><div><strong>Utility Tracker</strong><small>combankbd.com</small></div></div>
    <div className="utl-user-card"><span className="utl-avatar">{(user?.displayName||'?').split(/\s+/).map(x=>x[0]).slice(0,2).join('')}</span><div><strong>{user?.displayName}</strong><small>{isAdmin?'Administrator':'Branch User'}</small></div></div>
    {isAdmin && <label className="utl-branch-select">View Branch<select value={branchFilter} onChange={(e)=>setBranchFilter(e.target.value)}><option value="ALL">All Branches</option>{state.branches.map(b=><option key={b.code} value={b.code}>{b.name}</option>)}</select></label>}
    <nav>{all.map(({to,end,label,icon:Icon})=><NavLink key={to} to={to} end={end} className={({isActive})=>`utl-nav-link${isActive?' active':''}`}><Icon size={17}/><span>{label}</span></NavLink>)}</nav>
    <div className="utl-side-spacer"/>
    <button className="utl-logout" onClick={logout}><LogOut size={16}/> Log Out</button>
    <div className="utl-support">IT Support — SHAKIR KHUSRU</div>
  </aside>;
}
