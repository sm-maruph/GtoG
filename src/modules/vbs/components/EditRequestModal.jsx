/**
 * EditRequestModal — lets a manager/head/admin edit a request's trip details
 * while it's in their queue. Pre-fills from the current request; on save, only
 * changed fields are sent, and each change is recorded in the timeline by the
 * API. Reuses the same field styles as the requisition form.
 */

import { useState } from 'react';
import Modal from '../../../core/ui/Modal';
import { FormField, FormGrid } from '../../../core/ui';
import { editRequest } from '../api';

export default function EditRequestModal({ request, onClose, onSaved }) {
  const [v, setV] = useState({
    tripDate: request.tripDate, startTime: request.startTime, endTime: request.endTime,
    destination: request.destination, purpose: request.purpose,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const set = (f) => (e) => setV((s) => ({ ...s, [f]: e.target.value }));

  async function save() {
    if (v.endTime <= v.startTime) { setError('End time must be after the start time.'); return; }
    if (!v.destination.trim() || !v.purpose.trim()) { setError('Destination and purpose are required.'); return; }
    setBusy(true); setError(null);
    try {
      const updated = await editRequest(request.requestId, {
        ...v, destination: v.destination.trim(), purpose: v.purpose.trim(),
      });
      onSaved(updated);
    } catch (e) {
      setError(e.response?.data?.error ?? 'Could not save changes.');
      setBusy(false);
    }
  }

  const footer = (
    <>
      <button className="btn btn-ghost" onClick={onClose} disabled={busy}>Cancel</button>
      <button className="btn btn-primary" onClick={save} disabled={busy}>
        {busy ? 'Saving…' : 'Save changes'}
      </button>
    </>
  );

  return (
    <Modal title={`Edit ${request.requestNo}`} size="md" onClose={onClose} footer={footer}>
      <p style={{ marginTop: 0, fontSize: 'var(--text-sm)', color: 'var(--ink-500)' }}>
        Changes are recorded in the approval timeline.
      </p>
      {error && <div className="alert-error" style={{ marginBottom: 'var(--sp-4)' }}>{error}</div>}
      <FormGrid>
        <div className="ui-field-full">
          <FormField label="Trip date" htmlFor="e-date" required>
            <input id="e-date" type="date" value={v.tripDate} onChange={set('tripDate')} disabled={busy} />
          </FormField>
        </div>
        <FormField label="Start time" htmlFor="e-start" required>
          <input id="e-start" type="time" value={v.startTime} onChange={set('startTime')} disabled={busy} />
        </FormField>
        <FormField label="End time" htmlFor="e-end" required>
          <input id="e-end" type="time" value={v.endTime} onChange={set('endTime')} disabled={busy} />
        </FormField>
        <div className="ui-field-full">
          <FormField label="Destination" htmlFor="e-dest" required>
            <input id="e-dest" type="text" value={v.destination} onChange={set('destination')} disabled={busy} />
          </FormField>
        </div>
        <div className="ui-field-full">
          <FormField label="Purpose" htmlFor="e-purpose" required>
            <input id="e-purpose" type="text" value={v.purpose} onChange={set('purpose')} disabled={busy} />
          </FormField>
        </div>
      </FormGrid>
    </Modal>
  );
}