import { useEffect, useMemo, useState } from 'react';
import Modal from '../../../core/ui/Modal';
import { FormField, FormGrid } from '../../../core/ui';
import { useInsurance } from '../InsContext';

const COMPANIES = [
  'Green Delta Insurance PLC', 'Pioneer Insurance Company Ltd.',
  'Pragati Insurance PLC', 'Reliance Insurance Limited',
  'City General Insurance Company Limited',
];

export default function PolicyModal({ policy, onClose }) {
  const { units, isAdmin, unitCode, unitName, actions } = useInsurance();
  const initial = useMemo(() => ({
    acNo: policy?.acNo ?? '', borrowerName: policy?.borrowerName ?? '',
    unitCode: policy?.unitCode ?? unitCode, unitName: policy?.unitName ?? unitName,
    policyNo: policy?.policyNo ?? '', company: policy?.company ?? '',
    amount: policy?.amount ?? '', maturityDate: policy?.maturityDate ?? '',
    status: policy?.status ?? 'Active',
  }), [policy, unitCode, unitName]);
  const [form, setForm] = useState(initial);
  const [error, setError] = useState('');

  useEffect(() => setForm(initial), [initial]);

  function setField(name, value) {
    setForm((old) => ({ ...old, [name]: value }));
  }

  function chooseUnit(code) {
    const unit = units.find((u) => u.code === code);
    setForm((old) => ({ ...old, unitCode: code, unitName: unit?.name ?? code }));
  }

  function submit(e) {
    e.preventDefault();
    setError('');
    if (!form.acNo.trim() || !form.borrowerName.trim() || !form.unitCode || !form.company.trim() || !form.amount || !form.maturityDate) {
      setError('Complete all required fields.');
      return;
    }
    if (Number(form.amount) <= 0) {
      setError('Insurance amount must be greater than zero.');
      return;
    }
    try {
      if (policy) actions.updatePolicy(policy.policyId, form);
      else actions.addPolicy(form);
      onClose();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Modal
      title={policy ? `Edit ${policy.acNo}` : 'Add Insurance Policy'}
      size="lg"
      onClose={onClose}
      footer={<><button className="btn btn-secondary" onClick={onClose}>Cancel</button><button className="btn btn-primary" form="ins-policy-form" type="submit">{policy ? 'Save Changes' : 'Add Policy'}</button></>}
    >
      <form id="ins-policy-form" onSubmit={submit}>
        {error && <div className="alert-error">{error}</div>}
        <FormGrid>
          <FormField label="AC No" required hint={policy ? 'Primary key cannot be changed.' : 'Must be unique.'}>
            <input value={form.acNo} disabled={Boolean(policy)} onChange={(e) => setField('acNo', e.target.value)} placeholder="CBC-2026-001" />
          </FormField>
          <FormField label="Borrower Name" required>
            <input value={form.borrowerName} onChange={(e) => setField('borrowerName', e.target.value)} />
          </FormField>
          <FormField label="Unit" required>
            <select value={form.unitCode} disabled={!isAdmin} onChange={(e) => chooseUnit(e.target.value)}>
              <option value="">Select unit</option>
              {units.map((u) => <option key={u.code} value={u.code}>{u.name}</option>)}
            </select>
          </FormField>
          <FormField label="Insurance Policy No.">
            <input value={form.policyNo} onChange={(e) => setField('policyNo', e.target.value)} />
          </FormField>
          <FormField label="Insurance Company" required>
            <input list="ins-company-list" value={form.company} onChange={(e) => setField('company', e.target.value)} />
            <datalist id="ins-company-list">{COMPANIES.map((c) => <option key={c} value={c} />)}</datalist>
          </FormField>
          <FormField label="Insurance Amount (BDT)" required>
            <input type="number" min="1" value={form.amount} onChange={(e) => setField('amount', e.target.value)} />
          </FormField>
          <FormField label="Maturity / Expiry Date" required>
            <input type="date" value={form.maturityDate} onChange={(e) => setField('maturityDate', e.target.value)} />
          </FormField>
          <FormField label="Policy Status" required>
            <select value={form.status} onChange={(e) => setField('status', e.target.value)}>
              {['Active', 'Inactive', 'Expired', 'Renewed'].map((s) => <option key={s}>{s}</option>)}
            </select>
          </FormField>
        </FormGrid>
      </form>
    </Modal>
  );
}
