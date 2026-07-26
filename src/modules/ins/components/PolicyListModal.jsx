import Modal from '../../../core/ui/Modal';
import { formatDate, formatMoney } from '../format';
import MaturityBadge from './MaturityBadge';

export default function PolicyListModal({ title, subtitle, policies, onClose, onEdit, onFollowUp }) {
  const total = policies.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  return <Modal title={title} size="xl" onClose={onClose} footer={<button className="btn btn-secondary" onClick={onClose}>Close</button>}>
    {subtitle && <p className="ins-modal-sub">{subtitle}</p>}
    <div className="ins-modal-metrics"><div><span>Policies</span><strong>{policies.length}</strong></div><div><span>Total exposure</span><strong>{formatMoney(total)}</strong></div></div>
    <div className="ins-table-wrap"><table className="ui-table"><thead><tr><th>AC No</th><th>Borrower / client</th><th>Unit</th><th>Policy No.</th><th>Company</th><th>Amount</th><th>Maturity</th><th>Status</th>{(onEdit||onFollowUp)&&<th>Actions</th>}</tr></thead><tbody>{policies.map((p)=><tr key={p.policyId}>
      <td className="code">{p.acNo}</td><td><strong>{p.borrowerName}</strong><small className="ins-created-by">Created by {p.createdBy || 'System'}</small></td><td>{p.unitName}</td><td>{p.policyNo||'—'}</td><td>{p.company}</td><td>{formatMoney(p.amount)}</td><td>{formatDate(p.maturityDate)}<MaturityBadge date={p.maturityDate}/></td><td><span className={`ins-policy-status ins-policy-${String(p.status).toLowerCase()}`}>{p.status}</span></td>
      {(onEdit||onFollowUp)&&<td><div className="ins-inline-actions">{onEdit&&<button className="btn btn-secondary btn-small" onClick={()=>onEdit(p)}>Edit</button>}{onFollowUp&&<button className="btn btn-primary btn-small" onClick={()=>onFollowUp(p)}>Follow-up</button>}</div></td>}
    </tr>)}</tbody></table></div>
  </Modal>;
}
