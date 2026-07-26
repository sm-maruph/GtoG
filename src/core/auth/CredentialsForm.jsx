/**
 * CredentialsForm — the username/password form, and nothing else.
 * Reused by the generic LoginPage and the per-system ContextualLogin so the
 * sign-in fields, autocomplete, and enumeration-safe error handling live in one
 * place. It owns field state; the parent owns what "sign in" means and where it
 * goes next.
 */

import { useState } from 'react';
import { AlertCircle } from 'lucide-react';

export default function CredentialsForm({ onSubmit, submitLabel = 'Sign in' }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await onSubmit(username.trim(), password);
    } catch (err) {
      /* Surface exactly what the API returned — which is deliberately the same
         message for "no such account" and "wrong password". Do not add a hint
         that reveals which one it was; that hands out valid AD usernames. */
      setError(err.response?.data?.error ?? 'Can\u2019t reach the portal. Check your network connection.');
      setPassword('');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {error && (
        <div className="alert-error" style={{ marginBottom: 'var(--sp-4)' }} role="alert">
          <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <label className="field">
        <span>Lan ID</span>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
          autoFocus
          required
          placeholder="firstname.lastname"
          disabled={busy}
        />
      </label>

      <label className="field">
        <span>Password</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
          disabled={busy}
        />
      </label>

      <button
        type="submit"
        className="btn btn-primary"
        style={{ width: '100%', justifyContent: 'center', padding: 10, marginTop: 'var(--sp-1)' }}
        disabled={busy || !username || !password}
      >
        {busy ? 'Signing in\u2026' : submitLabel}
      </button>
    </form>
  );
}
