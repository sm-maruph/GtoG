/**
 * PublicTopBar — professional portal header used on the landing page.
 * It exposes the same module directory from the top navigation so users can
 * move directly to a system without returning to the card grid.
 */

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, Clock3, Grid3X3, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../core/auth/AuthContext';
import { MODULE_CATALOG } from '../../core/catalog';
import logo from '../../assets/cbc_logo.png';
import ThemeToggle from '../../core/theme/ThemeToggle';

export default function PublicTopBar() {
  const { status, user, isSuperAdmin, logout } = useAuth();
  const [modulesOpen, setModulesOpen] = useState(false);
  const [now, setNow] = useState(()=>new Date());
  const navigate = useNavigate();
  const menuItems = MODULE_CATALOG
    .filter((entry) => !entry.adminOnly || (status === 'authenticated' && isSuperAdmin))
    .sort((a,b)=>a.name.localeCompare(b.name));
  const hour=now.getHours();
  const greeting=hour<12?'Good morning':hour<17?'Good afternoon':hour<21?'Good evening':'Good night';
  const time=now.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:true});
  const date=now.toLocaleDateString('en-GB',{weekday:'short',day:'2-digit',month:'short',year:'numeric'});

  useEffect(()=>{
    const timer=window.setInterval(()=>setNow(new Date()),1000);
    return()=>window.clearInterval(timer);
  },[]);

  async function handleLogout() {
    await logout();
    navigate('/', { replace: true });
  }

  return (
    <header className="lp-topbar">
      <Link to="/" className="lp-brand">
        <img
          className="lp-brand-logo"
          src={logo}
          alt="Commercial Bank of Ceylon"
        />
      </Link>

      <div className="lp-topbar-right">
        <div className="lp-live-time" aria-label={`${greeting}. ${date}, ${time}`}>
          <span className="lp-clock-icon" aria-hidden="true"><Clock3 size={15}/><i/></span>
          <span className="lp-time-copy">
            <span className="lp-greeting">{greeting}<i>!</i></span>
            <span className="lp-date-time"><span>{date}</span><strong>{time}</strong></span>
          </span>
        </div>
        <ThemeToggle />
        <div className="lp-module-menu">
          <button type="button" className="lp-module-button" onClick={() => setModulesOpen((value) => !value)} aria-expanded={modulesOpen}>
            <Grid3X3 size={15} />
            <span>All modules</span>
            <ChevronDown size={13} />
          </button>
          {modulesOpen && (
            <div className="lp-module-popover">
              <div className="lp-module-popover-title">Portal directory</div>
              {menuItems.map((entry) => {
                const Icon = entry.icon;
                return (
                  <Link key={entry.code} to={entry.routePath} onClick={() => setModulesOpen(false)}>
                    <span className="lp-module-popover-icon">{entry.adminOnly ? <ShieldCheck size={16} /> : <Icon size={16} />}</span>
                    <span><strong>{entry.name}</strong><small>{entry.code.toUpperCase()}</small></span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {status === 'authenticated' ? (
          <>
            <span className="lp-user">
              <span className="lp-user-name">{user?.displayName}</span>
              <span className="lp-user-id code">{user?.employeeId}</span>
            </span>
            <button className="btn btn-ghost lp-signout" onClick={handleLogout}>
              <LogOut size={14} aria-hidden="true" />
              Sign out
            </button>
          </>
        ) : (
          <span className="lp-signin-hint">Sign in when you open a system</span>
        )}
      </div>
    </header>
  );
}
