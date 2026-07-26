/**
 * ContextualLogin — the sign-in a user meets when they open a system while
 * signed out. Same credentials, same session — only the framing is per-system,
 * so "with that option he can ask for login" holds while the identity stays
 * unified. On success, AuthContext flips to authenticated and the gateway that
 * renders this swaps straight to the system's dashboard; no redirect needed.
 */

import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from './AuthContext';
import CredentialsForm from './CredentialsForm';
import '../../pages/LoginPage.css';

export default function ContextualLogin({ entry }) {
  const { login } = useAuth();
  const Icon = entry.icon;

  return (
    <div className="login">
      <div className="login-panel">
        <Link to="/" className="login-back">
          <ArrowLeft size={14} aria-hidden="true" />
          All systems
        </Link>

        <div className="login-context">
          <span className="login-context-icon" aria-hidden="true">
            <Icon size={20} />
          </span>
          <div>
            <span className="login-context-code code">{entry.code.toUpperCase()}</span>
            <strong className="login-context-name">{entry.name}</strong>
          </div>
        </div>

        <h1 className="login-title">Sign in to continue</h1>
        <p className="login-sub">Use your network account to open {entry.name}.</p>

        <CredentialsForm onSubmit={login} submitLabel={`Open ${entry.name}`} />

        <p className="login-help">
          This is your Active Directory password &mdash; the same one you use for
          your workstation. Repeated failures will lock your network account.
        </p>
      </div>

      <footer className="login-foot">
        Commercial Bank of Ceylon PLC &mdash; Bangladesh Operation
      </footer>
    </div>
  );
}
