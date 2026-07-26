import { NavLink } from 'react-router-dom';
import { AlertTriangle, BarChart3, BellRing, ClipboardList, Gauge, History, ShieldCheck, UsersRound } from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';
import logo from '../../../assets/small_logo.jpg';
export default function InsNav({ isAdmin, onAlert }) {
  const { user } = useAuth();
  const links = [
    { to: '/insurance', end: true, label: 'Dashboard', icon: Gauge, section: isAdmin ? 'Overview' : 'My Unit' },
    { to: '/insurance/policies', label: isAdmin ? 'All Policies' : 'My Policies', icon: ClipboardList },
    { to: '/insurance/expired', label: 'Expired Policies', icon: AlertTriangle },
    { to: '/insurance/maturity', label: 'Maturity Tracker', icon: ShieldCheck },
    { to: '/insurance/stats', label: 'Insurance Stats', icon: BarChart3, section: 'Insights' },
    { to: '/insurance/follow-ups', label: 'Follow-Up Tracker', icon: BellRing, section: 'Operations' },
  ];
  if (isAdmin) {
    links.push({ to: '/insurance/audit', label: 'Audit Log', icon: History });
    links.push({ to: '/insurance/users', label: 'User Management', icon: UsersRound, section: 'Admin' });
  }
  return <aside className="ins-sidebar">
    <div className="ins-brand"><span className="ins-brand-logo"><img src={logo} alt="cbc logo" /></span><div><strong>CBC Insurance</strong><small>Management Tracker</small></div></div>
    <div className="ins-side-user"><span>{(user?.displayName||'?').split(/\s+/).map(v=>v[0]).slice(0,2).join('')}</span><div><strong>{user?.displayName}</strong><small>{isAdmin?'Admin · All Units':user?.branch?.name}</small></div></div>
    <nav className="ins-nav">{links.map(({to,label,icon:Icon,end,section})=><div key={to}>{section&&<div className="ins-nav-section">{section}</div>}<NavLink to={to} end={end} className={({isActive})=>`ins-nav-link${isActive?' active':''}`}><Icon size={16}/><span>{label}</span></NavLink></div>)}</nav>
    <div className="ins-side-spacer"/>
    {isAdmin&&<button className="ins-send-alert" onClick={onAlert}><BellRing size={15}/> Send Expiry Alerts</button>}
    <div className="ins-side-foot">Internal Use Only · v5.0</div>
  </aside>;
}
