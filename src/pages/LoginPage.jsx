/**
 * LoginPage — the generic sign-in at /login (direct visits, post-logout).
 * Most sign-ins happen contextually at a system; this is the plain entry point.
 */

import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../core/auth/AuthContext';
import { FullPageSpinner } from '../core/auth/Can';
import CredentialsForm from '../core/auth/CredentialsForm';
import './LoginPage.css';

export default function LoginPage() {
  const { status, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname ?? '/';

  if (status === 'loading') return <FullPageSpinner />;
  if (status === 'authenticated') return <Navigate to={from} replace />;

  async function handleLogin(username, password) {
    await login(username, password);
    navigate(from, { replace: true });
  }

  return (
    <div className="login">
      <div className="login-panel">
        <div className="login-brand">
          <div className="login-mark" aria-hidden="true" />
          <div>
            <strong>Commercial Bank of Ceylon</strong>
            <span>Bangladesh Operation</span>
          </div>
        </div>

        <h1 className="login-title">Internal Systems Portal</h1>
        <p className="login-sub">Sign in with your network account.</p>

        <CredentialsForm onSubmit={handleLogin} />

        <p className="login-help">
          This is your Active Directory password &mdash; the same one you use to
          log in to your workstation. Repeated failures will lock your network
          account.
        </p>
      </div>

      <footer className="login-foot">
        Commercial Bank of Ceylon PLC &mdash; Bangladesh Operation<br />
        Hadi Tower, Kemal Ataturk Avenue, Gulshan&ndash;2, Dhaka&ndash;1212
      </footer>
    </div>
  );
}
