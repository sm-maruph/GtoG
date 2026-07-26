/**
 * SystemCard — one system in the directory.
 * Pure presentation. Receives a catalog entry, links to its route. No auth
 * logic here: whether the user can enter is decided on arrival, not on the card.
 */

import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function SystemCard({ entry }) {
  const Icon = entry.icon;
  return (
    <Link to={entry.routePath} className="sys-card" aria-label={`Open ${entry.name}`}>
      <div className="sys-card-top">
        <span className="sys-card-icon" aria-hidden="true">
          <Icon size={20} />
        </span>
        <span className="sys-card-code code">{entry.code.toUpperCase()}</span>
      </div>

      <h3 className="sys-card-name">{entry.name}</h3>
      <p className="sys-card-blurb">{entry.blurb}</p>

      <span className="sys-card-enter">
        Open <ArrowRight size={14} aria-hidden="true" />
      </span>
    </Link>
  );
}
