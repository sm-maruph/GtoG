import { useEffect, useMemo, useState } from 'react';
import { Edit3, Megaphone, Plus, Search, Send, Trash2 } from 'lucide-react';
import { useAuth } from '../../core/auth/AuthContext';
import { FormField, FormGrid, PageHeader, Panel, StatTile } from '../../core/ui';
import Modal from '../../core/ui/Modal';
import { announcementEvent, deleteAnnouncement, listAnnouncements, saveAnnouncement } from './store';
import './ann.css';

const PRIORITIES=['CRITICAL','HIGH','NORMAL','LOW'];
const formatDate=(value)=>value?new Date(value).toLocaleString('en-GB'):'No limit';

export default function AnnModule(){
  const auth=useAuth(); const [rows,setRows]=useState(()=>listAnnouncements()); const [query,setQuery]=useState(''); const [priority,setPriority]=useState('ALL'); const [status,setStatus]=useState('ALL'); const [modal,setModal]=useState(null);
  const canManage=auth.isSuperAdmin||auth.can('ann.announcement.manage');
  useEffect(()=>{const refresh=()=>setRows(listAnnouncements());window.addEventListener(announcementEvent,refresh);return()=>window.removeEventListener(announcementEvent,refresh);},[]);
  const filtered=useMemo(()=>rows.filter((row)=>(priority==='ALL'||row.priority===priority)&&(status==='ALL'||row.status===status)&&(!query||[row.title,row.message,row.createdBy].some((value)=>String(value||'').toLowerCase().includes(query.toLowerCase())))),[rows,query,priority,status]);
  const active=rows.filter((row)=>row.status==='ACTIVE').length;
  return <div className="ann-module"><main className="ann-content">
    <PageHeader title="Announcement Management" subtitle="Create, prioritize, schedule, and publish notices shown across the portal landing page.">{canManage&&<button className="btn btn-primary" onClick={()=>setModal({})}><Plus size={15}/>New announcement</button>}</PageHeader>
    <div className="ui-stat-grid ann-stats"><StatTile label="Total announcements" value={rows.length} icon={Megaphone}/><StatTile label="Published" value={active} icon={Send} tone="approved"/><StatTile label="Critical and high" value={rows.filter((row)=>['CRITICAL','HIGH'].includes(row.priority)&&row.status==='ACTIVE').length} icon={Megaphone} tone="rejected"/></div>
    <Panel padded={false}><div className="ann-filter"><label><Search size={15}/><input value={query} onChange={(event)=>setQuery(event.target.value)} placeholder="Search title, text, or publisher…"/></label><select value={priority} onChange={(event)=>setPriority(event.target.value)}><option value="ALL">All priorities</option>{PRIORITIES.map((value)=><option key={value}>{value}</option>)}</select><select value={status} onChange={(event)=>setStatus(event.target.value)}><option value="ALL">All statuses</option><option>ACTIVE</option><option>DRAFT</option></select></div>
      <div className="ann-list">{filtered.map((row)=><article className={`ann-card priority-${row.priority.toLowerCase()}`} key={row.id}><div className="ann-priority"><i/><span>{row.priority}</span></div><div className="ann-copy"><div><h3>{row.title}</h3><span className={`ann-status ${row.status.toLowerCase()}`}>{row.status}</span></div><p>{row.message}</p><small>Published by {row.updatedBy||row.createdBy} · Updated {formatDate(row.updatedAt)} · Schedule: {formatDate(row.startsAt)} – {formatDate(row.endsAt)}</small></div>{canManage&&<div className="ann-actions"><button onClick={()=>setModal(row)} title="Edit"><Edit3 size={15}/></button><button className="danger" onClick={()=>{if(window.confirm(`Delete “${row.title}”?`))setRows(deleteAnnouncement(row.id,auth.user));}} title="Delete"><Trash2 size={15}/></button></div>}</article>)}{!filtered.length&&<div className="ann-empty">No announcements match the selected filters.</div>}</div>
    </Panel>
    {modal&&<AnnouncementModal row={modal} onClose={()=>setModal(null)} onSave={(payload)=>{try{setRows(saveAnnouncement(payload,auth.user,modal.id));setModal(null);}catch(error){window.alert(error.message);}}}/>}
  </main></div>;
}

function AnnouncementModal({row,onClose,onSave}){
  const [form,setForm]=useState({title:row.title||'',message:row.message||'',priority:row.priority||'NORMAL',status:row.status||'DRAFT',startsAt:row.startsAt||'',endsAt:row.endsAt||''});
  const set=(key,value)=>setForm((current)=>({...current,[key]:value}));
  return <Modal title={row.id?'Edit announcement':'New announcement'} size="lg" onClose={onClose} footer={<><button className="btn btn-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={()=>onSave(form)}><Send size={14}/>Save announcement</button></>}>
    <FormField label="Announcement title" required><input value={form.title} onChange={(event)=>set('title',event.target.value)} placeholder="Short internal title"/></FormField>
    <FormField label="Announcement text" required><textarea rows="4" value={form.message} onChange={(event)=>set('message',event.target.value)} placeholder="Message shown in the landing-page announcement bar"/></FormField>
    <FormGrid columns={2}><FormField label="Priority"><select value={form.priority} onChange={(event)=>set('priority',event.target.value)}>{PRIORITIES.map((value)=><option key={value}>{value}</option>)}</select></FormField><FormField label="Status"><select value={form.status} onChange={(event)=>set('status',event.target.value)}><option>DRAFT</option><option>ACTIVE</option></select></FormField><FormField label="Starts at"><input type="datetime-local" value={form.startsAt} onChange={(event)=>set('startsAt',event.target.value)}/></FormField><FormField label="Ends at"><input type="datetime-local" value={form.endsAt} onChange={(event)=>set('endsAt',event.target.value)}/></FormField></FormGrid>
    <div className={`ann-preview priority-${form.priority.toLowerCase()}`}><strong>Landing-page preview</strong><span>{form.message||'Your announcement text will appear here.'}</span></div>
  </Modal>;
}
