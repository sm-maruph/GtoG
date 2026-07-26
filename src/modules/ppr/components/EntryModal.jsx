import { useEffect, useMemo, useState } from 'react';
import Modal from '../../../core/ui/Modal';
import { FormField, FormGrid } from '../../../core/ui';
import { usePaper } from '../PprContext';
import { useAuth } from '../../../core/auth/AuthContext';

function currentMonth() { return new Date().toISOString().slice(0, 7); }

export default function EntryModal({ row = null, onClose }) {
  const { state, directory, actions } = usePaper();
  const auth = useAuth();
  const canGlobal = auth.isSuperAdmin || auth.scopeOf('ppr.entry.create')?.scopeType === 'GLOBAL';
  const defaultBranch = row?.branchId || auth.user?.branch?.branchId || directory.branches[0]?.branchId;
  const defaultDept = row?.deptId || auth.user?.dept?.deptId || '';
  const [form, setForm] = useState({
    month: row?.month || currentMonth(), scopeType: row?.scopeType || (defaultDept ? 'HEAD_OFFICE_DEPARTMENT' : 'WHOLE_BRANCH'),
    branchId: defaultBranch, deptId: defaultDept, printerId: row?.printerId || '', paperTypeId: row?.paperTypeId || '',
    startingPageCount: row?.startingPageCount ?? '', endingPageCount: row?.endingPageCount ?? '', totalPagesUsed: row?.totalPagesUsed ?? '',
    paperInHandQty: row?.paperInHandQty ?? '', paperInHandUnit: row?.paperInHandUnit || 'Rim',
    requisitionQty: row?.requisitionQty ?? '', requisitionUnit: row?.requisitionUnit || 'Rim', remarks: row?.remarks || '', status: row?.status || 'SUBMITTED',
  });
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const departments = useMemo(() => directory.departments.filter((d) => d.branchId === Number(form.branchId) && d.status === 'ACTIVE'), [directory.departments, form.branchId]);
  const printers = useMemo(() => state.printers.filter((p) => p.status === 'ACTIVE' && (!form.branchId || p.branchId === Number(form.branchId)) && (form.scopeType === 'WHOLE_BRANCH' || !form.deptId || p.deptId === Number(form.deptId))), [state.printers, form.branchId, form.deptId, form.scopeType]);
  useEffect(() => {
    if (!row && printers.length && !printers.some((p) => p.printerId === Number(form.printerId))) set('printerId', printers[0].printerId);
  }, [printers, form.printerId, row]);
  useEffect(() => {
    if (!row && !form.paperTypeId && state.paperTypes.length) set('paperTypeId', state.paperTypes.find((p) => p.status === 'ACTIVE')?.paperTypeId || '');
  }, [state.paperTypes, form.paperTypeId, row]);
  function calculate() {
    const start = Number(form.startingPageCount || 0); const end = Number(form.endingPageCount || 0);
    if (end >= start) set('totalPagesUsed', end - start);
  }
  function submit() {
    try {
      if (!form.month || !form.printerId || !form.paperTypeId) throw new Error('Month, printer, and paper type are required.');
      if (row) actions.updateEntry(row.entryId, form); else actions.addEntry(form);
      onClose();
    } catch (error) { window.alert(error.message); }
  }
  return <Modal title={`${row ? 'Edit' : 'Add'} Paper Usage Entry`} size="xl" onClose={onClose} footer={<><button className="btn btn-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" onClick={submit}>{row ? 'Save changes' : 'Save entry'}</button></>}>
    <div className="ppr-modal-section"><h3>Reporting Scope</h3><FormGrid>
      <FormField label="Month" required><input type="month" value={form.month} onChange={(e) => set('month', e.target.value)}/></FormField>
      <FormField label="Scope Type"><select value={form.scopeType} onChange={(e) => { set('scopeType', e.target.value); if (e.target.value === 'WHOLE_BRANCH') set('deptId', ''); }}><option value="HEAD_OFFICE_DEPARTMENT">Head Office Department</option><option value="BRANCH_DEPARTMENT">Branch Department</option><option value="WHOLE_BRANCH">Whole Branch</option></select></FormField>
      <FormField label="Branch / Office" required><select disabled={!canGlobal} value={form.branchId} onChange={(e) => { set('branchId', e.target.value); set('deptId', ''); set('printerId', ''); }}>{directory.branches.filter((b) => b.status === 'ACTIVE').map((b) => <option key={b.branchId} value={b.branchId}>{b.name}</option>)}</select></FormField>
      {form.scopeType !== 'WHOLE_BRANCH' && <FormField label="Department" required><select disabled={!canGlobal && Boolean(auth.user?.dept)} value={form.deptId} onChange={(e) => { set('deptId', e.target.value); set('printerId', ''); }}><option value="">Select department</option>{departments.map((d) => <option key={d.deptId} value={d.deptId}>{d.name}</option>)}</select></FormField>}
      <FormField label="Printer" required><select value={form.printerId} onChange={(e) => set('printerId', e.target.value)}><option value="">Select printer</option>{printers.map((p) => <option key={p.printerId} value={p.printerId}>{p.code} — {p.name}</option>)}</select></FormField>
      <FormField label="Paper Type" required><select value={form.paperTypeId} onChange={(e) => set('paperTypeId', e.target.value)}><option value="">Select paper</option>{state.paperTypes.filter((p) => p.status === 'ACTIVE').map((p) => <option key={p.paperTypeId} value={p.paperTypeId}>{p.name}</option>)}</select></FormField>
    </FormGrid></div>
    <div className="ppr-modal-section"><h3>Printer Counter</h3><FormGrid>
      <FormField label="Starting Page Count" required><input type="number" min="0" value={form.startingPageCount} onChange={(e) => set('startingPageCount', e.target.value)}/></FormField>
      <FormField label="Ending Page Count" required><input type="number" min="0" value={form.endingPageCount} onChange={(e) => set('endingPageCount', e.target.value)} onBlur={calculate}/></FormField>
      <FormField label="Total Pages Used" required hint="Use Calculate, then adjust if the printer counter was reset."><div className="ppr-total-control"><input type="number" min="0" value={form.totalPagesUsed} onChange={(e) => set('totalPagesUsed', e.target.value)}/><button type="button" className="btn btn-ghost" onClick={calculate}>Calculate</button></div></FormField>
      <FormField label="Status"><select value={form.status} onChange={(e) => set('status', e.target.value)}><option>DRAFT</option><option>SUBMITTED</option><option>VERIFIED</option></select></FormField>
    </FormGrid></div>
    <div className="ppr-modal-section"><h3>Paper Balance and Next Requisition</h3><FormGrid>
      <FormField label="Paper in Hand"><div className="ppr-qty-unit"><input type="number" min="0" step="0.01" value={form.paperInHandQty} onChange={(e) => set('paperInHandQty', e.target.value)}/><select value={form.paperInHandUnit} onChange={(e) => set('paperInHandUnit', e.target.value)}><option>Rim</option><option>Sheet</option><option>Box</option></select></div></FormField>
      <FormField label="Requisition for Next Month"><div className="ppr-qty-unit"><input type="number" min="0" step="0.01" value={form.requisitionQty} onChange={(e) => set('requisitionQty', e.target.value)}/><select value={form.requisitionUnit} onChange={(e) => set('requisitionUnit', e.target.value)}><option>Rim</option><option>Sheet</option><option>Box</option></select></div></FormField>
    </FormGrid><FormField label="Remarks"><textarea value={form.remarks} onChange={(e) => set('remarks', e.target.value)} placeholder="Toner replacement, year-end statement requirement, saved rough pages, or other explanation…"/></FormField></div>
  </Modal>;
}
