import { useMemo, useState } from 'react';
import { Save } from 'lucide-react';
import { PageHeader, Panel } from '../../../core/ui';
import { useAdmin } from '../AdmContext';

export default function Access() {
  const { state, actions, permissionDefinitions, moduleDefinitions } = useAdmin();
  const initial = state.users.find((user) => !user.isSuperAdmin) || state.users[0];
  const [userId, setUserId] = useState(initial?.userId || '');
  const [draft, setDraft] = useState(initial?.directPermissions || []);
  const user = state.users.find((row) => row.userId === Number(userId));
  const rolePermissions = useMemo(() => new Set(
    state.roles.filter((role) => user?.roleIds.includes(role.roleId)).flatMap((role) => role.permissions.map((permission) => permission.code))
  ), [state.roles, user]);
  const groups = useMemo(() => moduleDefinitions.map((module) => ({
    ...module,
    permissions: permissionDefinitions.filter((permission) => permission.module === module.code),
  })).filter((module) => module.permissions.length), [moduleDefinitions, permissionDefinitions]);

  const direct = (code) => draft.find((permission) => permission.code === code);
  const mode = (code) => {
    const permission = direct(code);
    if (!permission) return 'INHERIT';
    return permission.allowed === false ? 'DENY' : 'ALLOW';
  };
  function selectUser(id) {
    const nextId = Number(id);
    setUserId(nextId);
    setDraft(state.users.find((row) => row.userId === nextId)?.directPermissions || []);
  }
  function changeMode(code, value) {
    setDraft((rows) => {
      const rest = rows.filter((permission) => permission.code !== code);
      if (value === 'INHERIT') return rest;
      return [...rest, {
        code,
        allowed: value === 'ALLOW',
        scopeType: 'SELF',
        branchIds: [],
        deptIds: [],
      }];
    });
  }
  function changeScope(code, scopeType) {
    setDraft((rows) => rows.map((permission) => permission.code === code ? {
      ...permission,
      scopeType,
      branchIds: scopeType === 'BRANCH' ? (permission.branchIds?.length ? permission.branchIds : [user?.branchId].filter(Boolean)) : [],
      deptIds: scopeType === 'DEPT' ? (permission.deptIds?.length ? permission.deptIds : [user?.deptId].filter(Boolean)) : [],
    } : permission));
  }
  function changeTarget(code, target, value) {
    setDraft((rows) => rows.map((permission) => permission.code === code ? {
      ...permission,
      [target]: value ? [Number(value)] : [],
    } : permission));
  }
  function save() {
    try {
      actions.updateUserPermissions(user.userId, draft);
      window.alert('Granular access saved. The user must sign out and sign in again to refresh effective access.');
    } catch (error) { window.alert(error.message); }
  }

  return <div>
    <PageHeader title="Granular Access" subtitle="Override role access for one user: inherit, allow, deny, and restrict each permission to self, one branch, one department, or global records.">
      <button className="btn btn-primary" onClick={save} disabled={!user || user.isSuperAdmin}><Save size={15}/>Save access</button>
    </PageHeader>
    <Panel><div className="adm-access-head">
      <label><span>User</span><select value={userId} onChange={(event) => selectUser(event.target.value)}>{state.users.map((row) => <option key={row.userId} value={row.userId}>{row.displayName} — {row.username}</option>)}</select></label>
      {user && <div><strong>{user.displayName}</strong><span>{user.isSuperAdmin ? 'Super Admin automatically has every permission at GLOBAL scope.' : `${user.roleIds.length} role(s) · ${draft.length} direct override(s)`}</span></div>}
    </div></Panel>
    {user?.isSuperAdmin ? <Panel><div className="adm-empty">Super Admin access cannot be reduced from this page.</div></Panel> : <div className="adm-permission-groups adm-access-groups">{groups.map((group) => <section key={group.code}><h3>{group.name}</h3>{group.permissions.map((definition) => {
      const permission = direct(definition.code);
      return <div key={definition.code} className="adm-access-row">
        <div><strong>{definition.label}</strong><small className="code">{definition.code}</small>{rolePermissions.has(definition.code) && <em>Granted by assigned role</em>}</div>
        <select value={mode(definition.code)} onChange={(event) => changeMode(definition.code, event.target.value)}><option value="INHERIT">Inherit</option><option value="ALLOW">Allow</option><option value="DENY">Deny</option></select>
        <select disabled={!permission || permission.allowed === false} value={permission?.scopeType || 'SELF'} onChange={(event) => changeScope(definition.code, event.target.value)}><option>SELF</option><option>BRANCH</option><option>DEPT</option><option>GLOBAL</option></select>
        {permission?.allowed !== false && permission?.scopeType === 'BRANCH' && <select className="adm-target-select" value={permission.branchIds?.[0] || ''} onChange={(event) => changeTarget(definition.code, 'branchIds', event.target.value)}><option value="">User's assigned branch</option>{state.branches.filter((branch) => branch.status === 'ACTIVE').map((branch) => <option key={branch.branchId} value={branch.branchId}>{branch.name}</option>)}</select>}
        {permission?.allowed !== false && permission?.scopeType === 'DEPT' && <select className="adm-target-select" value={permission.deptIds?.[0] || ''} onChange={(event) => changeTarget(definition.code, 'deptIds', event.target.value)}><option value="">User's assigned department</option>{state.departments.filter((department) => department.status === 'ACTIVE').map((department) => <option key={department.deptId} value={department.deptId}>{department.name}</option>)}</select>}
      </div>;
    })}</section>)}</div>}
  </div>;
}
