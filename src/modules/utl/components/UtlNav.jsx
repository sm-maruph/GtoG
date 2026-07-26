import { NavLink } from 'react-router-dom';
import { Droplets, Factory, Gauge, LogOut, PlugZap, UsersRound, GlassWater } from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';
import { useUtility } from '../UtlContext';

const links = [
  { to:'/utility', end:true, label:'Dashboard', icon:Gauge },
  { to:'/utility/generator', label:'Generator', icon:Factory },
  { to:'/utility/electricity', label:'Electricity', icon:PlugZap },
  { to:'/utility/wasa', label:'WASA', icon:Droplets },
  { to:'/utility/water', label:'Drinking Water', icon:GlassWater },
];
export default function UtlNav(){
  const { isAdmin, state, branchFilter, setBranchFilter } = useUtility();
  const { user, logout } = useAuth();
  const all = isAdmin ? [...links,{to:'/utility/admin',label:'Admin',icon:UsersRound}] : links;
  return <aside className="utl-sidebar">
    <div className="utl-brand"><span className="utl-brand-icon">⚡</span><div><strong>Utility Tracker</strong><small>combankbd.com</small></div></div>
    <div className="utl-user-card"><span className="utl-avatar">{(user?.displayName||'?').split(/\s+/).map(x=>x[0]).slice(0,2).join('')}</span><div><strong>{user?.displayName}</strong><small>{isAdmin?'Administrator':'Branch User'}</small></div></div>
    {isAdmin && <label className="utl-branch-select">View Branch<select value={branchFilter} onChange={(e)=>setBranchFilter(e.target.value)}><option value="ALL">All Branches</option>{state.branches.map(b=><option key={b.code} value={b.code}>{b.name}</option>)}</select></label>}
    <nav>{all.map(({to,end,label,icon:Icon})=><NavLink key={to} to={to} end={end} className={({isActive})=>`utl-nav-link${isActive?' active':''}`}><Icon size={17}/><span>{label}</span></NavLink>)}</nav>
    <div className="utl-side-spacer"/>
    <button className="utl-logout" onClick={logout}><LogOut size={16}/> Log Out</button>
    <div className="utl-support">IT Support — SHAKIR KHUSRU</div>
  </aside>;
}
