import { useMemo, useState } from 'react';
import Modal from '../../../core/ui/Modal';
import { useInsurance } from '../InsContext';

export default function AlertModal({ onClose }) {
  const { previewAlerts, actions } = useInsurance();
  const preview = useMemo(() => previewAlerts('ALL'), [previewAlerts]);
  const defaultRecipients = [
    ...preview.admins.map((u) => u.email),
    ...preview.units.flatMap((unit) => unit.recipients.map((u) => u.email)),
  ];
  const [unitCodes, setUnitCodes] = useState(preview.units.filter((u) => u.recipients.length).map((u) => u.unitCode));
  const [recipients, setRecipients] = useState([...new Set(defaultRecipients)]);
  const [message, setMessage] = useState('');

  function toggleUnit(code) {
    setUnitCodes((old) => old.includes(code) ? old.filter((v) => v !== code) : [...old, code]);
  }
  function toggleRecipient(email) {
    setRecipients((old) => old.includes(email) ? old.filter((v) => v !== email) : [...old, email]);
  }
  const selectedPolicies = preview.units.filter((u) => unitCodes.includes(u.unitCode)).reduce((n, u) => n + u.policies.length, 0);

  function send() {
    if (!unitCodes.length || !recipients.length) { setMessage('Select at least one unit and one recipient.'); return; }
    actions.sendAlerts({ unitCodes, recipients });
    setMessage(`Alert prepared for ${unitCodes.length} unit(s), ${recipients.length} recipient(s), and ${selectedPolicies} policy/policies. Connect the production email endpoint to dispatch it.`);
  }

  return (
    <Modal title="Send Expiry Alert Emails" size="lg" onClose={onClose}
      footer={<><button className="btn btn-secondary" onClick={onClose}>Close</button><button className="btn btn-primary" onClick={send}>Send Alerts</button></>}>
      {message && <div className="alert-success">{message}</div>}
      <p className="ins-muted">Only active policies expiring within 15 days are included.</p>
      <div className="ins-alert-section">
        <h3>Admin copy recipients</h3>
        {preview.admins.map((user) => <label className="ins-check" key={user.rowId}><input type="checkbox" checked={recipients.includes(user.email)} onChange={() => toggleRecipient(user.email)} /><span>{user.fullName} — {user.email}</span></label>)}
      </div>
      <div className="ins-alert-section">
        <h3>Units requiring alerts</h3>
        {!preview.units.length && <p className="ins-muted">No policy is currently within the 0–15 day alert window.</p>}
        {preview.units.map((unit) => (
          <div className="ins-alert-unit" key={unit.unitCode}>
            <label className="ins-check"><input type="checkbox" disabled={!unit.recipients.length} checked={unitCodes.includes(unit.unitCode)} onChange={() => toggleUnit(unit.unitCode)} /><strong>{unit.unitName}</strong><span>{unit.policies.length} policy/policies</span></label>
            {unit.recipients.length ? unit.recipients.map((user) => <label className="ins-check ins-check-child" key={user.rowId}><input type="checkbox" checked={recipients.includes(user.email)} onChange={() => toggleRecipient(user.email)} /><span>{user.fullName} — {user.email}</span></label>) : <div className="ins-no-recipient">No recipient mapped</div>}
          </div>
        ))}
      </div>
      <div className="ins-alert-preview">Selected: <strong>{unitCodes.length}</strong> unit(s), <strong>{recipients.length}</strong> recipient(s), <strong>{selectedPolicies}</strong> policy/policies.</div>
    </Modal>
  );
}
