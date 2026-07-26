/**
 * PERMISSION GATES
 * ---------------------------------------------------------------------------
 * Read this once and remember it: everything in this file is COSMETIC.
 * It stops users from clicking buttons that would 403 anyway. It stops nothing
 * else. The real control lives in requirePermission() + req.scope on the API.
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

/**
 * <Can do="vbs.request.approve">        renders children if held
 * <Can any={['a','b']}>                 renders if ANY is held
 * <Can do="x" fallback={<Disabled/>}>   renders fallback otherwise
 */
export function Can({ do: permission, any, fallback = null, children }) {
  const { can } = useAuth();

  const allowed = any?.length
    ? any.some((p) => can(p))
    : can(permission);

  return allowed ? children : fallback;
}

/** Blocks a route until the session resolves; bounces anonymous users to /login. */
export function RequireAuth({ children }) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <FullPageSpinner />;
  if (status === 'anonymous') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}

/**
 * Guards a module route. Two different failures, two different messages —
 * "you don't have this module" and "this module has nothing for you" are
 * distinct problems with distinct fixes, and the admin needs to know which.
 */
export function RequireModule({ code, children }) {
  const { hasModule, isSuperAdmin } = useAuth();
  if (isSuperAdmin || hasModule(code)) return children;
  return <NoAccess reason="module" code={code} />;
}

export function RequirePermission({ code, children }) {
  const { can } = useAuth();
  if (can(code)) return children;
  return <NoAccess reason="permission" code={code} />;
}

function NoAccess({ reason, code }) {
  const copy = reason === 'module'
    ? {
        title: 'You don\u2019t have access to this module',
        body: 'Ask an administrator to grant it under Admin \u2192 Users \u2192 Module access.',
      }
    : {
        title: 'You don\u2019t have permission for this',
        body: 'Your role doesn\u2019t include this function. An administrator can add it to your role.',
      };

  return (
    <div style={{
      display: 'grid', placeItems: 'center', minHeight: '60vh',
      textAlign: 'center', padding: 'var(--sp-6)',
    }}>
      <div style={{ maxWidth: 380 }}>
        <div style={{
          width: 44, height: 44, margin: '0 auto var(--sp-4)',
          display: 'grid', placeItems: 'center',
          borderRadius: '50%', background: 'var(--ink-100)', color: 'var(--ink-500)',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h2 style={{ margin: '0 0 var(--sp-2)', fontSize: 'var(--text-lg)' }}>{copy.title}</h2>
        <p style={{ margin: 0, color: 'var(--ink-500)', fontSize: 'var(--text-sm)' }}>{copy.body}</p>
        <p className="code" style={{ marginTop: 'var(--sp-4)', color: 'var(--ink-400)', fontSize: 'var(--text-xs)' }}>
          {code}
        </p>
      </div>
    </div>
  );
}

export function FullPageSpinner() {
  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
      <div className="cbc-spinner" aria-label="Loading" role="status" />
      <style>{`
        .cbc-spinner {
          width: 22px; height: 22px;
          border: 2px solid var(--ink-200);
          border-top-color: var(--cbc-blue-600);
          border-radius: 50%;
          animation: cbc-spin 0.7s linear infinite;
        }
        @keyframes cbc-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
