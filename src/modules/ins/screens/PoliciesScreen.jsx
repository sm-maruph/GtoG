import { useMemo, useState } from 'react';
import { Edit3, FilePlus2, Search, Trash2 } from 'lucide-react';
import { EmptyState, PageHeader, Panel } from '../../../core/ui';
import { useInsurance } from '../InsContext';
import { formatDate, formatMoney, normaliseText } from '../format';
import MaturityBadge from '../components/MaturityBadge';
import PolicyModal from '../components/PolicyModal';

export default function PoliciesScreen() {
  const { policies, isAdmin, units, actions, can } = useInsurance();
  const [query, setQuery] = useState('');
  const [unit, setUnit] = useState('ALL');
  const [modal, setModal] = useState(null);
  const rows = useMemo(() => policies.filter((p) => {
    const unitOk = unit === 'ALL' || p.unitCode === unit;
    const needle = normaliseText(query);
    const textOk = !needle || [p.acNo, p.borrowerName, p.policyNo, p.company].some((v) => normaliseText(v).includes(needle));
    return unitOk && textOk;
  }), [policies, query, unit]);

  function remove(policy) {
    if (!window.confirm(`Delete ${policy.acNo}? This cannot be undone.`)) return;
    try { actions.deletePolicy(policy.policyId); } catch (err) { window.alert(err.message); }
  }

  const canCreate = can('ins.policy.create') || can('ins.policy.manage');
  const canEdit = can('ins.policy.edit') || can('ins.policy.manage');
  const canDelete = can('ins.policy.delete') || can('ins.policy.manage');

  return <div>
    <PageHeader title={isAdmin ? 'All Policies' : 'My Policies'} subtitle="Search, add, update, and monitor insurance policies.">
      {canCreate && <button className="btn btn-primary" onClick={() => setModal({ type: 'new' })}><FilePlus2 size={15} /> Add Insurance</button>}
    </PageHeader>
    <Panel padded={false}>
      <div className="ins-filterbar">
        <label className="ins-search"><Search size={15} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Borrower, AC No, policy number…" /></label>
        {isAdmin && <select value={unit} onChange={(e) => setUnit(e.target.value)}><option value="ALL">All Units</option>{units.map((u) => <option key={u.code} value={u.code}>{u.name}</option>)}</select>}
      </div>
      {!rows.length ? <EmptyState title="No policies found" body="Change the filters or add a new policy." /> : <div className="ins-table-wrap"><table className="ui-table"><thead><tr><th>AC No</th><th>Borrower</th><th>Unit</th><th>Policy No.</th><th>Company</th><th>Amount</th><th>Maturity</th><th>Policy status</th><th>Actions</th></tr></thead><tbody>{rows.map((p) => <tr key={p.policyId}><td className="code">{p.acNo}</td><td><strong>{p.borrowerName}</strong></td><td>{p.unitName}</td><td>{p.policyNo || '—'}</td><td>{p.company}</td><td>{formatMoney(p.amount)}</td><td><div>{formatDate(p.maturityDate)}</div><MaturityBadge date={p.maturityDate} /></td><td><span className={`ins-policy-status ins-policy-${p.status.toLowerCase()}`}>{p.status}</span></td><td><div className="ins-row-actions">{canEdit && <button className="icon-btn" title="Edit" onClick={() => setModal({ type: 'edit', policy: p })}><Edit3 size={15} /></button>}{canDelete && <button className="icon-btn danger" title="Delete" onClick={() => remove(p)}><Trash2 size={15} /></button>}</div></td></tr>)}</tbody></table></div>}
    </Panel>
    {modal && <PolicyModal policy={modal.policy} onClose={() => setModal(null)} />}
  </div>;
}
