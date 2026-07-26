import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut, ChevronDown, Grid3X3, ShieldCheck } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { ScopeChip } from '../ui';
import { getCatalogEntry } from '../catalog';
import ModuleWelcome from './ModuleWelcome';
import ThemeToggle from '../theme/ThemeToggle';
import './ModuleLayout.css';

export default function ModuleLayout({ entry, children }) {
  const { user, roles, isSuperAdmin, modules, logout } = useAuth();
  const [userOpen, setUserOpen] = useState(false);
  const [modulesOpen, setModulesOpen] = useState(false);
  const navigate = useNavigate();
  const Icon = entry.icon;

  const allowedModules = useMemo(() => {
    const list = modules.map((m) => getCatalogEntry(m.code)).filter(Boolean);
    if (isSuperAdmin && !list.some((m) => m.code === 'adm')) list.push(getCatalogEntry('adm'));
    return list.sort((a, b) => (a.code === 'adm') - (b.code === 'adm'));
  }, [modules, isSuperAdmin]);

  async function handleLogout() { await logout(); navigate('/', { replace: true }); }
  const scopeLabel = isSuperAdmin ? 'Global access' : (user?.dept?.name || user?.branch?.name || 'Assigned scope');

  return (
    <div className="ml">
      <header className="ml-header">
        <Link to="/" className="ml-back" aria-label="Back to all systems"><ArrowLeft size={16} /><span>Portal home</span></Link>
        <span className="ml-divider" />
        <span className="ml-title"><span className="ml-title-icon"><Icon size={16} /></span><span className="ml-title-code code">{entry.code.toUpperCase()}</span><strong className="ml-title-name">{entry.name}</strong></span>
        <span className="ml-spacer" />

        <div className="ml-module-menu">
          <button className="ml-module-btn" onClick={() => setModulesOpen((v) => !v)} aria-expanded={modulesOpen}>
            <Grid3X3 size={15} /><span>View Modules</span><ChevronDown size={13} />
          </button>
          {modulesOpen && <div className="ml-modules-popover">
            <div className="ml-popover-title">Your module access</div>
            {allowedModules.map((module) => {
              const MIcon = module.icon;
              return <Link key={module.code} to={module.routePath} className={module.code === entry.code ? 'current' : ''} onClick={() => setModulesOpen(false)}>
                <span><MIcon size={16} /></span><div><strong>{module.name}</strong><small>{module.code.toUpperCase()}</small></div>
              </Link>;
            })}
          </div>}
        </div>

        <ThemeToggle />
        <ScopeChip label={scopeLabel} />
        <div className="ml-user">
          <button className="ml-user-btn" onClick={() => setUserOpen((v) => !v)} aria-expanded={userOpen} aria-haspopup="menu"><span className="ml-avatar">{initials(user?.displayName)}</span><ChevronDown size={14} /></button>
          {userOpen && <div className="ml-menu" role="menu">
            <div className="ml-menu-head"><strong>{user?.displayName}</strong><span>{user?.email}</span><div className="ml-roles">{roles.map((r) => <span key={r} className="role-tag">{prettyRole(r)}</span>)}</div></div>
            {isSuperAdmin && <button className="ml-menu-item" onClick={() => navigate('/super-admin')}><ShieldCheck size={14} />Super Admin Portal</button>}
            <button className="ml-menu-item" onClick={handleLogout}><LogOut size={14} />Sign out</button>
          </div>}
        </div>
      </header>
      <main className={`ml-content ml-content--${entry.code}`}>{children}</main>
      <ModuleWelcome entry={entry} user={user} />
    </div>
  );
}
function initials(name) { return name ? name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase() : '?'; }
function prettyRole(code) { return code.toLowerCase().split('_').map((w) => w[0].toUpperCase() + w.slice(1)).join(' '); }
