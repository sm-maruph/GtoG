import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import Modal from '../ui/Modal';
import { recordAudit } from '../audit/store';

export default function ModuleWelcome({ entry, user }) {
  const key = `cbc.welcome.${entry.code}.${user?.userId ?? 'guest'}`;
  const [open, setOpen] = useState(() => sessionStorage.getItem(key) !== 'shown');

  useEffect(() => {
    const auditKey = `cbc.module.enter.${entry.code}.${user?.userId ?? 'guest'}`;
    const last = Number(sessionStorage.getItem(auditKey) || 0);
    if (Date.now() - last > 1000) {
      recordAudit({ moduleCode: entry.code, action: 'MODULE_ENTER', detail: `Entered ${entry.name}.`, actor: user, route: entry.routePath });
      sessionStorage.setItem(auditKey, String(Date.now()));
    }
  }, [entry.code, entry.name, entry.routePath, user]);

  function close() {
    sessionStorage.setItem(key, 'shown');
    setOpen(false);
  }
  if (!open) return null;
  return (
    <Modal title={`Welcome, ${user?.displayName?.split(' ')[0] || 'User'}`} onClose={close}
      footer={<button className="btn btn-primary" onClick={close}>Continue to dashboard</button>}>
      <div className="ml-welcome">
        <span><Sparkles size={24} /></span>
        <div><h3>{entry.name}</h3><p>{entry.welcome || `Welcome to ${entry.name}.`}</p><small>Your data access follows your assigned role, branch, department, and granular permissions.</small></div>
      </div>
    </Modal>
  );
}
