/**
 * ReportScreen — time-range report for Procurement / admins.
 * Pick a trip-date range, see totals + status/branch charts + a table, and
 * export to CSV or PDF. CSV is built in-browser; PDF uses the print dialog
 * (window.print of a print-scoped section) so there's no heavy PDF dependency
 * on a LAN box — the user picks "Save as PDF" in the print target.
 */

import { useEffect, useState, useCallback } from 'react';
import { Download, FileText, BarChart3, Clock } from 'lucide-react';
import { PageHeader, Panel, StatTile } from '../../../core/ui';
import { FullPageSpinner } from '../../../core/auth/Can';
import { formatDate, formatDateTime } from '../format';
import { getReport } from '../api';
import MiniBarChart from '../components/MiniBarChart';
import './../components/report.css';

const STATUS_TONE = {
  CONFIRMED: 'ok', PENDING: 'pending', PENDING_ADMIN: 'info',
  REJECTED: 'bad', DECLINED: 'bad', AUTO_CANCELLED: 'muted', CANCELLED: 'muted',
};
const STATUS_LABEL = {
  PENDING: 'Awaiting manager', PENDING_ADMIN: 'Awaiting procurement',
  CONFIRMED: 'Confirmed', REJECTED: 'Rejected', DECLINED: 'Declined',
  AUTO_CANCELLED: 'Auto-cancelled', CANCELLED: 'Cancelled',
};

function defaultRange() {
  const to = new Date();
  const from = new Date(); from.setMonth(from.getMonth() - 1);
  const iso = (d) => d.toISOString().slice(0, 10);
  return { from: iso(from), to: iso(to) };
}

export default function ReportScreen() {
  const [range, setRange] = useState(defaultRange);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = useCallback(async (r) => {
    setLoading(true); setError(null);
    try { setData(await getReport(r)); }
    catch (e) { setError(e.response?.data?.error ?? 'Could not generate the report.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { run(range); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function exportCsv() {
    if (!data?.rows?.length) return;
    const cols = ['requestNo', 'status', 'employee', 'employeeId', 'department', 'branch',
      'tripDate', 'startTime', 'endTime', 'destination', 'purpose', 'vehicle', 'driver', 'submittedUtc'];
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csv = [cols.join(','), ...data.rows.map((row) => cols.map((c) => esc(row[c])).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vbs-report_${range.from}_${range.to}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const statusData = data ? Object.entries(data.byStatus).map(([k, v]) => ({
    label: STATUS_LABEL[k] ?? k, value: v, tone: STATUS_TONE[k] ?? 'info',
  })) : [];
  const branchData = data ? Object.entries(data.byBranch).map(([k, v]) => ({
    label: k, value: v, tone: 'info',
  })) : [];

  return (
    <div>
      <PageHeader title="Vehicle booking — Report" subtitle="Usage and approval metrics for a trip-date range.">
        <button className="btn btn-ghost" onClick={exportCsv} disabled={!data?.rows?.length}>
          <Download size={15} aria-hidden="true" /> CSV
        </button>
        <button className="btn btn-primary" onClick={() => window.print()} disabled={!data}>
          <FileText size={15} aria-hidden="true" /> PDF
        </button>
      </PageHeader>

      {/* Range picker (hidden when printing) */}
      <div className="rep-range no-print">
        <label>From<input type="date" value={range.from} onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))} /></label>
        <label>To<input type="date" value={range.to} onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))} /></label>
        <button className="btn btn-primary" onClick={() => run(range)} disabled={loading}>
          {loading ? 'Generating…' : 'Generate'}
        </button>
      </div>

      {error && <div className="alert-error">{error}</div>}
      {loading && !data ? <FullPageSpinner /> : data && (
        <div className="rep-print">
          <div className="rep-print-head only-print">
            <h1>Vehicle Booking Report</h1>
            <p>Commercial Bank of Ceylon — Bangladesh Operation</p>
            <p>Trip dates {formatDate(range.from)} → {formatDate(range.to)} · generated {formatDateTime(new Date().toISOString())}</p>
          </div>

          <div className="ui-stat-grid">
            <StatTile label="Total requests" value={data.total} icon={BarChart3} />
            <StatTile label="Confirmed" value={data.confirmed} icon={BarChart3} tone="approved" />
            <StatTile label="Rejected / declined" value={data.rejectedOrDeclined} icon={BarChart3} />
            <StatTile label="Avg. decision time" value={data.avgDecisionHrs != null ? `${data.avgDecisionHrs} h` : '—'} icon={Clock} tone="pending" />
          </div>

          <div className="rep-charts">
            <Panel title="By status"><MiniBarChart data={statusData} /></Panel>
            <Panel title="By branch"><MiniBarChart data={branchData} /></Panel>
          </div>

          <Panel title={`Requests (${data.rows.length})`} padded={false}>
            <div style={{ overflowX: 'auto' }}>
              <table className="ui-table">
                <thead><tr>
                  <th>Booking</th><th>Status</th><th>Employee</th><th>Branch</th>
                  <th>Trip date</th><th>Destination</th><th>Vehicle</th>
                </tr></thead>
                <tbody>
                  {data.rows.map((r) => (
                    <tr key={r.requestNo} style={{ cursor: 'default' }}>
                      <td className="code">{r.requestNo}</td>
                      <td>{STATUS_LABEL[r.status] ?? r.status}</td>
                      <td>{r.employee}</td>
                      <td style={{ color: 'var(--ink-500)' }}>{r.branch}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>{formatDate(r.tripDate)}</td>
                      <td>{r.destination}</td>
                      <td className="code" style={{ fontSize: 12 }}>{r.vehicle || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}