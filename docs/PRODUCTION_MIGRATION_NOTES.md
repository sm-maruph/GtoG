# Production Migration Notes

## Current implementation

The three updated modules are complete frontend demonstrations integrated with the portal's authentication and permissions. Module data is stored in the browser so the application can be run without the separate Google Apps Script deployments.

## Required production architecture

Use the portal backend as the single application server and move the Google Sheet operations into database-backed services.

```text
React portal
   ↓ HTTPS /api
Portal backend
   ↓ transactions + permission checks
SQL Server / PostgreSQL
```

Do not rely only on hidden buttons in React. Every write endpoint must check the authenticated user's permission and branch/department scope.

## Suggested endpoint groups

### Insurance

```text
GET    /api/ins/policies
POST   /api/ins/policies
PUT    /api/ins/policies/:id
DELETE /api/ins/policies/:id
GET    /api/ins/follow-ups
POST   /api/ins/follow-ups
GET    /api/ins/stats
POST   /api/ins/alerts/preview
POST   /api/ins/alerts/send
GET    /api/ins/users
POST   /api/ins/users
PUT    /api/ins/users/:id
DELETE /api/ins/users/:id
GET    /api/ins/audit
```

### Inventory

```text
GET    /api/inv/dashboard
GET    /api/inv/products
POST   /api/inv/products
GET    /api/inv/stock/centre
POST   /api/inv/stock/receive
GET    /api/inv/stock/branches
POST   /api/inv/requisitions
POST   /api/inv/requisitions/:id/submit
POST   /api/inv/requisitions/:id/approve
POST   /api/inv/requisitions/:id/return
POST   /api/inv/requisitions/:id/reject
POST   /api/inv/requisitions/:id/dispatch
POST   /api/inv/requisitions/:id/decline
POST   /api/inv/requisitions/:id/receipt
POST   /api/inv/consumption
GET    /api/inv/transactions
GET    /api/inv/audit
GET    /api/inv/reports/:type
```

Inventory stock receipt, FIFO dispatch, transaction writing and audit writing must execute in one database transaction.

### Utility

```text
GET    /api/utl/dashboard
GET    /api/utl/generator
POST   /api/utl/generator/runs
POST   /api/utl/generator/fuel-purchases
GET    /api/utl/electricity
POST   /api/utl/electricity
GET    /api/utl/wasa
POST   /api/utl/wasa
GET    /api/utl/drinking-water
POST   /api/utl/drinking-water/deliveries
POST   /api/utl/drinking-water/bills
GET    /api/utl/users
POST   /api/utl/users
PUT    /api/utl/users/:id
DELETE /api/utl/users/:id
GET    /api/utl/audit
```

## Suggested permission codes

```text
ins.policy.view
ins.policy.manage
ins.followup.manage
ins.stats.view
ins.alert.send
ins.user.manage
ins.audit.view

inv.requisition.create
inv.requisition.view
inv.requisition.edit
inv.requisition.submit
inv.requisition.cancel
inv.requisition.approve
inv.requisition.return
inv.requisition.reject
inv.requisition.issue
inv.requisition.decline
inv.item.view
inv.item.manage
inv.stock.view
inv.stock.manage
inv.report.view

utl.dashboard.view
utl.record.view
utl.record.create
utl.report.view
utl.user.manage
utl.audit.view
```

## Data migration

Export each Google Sheet tab to CSV, normalize identifiers, validate duplicate keys and import into staging tables before loading production tables. Keep the original Apps Script audit data as an immutable historical archive.
