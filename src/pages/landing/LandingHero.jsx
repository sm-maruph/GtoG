import { MODULE_CATALOG } from '../../core/catalog';
export default function LandingHero(){
  const operational = MODULE_CATALOG.filter((m)=>!m.adminOnly).length;
  return <section className="lp-hero"><div className="lp-hero-beam" aria-hidden="true"/><div className="lp-hero-inner">
    <div className="lp-hero-copy">
      <span className="lp-eyebrow"><i/>Commercial Bank of Ceylon, BD Operations · Internal Operations Portal</span>
      <h1 className="lp-hero-title">From good to Great:<br/>Internal Process Mastery</h1>
      <p className="lp-hero-sub">A professional workspace for {operational} operational and people systems. Open a module, authenticate once, and work only within your assigned branch, department, role, and permissions.</p>
      <div className="lp-hero-badges"><span>Role-based access</span><span>Global audit trail</span><span>Branch & department scope</span></div>
    </div>
    <div className="lp-hero-visual" aria-hidden="true">
      <div className="lp-orbit lp-orbit-one"><i/><i/><i/></div><div className="lp-orbit lp-orbit-two"><i/><i/></div>
      <div className="lp-visual-core"><span>{operational}</span><small>Connected systems</small><b/></div>
      <div className="lp-visual-chip lp-chip-one"><i>01</i><span>Secure access</span><b>Active</b></div>
      <div className="lp-visual-chip lp-chip-two"><i>02</i><span>Operational scope</span><b>Synced</b></div>
      <div className="lp-visual-chip lp-chip-three"><i>03</i><span>Audit control</span><b>Online</b></div>
    </div>
  </div></section>;
}
