/**
 * LandingPage — the public front door.
 * Composed entirely of small parts: top bar, hero, directory, footer. It holds
 * no state of its own; each child owns its concern. This is the "menu where the
 * systems are listed" — a signed-out visitor can browse it freely and is only
 * asked to sign in when they open a specific system.
 */

import PublicTopBar from './PublicTopBar';
import LandingHero from './LandingHero';
import SystemDirectory from './SystemDirectory';
import PublicFooter from './PublicFooter';
import './landing.css';

export default function LandingPage() {
  return (
    <div className="lp">
      <PublicTopBar />
      <main className="lp-main">
        <LandingHero />
        <div className="lp-directory-wrap">
          <SystemDirectory />
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
