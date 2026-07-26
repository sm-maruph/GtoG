import { maturityBand } from '../format';

export default function MaturityBadge({ date }) {
  const band = maturityBand(date);
  const suffix = band.days == null ? '' : band.days < 0 ? ` · ${Math.abs(band.days)}d overdue` : ` · ${band.days}d`;
  return <span className={`ins-badge ins-badge-${band.tone}`}>{band.label}{suffix}</span>;
}
