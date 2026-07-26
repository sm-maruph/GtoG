import Modal from '../../../core/ui/Modal';
import { formatDate, formatMoney } from '../format';
import MaturityBadge from './MaturityBadge';

export default function PolicyListModal({ title, subtitle, policies, onClose, onEdit, onFollowUp }) {
  const total = policies.reduce((sum, policy) => sum + Number(policy.amount || 0), 0);
  const hasActions = Boolean(onEdit || onFollowUp);

  return <Modal title={title} size="xl" onClose={onClose} footer={<button className="btn btn-secondary" onClick={onClose}>Close</button>}>
    {subtitle && <p className="ins-modal-sub">{subtitle}</p>}
    <div className="ins-modal-metrics">
      <div><span>Policies</span><strong>{policies.length}</strong></div>
      <div><span>Total exposure</span><strong>{formatMoney(total)}</strong></div>
    </div>
    <div className="ins-table-wrap ins-policy-list-wrap">
      <table className="ui-table ins-policy-list-table">
        <colgroup>
          <col className="ins-col-ac"/><col className="ins-col-client"/><col className="ins-col-unit"/>
          <col className="ins-col-policy"/><col className="ins-col-company"/><col className="ins-col-amount"/>
          <col className="ins-col-maturity"/><col className="ins-col-status"/>
          {hasActions && <col className="ins-col-actions"/>}
        </colgroup>
        <thead><tr>
          <th>AC No</th><th>Borrower / client</th><th>Unit</th><th>Policy No.</th>
          <th>Company</th><th>Amount</th><th>Maturity</th><th>Status</th>
          {hasActions && <th>Actions</th>}
        </tr></thead>
        <tbody>{policies.map((policy) => <tr key={policy.policyId}>
          <td className="code ins-cell-ac">{policy.acNo}</td>
          <td><strong>{policy.borrowerName}</strong><small className="ins-created-by">Created by {policy.createdBy || 'System'}</small></td>
          <td>{policy.unitName}</td>
          <td className="ins-cell-policy">{policy.policyNo || '—'}</td>
          <td>{policy.company}</td>
          <td className="ins-cell-amount">{formatMoney(policy.amount)}</td>
          <td><div className="ins-maturity-cell"><span>{formatDate(policy.maturityDate)}</span><MaturityBadge date={policy.maturityDate}/></div></td>
          <td><span className={`ins-policy-status ins-policy-${String(policy.status).toLowerCase()}`}>{policy.status}</span></td>
          {hasActions && <td><div className="ins-inline-actions">
            {onEdit && <button className="btn btn-secondary btn-small" onClick={() => onEdit(policy)}>Edit</button>}
            {onFollowUp && <button className="btn btn-primary btn-small" onClick={() => onFollowUp(policy)}>Follow-up</button>}
          </div></td>}
        </tr>)}</tbody>
      </table>
    </div>
  </Modal>;
}
