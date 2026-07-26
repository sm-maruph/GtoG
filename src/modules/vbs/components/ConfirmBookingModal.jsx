/**
 * ConfirmBookingModal — spec 5.1 "To Confirm a Booking".
 * Shows a summary, loads ONLY vehicles/drivers free for the exact slot (the API
 * has already filtered maintenance, leave, and conflicts), reveals the driver's
 * mobile on selection, allows an optional date/time adjust + reload, and takes
 * admin notes. On confirm the employee is emailed + sent a calendar invite —
 * that side-effect lives in the backend, triggered by this one call.
 */

import { useEffect, useState, useCallback } from 'react';
import { Phone, RefreshCw } from 'lucide-react';
import Modal from '../../../core/ui/Modal';
import { FormField, FormGrid } from '../../../core/ui';
import { formatDate, formatSlot } from '../format';
import { getAvailability, confirmRequest } from '../api';

export default function ConfirmBookingModal({ request, onClose, onConfirmed }) {
  const [slot, setSlot] = useState({
    tripDate: request.tripDate, startTime: request.startTime, endTime: request.endTime,
  });
  const [avail, setAvail] = useState(null);
  const [vehicleId, setVehicleId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [showAdjust, setShowAdjust] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async (s) => {
    setAvail(null);
    setVehicleId(''); setDriverId('');
    try {
      setAvail(await getAvailability(s));
    } catch {
      setError('Could not load availability.');
    }
  }, []);

  useEffect(() => { load(slot); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedDriver = avail?.drivers.find((d) => String(d.driverId) === driverId);

  async function handleConfirm() {
    if (!vehicleId || !driverId) { setError('Select a vehicle and a driver.'); return; }
    setBusy(true); setError(null);
    try {
      const updated = await confirmRequest(request.requestId, {
        vehicleId: Number(vehicleId), driverId: Number(driverId),
        adminNotes, ...slot,
      });
      onConfirmed(updated);
    } catch (e) {
      setError(e.response?.data?.error ?? 'Could not confirm the booking.');
      setBusy(false);
    }
  }

  const footer = (
    <>
      <button className="btn btn-ghost" onClick={onClose} disabled={busy}>Cancel</button>
      <button className="btn btn-primary" onClick={handleConfirm} disabled={busy || !avail}>
        {busy ? 'Confirming\u2026' : 'Confirm booking'}
      </button>
    </>
  );

  return (
    <Modal title="Confirm booking" size="md" onClose={onClose} footer={footer}>
      <div className="ui-modal-summary">
        <div className="ui-modal-summary-row"><span>Booking</span><span className="code">{request.requestNo}</span></div>
        <div className="ui-modal-summary-row"><span>Employee</span><span>{request.employee.displayName} ({request.employee.employeeId})</span></div>
        <div className="ui-modal-summary-row"><span>Trip</span><span>{formatDate(slot.tripDate)}, {formatSlot(slot.startTime, slot.endTime)}</span></div>
        <div className="ui-modal-summary-row"><span>Destination</span><span>{request.destination}</span></div>
        <div className="ui-modal-summary-row"><span>Purpose</span><span>{request.purpose}</span></div>
      </div>

      {error && <div className="alert-error" style={{ marginBottom: 'var(--sp-4)' }}>{error}</div>}

      {!avail ? (
        <p style={{ color: 'var(--ink-500)', fontSize: 'var(--text-sm)' }}>Checking availability&hellip;</p>
      ) : (
        <>
          <FormField label="Vehicle" htmlFor="veh" required
            hint={avail.vehicles.length === 0 ? 'No vehicles free for this slot.' : undefined}>
            <select id="veh" value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} disabled={busy}>
              <option value="">Select an available vehicle</option>
              {avail.vehicles.map((v) => (
                <option key={v.vehicleId} value={v.vehicleId}>
                  {v.regNo} — {[v.make, v.model].filter(Boolean).join(' ')} ({v.seatCapacity} seats)
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Driver" htmlFor="drv" required
            hint={avail.drivers.length === 0 ? 'No drivers free for this slot.' : undefined}>
            <select id="drv" value={driverId} onChange={(e) => setDriverId(e.target.value)} disabled={busy}>
              <option value="">Select an available driver</option>
              {avail.drivers.map((d) => (
                <option key={d.driverId} value={d.driverId}>{d.fullName}</option>
              ))}
            </select>
          </FormField>

          {/* Driver mobile appears on selection — spec: "for quick reference" */}
          {selectedDriver && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6, marginTop: -8, marginBottom: 'var(--sp-4)',
              fontSize: 'var(--text-sm)', color: 'var(--cbc-blue-700)',
            }}>
              <Phone size={14} aria-hidden="true" />
              <span className="code">{selectedDriver.phone}</span>
            </div>
          )}

          {/* Optional date/time adjust + reload */}
          {!showAdjust ? (
            <button type="button" className="btn btn-ghost" style={{ marginBottom: 'var(--sp-4)' }}
              onClick={() => setShowAdjust(true)}>
              Adjust date / time before confirming?
            </button>
          ) : (
            <div style={{ padding: 'var(--sp-3)', border: '1px dashed var(--ink-300)', borderRadius: 'var(--radius)', marginBottom: 'var(--sp-4)' }}>
              <FormGrid>
                <div className="ui-field-full">
                  <FormField label="Trip date" htmlFor="adj-date">
                    <input id="adj-date" type="date" value={slot.tripDate}
                      onChange={(e) => setSlot((s) => ({ ...s, tripDate: e.target.value }))} />
                  </FormField>
                </div>
                <FormField label="Start" htmlFor="adj-start">
                  <input id="adj-start" type="time" value={slot.startTime}
                    onChange={(e) => setSlot((s) => ({ ...s, startTime: e.target.value }))} />
                </FormField>
                <FormField label="End" htmlFor="adj-end">
                  <input id="adj-end" type="time" value={slot.endTime}
                    onChange={(e) => setSlot((s) => ({ ...s, endTime: e.target.value }))} />
                </FormField>
              </FormGrid>
              <button type="button" className="btn btn-ghost" onClick={() => load(slot)}>
                <RefreshCw size={14} aria-hidden="true" /> Reload availability
              </button>
            </div>
          )}

          <FormField label="Admin notes" htmlFor="notes" hint="Optional — visible to the employee.">
            <textarea id="notes" rows={2} value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)} disabled={busy} />
          </FormField>
        </>
      )}
    </Modal>
  );
}
