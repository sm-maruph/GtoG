import { NavLink } from 'react-router-dom';
import { FileBarChart2, FileStack, Gauge, History, Printer, Settings2 } from 'lucide-react';
import { usePaper } from '../PprContext';
import logo from '../../../assets/small_logo.jpg';

export default function PprNav() {
  const { can } = usePaper();
  const links = [
    { to: '/paper-tracker', end: true, label: 'Dashboard', icon: Gauge, section: 'Overview' },
    { to: '/paper-tracker/entries', label: 'Usage Entries', icon: FileStack, section: 'Tracking' },
    { to: '/paper-tracker/reports', label: 'Reports', icon: FileBarChart2, section: 'Insights' },
  ];
  if (can('ppr.master.manage')) links.push({ to: '/paper-tracker/masters', label: 'Paper & Printers', icon: Printer, section: 'Administration' });
  if (can('ppr.audit.view')) links.push({ to: '/paper-tracker/audit', label: 'Audit Log', icon: History });
  return <aside className="ppr-sidebar">
    <div className="ppr-brand"><span><img src={logo} alt="CBC logo" /></span><div><strong>Paper Tracker</strong><small>Printer usage control</small></div></div>
    <nav>{links.map(({to,end,label,icon:Icon,section}) => <div key={to}>{section && <div className="ppr-nav-section">{section}</div>}<NavLink to={to} end={end} className={({isActive}) => `ppr-nav-link${isActive ? ' active' : ''}`}><Icon size={16}/><span>{label}</span></NavLink></div>)}</nav>
    <div className="ppr-side-spacer"/>
    <div className="ppr-side-note"><Settings2 size={14}/> Monthly page-counter control</div>
  </aside>;
}
