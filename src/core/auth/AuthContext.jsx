/**
 * AUTH CONTEXT
 * ---------------------------------------------------------------------------
 * Single source of session truth: user, roles, effective modules, effective
 * permissions. Everything comes from ONE /api/me call so the sidebar can never
 * disagree with what the API will actually allow.
 */

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import * as client from '../api/client';
import { recordAudit, setAuditActor } from '../audit/store';

const AuthContext = createContext(null);
const EMPLOYEE_DIRECTORY_MODULE = { moduleId: 6, code: 'emp', name: 'Employee Directory', icon: 'contact-round', routePath: '/employee-directory', sortOrder: 5 };
const EXIMBILL_ROSTER_MODULE = { moduleId: 7, code: 'exb', name: 'IT EximBill Roster Duty', icon: 'calendar-clock', routePath: '/eximbill-roster', sortOrder: 7 };

export function AuthProvider({ children }) {
  const [state, setState] = useState({
    status: 'loading',      // loading | authenticated | anonymous
    user: null,
    roles: [],
    isSuperAdmin: false,
    modules: [],
    permissions: {},
  });

  const applyMe = useCallback((me) => {
    const modules = [...(me.modules ?? [])];
    if (!modules.some((module) => module.code === 'emp')) modules.push(EMPLOYEE_DIRECTORY_MODULE);
    const isItUser = me.user?.dept?.code === 'IT' || /information technology/i.test(me.user?.dept?.name || '');
    if (isItUser && !modules.some((module) => module.code === 'exb')) modules.push(EXIMBILL_ROSTER_MODULE);
    const permissions = { ...(me.permissions ?? {}), 'emp.directory.view': { scopeType: 'GLOBAL', branchIds: [], deptIds: [] } };
    if (isItUser) {
      permissions['exb.roster.view'] ||= { scopeType: 'GLOBAL', branchIds: [], deptIds: [] };
      permissions['exb.roster.complete'] ||= { scopeType: 'SELF', branchIds: [], deptIds: [] };
    }
    setAuditActor(me.user);
    setState({
      status: 'authenticated',
      user: me.user,
      roles: me.roles ?? [],
      isSuperAdmin: me.isSuperAdmin ?? false,
      modules: modules.sort((a, b) => a.sortOrder - b.sortOrder),
      permissions,
    });
  }, []);

  const clear = useCallback(() => {
    setAuditActor(null);
    setState({ status: 'anonymous', user: null, roles: [], isSuperAdmin: false, modules: [], permissions: {} });
  }, []);

  /* On load, try to turn the surviving httpOnly refresh cookie back into a
     session. Failure here is the normal "not logged in" path, not an error —
     don't log it as one or your console will cry wolf on every visit. */
  useEffect(() => {
    let alive = true;
    client.setAuthFailureHandler(() => { if (alive) clear(); });

    client.bootstrap()
      .then((me) => { if (alive) applyMe(me); })
      .catch(() => { if (alive) clear(); });

    return () => { alive = false; };
  }, [applyMe, clear]);

  const login = useCallback(async (username, password) => {
    try {
      await client.login(username, password);
      const me = await client.fetchMe();
      applyMe(me);
      recordAudit({
        moduleCode: 'auth', action: 'LOGIN_SUCCESS',
        detail: `Successful portal login for ${me.user?.samAccountName ?? username}.`,
        actor: me.user,
      });
      return me;
    } catch (error) {
      recordAudit({
        moduleCode: 'auth', action: 'LOGIN_FAILED', status: 'FAILED',
        detail: `Failed login attempt for username ${String(username || '(blank)')}.`,
        actor: { username: String(username || '') },
      });
      throw error;
    }
  }, [applyMe]);

  const logout = useCallback(async () => {
    const actor = state.user;
    recordAudit({ moduleCode: 'auth', action: 'LOGOUT', detail: 'User signed out of the portal.', actor });
    await client.logout();
    clear();
  }, [clear, state.user]);

  /**
   * can('vbs.request.approve')
   *
   * COSMETICS, NOT SECURITY. This hides buttons a user can't use so the UI
   * isn't a maze of dead ends. It is not a control. Every check here must have
   * a matching requirePermission() on the server — a pentester will call the
   * endpoint with curl and never load this bundle at all.
   */
  const can = useCallback((permissionCode) => {
    if (state.isSuperAdmin) return true;
    return Boolean(state.permissions[permissionCode]);
  }, [state.isSuperAdmin, state.permissions]);

  /** The scope a permission is held at — drives the header scope chip. */
  const scopeOf = useCallback((permissionCode) => {
    if (state.isSuperAdmin) return { scopeType: 'GLOBAL', branchIds: [], deptIds: [] };
    return state.permissions[permissionCode] ?? null;
  }, [state.isSuperAdmin, state.permissions]);

  const hasModule = useCallback(
    (code) => state.modules.some((m) => m.code === code),
    [state.modules]
  );

  const value = useMemo(
    () => ({ ...state, login, logout, can, scopeOf, hasModule, refresh: () => client.fetchMe().then(applyMe) }),
    [state, login, logout, can, scopeOf, hasModule, applyMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
