import { Factory, Fuel, PlugZap, Droplets, GlassWater, Clock3 } from 'lucide-react';
import { useUtility } from '../UtlContext';
import { formatMoney, number } from '../format';
import MiniBars from '../components/MiniBars';
import { UtlCard, UtlPage, UtlStat } from '../components/UtlUI';

export default function Dashboard(){
  const { stats, branchFilter, state } = useUtility();
  const branch = branchFilter==='ALL'?'All branches':state.branches.find(b=>b.code===branchFilter)?.name;
  const labels = stats.months.map(m=>m.slice(5));
  return <UtlPage title="Utility Dashboard" subtitle={`Operational overview · ${branch}`}>
    <div className="utl-section-label"><Factory size={15}/> Generator</div>
    <div className="utl-stat-grid">
      <UtlStat icon={<Fuel size={18}/>} label="Fuel in hand" value={`${number(stats.generator.fuelInHand)} L`} hint="Estimated 90-day balance"/>
      <UtlStat icon={<Clock3 size={18}/>} label="Run hours · 7 days" value={`${number(stats.generator.weeklyHours)} h`} tone="green"/>
      <UtlStat icon={<Factory size={18}/>} label="Run hours · 30 days" value={`${number(stats.generator.monthlyHours)} h`} tone="orange"/>
      <UtlStat icon={<Fuel size={18}/>} label="Fuel used · 30 days" value={`${number(stats.generator.monthlyFuel)} L`} tone="purple"/>
    </div>
    <div className="utl-dashboard-grid">
      <UtlCard title="Generator — 12-month fuel purchased"><MiniBars labels={labels} values={stats.fuelTrend} format={v=>`${number(v,0)}L`}/></UtlCard>
      <UtlCard title="Electricity — 12-month billing"><MiniBars labels={labels} values={stats.electricTrend} format={formatMoney}/></UtlCard>
      <UtlCard title="WASA — 12-month billing"><MiniBars labels={labels} values={stats.wasaTrend} format={formatMoney}/></UtlCard>
      <UtlCard title="Drinking Water — deliveries"><MiniBars labels={labels} values={stats.waterDeliveryTrend} format={v=>`${number(v,0)}L`}/></UtlCard>
    </div>
    <div className="utl-section-label"><PlugZap size={15}/> Current position</div>
    <div className="utl-stat-grid utl-stat-grid-three">
      <UtlStat icon={<PlugZap size={18}/>} label="Latest electric bill" value={formatMoney(stats.electricity.lastBill)} tone="blue"/>
      <UtlStat icon={<Droplets size={18}/>} label="Latest WASA bill" value={formatMoney(stats.wasa.lastBill)} tone="teal"/>
      <UtlStat icon={<GlassWater size={18}/>} label="Drinking water billed" value={formatMoney(stats.water.amount)} tone="green"/>
    </div>
  </UtlPage>;
}
