import { MODULE_CATALOG } from '../../core/catalog';
import { useAuth } from '../../core/auth/AuthContext';
import SystemCard from './SystemCard';

export default function SystemDirectory() {
  const { status, isSuperAdmin } = useAuth();
  const items = MODULE_CATALOG
    .filter((entry) => !entry.adminOnly || (status === 'authenticated' && isSuperAdmin))
    .sort((a,b)=>a.name.localeCompare(b.name));
  return <section className="sys-directory" id="portal-directory">
    <header className="sys-directory-head">
      <div><span className="sys-directory-kicker">Portal directory</span><h2>Choose a module</h2></div>
      <span className="sys-directory-count">{items.length} modules · A–Z</span>
    </header>
    <div className="sys-grid">{items.map((entry,index)=><SystemCard key={entry.code} entry={entry} index={index}/>)}</div>
  </section>;
}
