/**
 * SHARED UI PRIMITIVES
 * ---------------------------------------------------------------------------
 * Small, prop-driven, module-agnostic. Every module composes its dashboard from
 * these instead of re-styling the same card/header/stat five times. If a piece
 * of UI would look identical in Inventory and in VBS, it belongs here.
 *
 * Nothing in this file knows about a specific module, permission, or API shape.
 * That is what makes it reusable — keep it that way.
 */

import './ui.css';

/* ---- PageHeader: title + optional subtitle + right-aligned actions -------- */
export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="ui-pagehead">
      <div className="ui-pagehead-text">
        <h1 className="ui-pagehead-title">{title}</h1>
        {subtitle && <p className="ui-pagehead-sub">{subtitle}</p>}
      </div>
      {children && <div className="ui-pagehead-actions">{children}</div>}
    </div>
  );
}

/* ---- Panel: a titled content card ---------------------------------------- */
export function Panel({ title, action, padded = true, children }) {
  return (
    <section className="ui-panel">
      {(title || action) && (
        <header className="ui-panel-head">
          {title && <h2 className="ui-panel-title">{title}</h2>}
          {action}
        </header>
      )}
      <div className={padded ? 'ui-panel-body' : ''}>{children}</div>
    </section>
  );
}

/* ---- StatTile: one number that matters ----------------------------------- */
export function StatTile({ label, value, hint, icon: Icon, tone = 'default', onClick }) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag type={onClick ? 'button' : undefined} onClick={onClick} className={`ui-stat ui-stat-${tone}${onClick ? ' ui-stat-clickable' : ''}`}>
      {Icon && <span className="ui-stat-icon" aria-hidden="true"><Icon size={18} /></span>}
      <span className="ui-stat-body">
        <span className="ui-stat-value">{value}</span>
        <span className="ui-stat-label">{label}</span>
        {hint && <span className="ui-stat-hint">{hint}</span>}
      </span>
    </Tag>
  );
}

/* ---- StatusPill: workflow state, colour-coded from tokens ----------------- */
const STATUS_TONE = {
  // VBS two-stage flow
  PENDING: 'pending', PENDING_ADMIN: 'active', CONFIRMED: 'approved',
  REJECTED: 'rejected', DECLINED: 'rejected', AUTO_CANCELLED: 'done', CANCELLED: 'done',
  RETURNED: 'pending', PARTIALLY_ISSUED: 'active', ISSUED: 'approved',
  // generic workflow states (other modules)
  DRAFT: 'draft', SUBMITTED: 'pending', PENDING_APPROVAL: 'pending',
  APPROVED: 'approved', ASSIGNED: 'active', IN_PROGRESS: 'active', COMPLETED: 'done',
};

/* Human labels — the raw enum isn't what a user should read. */
const STATUS_LABEL = {
  PENDING: 'Awaiting manager',
  PENDING_ADMIN: 'Awaiting procurement',
  CONFIRMED: 'Confirmed',
  REJECTED: 'Rejected',
  DECLINED: 'Declined',
  AUTO_CANCELLED: 'Auto cancelled',
  CANCELLED: 'Cancelled',
  RETURNED: 'Returned for correction',
  PARTIALLY_ISSUED: 'Partially supplied',
  ISSUED: 'Supplied',
};

export function StatusPill({ status }) {
  const tone = STATUS_TONE[status] ?? 'draft';
  const label = STATUS_LABEL[status] ?? String(status ?? '').replace(/_/g, ' ').toLowerCase();
  return <span className={`ui-pill ui-pill-${tone}`}>{label}</span>;
}

/* ---- EmptyState: an empty screen is an invitation to act ------------------ */
export function EmptyState({ icon: Icon, title, body, children }) {
  return (
    <div className="ui-empty">
      {Icon && (
        <span className="ui-empty-icon" aria-hidden="true">
          <Icon size={22} />
        </span>
      )}
      <p className="ui-empty-title">{title}</p>
      {body && <p className="ui-empty-body">{body}</p>}
      {children && <div className="ui-empty-action">{children}</div>}
    </div>
  );
}

/* ---- FormField: label + control + optional hint/error -------------------- */
export function FormField({ label, htmlFor, error, hint, required, children }) {
  return (
    <div className="ui-field">
      {label && (
        <label htmlFor={htmlFor}>
          {label}{required && <span className="ui-field-req" aria-hidden="true"> *</span>}
        </label>
      )}
      {children}
      {error ? (
        <span className="ui-field-error" role="alert">{error}</span>
      ) : hint ? (
        <span className="ui-field-hint">{hint}</span>
      ) : null}
    </div>
  );
}

/* ---- FormGrid: two-column responsive field layout ------------------------ */
export function FormGrid({ children }) {
  return <div className="ui-formgrid">{children}</div>;
}

/* ---- ScopeChip: the record-scope signature, reused in every module chrome - */
export function ScopeChip({ label }) {
  return (
    <div className="ui-scope" title="Records are filtered to this scope">
      <span className="ui-scope-dot" aria-hidden="true" />
      <span className="ui-scope-label">Viewing</span>
      <strong className="ui-scope-value">{label}</strong>
    </div>
  );
}
