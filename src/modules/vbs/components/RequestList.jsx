/**
 * RequestList — the employee's requests, colour-coded by status.
 * Rows are clickable through to the detail view. Pure presentation: it receives
 * requests and an onOpen handler, nothing more.
 */

import { StatusPill, EmptyState } from '../../../core/ui';
import { Inbox } from 'lucide-react';
import { formatDate, formatSlot } from '../format';

export default function RequestList({ requests, onOpen, emptyAction }) {
  if (!requests?.length) {
    return (
      <EmptyState
        icon={Inbox}
        title="No requests yet"
        body="Requests you submit will appear here with their current status."
      >
        {emptyAction}
      </EmptyState>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="ui-table">
        <thead>
          <tr>
            <th>Booking ID</th>
            <th>Trip date</th>
            <th>Time</th>
            <th>Destination</th>
            <th>Purpose</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r) => (
            <tr key={r.requestId} onClick={() => onOpen(r.requestId)}>
              <td className="code">{r.requestNo}</td>
              <td>{formatDate(r.tripDate)}</td>
              <td className="code">{formatSlot(r.startTime, r.endTime)}</td>
              <td>{r.destination}</td>
              <td style={{ color: 'var(--ink-500)' }}>{r.purpose}</td>
              <td><StatusPill status={r.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
