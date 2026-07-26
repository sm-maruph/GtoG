/**
 * DeclineModal — spec 5.1 "To Decline a Booking". A reason is mandatory; it's
 * emailed to the employee and kept as the audit trail (spec 5.3).
 */

import { useState } from 'react';
import Modal from '../../../core/ui/Modal';
import { FormField } from '../../../core/ui';
import { declineRequest } from '../api';

export default function DeclineModal({ request, onClose, onDeclined }) {
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function handleDecline() {
    if (!reason.trim()) { setError('Enter a reason so the employee understands why.'); return; }
    setBusy(true); setError(null);
    try {
      const updated = await declineRequest(request.requestId, reason.trim());
      onDeclined(updated);
    } catch (e) {
      setError(e.response?.data?.error ?? 'Could not decline the request.');
      setBusy(false);
    }
  }

  const footer = (
    <>
      <button className="btn btn-ghost" onClick={onClose} disabled={busy}>Cancel</button>
      <button className="btn btn-primary" onClick={handleDecline} disabled={busy}
        style={{ background: 'var(--danger-600)' }}>
        {busy ? 'Declining\u2026' : 'Decline request'}
      </button>
    </>
  );

  return (
    <Modal title="Decline request" size="sm" onClose={onClose} footer={footer}>
      <p style={{ marginTop: 0, fontSize: 'var(--text-sm)', color: 'var(--ink-500)' }}>
        Declining <span className="code">{request.requestNo}</span> from {request.employee.displayName}.
        The reason below is emailed to them.
      </p>
      {error && <div className="alert-error" style={{ marginBottom: 'var(--sp-4)' }}>{error}</div>}
      <FormField label="Reason for declining" htmlFor="reason" required>
        <textarea id="reason" rows={3} value={reason} autoFocus
          onChange={(e) => setReason(e.target.value)} disabled={busy}
          placeholder="e.g. All vehicles are booked for that slot." />
      </FormField>
    </Modal>
  );
}