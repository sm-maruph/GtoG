import { MODULE_CATALOG } from '../../core/catalog';
export default function LandingHero(){
  const operational = MODULE_CATALOG.filter((m)=>!m.adminOnly).length;
  return <section className="lp-hero"><div className="lp-hero-inner">
    <span className="lp-eyebrow">Commercial Bank of Ceylon, BD Operations · Internal Operations Portal</span>
    <h1 className="lp-hero-title">From good to Great:<br/>Internal Process Mastery</h1>
    <p className="lp-hero-sub">A professional workspace for {operational} operational and people systems. Open a module, authenticate once, and work only within your assigned branch, department, role, and permissions.</p>
    <div className="lp-hero-badges"><span>Role-based access</span><span>Global audit trail</span><span>Branch & department scope</span></div>
  </div></section>;
}
