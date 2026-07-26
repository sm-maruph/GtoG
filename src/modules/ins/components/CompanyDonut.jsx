import { useMemo, useState } from 'react';

const PALETTE = ['#2c82dc','#19b7a5','#f2a536','#8d64dd','#e25f78','#50a46e','#d26ec7','#53a8c7'];
function polar(cx, cy, radius, angle) { const rad=(angle-90)*Math.PI/180; return {x:cx+radius*Math.cos(rad),y:cy+radius*Math.sin(rad)}; }
function arcPath(startAngle,endAngle,outer=70,inner=42){
  const center=80; const startOuter=polar(center,center,outer,endAngle); const endOuter=polar(center,center,outer,startAngle); const startInner=polar(center,center,inner,startAngle); const endInner=polar(center,center,inner,endAngle); const large=endAngle-startAngle<=180?0:1;
  return `M ${startOuter.x} ${startOuter.y} A ${outer} ${outer} 0 ${large} 0 ${endOuter.x} ${endOuter.y} L ${startInner.x} ${startInner.y} A ${inner} ${inner} 0 ${large} 1 ${endInner.x} ${endInner.y} Z`;
}
export default function CompanyDonut({ rows, valueKey, title, formatter=(v)=>v, onCompanyClick }){
  const total=rows.reduce((sum,row)=>sum+Number(row[valueKey]||0),0); const [hover,setHover]=useState(null);
  const formattedTotal=String(formatter(total)); const firstSpace=formattedTotal.indexOf(' ');
  const currency=firstSpace>0?formattedTotal.slice(0,firstSpace):''; const amount=firstSpace>0?formattedTotal.slice(firstSpace+1):formattedTotal;
  const slices=useMemo(()=>{let angle=0;return rows.map((row,index)=>{const share=total?Number(row[valueKey]||0)/total:0;const start=angle;const end=angle+share*360;angle=end;return {row,index,start,end};});},[rows,total,valueKey]);
  const active=hover==null?null:rows[hover];
  return <div className="ins-donut-card"><h3>{title}</h3><div className="ins-donut-wrap">
    <div className="ins-donut-svg-wrap">
      <svg viewBox="0 0 160 160" className="ins-donut-svg" aria-label={title}>{total?slices.map(({row,index,start,end})=><path key={row.company} d={arcPath(start,end)} fill={PALETTE[index%PALETTE.length]} className="ins-donut-slice" onMouseEnter={()=>setHover(index)} onMouseLeave={()=>setHover(null)} onClick={()=>onCompanyClick?.(row.company)}><title>{row.company}: {formatter(row[valueKey])}</title></path>):<circle cx="80" cy="80" r="56" fill="none" stroke="#26384f" strokeWidth="28"/>}<text x="80" y="78" textAnchor="middle" className="ins-donut-total">{amount}</text><text x="80" y="94" textAnchor="middle" className="ins-donut-caption">{currency ? `Total · ${currency}` : 'Total'}</text></svg>
      {active&&<div className="ins-chart-tooltip"><strong>{active.company}</strong><span>{active.totalPolicies} {active.totalPolicies===1?'policy':'policies'}</span>{valueKey!=='totalPolicies'&&<span>{formatter(active[valueKey])}</span>}</div>}
    </div>
    <div className="ins-legend">{rows.map((row,index)=>{
      const share=total?(Number(row[valueKey]||0)/total)*100:0;
      return <button type="button" key={row.company} onMouseEnter={()=>setHover(index)} onMouseLeave={()=>setHover(null)} onClick={()=>onCompanyClick?.(row.company)}>
        <span className="ins-legend-dot" style={{background:PALETTE[index%PALETTE.length]}}/>
        <span className="ins-legend-label"><span>{row.company}</span><small>{share.toFixed(1)}% of total</small></span>
        <strong>{formatter(row[valueKey])}</strong>
      </button>;
    })}</div>
  </div></div>;
}
