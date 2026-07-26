import { recordAudit } from '../../core/audit/store';

const STORAGE_KEY='cbc.portal.announcements.v1';
const EVENT_NAME='cbc:announcements-changed';
const PRIORITY_ORDER={CRITICAL:0,HIGH:1,NORMAL:2,LOW:3};
const seed=[{id:1,title:'Portal services available',message:'All operational modules are available.',priority:'NORMAL',status:'ACTIVE',startsAt:'',endsAt:'',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),createdBy:'IT Operations'}];
const clone=(value)=>JSON.parse(JSON.stringify(value));
const load=()=>{try{const rows=JSON.parse(localStorage.getItem(STORAGE_KEY));return Array.isArray(rows)?rows:clone(seed);}catch{return clone(seed);}};
const save=(rows)=>{localStorage.setItem(STORAGE_KEY,JSON.stringify(rows));window.dispatchEvent(new Event(EVENT_NAME));};
const actorName=(actor)=>actor?.displayName||actor?.username||'Portal administrator';
export const announcementEvent=EVENT_NAME;
export const listAnnouncements=()=>load().sort((a,b)=>(PRIORITY_ORDER[a.priority]??9)-(PRIORITY_ORDER[b.priority]??9)||new Date(b.updatedAt)-new Date(a.updatedAt));
export function listPublishedAnnouncements(){
  const now=Date.now();
  return listAnnouncements().filter((row)=>row.status==='ACTIVE'&&(!row.startsAt||new Date(row.startsAt).getTime()<=now)&&(!row.endsAt||new Date(row.endsAt).getTime()>=now));
}
export function saveAnnouncement(payload,actor,id=null){
  const rows=load(); const now=new Date().toISOString();
  const clean={title:String(payload.title||'').trim(),message:String(payload.message||'').trim(),priority:payload.priority||'NORMAL',status:payload.status||'DRAFT',startsAt:payload.startsAt||'',endsAt:payload.endsAt||''};
  if(!clean.title||!clean.message)throw new Error('Title and announcement text are required.');
  if(clean.startsAt&&clean.endsAt&&new Date(clean.endsAt)<new Date(clean.startsAt))throw new Error('End time must be after start time.');
  if(id){
    const row=rows.find((item)=>item.id===id); if(!row)throw new Error('Announcement not found.');
    Object.assign(row,clean,{updatedAt:now,updatedBy:actorName(actor)});
    recordAudit({moduleCode:'ann',action:'ANNOUNCEMENT_UPDATE',detail:`Updated ${row.priority.toLowerCase()} priority announcement: ${row.title}`,actor});
  }else{
    const next=Math.max(0,...rows.map((item)=>Number(item.id)||0))+1;
    rows.push({...clean,id:next,createdAt:now,updatedAt:now,createdBy:actorName(actor),updatedBy:actorName(actor)});
    recordAudit({moduleCode:'ann',action:'ANNOUNCEMENT_CREATE',detail:`Created ${clean.priority.toLowerCase()} priority announcement: ${clean.title}`,actor});
  }
  save(rows); return listAnnouncements();
}
export function deleteAnnouncement(id,actor){
  const rows=load(); const row=rows.find((item)=>item.id===id); if(!row)return listAnnouncements();
  save(rows.filter((item)=>item.id!==id));
  recordAudit({moduleCode:'ann',action:'ANNOUNCEMENT_DELETE',detail:`Deleted announcement: ${row.title}`,actor});
  return listAnnouncements();
}
