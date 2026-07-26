import { useMemo, useState } from 'react';
import { FileStack, Layers3, Plus, Printer, ScrollText } from 'lucide-react';
import { PageHeader, Panel, StatTile } from '../../../core/ui';
import { usePaper } from '../PprContext';
import EntryModal from '../components/EntryModal';

function formatMonth(value) {
  if (!value || value === '—') return value;
  return new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric' }).format(new Date(`${value}-01T00:00:00`));
}

function TrendChart({ rows }) {
  const shown = rows.slice(-12);
  const max = Math.max(...shown.map((r) => r.pages), 1);
  return <div className="ppr-trend" role="img" aria-label="Monthly paper usage trend">
    {shown.map((row) => <div key={row.month} className="ppr-trend-column" title={`${formatMonth(row.month)}: ${row.pages.toLocaleString()} pages`}><span className="ppr-trend-value">{row.pages.toLocaleString()}</span><div className="ppr-trend-track"><i style={{ height: `${Math.max(4, (row.pages / max) * 100)}%` }}/></div><small>{new Date(`${row.month}-01`).toLocaleDateString('en-GB',{month:'short'})}</small></div>)}
  </div>;
}

export default function Dashboard() {
  const { entries, summary, trend, can } = usePaper();
  const [modal, setModal] = useState(false);
  const latest = useMemo(() => [...entries].sort((a,b) => b.month.localeCompare(a.month) || b.entryId-a.entryId).slice(0,8), [entries]);
  const paperBreakdown = useMemo(() => {
    const map = new Map();
    for (const row of entries) map.set(row.paperTypeName, (map.get(row.paperTypeName) || 0) + Number(row.totalPagesUsed || 0));
    return [...map.entries()].sort((a,b)=>b[1]-a[1]);
  }, [entries]);
  return <div className="ppr-page">
    <PageHeader title="Paper Usage Dashboard" subtitle="Printer counter usage, balance in hand, and next-month paper requisition by organisational scope.">
      {can('ppr.entry.create') && <button className="btn btn-primary" onClick={() => setModal(true)}><Plus size={15}/>Add usage entry</button>}
    </PageHeader>
    <div className="ui-stat-grid ppr-stats">
      <StatTile label="Tracked pages" value={summary.pages.toLocaleString()} icon={ScrollText} hint="Across visible records"/>
      <StatTile label="Usage entries" value={entries.length.toLocaleString()} icon={FileStack}/>
      <StatTile label="Next requisition" value={`${summary.requisitionRims.toLocaleString()} rims`} icon={Layers3}/>
      <StatTile label="Printers tracked" value={summary.printers.toLocaleString()} icon={Printer}/>
      <StatTile label="Latest reporting month" value={formatMonth(summary.latestMonth)} icon={FileStack}/>
    </div>
    <div className="ppr-dashboard-grid">
      <Panel title="Monthly Usage Trend"><TrendChart rows={trend}/></Panel>
      <Panel title="Usage by Paper Type"><div className="ppr-breakdown">{paperBreakdown.map(([name,pages]) => <div key={name}><div><strong>{name}</strong><span>{pages.toLocaleString()} pages</span></div><div className="ppr-progress"><i style={{width:`${summary.pages ? pages/summary.pages*100 : 0}%`}}/></div></div>)}</div></Panel>
    </div>
    <Panel title="Latest Entries" padded={false}><div className="ppr-table-wrap"><table className="ui-table"><thead><tr><th>Month</th><th>Scope</th><th>Printer</th><th>Paper</th><th>Counter</th><th>Total Used</th><th>In Hand</th><th>Next Requisition</th><th>Status</th></tr></thead><tbody>{latest.map((row)=><tr key={row.entryId}><td className="code">{formatMonth(row.month)}</td><td><strong>{row.branchName}</strong><small>{row.deptName}</small></td><td><span className="code">{row.printerCode}</span><small>{row.printerName}</small></td><td>{row.paperTypeName}</td><td className="code">{row.startingPageCount.toLocaleString()} → {row.endingPageCount.toLocaleString()}</td><td><strong>{row.totalPagesUsed.toLocaleString()}</strong></td><td>{row.paperInHandQty.toLocaleString()} {row.paperInHandUnit}</td><td>{row.requisitionQty.toLocaleString()} {row.requisitionUnit}</td><td><span className={`ppr-status ${row.status.toLowerCase()}`}>{row.status}</span></td></tr>)}</tbody></table></div></Panel>
    {modal && <EntryModal onClose={() => setModal(false)}/>} 
  </div>;
}
