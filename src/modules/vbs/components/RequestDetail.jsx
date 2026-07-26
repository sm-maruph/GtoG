/**
 * RequestDetail — everything the employee can see about one request (spec 4.2).
 * Vehicle, driver, and driver phone appear only once CONFIRMED. Admin notes and
 * decline reason appear only when present. A conditional row is never an empty
 * row — if there's nothing to show, the row isn't rendered.
 */

import { Panel, StatusPill } from '../../../core/ui';
import { Phone } from 'lucide-react';
import { formatDate, formatSlot, formatDateTime } from '../format';

function Row({ label, children }) {
  return (
    <div className="ui-defrow">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

export default function RequestDetail({ request }) {
  const r = request;
  const confirmed = r.status === 'CONFIRMED';

  return (
    <div style={{ display: 'grid', gap: 'var(--sp-4)' }}>
      <Panel title="Request">
        <dl style={{ margin: 0 }}>
          <Row label="Booking ID"><span className="code">{r.requestNo}</span></Row>
          <Row label="Status"><StatusPill status={r.status} /></Row>
          <Row label="Submitted">{formatDateTime(r.submittedUtc)}</Row>
          <Row label="Trip date">{formatDate(r.tripDate)}</Row>
          <Row label="Time slot"><span className="code">{formatSlot(r.startTime, r.endTime)}</span></Row>
          <Row label="Destination">{r.destination}</Row>
          <Row label="Purpose">{r.purpose}</Row>
          {r.notes && <Row label="Your notes">{r.notes}</Row>}
        </dl>
      </Panel>

      {/* Assignment — only meaningful once confirmed */}
      {confirmed && (r.vehicle || r.driver) && (
        <Panel title="Assigned vehicle & driver">
          <dl style={{ margin: 0 }}>
            {r.vehicle && (
              <Row label="Vehicle">
                <span className="code">{r.vehicle.regNo}</span>
                {(r.vehicle.make || r.vehicle.model) &&
                  <span style={{ color: 'var(--ink-500)', marginLeft: 8 }}>
                    {[r.vehicle.make, r.vehicle.model].filter(Boolean).join(' ')}
                  </span>}
              </Row>
            )}
            {r.driver && <Row label="Driver">{r.driver.fullName}</Row>}
            {r.driver?.phone && (
              <Row label="Driver mobile">
                <a href={`tel:${r.driver.phone}`} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  color: 'var(--cbc-blue-600)', textDecoration: 'none', fontWeight: 600,
                }}>
                  <Phone size={14} aria-hidden="true" />
                  <span className="code">{r.driver.phone}</span>
                </a>
              </Row>
            )}
          </dl>
        </Panel>
      )}

      {/* Admin notes / decline reason — only when present */}
      {(r.adminNotes || r.declineReason) && (
        <Panel title={r.declineReason ? 'Decline reason' : 'Admin notes'}>
          <p style={{ margin: 0, fontSize: 'var(--text-sm)', lineHeight: 1.6 }}>
            {r.declineReason || r.adminNotes}
          </p>
        </Panel>
      )}
    </div>
  );
}
