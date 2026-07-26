/**
 * ModuleGateway — the decision point for one system's route.
 * Given a catalog entry, it resolves which of four things the user should see:
 *
 *   loading        -> spinner
 *   anonymous      -> ContextualLogin (the per-system sign-in)
 *   no access      -> NoAccess inside the module chrome
 *   not built yet  -> placeholder inside the module chrome
 *   ok             -> the system's dashboard inside the module chrome
 *
 * Keeping this in one place means every system is gated identically. A new
 * module gets correct auth, access-gating and chrome for free.
 */

import { Suspense } from 'react';
import { useAuth } from '../auth/AuthContext';
import { FullPageSpinner } from '../auth/Can';
import ContextualLogin from '../auth/ContextualLogin';
import ModuleLayout from '../layout/ModuleLayout';
import { getModuleComponent } from '../moduleRegistry';
import { EmptyState } from '../ui';
import { Lock, Wrench } from 'lucide-react';

export default function ModuleGateway({ entry }) {
  const { status, isSuperAdmin, hasModule } = useAuth();

  if (status === 'loading') return <FullPageSpinner />;

  /* Signed out: ask for login, framed for this system. On success the context
     flips to authenticated and this component re-renders into the dashboard. */
  if (status === 'anonymous') return <ContextualLogin entry={entry} />;

  const allowed = entry.code === 'adm' ? isSuperAdmin : (isSuperAdmin || hasModule(entry.code));
  const Component = getModuleComponent(entry.code);

  return (
    <ModuleLayout entry={entry}>
      {!allowed ? (
        <EmptyState
          icon={Lock}
          title="You don't have access to this system"
          body={'Your account isn\u2019t granted this system. An administrator can add it under Admin \u2192 Users \u2192 Module access.'}
        />
      ) : !Component ? (
        <EmptyState
          icon={Wrench}
          title={`${entry.name} isn't available yet`}
          body="You have access, but this system hasn't been released to the portal yet."
        />
      ) : (
        <Suspense fallback={<div style={{ padding: 'var(--sp-6)' }}><FullPageSpinner /></div>}>
          <Component entry={entry} />
        </Suspense>
      )}
    </ModuleLayout>
  );
}
