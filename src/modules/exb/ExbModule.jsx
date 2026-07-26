import { useEffect, useState } from 'react';
import { CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock3, Download, Edit3, Headphones, Plus, RefreshCw, Search, Trash2, UsersRound } from 'lucide-react';
import { useAuth } from '../../core/auth/AuthContext';
import { PageHeader, Panel, StatTile } from '../../core/ui';
import Modal from '../../core/ui/Modal';
import { addMember, completeDuty, dateKey, generateMonth, loadRosterState, matchesActor, monthKey, monthLabel, parseMonth, removeMember, replaceDuty, rollingTwelveMonths, setSupportAvailability, updateMember } from './store';
import { MemberModal, ReplaceModal } from './RosterModals';
import './exb.css';

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MEMBER_COLORS = ['#2563eb','#0891b2','#d97706','#7c3aed','#db2777','#059669','#dc2626','#4f46e5','#0d9488','#c2410c','#9333ea','#be123c'];
const memberColor = (member) => MEMBER_COLORS[(Math.max(1,Number(member.id)||1)-1)%MEMBER_COLORS.length];
const todayKey = () => dateKey(new Date());
const time = (value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export default function ExbModule() {
  const auth = useAuth();
  const [, setVersion] = useState(0);
  const [month, setMonth] = useState(() => monthKey());
  const [tab, setTab] = useState('calendar');
  const [replacement, setReplacement] = useState(null);
  const [memberModal, setMemberModal] = useState(null);
  const state = loadRosterState();
  const days = generateMonth(month);
  const canManage = auth.isSuperAdmin || auth.can('exb.roster.manage');
  const canComplete = canManage || auth.can('exb.roster.complete');
  const canReport = canManage || auth.can('exb.report.view');
  const isItUser = auth.user?.dept?.code === 'IT' || /information technology/i.test(auth.user?.dept?.name || '');
  const currentUserMember = state.members.find((member) => matchesActor(member, auth.user));
  const today = todayKey();
  const todayDuty = generateMonth(today.slice(0, 7)).find((day) => day.date === today);
  const myDays = currentUserMember ? days.filter((day) => day.memberIds.includes(currentUserMember.id)).length : 0;
  const completed = days.reduce((sum, day) => sum + day.completions.length, 0);

  useEffect(() => {
    const refresh = () => setVersion((value) => value + 1);
    window.addEventListener('cbc:eximbill-roster-changed', refresh);
    return () => window.removeEventListener('cbc:eximbill-roster-changed', refresh);
  }, []);

  const moveMonth = (offset) => {
    const date = parseMonth(month);
    setMonth(monthKey(new Date(date.getFullYear(), date.getMonth() + offset, 1)));
  };
  const record = (day, member) => {
    try {
      completeDuty(day.date, member.id, auth.user);
    } catch (error) { window.alert(error.message); }
  };

  return <div className="exb-module"><main className="exb-content">
    <PageHeader title="IT EximBill Process Roster Duty" subtitle="Daily EximBill processing duty, departures, replacements, and monthly reporting—including holidays.">
      {isItUser && <button
        className={`exb-support-switch ${state.supportAvailable ? 'is-online' : 'is-offline'}`}
        type="button"
        onClick={() => setSupportAvailability(!state.supportAvailable, auth.user)}
        aria-pressed={state.supportAvailable}
        title="Change the availability shown on the landing-page IT support icon"
      >
        <Headphones size={15}/><i/><span>IT support {state.supportAvailable ? 'online' : 'offline'}</span>
      </button>}
      {canManage && <button className="btn btn-primary" onClick={() => setMemberModal({})}><Plus size={15}/>Add roster member</button>}
    </PageHeader>
    <div className="exb-tabs">
      <button className={tab === 'calendar' ? 'active' : ''} onClick={() => setTab('calendar')}><CalendarDays size={15}/>Duty calendar</button>
      <button className={tab === 'departures' ? 'active' : ''} onClick={() => setTab('departures')}><Clock3 size={15}/>Departure log</button>
      {canReport && <button className={tab === 'reports' ? 'active' : ''} onClick={() => setTab('reports')}><Clock3 size={15}/>Custom reports</button>}
      {canManage && <button className={tab === 'team' ? 'active' : ''} onClick={() => setTab('team')}><UsersRound size={15}/>Roster team</button>}
    </div>
    <TodayDuty day={todayDuty} currentUserMember={currentUserMember} canManage={canManage} canComplete={canComplete} onRecord={record}/>

    {tab === 'calendar' && <>
      <div className="ui-stat-grid exb-stats">
        <StatTile label="Roster members" value={state.members.filter((member) => member.active).length} icon={UsersRound}/>
        <StatTile label="My duties this month" value={myDays} icon={CalendarDays} tone="pending"/>
        <StatTile label="Recorded departures" value={completed} icon={CheckCircle2} tone="approved"/>
      </div>
      <Panel padded={false}>
        <div className="exb-month-head">
          <button onClick={() => moveMonth(-1)} title="Previous month"><ChevronLeft size={18}/></button>
          <div><strong>{monthLabel(month)}</strong><span>Automatic daily rotation · Fridays, Saturdays, and holidays included</span></div>
          <button onClick={() => moveMonth(1)} title="Next month"><ChevronRight size={18}/></button>
        </div>
        <RosterCalendar days={days} month={month} rosterMembers={state.members.filter((member)=>member.active)} currentUserMember={currentUserMember} canManage={canManage} canComplete={canComplete} onReplace={setReplacement} onRecord={record}/>
      </Panel>
    </>}

    {tab === 'departures' && <DepartureLog/>}
    {tab === 'reports' && canReport && <Reports state={state}/>}
    {tab === 'team' && canManage && <Team state={state} onEdit={setMemberModal} onRemove={(member) => {
      if (window.confirm(`Remove ${member.name} from future roster generation?`)) removeMember(member.id, auth.user);
    }}/>}

    {replacement && <ReplaceModal day={replacement} members={state.members} onClose={() => setReplacement(null)} onSave={(memberIds, note) => {
      try { replaceDuty(replacement.date, memberIds, note, auth.user); setReplacement(null); } catch (error) { window.alert(error.message); }
    }}/>}
    {memberModal && <MemberModal member={memberModal} onClose={() => setMemberModal(null)} onSave={(payload) => {
      try {
        if (memberModal.id) updateMember(memberModal.id, payload, auth.user);
        else addMember(payload, auth.user);
        setMemberModal(null);
      } catch (error) { window.alert(error.message); }
    }}/>}
  </main></div>;
}

function TodayDuty({ day, currentUserMember, canManage, canComplete, onRecord }) {
  if (!day) return null;
  return <section className="exb-today-duty">
    <div className="exb-today-title"><span><CalendarDays size={20}/></span><div><small>Today’s Duty Officers</small><strong>{new Date(`${day.date}T00:00:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</strong></div></div>
    <div className="exb-today-officers">{day.members.map((member) => {
      const completion = day.completions.find((item) => item.memberId === member.id);
      const own = currentUserMember?.id === member.id;
      const canEnd = canComplete && own && !completion;
      return <div className={`${own ? 'own' : ''}${completion ? ' completed' : ''}`} key={member.id}><div><strong>{member.name}</strong><span>{member.designation}{member.systemId ? ` · ${member.systemId}` : ''}</span></div>{completion ? <b><CheckCircle2 size={14}/>Departed at {time(completion.completedAt)}</b> : canEnd ? <button onClick={() => onRecord(day, member)}>End duty now</button> : <em>Duty in progress</em>}</div>;
    })}</div>
  </section>;
}

function RosterCalendar({ days, month, rosterMembers, currentUserMember, canManage, canComplete, onReplace, onRecord }) {
  const [selectedDay,setSelectedDay]=useState(null);
  const alphabeticalMembers=[...rosterMembers].sort((a,b)=>a.name.localeCompare(b.name));
  const firstDay = parseMonth(month).getDay();
  const cells = [...Array(firstDay).fill(null), ...days];
  const today = todayKey();
  return <><div className="exb-member-color-key" aria-label="Roster employee color key">{alphabeticalMembers.map((member)=><span key={member.id} style={{'--member-color':memberColor(member)}}><i/>{member.name}</span>)}</div><div className="exb-calendar">
    {DAY_NAMES.map((name) => <div className="exb-weekday" key={name}>{name}</div>)}
    {cells.map((day, index) => !day ? <div className="exb-day empty" key={`empty-${index}`}/> : <article className={`exb-day exb-day-clickable${day.isWeekend ? ' weekend' : ''}${day.date < today ? ' past' : ''}${day.date === today ? ' today' : ''}${currentUserMember && day.memberIds.includes(currentUserMember.id) ? ' mine' : ''}`} key={day.date} role="button" tabIndex="0" aria-label={`View duty details for ${day.date}`} onClick={(event)=>{if(!event.target.closest('button'))setSelectedDay(day);}} onKeyDown={(event)=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();setSelectedDay(day);}}}>
      <header><strong>{day.day}</strong><span>{day.isWeekend ? 'Holiday duty' : 'Working day'}</span>{day.date === today && <mark className="exb-today-inline">Today</mark>}{day.override && <em>Changed</em>}{canManage && <button className="exb-change" onClick={(event) => {event.stopPropagation();onReplace(day);}}><RefreshCw size={11}/>Change</button>}</header>
      <div className="exb-assignments">{day.members.map((member) => {
        const completion = day.completions.find((item) => item.memberId === member.id);
        const own = currentUserMember?.id === member.id;
        const recordable = canComplete && day.date === today && own && !completion;
        const otherCompleted = day.completions.length > 0 && !completion;
        return <div className={`${own ? 'own' : ''}${completion ? ' completed' : ''}`} style={{'--member-color':memberColor(member)}} key={member.id}><span>{member.name}</span><small>{member.designation}</small>{completion ? <b><CheckCircle2 size={12}/>Departed {time(completion.completedAt)}</b> : recordable ? <button onClick={() => onRecord(day, member)}>End my duty</button> : otherCompleted ? <i>Awaiting this officer’s departure</i> : <i>Duty pending</i>}</div>;
      })}</div>
    </article>)}
  </div>{selectedDay&&<DayDetailModal day={selectedDay} onClose={()=>setSelectedDay(null)}/>}</>;
}

function DayDetailModal({day,onClose}){
  const label=new Date(`${day.date}T00:00:00`).toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  return <Modal title="Daily roster details" size="md" onClose={onClose} footer={<button className="btn btn-primary" onClick={onClose}>Close</button>}>
    <div className="exb-day-detail-head"><span><CalendarDays size={20}/></span><div><strong>{label}</strong><small>{day.isWeekend?'Holiday duty':'Working day'}{day.override?' · Manually changed':' · Automatic rotation'}</small></div></div>
    {day.override?.note&&<div className="exb-day-detail-note"><strong>Change reason</strong><span>{day.override.note}</span></div>}
    <div className="exb-day-detail-list">{day.members.map((member)=>{
      const completion=day.completions.find((item)=>item.memberId===member.id);
      return <section className={completion?'completed':''} style={{'--member-color':memberColor(member)}} key={member.id}>
        <div className="exb-day-detail-person"><span>{member.name.split(/\s+/).slice(0,2).map((part)=>part[0]).join('').toUpperCase()}</span><div><strong>{member.name}</strong><small>{member.designation}</small></div></div>
        <dl><div><dt>System ID</dt><dd>{member.systemId||'Not provided'}</dd></div><div><dt>Status</dt><dd>{completion?'Duty completed':'Duty pending'}</dd></div><div><dt>Departure</dt><dd>{completion?time(completion.completedAt):'Not recorded'}</dd></div></dl>
      </section>;
    })}</div>
  </Modal>;
}

function Team({ state, onEdit, onRemove }) {
  return <Panel title={`Roster Team (${state.members.filter((member) => member.active).length} active)`} padded={false}><div className="exb-table-wrap"><table className="ui-table">
    <thead><tr><th>Name</th><th>System ID</th><th>Designation</th><th>Portal Username</th><th>Rotation</th><th>Status</th><th>Actions</th></tr></thead>
    <tbody>{state.members.map((member) => <tr key={member.id}><td><strong>{member.name}</strong></td><td className="code">{member.systemId || '—'}</td><td>{member.designation}</td><td className="code">{member.username || '—'}</td><td>{member.group === 'PRIMARY' ? 'Alternating primary' : 'Sequential partner'}</td><td><span className={`exb-status ${member.active ? 'active' : 'inactive'}`}>{member.active ? 'Active' : 'Removed'}</span></td><td><div className="exb-row-actions"><button onClick={() => onEdit(member)}><Edit3 size={14}/></button>{member.active && <button className="danger" onClick={() => onRemove(member)}><Trash2 size={14}/></button>}</div></td></tr>)}</tbody>
  </table></div></Panel>;
}

function DepartureLog() {
  const months = rollingTwelveMonths();
  const [selected, setSelected] = useState(months.at(-1));
  const [query, setQuery] = useState('');
  const [detailDay, setDetailDay] = useState(null);
  const days = generateMonth(selected);
  const firstDay = parseMonth(selected).getDay();
  const cells = [...Array(firstDay).fill(null), ...days];
  const visible = (member, day) => !query || [member.name, member.systemId, day.date].some((value) => String(value || '').toLowerCase().includes(query.toLowerCase()));
  const move = (offset) => {
    const date = parseMonth(selected);
    setSelected(monthKey(new Date(date.getFullYear(), date.getMonth() + offset, 1)));
  };

  return <Panel padded={false}>
    <div className="exb-month-head"><button onClick={() => move(-1)}><ChevronLeft size={18}/></button><div><strong>Departure Log — {monthLabel(selected)}</strong><span>Daily officer departure records in calendar view</span></div><button onClick={() => move(1)}><ChevronRight size={18}/></button></div>
    <div className="exb-log-filters"><label><Search size={15}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search officer, System ID, or date…"/></label><select value={selected} onChange={(event) => setSelected(event.target.value)}>{months.map((value) => <option key={value} value={value}>{monthLabel(value)}</option>)}</select></div>
    <div className="exb-departure-calendar">
      {DAY_NAMES.map((name) => <div className="exb-weekday" key={name}>{name}</div>)}
      {cells.map((day, index) => !day ? <div className="exb-departure-day empty" key={`departure-empty-${index}`}/> : <article className={`exb-departure-day exb-departure-clickable${day.date === todayKey() ? ' today' : ''}${day.isWeekend ? ' weekend' : ''}`} key={day.date} role="button" tabIndex="0" aria-label={`View departure details for ${day.date}`} onClick={()=>setDetailDay(day)} onKeyDown={(event)=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();setDetailDay(day);}}}>
        <header><strong>{day.day}</strong><span>{day.override ? 'Manual roster' : day.isWeekend ? 'Holiday duty' : 'Regular duty'}</span></header>
        <div>{day.members.filter((member) => visible(member, day)).map((member) => {
          const completion = day.completions.find((item) => item.memberId === member.id);
          return <section className={completion ? 'departed' : 'pending'} key={member.id}><strong>{member.name}</strong><small>{member.systemId || member.designation}</small>{completion ? <b><CheckCircle2 size={12}/>{time(completion.completedAt)}</b> : <em>Not recorded</em>}</section>;
        })}</div>
      </article>)}
    </div>
    {detailDay&&<DayDetailModal day={detailDay} onClose={()=>setDetailDay(null)}/>}
  </Panel>;
}

function Reports({ state }) {
  const months = rollingTwelveMonths();
  const [endMonth, setEndMonth] = useState(months.at(-1));
  const [period, setPeriod] = useState(1);
  const endDate = parseMonth(endMonth);
  const selectedMonths = Array.from({ length: period }, (_, offset) => monthKey(new Date(endDate.getFullYear(), endDate.getMonth() - period + 1 + offset, 1)));
  const allDays = selectedMonths.flatMap((value) => generateMonth(value));
  const dailyRows = allDays.flatMap((day) => day.members.map((member) => {
    const completion = day.completions.find((item) => item.memberId === member.id);
    const partner = day.members.filter((item) => item.id !== member.id).map((item) => item.name).join(', ');
    return { date: day.date, member, partner, completion, changed: Boolean(day.override) };
  }));
  const summaryRows = state.members.map((member) => {
    const assigned = dailyRows.filter((row) => row.member.id === member.id);
    return { member, assigned: assigned.length, completed: assigned.filter((row) => row.completion).length };
  }).filter((row) => row.assigned);
  const download = () => {
    const csv = ['Date,Officer,System ID,Designation,Duty Partner,Status,Departure Time,Roster Type'];
    dailyRows.forEach((row) => csv.push(`${row.date},"${row.member.name}",${row.member.systemId},"${row.member.designation}","${row.partner}",${row.completion ? 'Completed' : 'Pending'},"${row.completion ? time(row.completion.completedAt) : ''}",${row.changed ? 'Manual' : 'Automatic'}`));
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob); const anchor = document.createElement('a');
    anchor.href = url; anchor.download = `eximbill-roster-${period}-month-ending-${endMonth}.csv`; anchor.click(); URL.revokeObjectURL(url);
  };
  return <>
    <Panel><div className="exb-report-head"><div className="exb-report-controls"><label>Period<select value={period} onChange={(event) => setPeriod(Number(event.target.value))}><option value="1">1 month</option><option value="3">3 months</option><option value="6">6 months</option><option value="12">12 months</option></select></label><label>Ending month<select value={endMonth} onChange={(event) => setEndMonth(event.target.value)}>{months.map((value) => <option key={value} value={value}>{monthLabel(value)}</option>)}</select></label></div><button className="btn btn-primary" onClick={download}><Download size={14}/>Export daily CSV</button></div></Panel>
    <Panel title={`${period}-month duty summary`} padded={false}><div className="exb-table-wrap"><table className="ui-table"><thead><tr><th>Employee</th><th>System ID</th><th>Designation</th><th>Assigned Days</th><th>Completed</th><th>Pending</th></tr></thead><tbody>{summaryRows.map((row) => <tr key={row.member.id}><td><strong>{row.member.name}</strong></td><td className="code">{row.member.systemId || '—'}</td><td>{row.member.designation}</td><td>{row.assigned}</td><td>{row.completed}</td><td>{row.assigned - row.completed}</td></tr>)}</tbody></table></div></Panel>
    <Panel title="Each-day duty and departure data" padded={false}><div className="exb-table-wrap"><table className="ui-table"><thead><tr><th>Date</th><th>Officer</th><th>System ID</th><th>Duty Partner</th><th>Status</th><th>Departure Time</th><th>Roster</th></tr></thead><tbody>{dailyRows.map((row) => <tr key={`${row.date}-${row.member.id}`}><td className="code">{row.date}</td><td><strong>{row.member.name}</strong><small>{row.member.designation}</small></td><td className="code">{row.member.systemId || '—'}</td><td>{row.partner}</td><td><span className={`exb-status ${row.completion ? 'active' : 'pending'}`}>{row.completion ? 'Completed' : 'Pending'}</span></td><td>{row.completion ? time(row.completion.completedAt) : '—'}</td><td>{row.changed ? 'Manual change' : 'Automatic'}</td></tr>)}</tbody></table></div></Panel>
  </>;
}
