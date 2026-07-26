# Super Admin and global authorization — production API contract

The demonstration portal resolves users, roles, scopes, and direct overrides in the browser. In production, authentication and authorization must be enforced by the server.

## Organization directory

```http
GET    /api/admin/branches
POST   /api/admin/branches
PUT    /api/admin/branches/{id}
DELETE /api/admin/branches/{id}

GET    /api/admin/departments?branchId=
POST   /api/admin/departments
PUT    /api/admin/departments/{id}
DELETE /api/admin/departments/{id}
```

Prefer deactivation over deletion after business records reference a branch or department.

## Users

```http
GET  /api/admin/users?search=&branchId=&departmentId=&status=
GET  /api/admin/users/{id}
POST /api/admin/users
PUT  /api/admin/users/{id}
POST /api/admin/users/{id}/activate
POST /api/admin/users/{id}/deactivate
```

Never store plaintext passwords. Integrate Active Directory, Entra ID, SSO, or a secure password hashing implementation.

## Roles and role permissions

```http
GET    /api/admin/roles
POST   /api/admin/roles
PUT    /api/admin/roles/{id}
DELETE /api/admin/roles/{id}
PUT    /api/admin/roles/{id}/permissions
PUT    /api/admin/users/{id}/roles
```

A role permission contains:

```json
{
  "permissionCode": "ins.policy.view",
  "scopeType": "BRANCH"
}
```

## Direct granular overrides

```http
GET /api/admin/users/{id}/permission-overrides
PUT /api/admin/users/{id}/permission-overrides
```

Example:

```json
{
  "overrides": [
    {
      "permissionCode": "ins.policy.create",
      "effect": "ALLOW",
      "scopeType": "SELF"
    },
    {
      "permissionCode": "ins.policy.delete",
      "effect": "DENY",
      "scopeType": "SELF"
    },
    {
      "permissionCode": "ppr.entry.view",
      "effect": "ALLOW",
      "scopeType": "DEPT",
      "departmentId": 1
    }
  ]
}
```

Direct `DENY` overrides role grants. Direct `ALLOW` can grant an exception or narrow access to a selected branch/department. The server must never rely only on hidden frontend buttons.

## Current user contract

```http
GET /api/me
```

Response should contain the resolved module directory and permission scopes:

```json
{
  "user": {
    "userId": 1,
    "employeeId": "BNGL0171",
    "samAccountName": "shakir.khasru",
    "displayName": "Shakir Khasru",
    "email": "shakir.khasru@combankbd.com",
    "isSuperAdmin": true,
    "branch": { "branchId": 1, "code": "HQ", "name": "Head Office — Gulshan" },
    "dept": { "deptId": 1, "code": "IT", "name": "Information Technology" }
  },
  "modules": [],
  "permissions": {
    "ins.policy.view": {
      "scopeType": "GLOBAL",
      "branchIds": [],
      "deptIds": []
    }
  }
}
```

## Global audit

```http
GET /api/admin/audit?dateFrom=&dateTo=&module=&action=&status=&user=&search=
GET /api/admin/audit/export.csv?dateFrom=&dateTo=&module=&action=&status=&user=
```

Record at minimum:

- successful login;
- failed login;
- logout;
- portal/module entry;
- every create, update, delete, approval, rejection, assignment, dispatch, receipt, and report export;
- role, user, organization, and permission changes;
- API failures and access-denied attempts.

Audit rows should be append-only for ordinary administrators and should capture correlation ID, timestamp, actor, module, action, status, entity, detail, IP address, and user agent.
