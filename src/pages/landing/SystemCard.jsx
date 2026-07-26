/**
 * SystemCard — one system in the directory.
 * Pure presentation. Receives a catalog entry, links to its route. No auth
 * logic here: whether the user can enter is decided on arrival, not on the card.
 */

import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { isImplemented } from '../../core/moduleRegistry';

export default function SystemCard({ entry, index=0 }) {
  const Icon = entry.icon;
  const live=isImplemented(entry.code);
  return (
    <Link to={entry.routePath} className={`sys-card ${live?'is-live':'is-coming'}`} aria-label={`${live?'Open':'View'} ${entry.name}`} style={{'--card-index':index}}>
      <div className="sys-card-top">
        <span className="sys-card-icon" aria-hidden="true">
          <Icon size={20} />
        </span>
        <span className="sys-card-meta"><span className="sys-card-state"><i/>{live?'Live':'Coming soon'}</span><span className="sys-card-code code">{entry.code.toUpperCase()}</span></span>
      </div>

      <h3 className="sys-card-name">{entry.name}</h3>
      <p className="sys-card-blurb">{entry.blurb}</p>

      <div className="sys-card-foot"><span className="sys-card-category">{entry.category}</span><span className="sys-card-enter" aria-hidden="true"><ArrowRight size={14}/></span></div>
      <div className="sys-card-details">
        <span className="sys-detail-label">Module overview</span>
        <strong>{entry.name}</strong>
        <p>{entry.blurb}</p>
        <div><span>{entry.category}</span><b className={live?'live':'coming'}><i/>{live?'System live':'Coming soon'}</b></div>
        <em>{live?'Open module':'View availability'} <ArrowRight size={14}/></em>
      </div>
    </Link>
  );
}
