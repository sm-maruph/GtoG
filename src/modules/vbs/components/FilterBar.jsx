/**
 * FilterBar — search box + trip-date range + sort, used across the request
 * lists. Controlled by the parent; emits a single `filters` object on change so
 * the caller can pass it straight to listRequests({ ...filters }).
 */

import { Search, X } from 'lucide-react';
import './filterbar.css';

const SORTS = [
  { value: 'submitted_desc', label: 'Newest first' },
  { value: 'submitted_asc', label: 'Oldest first' },
  { value: 'trip_asc', label: 'Trip date ↑' },
  { value: 'trip_desc', label: 'Trip date ↓' },
  { value: 'status', label: 'Status' },
];

export default function FilterBar({ value, onChange, showSort = true }) {
  const set = (patch) => onChange({ ...value, ...patch });
  const hasFilters = value.q || value.from || value.to;

  return (
    <div className="fb">
      <div className="fb-search">
        <Search size={15} aria-hidden="true" />
        <input
          type="search"
          placeholder="Search booking, employee, destination…"
          value={value.q ?? ''}
          onChange={(e) => set({ q: e.target.value })}
        />
      </div>

      <div className="fb-dates">
        <label>From
          <input type="date" value={value.from ?? ''} onChange={(e) => set({ from: e.target.value })} />
        </label>
        <label>To
          <input type="date" value={value.to ?? ''} onChange={(e) => set({ to: e.target.value })} />
        </label>
      </div>

      {showSort && (
        <label className="fb-sort">Sort
          <select value={value.sort ?? 'submitted_desc'} onChange={(e) => set({ sort: e.target.value })}>
            {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </label>
      )}

      {hasFilters && (
        <button className="fb-clear" onClick={() => onChange({ sort: value.sort })}>
          <X size={13} aria-hidden="true" /> Clear
        </button>
      )}
    </div>
  );
}