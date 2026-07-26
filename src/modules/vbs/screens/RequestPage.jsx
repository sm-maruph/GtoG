/**
 * RequestPage — loads one request by id and renders its full detail.
 * Handles the after-submission moment: the freshly created PENDING request is
 * shown here with the message the spec describes.
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '../../../core/ui';
import { FullPageSpinner } from '../../../core/auth/Can';
import RequestDetail from '../components/RequestDetail';
import RequestTimeline from '../components/RequestTimeline';
import { Panel } from '../../../core/ui';
import { getRequest } from '../api';

export default function RequestPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    getRequest(id)
      .then((data) => { if (alive) setRequest(data); })
      .catch((e) => { if (alive) setError(e.response?.data?.error ?? 'Request not found.'); });
    return () => { alive = false; };
  }, [id]);

  if (error) {
    return (
      <div>
        <button className="btn btn-ghost" onClick={() => navigate('..')} style={{ marginBottom: 'var(--sp-4)' }}>
          <ArrowLeft size={15} aria-hidden="true" /> Back
        </button>
        <div className="alert-error">{error}</div>
      </div>
    );
  }
  if (!request) return <FullPageSpinner />;

  return (
    <div>
      <button className="btn btn-ghost" onClick={() => navigate('..')} style={{ marginBottom: 'var(--sp-4)' }}>
        <ArrowLeft size={15} aria-hidden="true" /> Back to requests
      </button>

      <PageHeader title="Request detail" subtitle={request.requestNo} />

      {request.status === 'PENDING' && (
        <div style={{
          display: 'flex', gap: 'var(--sp-2)', alignItems: 'flex-start',
          padding: 'var(--sp-3)', marginBottom: 'var(--sp-4)',
          background: 'var(--warn-50)', border: '1px solid #fde68a',
          borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)', color: 'var(--warn-600)',
        }}>
          <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
          <span>
            Your request is <strong>pending</strong>. You&rsquo;ll get an email once an admin confirms
            or declines it, and a calendar invitation if it&rsquo;s confirmed.
          </span>
        </div>
      )}

      <div style={{ display: 'grid', gap: 'var(--sp-4)', gridTemplateColumns: 'minmax(0, 1fr) 320px', alignItems: 'start' }}>
        <RequestDetail request={request} />
        <Panel title="Approval timeline">
          <RequestTimeline timeline={request.timeline} />
        </Panel>
      </div>
    </div>
  );
}