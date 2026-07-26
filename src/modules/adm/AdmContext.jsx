import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useAuth } from '../../core/auth/AuthContext';
import * as access from '../../core/admin/accessStore';
const Ctx=createContext(null);
export function AdminProvider({children}){
  const auth=useAuth(); const [state,setState]=useState(()=>access.loadAccessState());
  const refresh=useCallback(()=>setState(access.loadAccessState()),[]); const actor=auth.user;
  const wrap=(fn)=>(...args)=>{const result=fn(...args,actor);refresh();return result};
  const actions=useMemo(()=>({
    addBranch:wrap(access.addBranch),updateBranch:wrap(access.updateBranch),deleteBranch:wrap(access.deleteBranch),
    addDepartment:wrap(access.addDepartment),updateDepartment:wrap(access.updateDepartment),deleteDepartment:wrap(access.deleteDepartment),
    addRole:wrap(access.addRole),updateRole:wrap(access.updateRole),deleteRole:wrap(access.deleteRole),
    addGroup:wrap(access.addGroup),updateGroup:wrap(access.updateGroup),deleteGroup:wrap(access.deleteGroup),
    addUser:wrap(access.addUser),updateUser:wrap(access.updateUser),deleteUser:wrap(access.deleteUser),
    updateUserPermissions:wrap(access.updateUserPermissions),reset:()=>{const r=access.resetAccessState(actor);setState(r);return r},
  }),[actor,refresh]);
  const value=useMemo(()=>({state,actions,permissionDefinitions:access.PERMISSION_DEFINITIONS,moduleDefinitions:access.MODULE_DEFINITIONS,refresh}),[state,actions,refresh]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useAdmin(){const v=useContext(Ctx);if(!v)throw new Error('useAdmin must be inside AdminProvider');return v}
