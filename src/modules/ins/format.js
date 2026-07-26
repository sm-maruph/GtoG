export function formatDate(value) {
  if (!value) return '—';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  }).format(date);
}

export function formatDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(date);
}

export function formatMoney(value) {
  const amount = Number(value) || 0;
  return new Intl.NumberFormat('en-BD', {
    style: 'currency', currency: 'BDT', maximumFractionDigits: 0,
  }).format(amount);
}

export function daysToExpiry(value) {
  if (!value) return null;
  const target = new Date(`${value}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (Number.isNaN(target.getTime())) return null;
  return Math.ceil((target - today) / 86400000);
}

export function maturityBand(value) {
  const days = daysToExpiry(value);
  if (days == null) return { code: 'UNKNOWN', label: 'Unknown', tone: 'neutral', days };
  if (days < 0) return { code: 'EXPIRED', label: 'Expired', tone: 'danger', days };
  if (days <= 15) return { code: 'DAYS_0_15', label: '0–15 days', tone: 'danger', days };
  if (days <= 30) return { code: 'DAYS_16_30', label: '16–30 days', tone: 'warning', days };
  if (days <= 60) return { code: 'DAYS_31_60', label: '31–60 days', tone: 'watch', days };
  return { code: 'LONG_TERM', label: 'Long term', tone: 'success', days };
}

export function normaliseText(value) {
  return String(value ?? '').trim().toLowerCase();
}
