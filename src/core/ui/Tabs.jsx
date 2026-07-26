/**
 * Tabs — reusable tab bar. Controlled: parent owns the active value. Each tab
 * may carry a count badge (e.g. the live Pending count). Module-agnostic.
 */

import './tabs.css';

export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="ui-tabs" role="tablist">
      {tabs.map((t) => (
        <button
          key={t.value}
          role="tab"
          aria-selected={active === t.value}
          className={`ui-tab ${active === t.value ? 'is-active' : ''}`}
          onClick={() => onChange(t.value)}
        >
          {t.label}
          {typeof t.count === 'number' && (
            <span className={`ui-tab-count ${t.tone ? `ui-tab-count-${t.tone}` : ''}`}>{t.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}