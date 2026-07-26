import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useAuth } from '../../core/auth/AuthContext';
import * as store from './store';

const InsuranceContext = createContext(null);

export function InsuranceProvider({ children }) {
  const auth = useAuth();
  const [state, setState] = useState(() => store.loadState());
  const isAdmin = auth.isSuperAdmin || auth.can('ins.user.manage');
  const unitCode = auth.user?.branch?.code ?? '';
  const unitName = auth.user?.branch?.name ?? 'Unassigned unit';

  const refresh = useCallback(() => setState(store.loadState()), []);
  const actor = auth.user;

  const policyScope = auth.scopeOf('ins.policy.view');
  const policies = useMemo(() => {
    if (isAdmin || policyScope?.scopeType === 'GLOBAL') return state.policies;
    if (policyScope?.scopeType === 'SELF') return state.policies.filter((p) => p.createdByEmployeeId === auth.user?.employeeId);
    if (policyScope?.scopeType === 'DEPT') return state.policies.filter((p) => p.deptId && policyScope.deptIds.includes(p.deptId));
    return state.policies.filter((p) => p.unitCode === unitCode);
  }, [isAdmin, policyScope, state.policies, auth.user?.employeeId, unitCode]);
  const followUps = useMemo(() => {
    if (isAdmin || policyScope?.scopeType === 'GLOBAL') return state.followUps;
    if (policyScope?.scopeType === 'SELF') return state.followUps.filter((f) => f.createdByEmployeeId === auth.user?.employeeId);
    return state.followUps.filter((f) => f.unitCode === unitCode);
  }, [isAdmin, policyScope, state.followUps, auth.user?.employeeId, unitCode]);

  const actions = useMemo(() => ({
    addPolicy(payload) { const result = store.addPolicy(payload, actor); refresh(); return result; },
    updatePolicy(id, payload) { const result = store.updatePolicy(id, payload, actor); refresh(); return result; },
    deletePolicy(id) { const result = store.deletePolicy(id, actor); refresh(); return result; },
    addFollowUp(payload) { const result = store.addFollowUp(payload, actor); refresh(); return result; },
    updateFollowUp(id, payload) { const result = store.updateFollowUp(id, payload, actor); refresh(); return result; },
    deleteFollowUp(id) { const result = store.deleteFollowUp(id, actor); refresh(); return result; },
    addUser(payload) { const result = store.addUser(payload, actor); refresh(); return result; },
    updateUser(id, payload) { const result = store.updateUser(id, payload, actor); refresh(); return result; },
    deleteUser(id) { const result = store.deleteUser(id, actor); refresh(); return result; },
    sendAlerts(selection) { const result = store.sendAlerts(selection, actor); refresh(); return result; },
    reset() { const result = store.resetDemoData(actor); setState(result); },
  }), [actor, refresh]);

  const value = useMemo(() => ({
    state, policies, followUps, users: state.users, audit: state.audit,
    units: store.listUnits(state), isAdmin, unitCode, unitName, can: auth.can, scopeOf: auth.scopeOf,
    previewAlerts: store.previewAlerts, actions,
  }), [state, policies, followUps, isAdmin, unitCode, unitName, actions]);

  return <InsuranceContext.Provider value={value}>{children}</InsuranceContext.Provider>;
}

export function useInsurance() {
  const context = useContext(InsuranceContext);
  if (!context) throw new Error('useInsurance must be used inside InsuranceProvider');
  return context;
}
