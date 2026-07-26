import { groupByCategory, MODULE_CATALOG } from '../../core/catalog';
import { useAuth } from '../../core/auth/AuthContext';
import SystemCard from './SystemCard';

export default function SystemDirectory() {
  const { status, isSuperAdmin } = useAuth();
  const items = MODULE_CATALOG.filter((entry) => !entry.adminOnly || (status === 'authenticated' && isSuperAdmin));
  const sections = groupByCategory(items);
  return <div className="sys-directory">{sections.map((section) => <section key={section.category} className="sys-section">
    <header className="sys-section-head"><h2 className="sys-section-title">{section.category}</h2><span className="sys-section-count code">{String(section.items.length).padStart(2,'0')}</span></header>
    <div className="sys-grid">{section.items.map((entry) => <SystemCard key={entry.code} entry={entry}/>)}</div>
  </section>)}</div>;
}
