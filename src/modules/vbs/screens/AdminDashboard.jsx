/**
 * AdminDashboard — spec section 5, tabbed.
 * Insight strip on top, then tabs:
 *   My Requests   — the admin's OWN requests (they're an employee too)
 *   Pending       — the working queue, with Confirm (green) / Decline (red)
 *   Confirmed     — assigned vehicle/driver + admin notes (5.2)
 *   Declined      — with reason, as an audit trail (5.3)
 *   Auto-Cancelled— expired-and-cancelled, for reference (5.4)
 *   Schedule      — engaged schedule: confirmed, today onward, ascending
 *
 * All admin tabs are scope-filtered by the API (scope='all' returns only what
 * req.scope allows — a branch manager sees their branch, not the whole bank).
 * "My Requests" uses scope='mine'. Confirm/Decline live only on Pending.
 */

import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock, CheckCircle2, XCircle, Car, CalendarClock, Check, X, FilePlus2, BarChart3, Pencil, Settings2,
} from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';
import { Can } from '../../../core/auth/Can';
import { PageHeader, Panel, StatTile, StatusPill, EmptyState } from '../../../core/ui';
import { Tabs } from '../../../core/ui/Tabs';
import { FullPageSpinner } from '../../../core/auth/Can';
import { formatDate, formatSlot, formatDateTime } from '../format';
import { listRequests, getStats } from '../api';
import ConfirmBookingModal from '../components/ConfirmBookingModal';
import FilterBar from '../components/FilterBar';
import EditRequestModal from '../components/EditRequestModal';
import ReasonModal from '../components/ReasonModal';
import { declineRequest } from '../api';

const TABS = [
  { value: 'mine',      label: 'My Requests' },
  { value: 'pending',   label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'declined',  label: 'Declined' },
  { value: 'auto',      label: 'Auto-Cancelled' },
  { value: 'schedule',  label: 'Schedule' },
];

// Which API query each tab runs.
const QUERY = {
  mine:      { scope: 'mine' },
  pending:   { scope: 'all', status: 'PENDING_ADMIN' },
  confirmed: { scope: 'all', status: 'CONFIRMED' },
  declined:  { scope: 'all', status: 'DECLINED,REJECTED' },
  auto:      { scope: 'all', status: 'AUTO_CANCELLED' },
  schedule:  { scope: 'all', schedule: 'true' },
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { can } = useAuth();
  const [stats, setStats] = useState(null);
  const [tab, setTab] = useState('pending');
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(null);
  const [confirming, setConfirming] = useState(null);
  const [declining, setDeclining] = useState(null);
  const [editing, setEditing] = useState(null);
  const [filters, setFilters] = useState({ sort: 'submitted_desc' });

  const loadStats = useCallback(() => getStats().then(setStats).catch(() => {}), []);

  const loadTab = useCallback((which, f) => {
    setRows(null);
    listRequests({ ...QUERY[which], ...f })
      .then((d) => setRows(d.items ?? []))
      .catch((e) => setError(e.response?.data?.error ?? 'Could not load requests.'));
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { loadTab(tab, filters); }, [tab, filters, loadTab]);

  function afterAction(updated) {
    setConfirming(null);
    setDeclining(null);
    setRows((rs) => (rs ? rs.filter((r) => r.requestId !== updated.requestId) : rs));
    loadStats();
  }
  function afterEdit(updated) {
    setEditing(null);
    setRows((rs) => (rs ? rs.map((r) => (r.requestId === updated.requestId ? { ...r, ...updated } : r)) : rs));
  }

  if (error) {
    return <div><PageHeader title="Vehicle booking — Admin" /><div className="alert-error">{error}</div></div>;
  }
  if (stats === null) return <FullPageSpinner />;

  const tabsWithCounts = TABS.map((t) =>
    t.value === 'pending' ? { ...t, count: stats.pending, tone: 'pending' } : t);

  return (
    <div>
      <PageHeader
        title="Vehicle booking — Admin"
        subtitle="Review pending requests, confirm with an available vehicle and driver, or decline."
      >
        <button className="btn btn-ghost" onClick={() => navigate('fleet')}><Settings2 size={15} /> Fleet</button>
        <button className="btn btn-ghost" onClick={() => navigate('report')}>
          <BarChart3 size={15} aria-hidden="true" /> Report
        </button>
        <Can do="vbs.request.create">
          <button className="btn btn-primary" onClick={() => navigate('new')}>
            <FilePlus2 size={15} aria-hidden="true" /> New request
          </button>
        </Can>
      </PageHeader>

      <div className="ui-stat-grid">
        <StatTile label="Pending" value={stats.pending} icon={Clock} tone="pending" />
        <StatTile label="Confirmed this month" value={stats.confirmedThisMonth} icon={CheckCircle2} tone="approved" />
        <StatTile label="Declined" value={stats.declined} icon={XCircle} />
        <StatTile label="Vehicles available" value={stats.fleetSize} icon={Car} />
      </div>

      <Tabs tabs={tabsWithCounts} active={tab} onChange={setTab} />

      {tab !== 'schedule' && (
        <FilterBar value={filters} onChange={setFilters} />
      )}

      {rows === null ? (
        <FullPageSpinner />
      ) : tab === 'pending' ? (
        <PendingTable rows={rows} onConfirm={setConfirming} onDecline={setDeclining} onEdit={setEditing} />
      ) : tab === 'schedule' ? (
        <ScheduleTable rows={rows} />
      ) : (
        <ListTable rows={rows} tab={tab} onOpen={(id) => navigate(`request/${id}`)} />
      )}

      {editing && (
        <EditRequestModal request={editing} onClose={() => setEditing(null)} onSaved={afterEdit} />
      )}
      {confirming && (
        <ConfirmBookingModal request={confirming} onClose={() => setConfirming(null)} onConfirmed={afterAction} />
      )}
      {declining && (
        <ReasonModal
          request={declining}
          title="Decline request"
          actionLabel="Decline request"
          placeholder="e.g. No vehicles free for that slot."
          onSubmit={(reason) => declineRequest(declining.requestId, reason)}
          onClose={(updated) => (updated ? afterAction(updated) : setDeclining(null))}
        />
      )}
    </div>
  );
}

/* ---- Pending: the working queue with actions (spec 5.1) ------------------- */
function PendingTable({ rows, onConfirm, onDecline, onEdit }) {
  if (!rows.length) {
    return <Panel padded><EmptyState icon={CheckCircle2} title="Nothing pending" body="All requests have been actioned." /></Panel>;
  }
  return (
    <Panel padded={false} title={`Awaiting procurement (${rows.length})`}
      action={<span style={{ fontSize: 'var(--text-xs)', color: 'var(--ink-400)' }}>
        <CalendarClock size={12} style={{ verticalAlign: '-2px', marginRight: 4 }} />Oldest first</span>}>
      <div style={{ overflowX: 'auto' }}>
        <table className="ui-table">
          <thead><tr>
            <th>Booking ID</th><th>Submitted</th><th>Employee</th><th>Dept</th>
            <th>Trip date</th><th>Time</th><th>Destination</th><th>Purpose</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.requestId} style={{ cursor: 'default' }}>
                <td className="code">{r.requestNo}</td>
                <td style={{ color: 'var(--ink-500)', whiteSpace: 'nowrap' }}>{formatDateTime(r.submittedUtc)}</td>
                <td>{r.employee.displayName}<br /><span className="code" style={{ color: 'var(--ink-400)', fontSize: 11 }}>{r.employee.employeeId}</span></td>
                <td style={{ color: 'var(--ink-500)' }}>{r.employee.department}</td>
                <td style={{ whiteSpace: 'nowrap' }}>{formatDate(r.tripDate)}</td>
                <td className="code" style={{ whiteSpace: 'nowrap' }}>{formatSlot(r.startTime, r.endTime)}</td>
                <td>{r.destination}</td>
                <td style={{ color: 'var(--ink-500)' }}>{r.purpose}</td>
                <td>
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    <button className="vbs-act vbs-act-edit" title="Edit trip details" aria-label="Edit" onClick={() => onEdit(r)}><Pencil size={15} /></button>
                    <button className="vbs-act vbs-act-ok" title="Confirm" aria-label="Confirm" onClick={() => onConfirm(r)}><Check size={16} /></button>
                    <button className="vbs-act vbs-act-no" title="Decline" aria-label="Decline" onClick={() => onDecline(r)}><X size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* ---- Generic list: mine / confirmed / declined / auto-cancelled ----------- */
const EMPTY = {
  mine:      { title: 'You have no requests', body: 'Requests you submit will appear here.' },
  confirmed: { title: 'No confirmed bookings', body: 'Confirmed trips show here with their vehicle and driver.' },
  declined:  { title: 'No declined requests', body: 'Declined requests and their reasons appear here.' },
  auto:      { title: 'No auto-cancelled requests', body: 'Requests cancelled for expiring appear here.' },
};
function ListTable({ rows, tab, onOpen }) {
  if (!rows.length) {
    const e = EMPTY[tab] ?? EMPTY.mine;
    return <Panel padded><EmptyState icon={CheckCircle2} title={e.title} body={e.body} /></Panel>;
  }
  const showAssignment = tab === 'confirmed';
  const showReason = tab === 'declined' || tab === 'auto';
  return (
    <Panel padded={false}>
      <div style={{ overflowX: 'auto' }}>
        <table className="ui-table">
          <thead><tr>
            <th>Booking ID</th><th>Employee</th><th>Trip date</th><th>Time</th>
            <th>Destination</th>
            {showAssignment && <><th>Vehicle</th><th>Driver</th></>}
            {showReason && <th>Reason</th>}
            <th>Status</th>
          </tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.requestId} onClick={() => onOpen(r.requestId)}>
                <td className="code">{r.requestNo}</td>
                <td>{r.employee.displayName}</td>
                <td style={{ whiteSpace: 'nowrap' }}>{formatDate(r.tripDate)}</td>
                <td className="code" style={{ whiteSpace: 'nowrap' }}>{formatSlot(r.startTime, r.endTime)}</td>
                <td>{r.destination}</td>
                {showAssignment && <>
                  <td className="code" style={{ fontSize: 12 }}>{r.vehicle?.regNo ?? '—'}</td>
                  <td>{r.driver?.fullName ?? '—'}</td>
                </>}
                {showReason && <td style={{ color: 'var(--ink-500)', maxWidth: 240 }}>{r.declineReason ?? '—'}</td>}
                <td><StatusPill status={r.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* ---- Engaged schedule: confirmed, today onward, ascending ----------------- */
function ScheduleTable({ rows }) {
  if (!rows.length) {
    return <Panel padded><EmptyState icon={CalendarClock} title="No upcoming trips" body="Confirmed bookings from today onward appear here." /></Panel>;
  }
  return (
    <Panel padded={false} title="Engaged schedule — confirmed trips, today onward">
      <div style={{ overflowX: 'auto' }}>
        <table className="ui-table">
          <thead><tr>
            <th>Trip date</th><th>Time</th><th>Booking ID</th><th>Employee</th>
            <th>Destination</th><th>Vehicle</th><th>Driver</th>
          </tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.requestId} style={{ cursor: 'default' }}>
                <td style={{ whiteSpace: 'nowrap', fontWeight: 600 }}>{formatDate(r.tripDate)}</td>
                <td className="code" style={{ whiteSpace: 'nowrap' }}>{formatSlot(r.startTime, r.endTime)}</td>
                <td className="code">{r.requestNo}</td>
                <td>{r.employee.displayName}</td>
                <td>{r.destination}</td>
                <td className="code" style={{ fontSize: 12 }}>{r.vehicle?.regNo ?? '—'}</td>
                <td>{r.driver?.fullName ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}