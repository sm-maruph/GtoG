/**
 * RequestTimeline — the visual progression of one request:
 *   created -> manager/head approved or rejected -> procurement confirmed/declined.
 * Renders the request.timeline array from the API. Each event shows who, when,
 * and the elapsed time from the previous step, so an approver can see how long
 * each stage took at a glance.
 */

import { CheckCircle2, XCircle, Clock, Send, FileText, Ban, PencilLine } from 'lucide-react';
import { formatDateTime } from '../format';
import './timeline.css';

const ICON = {
  CREATED: FileText,
  EDITED: PencilLine,
  FIRST_APPROVED: Send,
  FIRST_REJECTED: XCircle,
  CONFIRMED: CheckCircle2,
  DECLINED: XCircle,
  AUTO_CANCELLED: Ban,
  CANCELLED: Ban,
};
const TONE = {
  CREATED: 'neutral',
  EDITED: 'info',
  FIRST_APPROVED: 'ok',
  FIRST_REJECTED: 'bad',
  CONFIRMED: 'ok',
  DECLINED: 'bad',
  AUTO_CANCELLED: 'muted',
  CANCELLED: 'muted',
};

function elapsed(fromIso, toIso) {
  const ms = new Date(toIso) - new Date(fromIso);
  if (ms < 0) return null;
  const hrs = ms / 3600e3;
  if (hrs < 1) return `${Math.round(ms / 60e3)} min later`;
  if (hrs < 48) return `${Math.round(hrs)} h later`;
  return `${Math.round(hrs / 24)} d later`;
}

export default function RequestTimeline({ timeline }) {
  if (!timeline?.length) return null;
  return (
    <ol className="tl">
      {timeline.map((e, i) => {
        const Icon = ICON[e.type] ?? Clock;
        const tone = TONE[e.type] ?? 'neutral';
        const gap = i > 0 ? elapsed(timeline[i - 1].at, e.at) : null;
        return (
          <li key={i} className={`tl-item tl-${tone}`}>
            <span className="tl-dot" aria-hidden="true"><Icon size={13} /></span>
            <div className="tl-body">
              <div className="tl-label">{e.label}</div>
              <div className="tl-meta">
                <span>{e.by}</span>
                <span className="tl-sep">·</span>
                <span className="code">{formatDateTime(e.at)}</span>
                {gap && <span className="tl-gap">{gap}</span>}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}