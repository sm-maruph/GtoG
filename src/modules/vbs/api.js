/**
 * VBS API
 * ---------------------------------------------------------------------------
 * Every backend endpoint this module needs, in one place. When you build the
 * Express routes, these signatures + the mock in core/api/mock.js are the
 * contract — match them and the UI works untouched.
 *
 * A request object (what the API returns):
 * {
 *   requestId, requestNo, status,               // PENDING | CONFIRMED | DECLINED | AUTO_CANCELLED | CANCELLED
 *   submittedUtc,                               // ISO string
 *   tripDate,                                   // 'YYYY-MM-DD'
 *   startTime, endTime,                         // 'HH:mm' local (backend stores UTC)
 *   purpose, destination, notes,
 *   employee: { displayName, employeeId, department },
 *   branch:   { branchId, name },
 *   vehicle:  { regNo, make, model } | null,    // only once CONFIRMED
 *   driver:   { fullName, phone } | null,       // only once CONFIRMED; phone shown to employee
 *   adminNotes:    string | null,
 *   declineReason: string | null,
 * }
 */

import { api } from '../../core/api/client';

/** GET /api/vbs/requests?scope=mine|all&status=PENDING,CONFIRMED&schedule=true
 *  scope 'mine' = requests I raised; 'all' = everything in my permission scope.
 *  status = comma-separated filter. schedule=true = engaged schedule view. */
export const listRequests = (params = {}) =>
  api.get('/vbs/requests', { params }).then((r) => r.data);

/** GET /api/vbs/requests/:id */
export const getRequest = (id) =>
  api.get(`/vbs/requests/${id}`).then((r) => r.data);

/** POST /api/vbs/requests
 *  body: { tripDate, startTime, endTime, purpose, destination, notes } */
export const createRequest = (body) =>
  api.post('/vbs/requests', body).then((r) => r.data);

/** POST /api/vbs/requests/:id/cancel  — employee withdraws their own PENDING request */
export const cancelRequest = (id) =>
  api.post(`/vbs/requests/${id}/cancel`).then((r) => r.data);

/* ---- Admin (spec section 5) ------------------------------------------------
 * These require vbs.request.approve / vbs.request.reject on the server. The
 * frontend hides the controls without them, but the API must re-check — hiding
 * a button is not access control.
 * -------------------------------------------------------------------------- */

/** GET /api/vbs/stats — dashboard insight counts */
export const getStats = () =>
  api.get('/vbs/stats').then((r) => r.data);

/** GET /api/vbs/availability?tripDate&startTime&endTime
 *  Returns { vehicles, drivers } free for that exact slot (maintenance + leave +
 *  existing bookings already filtered out — mirrors fn_AvailableVehicles). */
export const getAvailability = ({ tripDate, startTime, endTime }) =>
  api.get('/vbs/availability', { params: { tripDate, startTime, endTime } }).then((r) => r.data);

/** POST /api/vbs/requests/:id/confirm
 *  body: { vehicleId, driverId, adminNotes, tripDate?, startTime?, endTime? } */
export const confirmRequest = (id, body) =>
  api.post(`/vbs/requests/${id}/confirm`, body).then((r) => r.data);

/** POST /api/vbs/requests/:id/decline  body: { reason } — FINAL decline (procurement) */
export const declineRequest = (id, reason) =>
  api.post(`/vbs/requests/${id}/decline`, { reason }).then((r) => r.data);

/* ---- First-level approval (branch manager / department head) ---------------
 * approve forwards the request to Procurement; reject ends it with a reason.
 * Require vbs.request.approve / vbs.request.reject at BRANCH or DEPT scope.
 * -------------------------------------------------------------------------- */

/** POST /api/vbs/requests/:id/approve — PENDING -> PENDING_ADMIN (forward to procurement) */
export const approveRequest = (id) =>
  api.post(`/vbs/requests/${id}/approve`, {}).then((r) => r.data);

/** POST /api/vbs/requests/:id/reject  body: { reason } — first-level reject */
export const rejectRequest = (id, reason) =>
  api.post(`/vbs/requests/${id}/reject`, { reason }).then((r) => r.data);

/* ---- Reporting -------------------------------------------------------------
 * getReport aggregates within a scope + trip-date range for the report screen.
 * listRequests also accepts q (search), from/to (trip-date range), sort.
 * -------------------------------------------------------------------------- */

/** GET /api/vbs/report?scope=all&from=YYYY-MM-DD&to=YYYY-MM-DD
 *  -> { total, byStatus, byBranch, avgDecisionHrs, confirmed, rejectedOrDeclined, rows[] } */
export const getReport = ({ from, to } = {}) =>
  api.get('/vbs/report', { params: { scope: 'all', from, to } }).then((r) => r.data);

/** POST /api/vbs/requests/:id/edit — manager/head/admin edits trip details.
 *  body may include any of: tripDate, startTime, endTime, destination, purpose.
 *  Each change is recorded in the request timeline. */
export const editRequest = (id, body) =>
  api.post(`/vbs/requests/${id}/edit`, body).then((r) => r.data);
/* Fleet master data */
export const getFleet = () => api.get('/vbs/fleet').then((r) => r.data);
export const createVehicle = (body) => api.post('/vbs/vehicles', body).then((r) => r.data);
export const updateVehicle = (id, body) => api.put(`/vbs/vehicles/${id}`, body).then((r) => r.data);
export const deleteVehicle = (id) => api.delete(`/vbs/vehicles/${id}`).then((r) => r.data);
export const createDriver = (body) => api.post('/vbs/drivers', body).then((r) => r.data);
export const updateDriver = (id, body) => api.put(`/vbs/drivers/${id}`, body).then((r) => r.data);
export const deleteDriver = (id) => api.delete(`/vbs/drivers/${id}`).then((r) => r.data);
