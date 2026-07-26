/**
 * RequestForm — the vehicle requisition.
 * Spec: online submission with automatic date/time pre-fill for faster booking.
 * On submit the request becomes PENDING; the employee is notified on confirm or
 * decline. This component owns field state + validation only; the module wires
 * the actual create call and where to go next.
 */

import { useState } from 'react';
import { FormField, FormGrid } from '../../../core/ui';

/* Auto pre-fill: today, next round hour, +2h. This is the "faster booking"
   requirement — the employee should be able to submit with two edits, not six. */
function defaults() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const tripDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const startHour = Math.min(now.getHours() + 1, 22);
  return {
    tripDate,
    startTime: `${pad(startHour)}:00`,
    endTime: `${pad(Math.min(startHour + 2, 23))}:00`,
    purpose: '',
    destination: '',
    notes: '',
  };
}

function validate(v) {
  const e = {};
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const picked = new Date(`${v.tripDate}T00:00:00`);

  if (!v.tripDate) e.tripDate = 'Choose a trip date.';
  else if (picked < today) e.tripDate = 'The trip date can\u2019t be in the past.';

  if (!v.startTime) e.startTime = 'Set a start time.';
  if (!v.endTime) e.endTime = 'Set an end time.';
  if (v.startTime && v.endTime && v.endTime <= v.startTime) {
    e.endTime = 'End time must be after the start time.';
  }
  if (!v.purpose.trim()) e.purpose = 'Tell the admin what the trip is for.';
  if (!v.destination.trim()) e.destination = 'Where is the trip going?';
  return e;
}

export default function RequestForm({ onSubmit, onCancel, busy }) {
  const [values, setValues] = useState(defaults);
  const [errors, setErrors] = useState({});

  const set = (field) => (ev) =>
    setValues((v) => ({ ...v, [field]: ev.target.value }));

  function handleSubmit(ev) {
    ev.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length === 0) {
      onSubmit({
        ...values,
        purpose: values.purpose.trim(),
        destination: values.destination.trim(),
        notes: values.notes.trim(),
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <FormGrid>
        <div className="ui-field-full">
          <FormField label="Trip date" htmlFor="tripDate" required error={errors.tripDate}>
            <input id="tripDate" type="date" value={values.tripDate}
              onChange={set('tripDate')} aria-invalid={!!errors.tripDate} disabled={busy} />
          </FormField>
        </div>

        <FormField label="Start time" htmlFor="startTime" required error={errors.startTime}>
          <input id="startTime" type="time" value={values.startTime}
            onChange={set('startTime')} aria-invalid={!!errors.startTime} disabled={busy} />
        </FormField>

        <FormField label="End time" htmlFor="endTime" required error={errors.endTime}>
          <input id="endTime" type="time" value={values.endTime}
            onChange={set('endTime')} aria-invalid={!!errors.endTime} disabled={busy} />
        </FormField>

        <div className="ui-field-full">
          <FormField label="Destination" htmlFor="destination" required error={errors.destination}>
            <input id="destination" type="text" value={values.destination}
              onChange={set('destination')} placeholder="e.g. DEPZ Branch, Savar"
              aria-invalid={!!errors.destination} disabled={busy} />
          </FormField>
        </div>

        <div className="ui-field-full">
          <FormField label="Purpose" htmlFor="purpose" required error={errors.purpose}>
            <input id="purpose" type="text" value={values.purpose}
              onChange={set('purpose')} placeholder="e.g. Branch audit visit"
              aria-invalid={!!errors.purpose} disabled={busy} />
          </FormField>
        </div>

        <div className="ui-field-full">
          <FormField label="Notes for the admin" htmlFor="notes"
            hint="Optional — anything the approver should know.">
            <textarea id="notes" value={values.notes} onChange={set('notes')}
              rows={3} disabled={busy} />
          </FormField>
        </div>
      </FormGrid>

      <div style={{ display: 'flex', gap: 'var(--sp-2)', marginTop: 'var(--sp-2)' }}>
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? 'Submitting\u2026' : 'Submit request'}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
      </div>
    </form>
  );
}
