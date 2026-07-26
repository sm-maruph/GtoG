/**
 * MiniBarChart — a dependency-free horizontal bar chart in inline SVG.
 * A full charting library is overkill for a LAN app; this renders the handful
 * of categories a report needs (by status, by branch) with no install.
 * data: [{ label, value, tone? }]
 */

const TONE_FILL = {
  ok: 'var(--cbc-green-500)',
  pending: 'var(--warn-600)',
  bad: 'var(--danger-600)',
  info: 'var(--cbc-blue-600)',
  muted: 'var(--ink-400)',
};

export default function MiniBarChart({ data, height = 26, gap = 10 }) {
  if (!data?.length) {
    return <p style={{ color: 'var(--ink-400)', fontSize: 'var(--text-sm)', margin: 0 }}>No data in range.</p>;
  }
  const max = Math.max(...data.map((d) => d.value), 1);
  const labelW = 150;
  const barMax = 320;
  const total = data.length * (height + gap);

  return (
    <svg width="100%" viewBox={`0 0 ${labelW + barMax + 44} ${total}`} role="img"
      style={{ maxWidth: labelW + barMax + 44 }}>
      {data.map((d, i) => {
        const y = i * (height + gap);
        const w = Math.max((d.value / max) * barMax, d.value > 0 ? 3 : 0);
        const fill = TONE_FILL[d.tone] ?? TONE_FILL.info;
        return (
          <g key={d.label}>
            <text x={labelW - 8} y={y + height / 2} textAnchor="end" dominantBaseline="middle"
              fontSize="12" fill="var(--ink-600)">{d.label}</text>
            <rect x={labelW} y={y} width={barMax} height={height} rx="4" fill="var(--ink-100)" />
            <rect x={labelW} y={y} width={w} height={height} rx="4" fill={fill} />
            <text x={labelW + w + 8} y={y + height / 2} dominantBaseline="middle"
              fontSize="12" fontWeight="600" fill="var(--ink-700)">{d.value}</text>
          </g>
        );
      })}
    </svg>
  );
}