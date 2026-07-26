export default function MiniBars({ labels, values, format=(v)=>v, title }) {
  const max = Math.max(1, ...values.map(Number));
  return <div className="utl-chart" aria-label={title}>
    <div className="utl-chart-grid">{values.map((v,i)=><div className="utl-bar-col" key={`${labels[i]}-${i}`} title={`${labels[i]}: ${format(v)}`}><span className="utl-bar-value">{Number(v)>0?format(v):''}</span><div className="utl-bar" style={{height:`${Math.max(2, Number(v)/max*150)}px`}}/><small>{String(labels[i]).replace(/^\d{4}-/,'')}</small></div>)}</div>
  </div>;
}
