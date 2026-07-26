import { useEffect, useState } from 'react';
import { ContactRound, ExternalLink, Headphones, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { loadRosterState } from '../../modules/exb/store';

const pmsUrl = import.meta.env.VITE_PMS_SYSTEM_URL || '';

export default function FloatingSupport() {
  const [open, setOpen] = useState(false);
  const [available, setAvailable] = useState(() => loadRosterState().supportAvailable);

  useEffect(() => {
    const refresh = () => setAvailable(loadRosterState().supportAvailable);
    window.addEventListener('cbc:eximbill-roster-changed', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('cbc:eximbill-roster-changed', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  return (
    <div
      className={`lp-support ${available ? 'is-available' : 'is-unavailable'}${open ? ' is-open' : ''}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      {open && (
        <section className="lp-support-panel" aria-label="IT support options">
          <header>
            <span><Headphones size={17} /></span>
            <div>
              <strong>Need IT assistance?</strong>
              <small>Choose a support channel</small>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close IT support">
              <X size={15} />
            </button>
          </header>

          <Link to="/employee-directory" className="lp-support-option">
            <span><ContactRound size={18} /></span>
            <div>
              <strong>Contact the IT team</strong>
              <small>Find IT contacts in Employee Directory</small>
            </div>
          </Link>

          {pmsUrl ? (
            <a href={pmsUrl} target="_blank" rel="noreferrer" className="lp-support-option pms">
              <span><ExternalLink size={18} /></span>
              <div>
                <strong>Open PMS System</strong>
                <small>Continue to the external support system</small>
              </div>
              <ExternalLink size={13} />
            </a>
          ) : (
            <div className="lp-support-option pms is-disabled">
              <span><ExternalLink size={18} /></span>
              <div>
                <strong>PMS System</strong>
                <small>Add your PMS link in the environment settings</small>
              </div>
            </div>
          )}

          <footer><i /> IT Operations support is {available ? 'online' : 'offline'}</footer>
        </section>
      )}

      <button
        type="button"
        className="lp-support-trigger"
        style={available ? {
          color: '#22c55e',
          borderColor: '#22c55e',
          background: 'linear-gradient(145deg, rgba(34,197,94,.16), rgba(6,38,55,.96))',
          boxShadow: '0 0 0 1px rgba(34,197,94,.16), 0 10px 28px rgba(34,197,94,.24)',
        } : {
          color: '#94a3b8',
          borderColor: '#64748b',
        }}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label={open ? 'Close IT support options' : `Contact IT support — currently ${available ? 'online' : 'offline'}`}
      >
        {open
          ? <X size={20} color={available ? '#22c55e' : undefined} />
          : <Headphones size={20} color={available ? '#22c55e' : undefined} strokeWidth={2.25} />}
        <span
          className={`lp-support-availability ${available ? 'online' : 'offline'}`}
          style={{
            backgroundColor: available ? '#22c55e' : '#94a3b8',
            borderColor: available ? '#22c55e' : '#94a3b8',
          }}
          aria-hidden="true"
        ><i /></span>
        <span className="lp-support-tooltip">{open ? 'Close' : `IT support: ${available ? 'Online' : 'Offline'}`}</span>
      </button>
    </div>
  );
}
