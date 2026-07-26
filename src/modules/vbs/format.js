/**
 * VBS formatting helpers. Small, pure, shared across VBS components so date and
 * slot rendering is identical everywhere.
 */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** '2026-07-20' -> '20 Jul 2026' */
export function formatDate(isoDate) {
  if (!isoDate) return '\u2014';
  const [y, m, d] = isoDate.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

/** '09:00','11:00' -> '09:00 – 11:00' */
export function formatSlot(start, end) {
  if (!start || !end) return '\u2014';
  return `${start} \u2013 ${end}`;
}

/** ISO timestamp -> '16 Jul 2026, 14:32' */
export function formatDateTime(iso) {
  if (!iso) return '\u2014';
  const dt = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${dt.getDate()} ${MONTHS[dt.getMonth()]} ${dt.getFullYear()}, ${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
}
