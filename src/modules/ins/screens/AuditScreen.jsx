import { useEffect, useMemo, useState } from 'react';
import { Download, RotateCcw, Search } from 'lucide-react';
import { PageHeader, Panel } from '../../../core/ui';
import { useInsurance } from '../InsContext';
import { formatDateTime } from '../format';
import { exportAuditCsv, listAudit } from '../../../core/audit/store';

export default function AuditScreen(){
  const {actions}=useInsurance(); const [rows,setRows]=useState(()=>listAudit()); const [query,setQuery]=useState(''); const [module,setModule]=useState('ALL'); const [status,setStatus]=useState('ALL');
  useEffect(()=>{const refresh=()=>setRows(listAudit());window.addEventListener('cbc:audit-changed',refresh);return()=>window.removeEventListener('cbc:audit-changed',refresh)},[]);
  const filtered=useMemo(()=>rows.filter((r)=>{const q=query.toLowerCase();return(module==='ALL'||r.moduleCode===module)&&(status==='ALL'||r.status===status)&&(!q||[r.username,r.displayName,r.action,r.detail,r.employeeId].some((v)=>String(v||'').toLowerCase().includes(q)))}),[rows,query,module,status]);
  function reset(){if(window.confirm('Reset all Insurance demo data?'))actions.reset()}
  function download(){const blob=new Blob([exportAuditCsv(filtered)],{type:'text/csv'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='cbc-global-audit.csv';a.click();URL.revokeObjectURL(url)}
  return <div><PageHeader title="Global Audit Log" subtitle="Successful and failed login, logout, module entry, and data changes across every portal module."><button className="btn btn-secondary" onClick={download}><Download size={15}/>Export CSV</button><button className="btn btn-secondary" onClick={reset}><RotateCcw size={15}/>Reset insurance demo</button></PageHeader>
    <Panel padded={false}><div className="ins-filterbar"><label className="ins-search"><Search size={15}/><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="User, action, detail…"/></label><select value={module} onChange={(e)=>setModule(e.target.value)}><option value="ALL">All modules</option>{['auth','ins','vbs','inv','utl','ppr','adm'].map((v)=><option key={v} value={v}>{v.toUpperCase()}</option>)}</select><select value={status} onChange={(e)=>setStatus(e.target.value)}><option value="ALL">All outcomes</option><option value="SUCCESS">Success</option><option value="FAILED">Failed</option></select></div><div className="ins-table-wrap"><table className="ui-table"><thead><tr><th>Timestamp</th><th>Outcome</th><th>Module</th><th>User</th><th>Action</th><th>Detail</th></tr></thead><tbody>{filtered.slice(0,500).map((row)=><tr key={row.auditId}><td>{formatDateTime(row.timestamp)}</td><td><span className={`ins-audit-status ${row.status==='FAILED'?'failed':'success'}`}>{row.status}</span></td><td className="code">{String(row.moduleCode).toUpperCase()}</td><td>{row.displayName||row.username||'Unknown'}<small className="ins-created-by">{row.employeeId||row.email}</small></td><td><span className="code">{row.action}</span></td><td>{row.detail}</td></tr>)}</tbody></table></div></Panel>
  </div>;
}
