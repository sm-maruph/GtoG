/**
 * ReasonModal — a reason-required decision dialog, reused for:
 *   - branch manager / dept head REJECT (first level)
 *   - procurement DECLINE (final)
 * The parent supplies the title, button label, and the async action. This is
 * the generic version of the old DeclineModal so both levels share one dialog.
 */

import { useState } from 'react';
import Modal from '../../../core/ui/Modal';
import { FormField } from '../../../core/ui';

export default function ReasonModal({
  request, title = 'Provide a reason', actionLabel = 'Submit',
  placeholder = 'Enter a reason…', onSubmit, onClose,
}) {
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function handle() {
    if (!reason.trim()) { setError('A reason is required so the employee understands why.'); return; }
    setBusy(true); setError(null);
    try {
      const updated = await onSubmit(reason.trim());
      onClose(updated);
    } catch (e) {
      setError(e.response?.data?.error ?? 'Could not submit. Please try again.');
      setBusy(false);
    }
  }

  const footer = (
    <>
      <button className="btn btn-ghost" onClick={() => onClose(null)} disabled={busy}>Cancel</button>
      <button className="btn btn-primary" onClick={handle} disabled={busy}
        style={{ background: 'var(--danger-600)' }}>
        {busy ? 'Working…' : actionLabel}
      </button>
    </>
  );

  return (
    <Modal title={title} size="sm" onClose={() => onClose(null)} footer={footer}>
      <p style={{ marginTop: 0, fontSize: 'var(--text-sm)', color: 'var(--ink-500)' }}>
        {request.requestNo} — {request.employee.displayName}. The reason is emailed to the requester.
      </p>
      {error && <div className="alert-error" style={{ marginBottom: 'var(--sp-4)' }}>{error}</div>}
      <FormField label="Reason" htmlFor="reason" required>
        <textarea id="reason" rows={3} value={reason} autoFocus
          onChange={(e) => setReason(e.target.value)} disabled={busy} placeholder={placeholder} />
      </FormField>
    </Modal>
  );
}