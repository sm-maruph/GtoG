import Modal from '../../../core/ui/Modal';

const monthLabel = (value) => new Intl.DateTimeFormat('en-GB', {
  month: 'long',
  year: 'numeric',
}).format(new Date(`${value}-01T00:00:00`));
const dateTime = (value) => value ? new Date(value).toLocaleString('en-GB') : '—';

export default function EntryDetailsModal({ row, onClose }) {
  return <Modal title={`Paper Usage Entry #${row.entryId}`} size="lg" onClose={onClose} footer={<button className="btn btn-secondary" onClick={onClose}>Close</button>}>
    <div className="ppr-detail-head"><div><strong>{row.paperTypeName}</strong><span>{monthLabel(row.month)}</span></div><span className={`ppr-status ${row.status.toLowerCase()}`}>{row.status}</span></div>
    <DetailSection title="Reporting Scope">
      <Detail label="Branch / Office" value={row.branchName}/>
      <Detail label="Department" value={row.deptName || 'Whole Branch'}/>
      <Detail label="Scope Type" value={String(row.scopeType || '—').replaceAll('_',' ')}/>
      <Detail label="Printer" value={`${row.printerCode} — ${row.printerName}`}/>
    </DetailSection>
    <DetailSection title="Usage and Requisition">
      <Detail label="Starting Page Count" value={row.startingPageCount.toLocaleString()}/>
      <Detail label="Ending Page Count" value={row.endingPageCount.toLocaleString()}/>
      <Detail label="Total Pages Used" value={row.totalPagesUsed.toLocaleString()} emphasis/>
      <Detail label="Paper in Hand" value={`${row.paperInHandQty.toLocaleString()} ${row.paperInHandUnit}`}/>
      <Detail label="Next Month Requisition" value={`${row.requisitionQty.toLocaleString()} ${row.requisitionUnit}`}/>
      <Detail label="Paper Type" value={row.paperTypeName}/>
    </DetailSection>
    <DetailSection title="Record Information">
      <Detail label="Recorded By" value={`${row.recordedByName || '—'}${row.recordedByEmployeeId ? ` · ${row.recordedByEmployeeId}` : ''}`}/>
      <Detail label="Created" value={dateTime(row.createdAt)}/>
      <Detail label="Last Updated" value={dateTime(row.updatedAt)}/>
      <Detail label="Remarks" value={row.remarks || '—'} wide/>
    </DetailSection>
  </Modal>;
}

function DetailSection({ title, children }) {
  return <section className="ppr-detail-section"><h3>{title}</h3><dl className="ppr-detail-grid">{children}</dl></section>;
}
function Detail({ label, value, emphasis=false, wide=false }) {
  return <div className={wide?'wide':''}><dt>{label}</dt><dd className={emphasis?'emphasis':''}>{value}</dd></div>;
}
