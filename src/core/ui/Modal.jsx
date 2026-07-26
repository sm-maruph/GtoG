/**
 * Modal — reusable dialog. Closes on Escape and backdrop click, locks body
 * scroll while open, traps nothing fancy but returns focus sanely. Every module
 * that needs a dialog uses this rather than rolling its own overlay.
 */

import { useEffect } from 'react';
import { X } from 'lucide-react';
import './modal.css';

export default function Modal({ title, onClose, footer, size = 'md', children }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="ui-modal-backdrop" onClick={onClose}>
      <div
        className={`ui-modal ui-modal-${size}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="ui-modal-head">
          <h2 className="ui-modal-title">{title}</h2>
          <button className="ui-modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>
        <div className="ui-modal-body">{children}</div>
        {footer && <footer className="ui-modal-foot">{footer}</footer>}
      </div>
    </div>
  );
}
