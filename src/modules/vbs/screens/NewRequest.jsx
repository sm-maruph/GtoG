/**
 * NewRequest — hosts the requisition form, owns the create call + navigation.
 * On success it routes to the new request's detail so the employee immediately
 * sees the PENDING status the spec promises.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageHeader, Panel } from '../../../core/ui';
import RequestForm from '../components/RequestForm';
import { createRequest } from '../api';

export default function NewRequest() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(payload) {
    setBusy(true);
    setError(null);
    try {
      const created = await createRequest(payload);
      navigate(`../request/${created.requestId}`, { replace: true });
    } catch (e) {
      setError(e.response?.data?.error ?? 'Could not submit your request. Please try again.');
      setBusy(false);
    }
  }

  return (
    <div>
      <button className="btn btn-ghost" onClick={() => navigate('..')} style={{ marginBottom: 'var(--sp-4)' }}>
        <ArrowLeft size={15} aria-hidden="true" /> Back
      </button>

      <PageHeader
        title="New vehicle request"
        subtitle="Date and time are pre-filled — adjust them, add your destination and purpose, then submit."
      />

      <div style={{ maxWidth: 640 }}>
        <Panel>
          {error && <div className="alert-error" style={{ marginBottom: 'var(--sp-4)' }}>{error}</div>}
          <RequestForm onSubmit={handleSubmit} onCancel={() => navigate('..')} busy={busy} />
        </Panel>
      </div>
    </div>
  );
}
