# Analysis of the Supplied Three-Module Source Code

The supplied `code.zip` was reviewed file by file and mapped into the existing React/Vite portal architecture.

## 1. Insurance Management Tracker

### Supplied files

- `coge.gs_Master_Insurance_database.txt`
- `index.html_Master_Insurance_database.txt`

### Source capabilities retained

- Admin and unit-user access
- Unit-scoped policy visibility
- Policy add, update, delete and duplicate-account protection
- Expired-policy listing
- Maturity bands: expired, 0–15, 16–30, 31–60 and long-term
- Company exposure and portfolio-share analysis
- Follow-up records
- Expiry-alert preview and dispatch simulation
- User and role management
- Audit log

### Portal implementation

The functionality is implemented under:

```text
src/modules/ins/
```

Routes use absolute paths so changing tabs never produces nested paths such as `/insurance/maturity/policies`.

## 2. Stationery Inventory Management

### Supplied file

- `Code.gs_Invenroey_management.txt`

### Source capabilities retained

- Product, category, branch and user master concepts
- Central-store stock receipt
- FIFO stock valuation and dispatch
- Monthly requisitions
- Manager/head approval
- Procurement issue/decline
- Branch receipt confirmation
- Branch consumption
- Centre-stock and branch-stock position
- Month-end, branch, consumption and out-of-stock reports
- Transactions and audit history

### Important source limitation

The file named `index.html_Invenroey_management.txt` is not the Inventory frontend. Its contents duplicate the Insurance Apps Script backend. Therefore, the supplied attachment did not contain the actual Inventory HTML dashboard.

The React Inventory dashboard was recreated from:

1. The complete Inventory Apps Script backend workflow.
2. The portal's existing visual system.
3. The sidebar/card/table dashboard patterns found in the supplied Insurance and Utility frontends.

### Portal implementation

```text
src/modules/inv/
```

The module supports this complete lifecycle:

```text
DRAFT
  → PENDING
  → PENDING_ADMIN
  → PARTIALLY_ISSUED / ISSUED
  → AWAITING_RECEIPT
  → PARTIAL_RECEIPT / CONFIRMED
```

It also supports `RETURNED`, `REJECTED`, `DECLINED`, and `CANCELLED`.

## 3. CBC Utility Tracker

### Supplied files

- `Code.gs_CBC_Generator_Dashboard.txt`
- `Index.html_CBC_Generator_Dashboard.txt`
- `Login.html_CBC_Generator_Dashboard.txt`

### Source capabilities retained

- Admin and branch-user views
- Branch-scoped dashboard filtering
- Generator run-hour entry and estimated/actual fuel usage
- Fuel purchases
- Electricity consumption and bills
- WASA consumption and bills
- Drinking-water deliveries and bills
- Twelve-month trend charts
- Admin user management
- Audit history

### Portal implementation

```text
src/modules/utl/
```

## Portal integration approach

The original Apps Script projects are independent systems using Google Sheets. The current portal is a React/Vite application with centralized login, module access and permission scopes. The updated code therefore:

- Preserves the workflows and fields from the supplied systems.
- Rebuilds the dashboards as React components.
- Uses the existing portal authentication and role model.
- Uses absolute React Router paths.
- Provides local browser persistence for demonstration.
- Keeps each module isolated in its own folder.

## Demonstration storage

The current ready-to-run version uses browser `localStorage`:

```text
cbc.insurance.module.v1
cbc.inventory.module.v5
cbc.utility.module.v1
```

This is suitable for demonstration and frontend review. Production deployment requires database-backed API endpoints and server-side permission enforcement.
