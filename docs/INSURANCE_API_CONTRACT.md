# Insurance Management Tracker — Production API Contract

The copy-paste module is a frontend demo backed by `localStorage`. Replace the functions in `src/modules/ins/store.js` with these API calls when your server is ready.

## Authorization

Suggested permissions:

- `ins.policy.view`
- `ins.policy.manage`
- `ins.followup.manage`
- `ins.stats.view`
- `ins.alert.send`
- `ins.user.manage`
- `ins.audit.view`

Unit users receive branch/unit scope. Admin receives global scope. The server must derive the user's permitted units from the authenticated session; never trust a unit supplied by the browser.

## Policies

- `GET /api/ins/policies?unit=&q=&band=&status=`
- `POST /api/ins/policies`
- `PUT /api/ins/policies/:id`
- `DELETE /api/ins/policies/:id`

Policy payload:

```json
{
  "acNo": "CBC-2026-001",
  "borrowerName": "Example Borrower Ltd.",
  "unitCode": "HQ",
  "policyNo": "POL-1001",
  "company": "Example Insurance PLC",
  "amount": 2500000,
  "maturityDate": "2026-12-31",
  "status": "Active"
}
```

Rules:

- AC No is unique and read-only after creation.
- Unit users can only create or update policies in their assigned unit.
- Delete must create an audit record.
- Use optimistic concurrency (`rowversion`) for updates.

## Dashboard and statistics

- `GET /api/ins/dashboard?unit=`
- `GET /api/ins/stats/companies?unit=`
- `GET /api/ins/stats/units`
- `GET /api/ins/maturity?unit=`

Maturity bands:

- `EXPIRED`: maturity date before today
- `DAYS_0_15`: 0 through 15 days
- `DAYS_16_30`: 16 through 30 days
- `DAYS_31_60`: 31 through 60 days
- `LONG_TERM`: over 60 days

Risk score:

```text
(expired policies + policies expiring within 15 days) / total policies × 100
```

## Follow-ups

- `GET /api/ins/follow-ups?unit=&policyId=`
- `POST /api/ins/follow-ups`

Follow-up payload:

```json
{
  "policyId": 42,
  "followUpDate": "2026-07-22",
  "type": "Renewal",
  "contactMode": "Email",
  "summary": "Renewal documents requested.",
  "actionTaken": "Relationship manager copied.",
  "nextFollowUpDate": "2026-07-26",
  "status": "Pending",
  "emailTo": "employee@combankbd.com"
}
```

## Expiry alerts

- `GET /api/ins/alerts/preview`
- `POST /api/ins/alerts/send`

Only active policies with 0–15 days remaining should be included. Units without an active recipient must be returned with `recipientMapped: false` and must not be sendable.

## User assignments

Admin only:

- `GET /api/ins/users`
- `POST /api/ins/users`
- `PUT /api/ins/users/:assignmentId`
- `DELETE /api/ins/users/:assignmentId`

Rules:

- A user may have multiple unit assignments.
- Employee ID + unit combination must be unique.
- A logged-in user cannot delete their own active assignment.
- Inactive assignments cannot log in or receive alerts.

## Audit

- `GET /api/ins/audit?limit=200`

Audit at least: login, add/update/delete policy, follow-up, user add/update/delete, and alert send.
