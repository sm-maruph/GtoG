/**
 * Dashboard — the employee's landing screen inside VBS: a few stat tiles derived
 * from their requests, then the request list. Stats are computed from the list
 * so there's no second source to keep in sync.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FilePlus2, Clock, CheckCircle2, Inbox } from 'lucide-react';
import { useAuth } from '../../../core/auth/AuthContext';
import { Can } from '../../../core/auth/Can';
import { PageHeader, Panel, StatTile } from '../../../core/ui';
import { FullPageSpinner } from '../../../core/auth/Can';
import RequestList from '../components/RequestList';
import { listRequests } from '../api';

export default function Dashboard() {
  const navigate = useNavigate();
  const { can } = useAuth();
  const [requests, setRequests] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    listRequests({ scope: 'mine' })
      .then((data) => { if (alive) setRequests(data.items ?? []); })
      .catch((e) => { if (alive) setError(e.response?.data?.error ?? 'Could not load your requests.'); });
    return () => { alive = false; };
  }, []);

  if (error) {
    return (
      <div>
        <PageHeader title="Travel requests" />
        <div className="alert-error">{error}</div>
      </div>
    );
  }
  if (requests === null) return <FullPageSpinner />;

  const thisMonth = new Date().getMonth();
  const pending = requests.filter((r) => r.status === 'PENDING').length;
  const confirmed = requests.filter((r) =>
    r.status === 'CONFIRMED' && new Date(r.submittedUtc).getMonth() === thisMonth).length;

  const newBtn = (
    <Can do="vbs.request.create">
      <button className="btn btn-primary" onClick={() => navigate('new')}>
        <FilePlus2 size={15} aria-hidden="true" /> New request
      </button>
    </Can>
  );

  return (
    <div>
      <PageHeader
        title="Travel requests"
        subtitle="Raise official vehicle requests and track them through approval."
      >
        {newBtn}
      </PageHeader>

      <div className="ui-stat-grid">
        <StatTile label="Pending" value={pending} icon={Clock} tone="pending" />
        <StatTile label="Confirmed this month" value={confirmed} icon={CheckCircle2} tone="approved" />
        <StatTile label="Total requests" value={requests.length} icon={Inbox} />
      </div>

      <Panel title="My requests" padded={false}>
        <div style={{ padding: requests.length ? 0 : 'var(--sp-2)' }}>
          <RequestList
            requests={requests}
            onOpen={(id) => navigate(`request/${id}`)}
            emptyAction={newBtn}
          />
        </div>
      </Panel>
    </div>
  );
}
