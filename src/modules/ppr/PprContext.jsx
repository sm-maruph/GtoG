import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useAuth } from '../../core/auth/AuthContext';
import { loadAccessState } from '../../core/admin/accessStore';
import * as store from './store';

const Context = createContext(null);

export function PaperProvider({ children }) {
  const auth = useAuth();
  const [state, setState] = useState(() => store.loadState());
  const [directory, setDirectory] = useState(() => loadAccessState());
  const refresh = useCallback(() => {
    setState(store.loadState());
    setDirectory(loadAccessState());
  }, []);
  const entries = useMemo(() => store.visibleEntries(state, auth), [state, auth.user, auth.permissions, auth.isSuperAdmin]);
  const actor = auth.user;
  const can = auth.can;
  const isAdmin = auth.isSuperAdmin || auth.scopeOf('ppr.entry.view')?.scopeType === 'GLOBAL' || auth.can('ppr.master.manage');
  const actions = useMemo(() => ({
    addEntry(payload) { const result = store.addEntry(payload, actor); refresh(); return result; },
    updateEntry(id, payload) { const result = store.updateEntry(id, payload, actor); refresh(); return result; },
    deleteEntry(id) { const result = store.deleteEntry(id, actor); refresh(); return result; },
    savePaperType(payload) { const result = store.savePaperType(payload, actor); refresh(); return result; },
    deletePaperType(id) { const result = store.deletePaperType(id, actor); refresh(); return result; },
    savePrinter(payload) { const result = store.savePrinter(payload, actor); refresh(); return result; },
    deletePrinter(id) { const result = store.deletePrinter(id, actor); refresh(); return result; },
    reset() { const result = store.resetState(actor); setState(result); },
  }), [actor, refresh]);
  const value = useMemo(() => ({
    state, entries, directory, actions, can, isAdmin,
    summary: store.summarize(entries), trend: store.monthlyTrend(entries), exportCsv: store.exportEntriesCsv,
  }), [state, entries, directory, actions, can, isAdmin]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function usePaper() {
  const value = useContext(Context);
  if (!value) throw new Error('usePaper must be used inside PaperProvider');
  return value;
}
