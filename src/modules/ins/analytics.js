import { maturityBand } from './format.js';

export function companyRows(policies) {
  const map = new Map();
  for (const policy of policies) {
    const current = map.get(policy.company) ?? { company: policy.company, totalPolicies: 0, expired: 0, within15: 0, totalExposure: 0 };
    current.totalPolicies += 1;
    current.totalExposure += Number(policy.amount) || 0;
    const band = maturityBand(policy.maturityDate).code;
    if (band === 'EXPIRED') current.expired += 1;
    if (band === 'DAYS_0_15') current.within15 += 1;
    map.set(policy.company, current);
  }
  const total = policies.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  return [...map.values()].map((row) => ({ ...row, share: total ? row.totalExposure / total * 100 : 0 })).sort((a, b) => b.totalExposure - a.totalExposure);
}

export function unitRows(policies) {
  const map = new Map();
  for (const policy of policies) {
    const key = policy.unitCode;
    const current = map.get(key) ?? { unitCode: key, unitName: policy.unitName, totalPolicies: 0, expired: 0, within15: 0, totalInsured: 0 };
    current.totalPolicies += 1;
    current.totalInsured += Number(policy.amount) || 0;
    const band = maturityBand(policy.maturityDate).code;
    if (band === 'EXPIRED') current.expired += 1;
    if (band === 'DAYS_0_15') current.within15 += 1;
    map.set(key, current);
  }
  return [...map.values()].map((row) => ({ ...row, risk: row.totalPolicies ? (row.expired + row.within15) / row.totalPolicies * 100 : 0 })).sort((a, b) => b.risk - a.risk);
}
