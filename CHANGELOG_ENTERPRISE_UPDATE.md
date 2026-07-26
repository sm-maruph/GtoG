# Enterprise Portal Update — change log

## Shared platform

- Added global audit store and event logging.
- Added successful login, failed login, logout, and module-entry audit events.
- Added API mutation and failure audit interception.
- Added dark professional design tokens and consistent shared components.
- Added module welcome popup.
- Added module menu to the landing header and module header.
- Added Super Admin portal, organization directory, custom roles, users, and direct permission overrides.
- Added `SELF`, `DEPT`, `BRANCH`, and `GLOBAL` scopes.

## Insurance Management Tracker

- Made all dashboard statistic cards interactive.
- Added company chart hover tooltips and click-through policy modal.
- Made unit performance/risk rows interactive.
- Added Status and complete row actions to Expired Policies.
- Added Edit and Follow-Up actions to Maturity Tracker.
- Added company View action and total portfolio footer to Insurance Stats.
- Added policy/follow-up status and Edit/Delete to Follow-Up Tracker.
- Replaced module-only audit view with global audit events.
- Added ownership migration for older browser data.

## Vehicle Booking System

- Added Fleet Management route.
- Added vehicle create/edit/delete.
- Added driver create/edit/delete.
- Added mock API endpoints and permission checks.

## Stationery Inventory Management

- Renamed module consistently.
- Connected module actions to global audit.
- Retained requisition, stock, dispatch, receipt, consumption, and reporting workflows.

## Utility Tracker

- Connected utility changes and resets to global audit.
- Applied the shared dark visual system.

## Paper Usage Tracker

- Added monthly paper usage entry management.
- Added printer and paper-type master data.
- Added branch, department, whole-branch, and self scopes.
- Added search and date/branch/department/paper filters.
- Added monthly trend, totals, reports, and CSV export.
- Added audit view and global audit integration.

## Production references

- Added portal access and global audit SQL schema.
- Added Paper Tracker SQL schema.
- Added Super Admin API contract.
- Added Paper Tracker API contract.
