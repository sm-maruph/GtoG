import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useAuth } from '../../core/auth/AuthContext';
import * as store from './store.js';

const Ctx = createContext(null);
export function UtilityProvider({ children }) {
  const auth = useAuth();
  const [state, setState] = useState(() => store.loadState());
  const isAdmin = auth.isSuperAdmin || auth.can('utl.user.manage');
  const ownCode = auth.user?.branch?.code === 'HQ' ? '801' : auth.user?.branch?.code === 'GLSHN' ? '802' : auth.user?.branch?.code || '801';
  const [branchFilter, setBranchFilter] = useState(isAdmin ? 'ALL' : ownCode);
  const refresh = useCallback(() => setState(store.loadState()), []);
  const actor = auth.user;
  const actions = useMemo(() => ({
    addGeneratorRun(p){ store.addGeneratorRun(p, actor); refresh(); }, addFuelPurchase(p){ store.addFuelPurchase(p, actor); refresh(); }, addElectricBill(p){ store.addElectricBill(p, actor); refresh(); }, addWasaBill(p){ store.addWasaBill(p, actor); refresh(); }, addWaterDelivery(p){ store.addWaterDelivery(p, actor); refresh(); }, addWaterBill(p){ store.addWaterBill(p, actor); refresh(); }, saveUser(p){ store.saveUser(p, actor); refresh(); }, deleteUser(id){ store.deleteUser(id, actor); refresh(); }, saveUtilityType(p){ store.saveUtilityType(p, actor); refresh(); }, deleteUtilityType(id){ store.deleteUtilityType(id, actor); refresh(); }, saveBill(p){store.saveBill(p,actor);refresh();}, deleteBill(id){store.deleteBill(id,actor);refresh();}, saveFuelAsset(p){store.saveFuelAsset(p,actor);refresh();}, saveFuelStation(name){store.saveFuelStation(name,actor);refresh();}, reset(){ setState(store.reset(actor)); }
  }), [actor, refresh]);
  const stats = useMemo(() => store.analytics(state, branchFilter), [state, branchFilter]);
  const value = useMemo(() => ({ state, isAdmin, ownCode, branchFilter, setBranchFilter, stats, actions }), [state,isAdmin,ownCode,branchFilter,stats,actions]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useUtility(){ const v=useContext(Ctx); if(!v) throw new Error('useUtility must be inside UtilityProvider'); return v; }
