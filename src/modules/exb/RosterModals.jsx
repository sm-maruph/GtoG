import { useState } from 'react';
import Modal from '../../core/ui/Modal';
import { FormField, FormGrid } from '../../core/ui';

export function ReplaceModal({ day, members, onClose, onSave }) {
  const [selected, setSelected] = useState(day.memberIds);
  const [note, setNote] = useState(day.override?.note || '');
  const toggle = (id) => setSelected((rows) => rows.includes(id) ? rows.filter((value) => value !== id) : [...rows, id]);
  return <Modal title={`Change duty — ${day.date}`} size="md" onClose={onClose} footer={<><button className="btn btn-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" disabled={!selected.length} onClick={() => onSave(selected, note)}>Save replacement</button></>}>
    <p className="exb-modal-note">Select the employee(s) who will perform the duty. This manual assignment replaces the automatically generated roster for this date.</p>
    <div className="exb-member-checks">{members.filter((member) => member.active).map((member) => <label key={member.id}><input type="checkbox" checked={selected.includes(member.id)} onChange={() => toggle(member.id)}/><span><strong>{member.name}</strong><small>{member.systemId || 'No System ID'} · {member.designation}</small></span></label>)}</div>
    <FormField label="Reason / note"><textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Leave, unavailable, manual swap…"/></FormField>
  </Modal>;
}

export function MemberModal({ member = {}, onClose, onSave }) {
  const [form, setForm] = useState({ name: member.name || '', systemId: member.systemId || '', designation: member.designation || '', username: member.username || '', group: member.group || 'PARTNER', active: member.active !== false });
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  return <Modal title={`${member.id ? 'Edit' : 'Add'} roster member`} size="md" onClose={onClose} footer={<><button className="btn btn-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={() => onSave(form)}>Save member</button></>}>
    <FormGrid>
      <FormField label="Name" required><input value={form.name} onChange={(event) => set('name', event.target.value)}/></FormField>
      <FormField label="System ID"><input value={form.systemId} placeholder="BD…" onChange={(event) => set('systemId', event.target.value)}/></FormField>
      <FormField label="Designation" required><input value={form.designation} onChange={(event) => set('designation', event.target.value)}/></FormField>
      <FormField label="Portal Username"><input value={form.username} onChange={(event) => set('username', event.target.value)}/></FormField>
      <FormField label="Rotation group"><select value={form.group} onChange={(event) => set('group', event.target.value)}><option value="PRIMARY">Alternating primary</option><option value="PARTNER">Sequential partner</option></select></FormField>
    </FormGrid>
    {member.id && <label className="exb-active-check"><input type="checkbox" checked={form.active} onChange={(event) => set('active', event.target.checked)}/> Active in future rosters</label>}
  </Modal>;
}
