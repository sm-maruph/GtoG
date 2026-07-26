# CBC Enterprise Portal — Complete Update Guide

This package updates the existing React/Vite portal with a consistent dark enterprise interface, interactive Insurance dashboards, fleet master maintenance, global audit logging, granular Super Admin access control, and a new Paper Usage Tracker.

## 1. Choose the correct package

### Existing working project
Use `enterprise-portal-copy-paste.zip`. This is the safest choice when your current project already contains your own VBS, Insurance, Inventory, or Utility changes.

### Clean replacement/reference project
Use `G-G-main-enterprise-portal-complete.zip`. This contains the complete ready-integrated project. Keep it as a reference or use it when you want a fresh installation.

---

## 2. Back up the existing project

Your current project is expected at a path similar to:

```text
C:\Users\DELL\Desktop\GtoG\web
```

Before replacing anything:

1. Stop Vite with `Ctrl + C`.
2. Copy the entire `web` folder.
3. Rename the copy to `web-backup-before-enterprise-update`.

Do not skip this step if you have local changes.

---

## 3. Copy-paste installation

Extract `enterprise-portal-copy-paste.zip`. Inside it you will find:

```text
enterprise-portal-copy-paste-bundle/
├── src/
├── database/
├── docs/
├── ENTERPRISE_PORTAL_UPDATE_GUIDE.md
└── CHANGELOG_ENTERPRISE_UPDATE.md
```

### Recommended update method

Copy the bundle's complete:

```text
src
```

and paste it into:

```text
C:\Users\DELL\Desktop\GtoG\web
```

Choose **Replace the files in the destination**.

This is recommended because the update changes shared authentication, audit, layout, catalog, theme, and module files together. Copying only one module would leave the integration incomplete.

Also copy:

```text
database
```

and:

```text
docs
```

into the project root. These two folders are production references and do not affect the demo build.

### Resulting module structure

```text
web/
└── src/
    └── modules/
        ├── vbs/
        ├── ins/
        ├── inv/
        ├── utl/
        ├── ppr/
        └── adm/
```

All six folders must be siblings. Never paste one module inside another module.

---

## 4. Important updated paths

The copy-paste package replaces or adds the following major areas:

```text
src/core/admin/
src/core/audit/
src/core/auth/
src/core/layout/
src/core/api/
src/core/ui/
src/core/catalog.js
src/core/moduleRegistry.js
src/styles/tokens.css

src/pages/landing/

src/modules/ins/
src/modules/vbs/
src/modules/inv/
src/modules/utl/
src/modules/ppr/
src/modules/adm/
```

Do not copy only `src/modules/ppr` or `src/modules/adm`; granular permissions and global audit depend on the updated shared `src/core` files.

---

## 5. Environment configuration

Open:

```text
C:\Users\DELL\Desktop\GtoG\web\.env.development
```

For the included demonstration version, use:

```env
VITE_USE_MOCK=true
VITE_API_BASE=/api
```

The current package uses browser storage and mock APIs for demonstration. Production migration files are provided separately.

---

## 6. Install and start

Open VS Code in the folder containing `package.json`.

### Windows Command Prompt

```bat
rmdir /s /q node_modules\.vite 2>nul
npm install
npm run dev
```

### PowerShell

```powershell
Remove-Item -Recurse -Force node_modules\.vite -ErrorAction SilentlyContinue
npm install
npm run dev
```

Open the Vite URL, normally:

```text
http://localhost:5173
```

Use `Ctrl + Shift + R` once after the first start to bypass an old browser cache.

---

## 7. Demo accounts

All demo accounts use:

```text
Password: demo
```

| Username | Role and useful tests |
|---|---|
| `shakir.khasru` | Super Admin; all modules, global audit, user/role/access management |
| `procurement.admin` | Global operational administrator; Insurance admin, VBS fleet admin, stationery and reporting |
| `branch.user` | Branch-level employee/self-service workflows |
| `branch.manager` | Branch approval and branch report scope |
| `dept.user` | Department employee/self-service workflows |
| `dept.head` | Department approval and department report scope |

### Super Admin route

```text
http://localhost:5173/super-admin
```

### Paper Tracker route

```text
http://localhost:5173/paper-tracker
```

---

## 8. Insurance Management Tracker changes

### Dashboard

Every statistics card is clickable:

- Total policies
- Expired
- Expiring within 15 days
- Expiring within 16–30 days
- Total insured amount

Clicking opens a borrower/policy modal containing the corresponding records.

### Company charts

- Hovering a doughnut slice shows the company name and policy count.
- The insured-exposure chart also shows the formatted exposure value.
- Clicking a slice or its legend opens all policies for that company.

### Unit performance and risk

Every row is clickable and opens borrower/client policy details for the selected unit.

### Updated tables

- Expired Policies: Status, Edit, Follow-Up, Delete
- Maturity Tracker: Status, Edit, Follow-Up
- Insurance Stats: total portfolio, portfolio footer, company View action
- Follow-Up Tracker: policy status, follow-up status, Edit, Delete
- Global Audit: login success, login failure, logout, module entry, and every recorded module change

### Self-service Insurance access

The Super Admin can assign a user only:

```text
ins.policy.create — SELF
ins.policy.view — SELF
```

and explicitly deny edit/delete or other Insurance features. Existing Insurance browser data is automatically migrated with record ownership fields so SELF scope can function after this update.

---

## 9. Vehicle Booking System changes

A global VBS administrator can open:

```text
/vehicle-booking/fleet
```

The Fleet screen supports:

- Add vehicle
- Edit vehicle
- Delete vehicle
- Add driver
- Edit driver
- Delete driver
- Vehicle registration, make/model, seat capacity, and status
- Driver phone, licence, expiry, and status

Required permissions:

```text
vbs.vehicle.view
vbs.vehicle.manage
vbs.driver.view
vbs.driver.manage
```

All master-data changes are written to the global audit log through the shared API audit interceptor.

---

## 10. Stationery Inventory Management

The visible name has been changed from **Inventory Management** to:

```text
Stationery Inventory Management
```

The existing requisition, approval, FIFO stock, dispatch, receipt, consumption, transaction, and reporting functions are retained.

---

## 11. Welcome popup and navigation

Each individual portal displays a welcome popup once per browser session when the user enters it.

The dark top header contains an **All modules** menu on both:

- the landing page;
- every individual module page.

Only modules the signed-in user can access appear after authentication. The Super Admin option is visible only to a Super Admin.

---

## 12. Super Admin Portal

The separate Super Admin Portal provides:

### Organization

- Add/edit/delete or maintain branches
- Add/edit/delete or maintain departments
- Associate departments with a branch

### Users

- Add and edit users
- Assign branch and department
- Assign one or more roles
- Activate or deactivate accounts
- Mark an authorized account as Super Admin

### Roles

- Create custom roles
- Assign module permissions to a role
- Set default scope for each permission

### Granular access

A direct user permission can:

- `ALLOW` a permission;
- `DENY` a permission granted by a role;
- apply `SELF`, `DEPT`, `BRANCH`, or `GLOBAL` scope;
- target a specific branch or department.

Example:

```text
User: BNGL1001
ALLOW ins.policy.create — SELF
ALLOW ins.policy.view — SELF
DENY  ins.policy.edit — SELF
DENY  ins.policy.delete — SELF
ALLOW ppr.entry.view — DEPT — Information Technology
```

The frontend controls visibility, but a production backend must repeat every permission and scope check server-side.

---

## 13. Global audit logging

The global audit log is available to Super Admin and appropriately authorized admin users.

It records:

- Login success
- Login failure
- Logout
- Module entry
- API create/update/delete commands
- Insurance policy and follow-up changes
- VBS vehicle and driver changes
- Stationery requisition, approval, issue, receipt, and master changes
- Utility changes
- Paper Tracker entry and master-data changes
- Branch, department, role, user, and permission changes
- Failed module/API actions where captured

The demo audit data is stored in:

```text
cbc.portal.audit.v2
```

Production audit storage should be append-only and server-side. See:

```text
database/portal-access-schema.sql
docs/SUPER_ADMIN_API_CONTRACT.md
```

---

## 14. Paper Usage Tracker

The new module supports Head Office departments, branch departments, and a whole-branch reporting scope.

### Entry fields

- Month
- Organizational scope
- Branch
- Department, when applicable
- Printer
- Paper type
- Starting page count
- Ending page count
- Total pages used
- Paper in hand and unit
- Requisition for next month and unit
- Remarks
- Status

The total is automatically calculated from the starting and ending printer counters.

### Entry management

- Search branch, department, printer, paper type, staff, and remarks
- Filter by from/to month
- Filter by branch
- Filter by department
- Filter by paper type
- Add, edit, and delete according to permission
- Prevent duplicate month + printer + paper type rows

### Reporting

- Date-range report
- Branch report
- Department report
- Paper-type report
- Monthly trend
- Branch/department summary
- Total pages and next requisition
- CSV export

### Master data

- Paper types
- Printers
- Printer assignment to branch/department

### Permissions

```text
ppr.entry.create
ppr.entry.view
ppr.entry.edit
ppr.entry.delete
ppr.report.view
ppr.master.manage
ppr.audit.view
```

---

## 15. Browser demo storage

The demonstration version stores records under keys including:

```text
cbc.portal.access.v3
cbc.portal.audit.v2
cbc.insurance.module.v1
cbc.inventory.module.v5
cbc.utility.module.v1
cbc.paper.tracker.v1
```

Data normally remains after refresh on the same browser.

### Reset all demo data only when necessary

Open Chrome Developer Tools → Application → Local Storage → `http://localhost:5173` and clear the CBC keys.

Warning: this deletes all local demonstration records and custom access assignments.

---

## 16. Production migration

The package is a complete frontend demonstration, not a production identity or database server.

Reference SQL schemas:

```text
database/portal-access-schema.sql
database/paper-tracker-schema.sql
database/insurance-schema.sql
database/inventory-schema.sql
database/utility-schema.sql
```

API contracts:

```text
docs/SUPER_ADMIN_API_CONTRACT.md
docs/PAPER_TRACKER_API_CONTRACT.md
docs/INSURANCE_API_CONTRACT.md
docs/INVENTORY_API_CONTRACT.md
```

Before production:

1. Implement authenticated server endpoints.
2. Integrate Active Directory/Entra ID/SSO or secure password hashing.
3. Move organization, role, permission, audit, and module records to a database.
4. Validate every permission and scope server-side.
5. Use append-only audit storage.
6. Use database transactions for stock, approvals, dispatch, receipts, and other multi-row commands.
7. Change `VITE_USE_MOCK=false` and configure the production API base.

---

## 17. Quick acceptance test

### Insurance

1. Sign in as `procurement.admin`.
2. Open Insurance.
3. Click all five cards.
4. Hover and click both company charts.
5. Click a unit-risk row.
6. Test policy Edit, Follow-Up, and Delete where appropriate.
7. Check Insurance Audit.

### VBS

1. Open Vehicle Booking.
2. Open Fleet.
3. Add a test vehicle and driver.
4. Edit them.
5. Check the global audit.

### Super Admin

1. Sign in as `shakir.khasru`.
2. Create a test department.
3. Create a test role.
4. Add a test user.
5. Assign granular Insurance SELF access.
6. Sign in as the test user and confirm only assigned modules/actions are visible.

### Paper Tracker

1. Open Paper Tracker.
2. Add one monthly entry.
3. Filter it by month, branch, and department.
4. Open Reports and export CSV.
5. Confirm the change in Paper Audit and Global Audit.

---

## 18. Troubleshooting

### Import cannot be resolved

Confirm module folders are siblings:

```text
src/modules/ins
src/modules/vbs
src/modules/inv
src/modules/utl
src/modules/ppr
src/modules/adm
```

### Old UI still appears

```bat
rmdir /s /q node_modules\.vite
npm run dev
```

Then use `Ctrl + Shift + R`.

### A user cannot see a module

Open Super Admin → Access and confirm at least one permission from that module is granted. A module is derived from its granted permissions.

### A user sees no SELF records

Create a record while signed in as that user, or reset/migrate the relevant demo store. Insurance seed records include ownership and the update automatically migrates older Insurance data.

### Full build fails after replacement

Delete `node_modules` and reinstall:

```bat
rmdir /s /q node_modules
npm install
npm run dev
```
