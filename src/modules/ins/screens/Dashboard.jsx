import { useMemo, useState } from 'react';
import { AlertTriangle, Banknote, CalendarClock, FileCheck2, ShieldAlert } from 'lucide-react';
import { PageHeader, Panel, StatTile } from '../../../core/ui';
import { useInsurance } from '../InsContext';
import { companyRows, unitRows } from '../analytics';
import { formatMoney, maturityBand } from '../format';
import { policyMetrics } from '../store';
import CompanyDonut from '../components/CompanyDonut';
import PolicyListModal from '../components/PolicyListModal';
import PolicyModal from '../components/PolicyModal';
import FollowUpModal from '../components/FollowUpModal';

export default function Dashboard() {
  const { policies, state, isAdmin, units, unitName, can } = useInsurance();
  const [unitFilter, setUnitFilter] = useState('ALL');
  const [dialog, setDialog] = useState(null);
  const [editing, setEditing] = useState(null);
  const [following, setFollowing] = useState(null);
  const visible = useMemo(() => isAdmin && unitFilter !== 'ALL' ? state.policies.filter((p) => p.unitCode === unitFilter) : policies, [isAdmin, unitFilter, state.policies, policies]);
  const metrics = policyMetrics(visible);
  const companies = companyRows(visible).sort((a,b)=>a.company.localeCompare(b.company));
  const risks = unitRows(visible).sort((a,b)=>a.unitName.localeCompare(b.unitName));
  const sortedUnits = [...units].sort((a,b)=>a.name.localeCompare(b.name));

  const openPolicies = (title, list, subtitle='') => setDialog({ title, policies:list, subtitle });
  const bandRows = (code) => visible.filter((p)=>maturityBand(p.maturityDate).code===code);
  const canEdit = can('ins.policy.edit') || can('ins.policy.manage');
  const canFollow = can('ins.followup.create') || can('ins.followup.manage');

  return <div>
    <PageHeader title="Insurance Dashboard" subtitle={`Real-time portfolio summary for ${isAdmin ? 'all accessible units' : unitName}.`}>
      {isAdmin && <select className="ins-inline-select" value={unitFilter} onChange={(e)=>setUnitFilter(e.target.value)} aria-label="Filter dashboard by unit"><option value="ALL">All Units</option>{sortedUnits.map((u)=><option key={u.code} value={u.code}>{u.name}</option>)}</select>}
    </PageHeader>
    <div className="ui-stat-grid ins-stat-grid-five">
      <StatTile label="Total policies" value={metrics.totalPolicies} icon={FileCheck2} onClick={()=>openPolicies('All policies',visible,'Complete policy portfolio in the selected scope.')} />
      <StatTile label="Expired" value={metrics.EXPIRED} icon={ShieldAlert} tone="rejected" onClick={()=>openPolicies('Expired policies',bandRows('EXPIRED'),'Policies already past maturity date.')} />
      <StatTile label="Expiring ≤15 days" value={metrics.DAYS_0_15} icon={AlertTriangle} tone="pending" onClick={()=>openPolicies('Policies expiring within 15 days',bandRows('DAYS_0_15'),'Urgent renewal and follow-up queue.')} />
      <StatTile label="Expiring 16–30 days" value={metrics.DAYS_16_30} icon={CalendarClock} tone="pending" onClick={()=>openPolicies('Policies expiring within 16–30 days',bandRows('DAYS_16_30'),'Policies requiring early follow-up.')} />
      <StatTile label="Total insured" value={formatMoney(metrics.totalInsured)} icon={Banknote} tone="approved" onClick={()=>openPolicies('Total insured portfolio',visible,'All clients contributing to the displayed insured exposure.')} />
    </div>

    <div className="ins-grid-two">
      <Panel title="Policies by insurance company"><CompanyDonut rows={companies} valueKey="totalPolicies" title="Policy count" onCompanyClick={(company)=>openPolicies(company,visible.filter((p)=>p.company===company),`${company} policy portfolio.`)} /></Panel>
      <Panel title="Insured amount by company"><CompanyDonut rows={companies} valueKey="totalExposure" title="Total exposure" formatter={formatMoney} onCompanyClick={(company)=>openPolicies(company,visible.filter((p)=>p.company===company),`${company} insured exposure.`)} /></Panel>
    </div>

    {isAdmin && <Panel title="Unit Performance & Risk Scoring" padded={false}>
      <div className="ins-table-wrap"><table className="ui-table"><thead><tr><th>Unit</th><th>Total</th><th>Expired</th><th>≤15 days</th><th>Total insured</th><th>Risk score</th></tr></thead><tbody>{risks.map((row)=><tr key={row.unitCode} className="ins-click-row" onClick={()=>openPolicies(`${row.unitName} — client details`,visible.filter((p)=>p.unitCode===row.unitCode),`Risk score ${row.risk.toFixed(1)}%. Clicked unit contains the following borrower policies.`)}><td><strong>{row.unitName}</strong><small className="ins-row-hint">Click to view clients</small></td><td>{row.totalPolicies}</td><td>{row.expired}</td><td>{row.within15}</td><td>{formatMoney(row.totalInsured)}</td><td><div className="ins-risk"><div><span style={{width:`${Math.min(100,row.risk)}%`}} className={row.risk>50?'danger':row.risk>=25?'warning':'success'}/></div><strong>{row.risk.toFixed(1)}%</strong></div></td></tr>)}</tbody></table></div>
    </Panel>}

    {dialog && <PolicyListModal {...dialog} onClose={()=>setDialog(null)} onEdit={canEdit?(p)=>{setDialog(null);setEditing(p)}:null} onFollowUp={canFollow?(p)=>{setDialog(null);setFollowing(p)}:null}/>} 
    {editing && <PolicyModal policy={editing} onClose={()=>setEditing(null)}/>} 
    {following && <FollowUpModal policy={following} onClose={()=>setFollowing(null)}/>} 
  </div>;
}
