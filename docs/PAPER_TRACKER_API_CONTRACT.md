# Paper Usage Tracker — production API contract

The included frontend runs with browser `localStorage`. These endpoints are the recommended production replacement. Every endpoint must validate the authenticated user's permission and `SELF`, `DEPT`, `BRANCH`, or `GLOBAL` scope on the server.

## Read endpoints

```http
GET /api/ppr/dashboard?dateFrom=YYYY-MM-DD&dateTo=YYYY-MM-DD&branchId=&departmentId=&paperTypeId=
GET /api/ppr/entries?dateFrom=&dateTo=&branchId=&departmentId=&printerId=&paperTypeId=&status=&search=
GET /api/ppr/entries/{id}
GET /api/ppr/reports/monthly?dateFrom=&dateTo=&branchId=&departmentId=&paperTypeId=
GET /api/ppr/reports/export.csv?dateFrom=&dateTo=&branchId=&departmentId=&paperTypeId=
GET /api/ppr/paper-types
GET /api/ppr/printers?branchId=&departmentId=&status=ACTIVE
```

## Entry commands

```http
POST   /api/ppr/entries
PUT    /api/ppr/entries/{id}
DELETE /api/ppr/entries/{id}
```

Example request:

```json
{
  "month": "2026-07-01",
  "scopeType": "HEAD_OFFICE_DEPARTMENT",
  "branchId": 1,
  "departmentId": 1,
  "printerId": 1,
  "paperTypeId": 1,
  "startingPageCount": 8179,
  "endingPageCount": 11340,
  "paperInHandQty": 1,
  "paperInHandUnit": "Rim",
  "requisitionQty": 5,
  "requisitionUnit": "Rim",
  "remarks": "New toner installed",
  "status": "SUBMITTED"
}
```

The server calculates `totalPagesUsed = endingPageCount - startingPageCount`. Do not trust a client-supplied total.

## Master-data commands

```http
POST   /api/ppr/paper-types
PUT    /api/ppr/paper-types/{id}
DELETE /api/ppr/paper-types/{id}
POST   /api/ppr/printers
PUT    /api/ppr/printers/{id}
DELETE /api/ppr/printers/{id}
```

A paper type or printer with historical entries should normally be marked inactive rather than deleted.

## Required permissions

| Permission | Purpose |
|---|---|
| `ppr.entry.create` | Add monthly usage entries |
| `ppr.entry.view` | View entries within permission scope |
| `ppr.entry.edit` | Correct permitted entries |
| `ppr.entry.delete` | Delete permitted entries |
| `ppr.report.view` | Generate and export reports |
| `ppr.master.manage` | Manage paper types and printers |
| `ppr.audit.view` | View Paper Tracker audit events |

## Validation rules

- Month, printer, and paper type are required.
- Ending page count cannot be less than starting page count.
- One row per month + printer + paper type.
- Quantities cannot be negative.
- Branch and department must be derived or validated against the authenticated user's granted scope.
- Every create, edit, delete, report export, and master-data change must write a global audit event.
- Use optimistic concurrency (`rowversion`/ETag) when editing production records.
