/**
 * LandingPage — the public front door.
 * Composed entirely of small parts: top bar, hero, directory, footer. It holds
 * no state of its own; each child owns its concern. This is the "menu where the
 * systems are listed" — a signed-out visitor can browse it freely and is only
 * asked to sign in when they open a specific system.
 */

import { useEffect, useState } from 'react';
import PublicTopBar from './PublicTopBar';
import LandingHero from './LandingHero';
import SystemDirectory from './SystemDirectory';
import PublicFooter from './PublicFooter';
import FloatingSupport from './FloatingSupport';
import logo from '../../assets/cbc_logo.png';
import { announcementEvent, listPublishedAnnouncements } from '../../modules/ann/store';
import './landing.css';

export default function LandingPage() {
  const [loading,setLoading]=useState(true);
  const [leaving,setLeaving]=useState(false);
  const [announcements,setAnnouncements]=useState(()=>listPublishedAnnouncements());

  useEffect(()=>{
    const reveal=window.setTimeout(()=>setLeaving(true),1850);
    const finish=window.setTimeout(()=>setLoading(false),2250);
    return()=>{window.clearTimeout(reveal);window.clearTimeout(finish);};
  },[]);
  useEffect(()=>{const refresh=()=>setAnnouncements(listPublishedAnnouncements());window.addEventListener(announcementEvent,refresh);return()=>window.removeEventListener(announcementEvent,refresh);},[]);

  return (
    <div className="lp">
      {loading&&<div className={`lp-loader${leaving?' is-leaving':''}`} role="status" aria-live="polite" aria-label="Loading CBC internal operations portal">
        <div className="lp-loader-glow" aria-hidden="true"/>
        <div className="lp-loader-grid" aria-hidden="true"/>
        <div className="lp-loader-scan" aria-hidden="true"/>
        <div className="lp-loader-content">
          <div className="lp-loader-hud" aria-hidden="true"><i/><i/><i/><i/></div>
          <div className="lp-loader-logo"><span aria-hidden="true"/><b aria-hidden="true"/><em aria-hidden="true"/><img src={logo} alt="Commercial Bank of Ceylon"/></div>
          <div className="lp-loader-copy"><strong>Internal Operations Portal</strong><span>From good to great</span></div>
          <div className="lp-loader-track" aria-hidden="true"><i/></div>
          <div className="lp-loader-status"><small>Preparing your workspace</small><span><i/><i/><i/></span></div>
        </div>
      </div>}
      <PublicTopBar />
      <aside className="lp-announcement" aria-label="Portal announcement">
        <strong><i/>Announcement</strong>
        <div className="lp-announcement-viewport"><p>{announcements.map((item,index)=><span className={`lp-announcement-message priority-${item.priority.toLowerCase()}`} key={item.id}>{index>0&&<b>•</b>}{item.message}</span>)}</p></div>
        <em>Live</em>
      </aside>
      <main className="lp-main">
        <LandingHero />
        <div className="lp-directory-wrap">
          <SystemDirectory />
        </div>
      </main>
      <PublicFooter />
      <FloatingSupport />
    </div>
  );
}
