/**
 * ApproverDashboard — first-level approver (branch manager / department head).
 * They see ONLY their branch's / department's tickets (scope enforced by the
 * API). Tabs:
 *   To Approve  — PENDING requests routed to them; Approve (forward) / Reject
 *   Forwarded   — ones they've sent up to Procurement (PENDING_ADMIN)
 *   All Tickets — every status in their scope (audit view)
 *   My Requests — their own submissions
 *
 * Approve forwards to Procurement (PENDING -> PENDING_ADMIN). Reject ends it
 * with a reason. Final confirmation + vehicle assignment is Procurement's job,
 * not theirs — so there is no Confirm modal here.
 */

import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Send, CheckCircle2, ListChecks, FilePlus2, Check, X, Pencil } from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';
import { Can } from '../../../core/auth/Can';
import { PageHeader, Panel, StatTile, StatusPill, EmptyState } from '../../../core/ui';
import { Tabs } from '../../../core/ui/Tabs';
import { FullPageSpinner } from '../../../core/auth/Can';
import { formatDate, formatSlot, formatDateTime } from '../format';
import { listRequests, getStats, approveRequest, rejectRequest } from '../api';
import ReasonModal from '../components/ReasonModal';
import EditRequestModal from '../components/EditRequestModal';

const TABS = [
  { value: 'toApprove', label: 'To Approve' },
  { value: 'forwarded', label: 'Forwarded' },
  { value: 'all',       label: 'All Tickets' },
  { value: 'mine',      label: 'My Requests' },
];
const QUERY = {
  toApprove: { scope: 'all', status: 'PENDING' },
  forwarded: { scope: 'all', status: 'PENDING_ADMIN' },
  all:       { scope: 'all' },
  mine:      { scope: 'mine' },
};

export default function ApproverDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [tab, setTab] = useState('toApprove');
  const [rows, setRows] = useState(null);
  const [error, setError] = useState(null);
  const [rejecting, setRejecting] = useState(null);
  const [editing, setEditing] = useState(null);

  const loadStats = useCallback(() => getStats().then(setStats).catch(() => {}), []);
  const loadTab = useCallback((which) => {
    setRows(null);
    listRequests(QUERY[which]).then((d) => setRows(d.items ?? []))
      .catch((e) => setError(e.response?.data?.error ?? 'Could not load requests.'));
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { loadTab(tab); }, [tab, loadTab]);

  async function approve(r) {
    await approveRequest(r.requestId);
    setRows((rs) => (rs ? rs.filter((x) => x.requestId !== r.requestId) : rs));
    loadStats();
  }
  function afterReject(updated) {
    setRejecting(null);
    if (updated) {
      setRows((rs) => (rs ? rs.filter((x) => x.requestId !== updated.requestId) : rs));
      loadStats();
    }
  }
  function afterEdit(updated) {
    setEditing(null);
    setRows((rs) => (rs ? rs.map((x) => (x.requestId === updated.requestId ? { ...x, ...updated } : x)) : rs));
  }

  if (error) return <div><PageHeader title="Vehicle booking — Approvals" /><div className="alert-error">{error}</div></div>;
  if (stats === null) return <FullPageSpinner />;

  const unit = user?.dept && QUERY.toApprove && user?.branch
    ? (user.branch?.name ?? user.dept?.name) : (user?.branch?.name ?? user?.dept?.name);

  const tabsWithCounts = TABS.map((t) =>
    t.value === 'toApprove' ? { ...t, count: stats.awaitingManager, tone: 'pending' } : t);

  return (
    <div>
      <PageHeader
        title="Vehicle booking — Approvals"
        subtitle="Review requests from your team, forward approved ones to Procurement, or reject with a reason."
      >
        <Can do="vbs.request.create">
          <button className="btn btn-primary" onClick={() => navigate('new')}>
            <FilePlus2 size={15} aria-hidden="true" /> New request
          </button>
        </Can>
      </PageHeader>

      <div className="ui-stat-grid">
        <StatTile label="Awaiting my approval" value={stats.awaitingManager} icon={Clock} tone="pending" />
        <StatTile label="Forwarded to procurement" value={stats.awaitingProcurement} icon={Send} tone="approved" />
        <StatTile label="Confirmed" value={stats.confirmed} icon={CheckCircle2} tone="approved" />
        <StatTile label="In my scope" value={stats.awaitingManager + stats.awaitingProcurement + stats.confirmed} icon={ListChecks} />
      </div>

      <Tabs tabs={tabsWithCounts} active={tab} onChange={setTab} />

      {rows === null ? <FullPageSpinner /> : (
        tab === 'toApprove'
          ? <ApproveTable rows={rows} onApprove={approve} onReject={setRejecting} onEdit={setEditing} />
          : <ListTable rows={rows} tab={tab} onOpen={(id) => navigate(`request/${id}`)} />
      )}

      {editing && (
        <EditRequestModal request={editing} onClose={() => setEditing(null)} onSaved={afterEdit} />
      )}
      {rejecting && (
        <ReasonModal
          request={rejecting}
          title="Reject request"
          actionLabel="Reject request"
          placeholder="e.g. Trip not necessary this week."
          onSubmit={(reason) => rejectRequest(rejecting.requestId, reason)}
          onClose={afterReject}
        />
      )}
    </div>
  );
}

function ApproveTable({ rows, onApprove, onReject, onEdit }) {
  if (!rows.length) {
    return <Panel padded><EmptyState icon={CheckCircle2} title="Nothing to approve" body="Requests from your team will appear here." /></Panel>;
  }
  return (
    <Panel padded={false} title={`Awaiting your approval (${rows.length})`}>
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
                    <button className="vbs-act vbs-act-ok" title="Approve & forward" aria-label="Approve" onClick={() => onApprove(r)}><Check size={16} /></button>
                    <button className="vbs-act vbs-act-no" title="Reject" aria-label="Reject" onClick={() => onReject(r)}><X size={16} /></button>
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

function ListTable({ rows, tab, onOpen }) {
  if (!rows.length) {
    const msg = tab === 'mine' ? 'You have no requests.'
      : tab === 'forwarded' ? 'Nothing forwarded to Procurement yet.'
      : 'No tickets in your scope yet.';
    return <Panel padded><EmptyState icon={ListChecks} title="Nothing here" body={msg} /></Panel>;
  }
  return (
    <Panel padded={false}>
      <div style={{ overflowX: 'auto' }}>
        <table className="ui-table">
          <thead><tr>
            <th>Booking ID</th><th>Employee</th><th>Trip date</th><th>Time</th>
            <th>Destination</th><th>Purpose</th><th>Status</th>
          </tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.requestId} onClick={() => onOpen(r.requestId)}>
                <td className="code">{r.requestNo}</td>
                <td>{r.employee.displayName}</td>
                <td style={{ whiteSpace: 'nowrap' }}>{formatDate(r.tripDate)}</td>
                <td className="code" style={{ whiteSpace: 'nowrap' }}>{formatSlot(r.startTime, r.endTime)}</td>
                <td>{r.destination}</td>
                <td style={{ color: 'var(--ink-500)' }}>{r.purpose}</td>
                <td><StatusPill status={r.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}