# Inventory Requisition API Contract

The frontend in `src/modules/inv/api.js` expects the following endpoints under `/api`.

## Read endpoints

- `GET /inv/items`
- `GET /inv/stats`
- `GET /inv/requisitions?scope=mine|all&status=...&q=...&month=YYYY-MM&sort=...`
- `GET /inv/requisitions/:id`
- `GET /inv/report?from=YYYY-MM&to=YYYY-MM`

## Create and requester endpoints

- `POST /inv/requisitions`
- `PUT /inv/requisitions/:id`
- `POST /inv/requisitions/:id/submit`
- `POST /inv/requisitions/:id/cancel`

Create/update body:

```json
{
  "requisitionMonth": "2026-08-01",
  "purpose": "Monthly office supplies",
  "notes": "Required by first working day",
  "submit": true,
  "items": [
    {
      "itemId": 101,
      "requestedQty": 20,
      "requesterNote": "Optional"
    }
  ]
}
```

## Manager/head endpoints

- `POST /inv/requisitions/:id/approve`
- `POST /inv/requisitions/:id/return`
- `POST /inv/requisitions/:id/reject`

Approve body:

```json
{
  "notes": "Approved with adjusted quantities",
  "items": [
    {
      "requisitionItemId": 3001,
      "approvedQty": 18,
      "managerNote": "Adjusted based on previous consumption"
    }
  ]
}
```

Return/reject body:

```json
{ "reason": "Correct the toner model and resubmit." }
```

## Procurement endpoints

- `POST /inv/requisitions/:id/issue`
- `POST /inv/requisitions/:id/decline`

Issue body uses the quantity supplied in the current transaction, not the final cumulative quantity:

```json
{
  "procurementNotes": "Dispatched to IT",
  "items": [
    {
      "requisitionItemId": 3001,
      "issueQty": 10,
      "procurementNote": "Remaining quantity will be supplied later"
    }
  ]
}
```

## Required permissions

- `inv.requisition.create`
- `inv.requisition.view`
- `inv.requisition.edit`
- `inv.requisition.submit`
- `inv.requisition.cancel`
- `inv.requisition.approve`
- `inv.requisition.return`
- `inv.requisition.reject`
- `inv.requisition.issue`
- `inv.requisition.decline`
- `inv.item.view`
- `inv.item.manage`
- `inv.stock.view`
- `inv.stock.manage`
- `inv.report.view`

## Required server rules

1. Never trust branch, department, requester, or role values from the browser.
2. Resolve route and scope from the authenticated user.
3. Validate every state transition on the server.
4. Lock the requisition and stock rows during issue.
5. Update stock, requisition lines, status, and audit events in one database transaction.
6. Return `403` for permission/scope failure, `409` for invalid state, and `422` for invalid data.
