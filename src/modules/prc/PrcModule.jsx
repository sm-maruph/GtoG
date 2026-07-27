import { useMemo, useState } from 'react';
import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import {
  Archive, ArrowRightLeft, BadgeCheck, Barcode, Boxes, ClipboardCheck, FileSearch, Gauge, History, PackageCheck,
  Plus, Printer, Save, Search, ShieldCheck, ShoppingCart, Tags, Trash2, Truck, UploadCloud, Users, Wrench, X,
} from 'lucide-react';
import logo from '../../assets/small_logo.jpg';
import bankLogo from '../../assets/cbc_logo.png';
import './prc.css';

const money = (n) => new Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT', maximumFractionDigits: 0 }).format(n);
const stock = [
  { code: 'GIN-0001', item: 'Executive Office Chair', category: 'Furniture', location: 'Central Store · Inventory & Stores', type: 'General', unit: 'Piece', qty: 24, reorder: 8, value: 432000 },
  { code: 'GIN-0002', item: 'Visitor Chair', category: 'Furniture', location: 'Central Store · Inventory & Stores', type: 'General', unit: 'Piece', qty: 46, reorder: 15, value: 276000 },
  { code: 'GIN-0003', item: 'Four-Drawer Filing Cabinet', category: 'Furniture', location: 'Central Store · Inventory & Stores', type: 'General', unit: 'Piece', qty: 12, reorder: 5, value: 228000 },
  { code: 'GIN-0004', item: 'Cash Counting Machine', category: 'Branch Equipment', location: 'Central Store · Inventory & Stores', type: 'General', unit: 'Piece', qty: 8, reorder: 4, value: 784000 },
  { code: 'GIN-0005', item: 'Currency UV Detector', category: 'Branch Equipment', location: 'Central Store · Inventory & Stores', type: 'General', unit: 'Piece', qty: 17, reorder: 6, value: 187000 },
  { code: 'GIN-0006', item: 'Queue Barrier Stand', category: 'Branch Equipment', location: 'Central Store · Inventory & Stores', type: 'General', unit: 'Set', qty: 10, reorder: 4, value: 145000 },
  { code: 'GIN-0007', item: 'Fire Extinguisher 5kg', category: 'Safety Equipment', location: 'Central Store · Inventory & Stores', type: 'General', unit: 'Piece', qty: 21, reorder: 10, value: 189000 },
  { code: 'GIN-0008', item: 'First Aid Box — Complete', category: 'Safety Equipment', location: 'Central Store · Inventory & Stores', type: 'General', unit: 'Box', qty: 9, reorder: 10, value: 40500 },
  { code: 'GIN-0009', item: 'Water Dispenser', category: 'Office Appliance', location: 'Central Store · Inventory & Stores', type: 'General', unit: 'Piece', qty: 7, reorder: 3, value: 126000 },
  { code: 'GIN-0010', item: 'Heavy-Duty Vacuum Cleaner', category: 'Cleaning Equipment', location: 'Central Store · Inventory & Stores', type: 'General', unit: 'Piece', qty: 5, reorder: 3, value: 137500 },
  { code: 'GIN-0011', item: 'LED Emergency Light', category: 'Electrical', location: 'Central Store · Inventory & Stores', type: 'General', unit: 'Piece', qty: 28, reorder: 12, value: 98000 },
  { code: 'GIN-0012', item: 'Voltage Stabilizer 3 KVA', category: 'Electrical', location: 'Central Store · Inventory & Stores', type: 'General', unit: 'Piece', qty: 6, reorder: 4, value: 168000 },
  { code: 'GIN-0013', item: '24-inch LED Monitor', category: 'IT Equipment', location: 'Central Store · Inventory & Stores', type: 'General', unit: 'Piece', qty: 14, reorder: 8, value: 350000 },
  { code: 'GIN-0014', item: 'Desktop UPS 1200VA', category: 'IT Equipment', location: 'Central Store · Inventory & Stores', type: 'General', unit: 'Piece', qty: 11, reorder: 6, value: 181500 },
  { code: 'GIN-0015', item: 'Network Patch Cable, 3m', category: 'IT Accessories', location: 'Central Store · Inventory & Stores', type: 'General', unit: 'Piece', qty: 14, reorder: 20, value: 9800 },
];
const inventoryActivities = [
  { at: '2026-07-27T14:22', ref: 'GRN-0091', action: 'Stock received', item: 'Visitor Chair', qty: 20, balance: 46, actor: 'Procurement', destination: 'Central Store' },
  { at: '2026-07-27T11:05', ref: 'DIS-0448', action: 'Distributed', item: 'Fire Extinguisher 5kg', qty: -4, balance: 21, actor: 'Admin & Procurement', destination: 'Gulshan Branch · Branch Operations' },
  { at: '2026-07-26T16:40', ref: 'DIS-0447', action: 'Distributed', item: 'Executive Office Chair', qty: -3, balance: 24, actor: 'Admin & Procurement', destination: 'Motijheel Branch · Customer Service' },
  { at: '2026-07-26T10:15', ref: 'ADJ-0189', action: 'Stock adjustment', item: 'First Aid Box — Complete', qty: -1, balance: 9, actor: 'Store Officer', destination: 'Central Store' },
  { at: '2026-07-25T15:30', ref: 'GRN-0089', action: 'Stock received', item: 'LED Emergency Light', qty: 12, balance: 28, actor: 'Procurement', destination: 'Central Store' },
];
const requisitionSeed = [
  { id: 'REQ-2026-0108', requestedAt: '2026-07-27T10:35', requester: 'Nusrat Jahan', destination: 'Gulshan Branch · Branch Operations', purpose: 'Replacement of damaged customer-area furniture', status: 'Pending Unit Approval', items: [{ code: 'GIN-0002', requested: 6, approved: 6 }, { code: 'GIN-0006', requested: 2, approved: 2 }] },
  { id: 'REQ-2026-0107', requestedAt: '2026-07-26T15:20', requester: 'Kamrul Ahsan', destination: 'Head Office · Information Technology', purpose: 'New employee workstation setup', status: 'Pending Admin Approval', items: [{ code: 'GIN-0013', requested: 3, approved: 3 }, { code: 'GIN-0014', requested: 3, approved: 3 }] },
  { id: 'REQ-2026-0106', requestedAt: '2026-07-25T11:10', requester: 'Farhana Islam', destination: 'Motijheel Branch · Customer Service', purpose: 'Customer service area safety requirement', status: 'Pending Procurement', items: [{ code: 'GIN-0007', requested: 4, approved: 4 }, { code: 'GIN-0008', requested: 2, approved: 2 }] },
  { id: 'REQ-2026-0105', requestedAt: '2026-07-24T09:45', requester: 'Rakib Hasan', destination: 'Dhanmondi Branch · Branch Operations', purpose: 'Branch operational equipment replacement', status: 'Ready to Distribute', items: [{ code: 'GIN-0004', requested: 2, approved: 1 }, { code: 'GIN-0005', requested: 3, approved: 3 }] },
  { id: 'REQ-2026-0104', requestedAt: '2026-07-22T14:30', requester: 'M. Rahman', destination: 'Chattogram Branch · Cash', purpose: 'Approved branch equipment allocation', status: 'Distributed', distributedAt: '2026-07-24T13:10', items: [{ code: 'GIN-0004', requested: 1, approved: 1 }, { code: 'GIN-0005', requested: 2, approved: 2 }] },
];
const rfqSeed = [
  { id: 'RFQ-2026-047', title: 'ATM receipt roll printing', kind: 'RFQ-1 · Printing', vendor: 'Dhaka Print & Pack', vendors: 4, issuedAt: '2026-07-27T15:40', deadline: '31 Jul 2026', status: 'Open' },
  { id: 'RFQ-2026-046', title: 'Head office access control', kind: 'RFQ-3 · Modification', vendor: 'SecureTech Bangladesh', vendors: 3, issuedAt: '2026-07-27T11:20', deadline: '05 Aug 2026', status: 'Open' },
  { id: 'RFQ-2026-045', title: 'Branch UPS replacement', kind: 'RFQ-2 · Product', vendor: 'Techno Systems Ltd.', vendors: 5, issuedAt: '2026-07-26T16:15', deadline: '04 Aug 2026', status: 'Open' },
  { id: 'RFQ-2026-044', title: 'Annual signage printing', kind: 'RFQ-1 · Printing', vendor: 'Dhaka Print & Pack', vendors: 4, issuedAt: '2026-07-25T14:05', deadline: '30 Jul 2026', status: 'Evaluation' },
  { id: 'RFQ-2026-043', title: 'Cash counting machines', kind: 'RFQ-2 · Product', vendor: 'Office Solutions BD', vendors: 6, issuedAt: '2026-07-24T10:30', deadline: '01 Aug 2026', status: 'Evaluation' },
  { id: 'RFQ-2026-042', title: 'Customer token display retrofit', kind: 'RFQ-3 · Modification', vendor: 'Metro Engineering', vendors: 3, issuedAt: '2026-07-23T09:45', deadline: '29 Jul 2026', status: 'Open' },
  { id: 'RFQ-2026-041', title: 'Network accessories supply', kind: 'RFQ-2 · Product', vendor: 'Techno Systems Ltd.', vendors: 6, issuedAt: '2026-07-22T16:50', deadline: '28 Jul 2026', status: 'Closed' },
  { id: 'RFQ-2026-040', title: 'Cheque book cover printing', kind: 'RFQ-1 · Printing', vendor: 'Prime Press Ltd.', vendors: 4, issuedAt: '2026-07-21T13:10', deadline: '27 Jul 2026', status: 'Closed' },
  { id: 'RFQ-2026-039', title: 'Server room cooling upgrade', kind: 'RFQ-3 · Modification', vendor: 'Climate Engineering Ltd.', vendors: 5, issuedAt: '2026-07-20T12:25', deadline: '02 Aug 2026', status: 'Evaluation' },
  { id: 'RFQ-2026-038', title: 'Desktop computer procurement', kind: 'RFQ-2 · Product', vendor: 'Computer Source Ltd.', vendors: 7, issuedAt: '2026-07-18T15:35', deadline: '26 Jul 2026', status: 'Closed' },
  { id: 'RFQ-2026-037', title: 'Deposit slip printing', kind: 'RFQ-1 · Printing', vendor: 'Dhaka Print & Pack', vendors: 4, issuedAt: '2026-07-17T11:00', deadline: '24 Jul 2026', status: 'Closed' },
  { id: 'RFQ-2026-036', title: 'Generator control panel upgrade', kind: 'RFQ-3 · Modification', vendor: 'Metro Engineering', vendors: 3, issuedAt: '2026-07-15T09:20', deadline: '25 Jul 2026', status: 'Closed' },
];
const dummyRfqTemplates = [
  { id: 'tpl-print-form', name: 'Standard Bank Form Printing', kind: 'RFQ-1', data: { title: 'Standard bank form printing', kind: 'RFQ-1', deadline: '', size: 'A4', paper: '80 GSM offset', colour: '2 colour', pages: '100 sheets per pad', binding: 'Glue bound', ply: 'Single', packing: 'Shrink-wrapped, 20 pads per carton', terms: 'Price must include delivery, taxes, plate and design charges. Submit paper and colour samples with the quotation.', remarks: '' } },
  { id: 'tpl-secure-print', name: 'Security Printing', kind: 'RFQ-1', data: { title: 'Security-controlled document printing', kind: 'RFQ-1', deadline: '', size: 'Custom', paper: 'Security paper', colour: 'As approved artwork', pages: '', binding: '', ply: 'Single', packing: 'Tamper-evident sealed cartons', terms: 'Vendor must maintain confidentiality and provide controlled wastage records.', remarks: 'Pre-production sample approval is mandatory.' } },
  { id: 'tpl-it-equipment', name: 'IT Equipment Purchase', kind: 'RFQ-2', data: { title: 'IT equipment procurement', kind: 'RFQ-2', deadline: '', item: 'Business-class equipment', model: 'Latest supported model or equivalent', quantity: '10', specification: 'OEM warranty, local support, genuine licence, delivery and installation included.', terms: 'Quote unit price, VAT/tax, delivery lead time, warranty and proposal validity separately.', remarks: '' } },
  { id: 'tpl-branch-equipment', name: 'Branch Equipment Supply', kind: 'RFQ-2', data: { title: 'Branch equipment supply', kind: 'RFQ-2', deadline: '', item: 'Operational equipment', model: 'Vendor to propose', quantity: '5', specification: 'Commercial grade, Bangladesh power standard, onsite installation and user training.', terms: 'Minimum one-year comprehensive warranty and delivery to designated branch.', remarks: '' } },
  { id: 'tpl-modification', name: 'Equipment Modification', kind: 'RFQ-3', data: { title: 'Existing equipment modification', kind: 'RFQ-3', deadline: '', requestType: 'Modification', quantity: '1', reference: 'Existing bank equipment / asset', scope: 'Inspect, propose modification, supply required parts, complete installation, test and hand over.', terms: 'Site survey, materials, labour, testing and warranty must be included.', remarks: 'Work must be completed without disrupting branch operations.' } },
  { id: 'tpl-creation', name: 'Custom Fabrication & Creation', kind: 'RFQ-3', data: { title: 'Custom fabrication requirement', kind: 'RFQ-3', deadline: '', requestType: 'Fabrication', quantity: '1', reference: 'Approved concept / drawing', scope: 'Prepare shop drawing, obtain approval, fabricate, finish, deliver and install the completed item.', terms: 'Final measurement and material sample approval are required before production.', remarks: '' } },
];
const vendors = [
  { name: 'Techno Systems Ltd.', category: 'IT equipment', documents: '6 / 6', score: 92, review: '12 Jun 2026', status: 'Approved' },
  { name: 'Dhaka Print & Pack', category: 'Printing press', documents: '5 / 6', score: 84, review: '19 May 2026', status: 'Conditional' },
  { name: 'Office Solutions BD', category: 'General supplies', documents: '6 / 6', score: 89, review: '03 Apr 2026', status: 'Approved' },
  { name: 'Metro Engineering', category: 'Equipment service', documents: '4 / 6', score: 73, review: '18 Mar 2026', status: 'Review due' },
];
const tenders = [
  { id: 'TND-2026-012', subject: 'ATM UPS replacement', source: 'Open tender', closes: '04 Aug 2026, 15:00', bids: 0, status: 'Locked' },
  { id: 'TND-2026-009', subject: 'Branch furniture supply', source: 'Newspaper + portal', closes: '29 Jul 2026, 14:00', bids: 7, status: 'Opening due' },
  { id: 'TND-2026-006', subject: 'Generator maintenance', source: 'Enlisted vendors', closes: '16 Jul 2026, 15:00', bids: 5, status: 'Analysis' },
];
const orders = [
  { id: 'WO-2026-0178', vendor: 'Techno Systems Ltd.', total: 485000, delivery: '12 Aug 2026', progress: 'Production', grn: 'Pending' },
  { id: 'WO-2026-0169', vendor: 'Office Solutions BD', total: 96500, delivery: '30 Jul 2026', progress: 'In transit', grn: 'Pending' },
  { id: 'WO-2026-0151', vendor: 'Metro Engineering', total: 138000, delivery: '20 Jul 2026', progress: 'Delivered', grn: 'GRN-0088' },
];
const assets = [
  { tag: 'CBC-IT-002184', asset: 'HP ProBook 440 G10', location: 'Head Office · IT', purchased: '14 Feb 2026', value: 140000, warranty: '18 months', status: 'In use' },
  { tag: 'CBC-OPS-001927', asset: 'Cash Counting Machine', location: 'Motijheel Branch', purchased: '08 Sep 2025', value: 98000, warranty: '2 months', status: 'In use' },
  { tag: 'CBC-ADM-001105', asset: 'Canon ImageRunner 2630i', location: 'Head Office · Admin', purchased: '03 Jan 2024', value: 315000, warranty: 'Expired', status: 'Service due' },
];
const assetLocations = [
  { branch: 'Head Office', departments: ['Administration', 'Finance & Accounts', 'Human Resources', 'Information Technology', 'Operations', 'Procurement', 'Risk & Compliance'] },
  { branch: 'Central Store', departments: ['Inventory & Stores', 'Procurement'] },
  { branch: 'Gulshan Branch', departments: ['Branch Operations', 'Cash', 'Credit', 'Customer Service'] },
  { branch: 'Motijheel Branch', departments: ['Branch Operations', 'Cash', 'Credit', 'Customer Service'] },
  { branch: 'Dhanmondi Branch', departments: ['Branch Operations', 'Cash', 'Credit', 'Customer Service'] },
  { branch: 'Chattogram Branch', departments: ['Branch Operations', 'Cash', 'Credit', 'Customer Service'] },
  { branch: 'Sylhet Branch', departments: ['Branch Operations', 'Cash', 'Credit', 'Customer Service'] },
];

function Status({ children }) {
  return <span className={`prc-status ${String(children).toLowerCase().replaceAll(' ', '-')}`}>{children}</span>;
}
const code39 = {
  '0':'nnnwwnwnn','1':'wnnwnnnnw','2':'nnwwnnnnw','3':'wnwwnnnnn','4':'nnnwwnnnw','5':'wnnwwnnnn','6':'nnwwwnnnn','7':'nnnwnnwnw','8':'wnnwnnwnn','9':'nnwwnnwnn',
  A:'wnnnnwnnw',B:'nnwnnwnnw',C:'wnwnnwnnn',D:'nnnnwwnnw',E:'wnnnwwnnn',F:'nnwnwwnnn',G:'nnnnnwwnw',H:'wnnnnwwnn',I:'nnwnnwwnn',J:'nnnnwwwnn',
  K:'wnnnnnnww',L:'nnwnnnnww',M:'wnwnnnnwn',N:'nnnnwnnww',O:'wnnnwnnwn',P:'nnwnwnnwn',Q:'nnnnnnwww',R:'wnnnnnwwn',S:'nnwnnnwwn',T:'nnnnwnwwn',
  U:'wwnnnnnnw',V:'nwwnnnnnw',W:'wwwnnnnnn',X:'nwnnwnnnw',Y:'wwnnwnnnn',Z:'nwwnwnnnn','-':'nwnnnnwnw','.':'wwnnnnwnn',' ':'nwwnnnwnn','*':'nwnnwnwnn',
};
function AssetBarcode({ value, compact = false }) {
  const text = String(value || 'UNASSIGNED').toUpperCase().replace(/[^0-9A-Z. -]/g, '-');
  const encoded = `*${text}*`;
  const narrow = compact ? 1 : 1.5;
  const wide = narrow * 3;
  const gap = narrow;
  let x = 8;
  const bars = [];
  for (const character of encoded) {
    const pattern = code39[character] || code39['-'];
    [...pattern].forEach((widthCode, index) => {
      const width = widthCode === 'w' ? wide : narrow;
      if (index % 2 === 0) bars.push(<rect key={`${character}-${x}-${index}`} x={x} y="4" width={width} height={compact ? 25 : 38} />);
      x += width;
    });
    x += gap;
  }
  return <div className={`prc-barcode${compact ? ' compact' : ''}`}><svg viewBox={`0 0 ${x + 8} ${compact ? 32 : 48}`} role="img" aria-label={`Barcode ${text}`} preserveAspectRatio="none">{bars}</svg><span>{text}</span></div>;
}
function Title({ eyebrow, title, note, action }) {
  return <div className="prc-title"><div><span>{eyebrow}</span><h1>{title}</h1><p>{note}</p></div>{action}</div>;
}
function Card({ title, meta, children }) {
  return <section className="prc-card"><header><h2>{title}</h2>{meta && <p>{meta}</p>}</header>{children}</section>;
}
function Table({ columns, rows, onRowClick }) {
  return <div className="prc-table"><table><thead><tr>{columns.map((c) => <th key={c.key}>{c.label}</th>)}</tr></thead><tbody>{rows.map((row, i) =>
    <tr key={row.id || row.code || row.tag || row.name || i} className={onRowClick ? 'prc-clickable-row' : ''} tabIndex={onRowClick ? 0 : undefined} onClick={() => onRowClick?.(row)} onKeyDown={(event) => { if (onRowClick && (event.key === 'Enter' || event.key === ' ')) onRowClick(row); }}>{columns.map((c) => <td key={c.key}>{c.render ? c.render(row) : row[c.key]}</td>)}</tr>)}</tbody></table></div>;
}
const Button = ({ children, ...props }) => <button className="prc-primary" {...props}>{children}</button>;

function Dashboard() {
  const fixedAssetCount = 143;
  const generalStockQuantity = stock.filter((item) => item.type === 'General').reduce((sum, item) => sum + item.qty, 0);
  const totalStockQuantity = generalStockQuantity + fixedAssetCount;
  const currentStockValue = 18400000 + stock.filter((item) => item.type === 'General').reduce((sum, item) => sum + item.value, 0);
  const reorderCount = stock.filter((item) => item.qty < item.reorder).length;
  return <div>
    <Title eyebrow="Operational overview" title="Procurement & inventory dashboard" note="Sourcing, stock, fixed assets, deliveries, and control exceptions at a glance." />
    <Card title="Inventory management" meta="General inventory and fixed assets · Live stock position">
      <div className="prc-kpis prc-inventory-kpis">
        {[[Boxes, 'Total items in stock', totalStockQuantity, 'General inventory + fixed assets'],
          [Tags, 'Number of asset items', fixedAssetCount, 'Fixed assets across 18 locations'],
          [ShoppingCart, 'Current stock value (BDT)', money(currentStockValue), 'Combined current book and stock value'],
          [Gauge, 'Items below reorder level', reorderCount, 'Immediate replenishment review', 'warn']].map(([Icon, label, value, hint, cls]) =>
          <article className={cls || ''} key={label}><Icon /><span>{label}</span><strong>{value}</strong><small>{hint}</small></article>)}
      </div>
      <div className="prc-inventory-recent"><header><div><h3>Recently added / removed items</h3><p>Latest inventory movements and asset transfers</p></div><span>Live ledger</span></header><Table rows={[
        { time: '27 Jul · 14:22', ref: 'GRN-0091', item: 'Network Patch Cable, 3m', move: '+ 30', type: 'Stock added', location: 'Central Store · Inventory & Stores' },
        { time: '27 Jul · 11:05', ref: 'ISS-0448', item: 'Thermal Receipt Roll', move: '− 12', type: 'Stock issued', location: 'Gulshan Branch · Branch Operations' },
        { time: '26 Jul · 16:40', ref: 'TRF-0182', item: '24-inch LED Monitor', move: '− 2', type: 'Asset transfer', location: 'Dhanmondi Branch · Information Technology' },
        { time: '26 Jul · 10:15', ref: 'GRN-0089', item: 'Cash Counting Machine', move: '+ 3', type: 'Asset received', location: 'Central Store · Inventory & Stores' },
        { time: '25 Jul · 15:30', ref: 'DSP-0014', item: 'Obsolete Desktop Computer', move: '− 1', type: 'Asset disposal', location: 'Head Office · Information Technology' },
      ]} columns={[['time', 'Date & time'], ['ref', 'Reference'], ['item', 'Item'], ['move', 'Movement'], ['type', 'Transaction'], ['location', 'Branch & department']].map(([key, label]) => ({ key, label }))} /></div>
    </Card>
    <div className="prc-grid">
      <Card title="Procurement pipeline" meta="Live workload by control stage"><div className="prc-pipeline">{[
        ['RFQs open', 8, '3 close this week'], ['Vendor evaluations', 4, '1 document gap'], ['Tenders active', 3, '1 opening due'],
        ['Work orders active', 12, '2 above threshold'], ['GRNs pending', 5, 'Oldest: 4 days'],
      ].map(([a, b, c]) => <div key={a}><span>{a}</span><strong>{b}</strong><small>{c}</small></div>)}</div></Card>
      <Card title="Attention required" meta="Controls requiring an owner"><div className="prc-alerts">{[
        ['2', 'Items below reorder level', 'Central Store'], ['1', 'Physical verification overdue', 'Motijheel Branch'],
        ['3', 'Vendor documents expiring', 'Within 30 days'], ['2', 'Warranty expiries', 'Within 60 days'],
      ].map(([a, b, c]) => <div key={b}><b>{a}</b><span>{b}<small>{c}</small></span></div>)}</div></Card>
    </div>
  </div>;
}

function RFQs() {
  const [rows, setRows] = useState(rfqSeed);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState('type');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('newest');
  const [statusFilter, setStatusFilter] = useState('All');
  const [rfqPage, setRfqPage] = useState(1);
  const [templatePage, setTemplatePage] = useState(1);
  const pageSize = 5;
  const templatePageSize = 4;
  const emptyForm = { title: '', kind: '', deadline: '', terms: '', remarks: '', size: '', paper: '', colour: '', pages: '', binding: '', ply: '', packing: '', item: '', model: '', quantity: '', specification: '', requestType: 'Modification', reference: '', scope: '' };
  const [form, setForm] = useState(emptyForm);
  const [templates, setTemplates] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('prc-rfq-templates') || '[]');
      return [...saved, ...dummyRfqTemplates.filter((sample) => !saved.some((template) => template.id === sample.id))];
    } catch { return dummyRfqTemplates; }
  });
  const types = [
    { code: 'RFQ-1', title: 'Printing & publication', detail: 'Size, paper, colour, pages or pads, binding, ply, packing, and print specifications.' },
    { code: 'RFQ-2', title: 'Items & products', detail: 'Item description, product model and specification, unit, and required quantity.' },
    { code: 'RFQ-3', title: 'Modification & creation', detail: 'Custom modification, fabrication, design, creation options, and scope of work.' },
  ];
  const selectedType = types.find((type) => type.code === form.kind) || types[0];
  const filteredRows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const result = rows.filter((row) => (statusFilter === 'All' || row.status === statusFilter)
      && (!needle || JSON.stringify(row).toLowerCase().includes(needle)));
    return [...result].sort((a, b) => {
      if (sort === 'oldest') return new Date(a.issuedAt || 0) - new Date(b.issuedAt || 0);
      if (sort === 'vendor-az') return (a.vendor || '').localeCompare(b.vendor || '');
      if (sort === 'vendor-za') return (b.vendor || '').localeCompare(a.vendor || '');
      if (sort === 'deadline') return new Date(a.deadline || 0) - new Date(b.deadline || 0);
      return new Date(b.issuedAt || 0) - new Date(a.issuedAt || 0);
    });
  }, [rows, query, sort, statusFilter]);
  const rfqPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const visibleRows = filteredRows.slice((Math.min(rfqPage, rfqPages) - 1) * pageSize, Math.min(rfqPage, rfqPages) * pageSize);
  const templatePages = Math.max(1, Math.ceil(templates.length / templatePageSize));
  const visibleTemplates = templates.slice((Math.min(templatePage, templatePages) - 1) * templatePageSize, Math.min(templatePage, templatePages) * templatePageSize);
  const printRows = form.kind === 'RFQ-1'
    ? [['Size', form.size], ['Paper', form.paper], ['Colour', form.colour], ['Pages / pads', form.pages], ['Binding', form.binding], ['Ply', form.ply], ['Packing / other specification', form.packing]]
    : form.kind === 'RFQ-2'
      ? [['Item description', form.item], ['Product model', form.model], ['Quantity', form.quantity], ['Technical specification', form.specification]]
      : [['Request type', form.requestType], ['Quantity', form.quantity], ['Existing item / reference', form.reference], ['Scope of work', form.scope]];
  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  const begin = () => { setForm(emptyForm); setTemplatePage(1); setStep('type'); setOpen(true); };
  const selectType = (kind) => { setForm({ ...emptyForm, kind }); setStep('form'); };
  const reuse = (template) => { setForm({ ...emptyForm, ...template.data }); setStep('form'); };
  const viewRFQ = (row) => {
    const kind = row.kind?.slice(0, 5) || 'RFQ-1';
    const sampleDetails = kind === 'RFQ-1'
      ? { size: 'A4 / approved custom size', paper: '80 GSM offset paper', colour: 'As approved artwork', pages: '100 sheets per pad', binding: 'Glue bound', ply: 'Single', packing: 'Shrink-wrapped and labelled cartons' }
      : kind === 'RFQ-2'
        ? { item: row.title, model: 'Vendor to quote compliant model', quantity: '10', specification: 'Commercial-grade product with manufacturer warranty, delivery, installation and local support.' }
        : { requestType: 'Modification', quantity: '1', reference: row.title, scope: 'Site inspection, detailed proposal, supply of materials, installation, testing and final handover.' };
    setForm({ ...emptyForm, ...sampleDetails, kind, title: row.title || '', deadline: row.deadline || '', terms: 'Quote unit price, applicable VAT/tax, delivery lead time, warranty and quotation validity. The Bank may accept or reject any quotation.', remarks: `Primary vendor: ${row.vendor || 'Not assigned'}. Invited vendors: ${row.vendors || 0}.`, ...(row.data || {}) });
    setStep('view');
    setOpen(true);
  };
  const saveDraft = (event) => {
    event.preventDefault();
    setRows((current) => [{ id: `RFQ-2026-${48 + current.length}`, title: form.title, kind: form.kind, vendor: 'Not assigned', issuedAt: new Date().toISOString(), deadline: form.deadline || 'Not set', vendors: 0, status: 'Draft', data: form }, ...current]);
    setOpen(false);
  };
  const saveTemplate = () => {
    if (!form.title.trim()) return;
    const next = [{ id: Date.now(), name: form.title, kind: form.kind, data: form }, ...templates];
    setTemplates(next);
    setTemplatePage(1);
    localStorage.setItem('prc-rfq-templates', JSON.stringify(next));
  };
  return <div><Title eyebrow="Sourcing" title="RFQ (Request for Quotation) management" note="Create, reuse, print, search, sort, and track quotation requests." action={<div className="prc-title-actions"><button className="prc-secondary" onClick={() => { setTemplatePage(1); setStep('templates'); setOpen(true); }}><Save size={14} /> Templates <span>{templates.length}</span></button><Button onClick={begin}><Plus size={15} /> Add RFQ</Button></div>} />
    <Card title="Request for quotation register" meta={`${filteredRows.length} of ${rows.length} RFQs`}>
      <div className="prc-rfq-toolbar"><label><Search size={16} /><input value={query} onChange={(event) => { setQuery(event.target.value); setRfqPage(1); }} placeholder="Search RFQ, requirement, vendor, date, status or any detail" /></label>
        <select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setRfqPage(1); }}><option>All</option><option>Draft</option><option>Open</option><option>Evaluation</option><option>Closed</option></select>
        <select value={sort} onChange={(event) => { setSort(event.target.value); setRfqPage(1); }}><option value="newest">Date & time: newest</option><option value="oldest">Date & time: oldest</option><option value="vendor-az">Vendor: A–Z</option><option value="vendor-za">Vendor: Z–A</option><option value="deadline">Deadline: earliest</option></select>
      </div>
      <Table rows={visibleRows} columns={[
        { key: 'id', label: 'RFQ no.' }, { key: 'title', label: 'Requirement' }, { key: 'kind', label: 'Type' }, { key: 'vendor', label: 'Primary vendor' },
        { key: 'issuedAt', label: 'Created', render: (r) => r.issuedAt ? new Date(r.issuedAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : '—' },
        { key: 'deadline', label: 'Deadline' }, { key: 'status', label: 'Status', render: (r) => <Status>{r.status}</Status> },
      ]} onRowClick={viewRFQ} />
      <Pagination page={Math.min(rfqPage, rfqPages)} pages={rfqPages} total={filteredRows.length} pageSize={pageSize} onPage={setRfqPage} />
    </Card>
    {open && <div className="prc-backdrop" onMouseDown={() => setOpen(false)}><div className="prc-modal" onMouseDown={(e) => e.stopPropagation()}>
      {step === 'view' ? <><header><div><span>{form.kind} · RFQ details</span><h2>{form.title}</h2></div><button type="button" onClick={() => setOpen(false)}><X /></button></header>
        <div className="prc-rfq-detail"><dl><div><dt>RFQ format</dt><dd>{form.kind}</dd></div><div><dt>Submission deadline</dt><dd>{form.deadline || 'Not set'}</dd></div>{printRows.map(([label, value]) => <div className={label.toLowerCase().includes('specification') || label === 'Scope of work' ? 'wide' : ''} key={label}><dt>{label}</dt><dd>{value || '—'}</dd></div>)}</dl>
          <section><h3>Terms & conditions</h3><p>{form.terms || 'No additional terms recorded.'}</p></section><section><h3>Remarks</h3><p>{form.remarks || 'No remarks recorded.'}</p></section></div>
        <footer><button type="button" onClick={() => setOpen(false)}>Close</button></footer>
      </> : step === 'templates' ? <><header><div><span>Reusable RFQ library</span><h2>Saved templates</h2></div><button type="button" onClick={() => setOpen(false)}><X /></button></header>
        <div className="prc-template-browser">{templates.length ? visibleTemplates.map((template) => <button key={template.id} type="button" onClick={() => reuse(template)}><Save size={16} /><span><strong>{template.name}</strong><small>{template.kind} · Click to reuse this template</small></span><em>Use template</em></button>) : <p>No RFQ templates have been saved yet.</p>}</div>
        <Pagination page={Math.min(templatePage, templatePages)} pages={templatePages} total={templates.length} pageSize={templatePageSize} onPage={setTemplatePage} compact />
        <footer><button type="button" onClick={() => setOpen(false)}>Close</button><Button type="button" onClick={() => setStep('type')}><Plus size={13} /> Create RFQ</Button></footer>
      </> : step === 'type' ? <><header><div><span>New request for quotation</span><h2>Select RFQ type</h2></div><button type="button" onClick={() => setOpen(false)}><X /></button></header>
        <div className="prc-rfq-picker">{types.map((type) => <button key={type.code} type="button" onClick={() => selectType(type.code)}><span>{type.code}</span><div><strong>{type.title}</strong><p>{type.detail}</p></div><Plus size={15} /></button>)}</div>
        {templates.length > 0 && <div className="prc-template-list"><h3>Saved templates</h3>{visibleTemplates.map((template) => <button key={template.id} type="button" onClick={() => reuse(template)}><Save size={13} /><span><strong>{template.name}</strong><small>{template.kind}</small></span><em>Reuse</em></button>)}<Pagination page={Math.min(templatePage, templatePages)} pages={templatePages} total={templates.length} pageSize={templatePageSize} onPage={setTemplatePage} compact /></div>}
      </> : <form onSubmit={saveDraft}><header><div><span>{selectedType.code} · RFQ entry</span><h2>{selectedType.title}</h2></div><button type="button" onClick={() => setOpen(false)}><X /></button></header>
        <div className="prc-form"><label className="wide">Requirement title<input required value={form.title} onChange={update('title')} /></label>
          <label>RFQ format<input readOnly value={form.kind} /></label><label>Submission deadline<input type="date" value={form.deadline} onChange={update('deadline')} /></label>
          {form.kind === 'RFQ-1' && <div className="prc-spec-grid prc-spec-grid--rfq1 wide"><label>Size<input value={form.size} onChange={update('size')} /></label><label>Paper<input value={form.paper} onChange={update('paper')} /></label><label>Colour<input value={form.colour} onChange={update('colour')} /></label><label>Pages / pads<input value={form.pages} onChange={update('pages')} /></label><label>Binding<input value={form.binding} onChange={update('binding')} /></label><label>Ply<input value={form.ply} onChange={update('ply')} /></label><label className="wide">Packing and other specifications<textarea value={form.packing} onChange={update('packing')} /></label></div>}
          {form.kind === 'RFQ-2' && <div className="prc-spec-grid wide"><label className="wide">Item description<input value={form.item} onChange={update('item')} /></label><label>Product model<input value={form.model} onChange={update('model')} /></label><label>Quantity<input type="number" min="1" value={form.quantity} onChange={update('quantity')} /></label><label className="wide">Product specification<textarea value={form.specification} onChange={update('specification')} /></label></div>}
          {form.kind === 'RFQ-3' && <div className="prc-spec-grid wide"><label>Request type<select value={form.requestType} onChange={update('requestType')}><option>Modification</option><option>New creation</option><option>Fabrication</option><option>Design service</option></select></label><label>Quantity<input type="number" min="1" value={form.quantity} onChange={update('quantity')} /></label><label className="wide">Existing item / reference<input value={form.reference} onChange={update('reference')} /></label><label className="wide">Modification or creation scope<textarea value={form.scope} onChange={update('scope')} /></label></div>}
          <label className="wide prc-no-print">Scanned additional requirements<input type="file" multiple accept=".pdf,.png,.jpg,.jpeg" /></label>
          <label className="wide">Terms & conditions<textarea value={form.terms} onChange={update('terms')} /></label>
          <label className="wide">Remarks<textarea value={form.remarks} onChange={update('remarks')} /></label></div>
        <footer><button type="button" onClick={() => setStep('type')}>Back</button><button type="button" onClick={() => window.print()}><Printer size={13} /> Print</button><button type="button" onClick={saveTemplate}><Save size={13} /> Save template</button><Button>Save draft</Button></footer>
        <section className="prc-rfq-print">
          <header className="prc-print-head"><img src={bankLogo} alt="Commercial Bank" /><div><strong>COMMERCIAL BANK OF CEYLON PLC</strong><span>Bangladesh Operations</span><small>Procurement & Administration Department</small></div></header>
          <div className="prc-print-title"><p>REQUEST FOR QUOTATION</p><h1>{form.title || 'Untitled requirement'}</h1></div>
          <dl className="prc-print-meta"><div><dt>RFQ reference</dt><dd>DRAFT · {form.kind}</dd></div><div><dt>Issue date</dt><dd>{new Date().toLocaleDateString('en-GB')}</dd></div><div><dt>Submission deadline</dt><dd>{form.deadline || 'To be confirmed'}</dd></div><div><dt>Proposal validity</dt><dd>30 days from deadline</dd></div></dl>
          <div className="prc-print-address"><strong>To: Enlisted / Invited Vendors</strong><p>Commercial Bank of Ceylon PLC invites your best commercial proposal for the requirement described below. Please submit a signed quotation in accordance with these specifications and conditions.</p></div>
          <section className="prc-print-section"><h2>1. Requirement specification</h2><table><thead><tr><th>Specification</th><th>Required details</th></tr></thead><tbody>{printRows.map(([label, value]) => <tr key={label}><td>{label}</td><td>{value || '—'}</td></tr>)}</tbody></table></section>
          <section className="prc-print-section"><h2>2. Terms and conditions</h2><p className="preserve">{form.terms || 'Vendor shall state delivery lead time, warranty, payment terms, applicable taxes, and quotation validity. All prices must be quoted in BDT unless otherwise instructed.'}</p></section>
          {form.remarks && <section className="prc-print-section"><h2>3. Remarks</h2><p className="preserve">{form.remarks}</p></section>}
          <section className="prc-print-section prc-print-submit"><h2>{form.remarks ? '4' : '3'}. Proposal submission</h2><ul><li>Quote the RFQ reference on the proposal and envelope/email subject.</li><li>Submit the signed quotation before the stated deadline.</li><li>Attach product literature, compliance statement, and supporting documents where applicable.</li><li>The Bank reserves the right to accept or reject any proposal without assigning a reason.</li></ul></section>
          <div className="prc-print-signatures"><div><span>Prepared by</span><b>Procurement Officer</b></div><div><span>Reviewed by</span><b>Department Head</b></div><div><span>Approved by</span><b>Authorised Signatory</b></div></div>
          <footer className="prc-print-footer"><span>Commercial Bank of Ceylon PLC · Bangladesh Operations</span><span>Confidential procurement document</span></footer>
        </section>
      </form>}
    </div></div>}
  </div>;
}
function Pagination({ page, pages, total, pageSize, onPage, compact = false }) {
  const start = total ? (page - 1) * pageSize + 1 : 0;
  const end = Math.min(page * pageSize, total);
  return <div className={`prc-pagination${compact ? ' compact' : ''}`}><span>{start}–{end} of {total}</span><div><button type="button" disabled={page <= 1} onClick={() => onPage(page - 1)}>Previous</button>{Array.from({ length: pages }, (_, index) => index + 1).map((number) => <button type="button" className={number === page ? 'active' : ''} key={number} onClick={() => onPage(number)}>{number}</button>)}<button type="button" disabled={page >= pages} onClick={() => onPage(page + 1)}>Next</button></div></div>;
}
function Vendors() {
  const empty = { name: '', category: '', contact: '', phone: '', email: '', address: '', tradeLicense: '', etin: '', vat: '', bin: '', psr: '', printerCertificate: '', clients: '', nda: false, otherPapers: [], evaluationCriteria: '', score: '', exception: '', finalSelection: 'Under review', yearlyScore: '', yearlyReview: '', remarks: '' };
  const [rows, setRows] = useState(vendors);
  const [form, setForm] = useState(empty);
  const [open, setOpen] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }));
  const attach = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.files?.[0]?.name || '' }));
  const attachMany = (event) => setForm((current) => ({ ...current, otherPapers: Array.from(event.target.files || [], (file) => file.name) }));
  const Attachment = ({ field, label, optional = false }) => <label className="prc-attachment">{label}{readOnly
    ? <span className={form[field] ? 'attached' : 'missing'}><FileSearch size={14} />{form[field] || (optional ? 'Not applicable' : 'Not attached')}</span>
    : <><input className="prc-file-input" type="file" required={!optional} accept=".pdf,.png,.jpg,.jpeg" onChange={attach(field)} /><span className={`prc-upload-box${form[field] ? ' attached' : ''}`}><UploadCloud size={18} /><b>{form[field] || 'Choose document'}</b><small>PDF, JPG or PNG · Max 10 MB</small></span></>}</label>;
  const add = () => { setForm(empty); setReadOnly(false); setOpen(true); };
  const view = (vendor) => {
    setForm({ ...empty, ...vendor, contact: vendor.contact || 'Md. Arif Hossain', phone: vendor.phone || '+880 1711 000000', email: vendor.email || 'vendor@example.com', address: vendor.address || 'Dhaka, Bangladesh', tradeLicense: vendor.tradeLicense || 'trade-licence-2026.pdf', etin: vendor.etin || 'e-tin-certificate.pdf', vat: vendor.vat || 'vat-certificate.pdf', bin: vendor.bin || 'bin-certificate.pdf', psr: vendor.psr || 'psr-tax-return-2026.pdf', printerCertificate: vendor.category?.toLowerCase().includes('print') ? 'printer-authority-certificate.pdf' : '', clients: vendor.clients || 'Commercial organisations and financial institutions', nda: true, otherPapers: vendor.otherPapers?.length ? vendor.otherPapers : ['company-profile.pdf', 'client-reference-list.pdf'], evaluationCriteria: vendor.evaluationCriteria || 'Document compliance, experience, capability, quality, delivery and financial competitiveness.', yearlyScore: vendor.score, yearlyReview: vendor.review, finalSelection: vendor.status, remarks: vendor.remarks || 'Vendor record reviewed and maintained by Procurement.' });
    setReadOnly(true); setOpen(true);
  };
  const submit = (event) => {
    event.preventDefault();
    setRows((current) => [{ ...form, documents: '6 / 6', score: Number(form.score || 0), review: form.yearlyReview || 'Not reviewed', status: form.finalSelection }, ...current]);
    setOpen(false);
  };
  return <div><Title eyebrow="Supplier controls" title="Vendor management" note="Registration, document compliance, selection, scoring, yearly evaluation, and vendor records." action={<Button onClick={add}><Plus size={15} /> Register vendor</Button>} />
    <Card title="Registration & selection controls" meta="Mandatory evidence checked before vendor enlistment">
      <div className="prc-vendor-controls">{['Company profile', 'Trade licence', 'e-TIN', 'VAT & BIN certificate', 'PSR / tax return', 'Printer certificate (if applicable)', 'Past performance & client contacts', 'Confidentiality undertaking', 'Other required papers'].map((item, index) => <span key={item}><b>{index + 1}</b>{item}</span>)}</div>
    </Card>
    <Card title="Approved and candidate vendors" meta={`${rows.length} vendors · Click a row to view the complete record`}><Table rows={rows} onRowClick={view} columns={[
      { key: 'name', label: 'Company' }, { key: 'category', label: 'Category' }, { key: 'documents', label: 'Documents' }, { key: 'score', label: 'Score', render: (r) => <b>{r.score}/100</b> }, { key: 'review', label: 'Last review' }, { key: 'status', label: 'Selection', render: (r) => <Status>{r.status}</Status> },
    ]} /></Card>
    {open && <div className="prc-backdrop" onMouseDown={() => setOpen(false)}><div className="prc-modal prc-vendor-modal" onMouseDown={(event) => event.stopPropagation()}><form onSubmit={submit}>
      <header><div><span>{readOnly ? 'Vendor record' : 'New vendor registration'}</span><h2>{readOnly ? form.name : 'Register and evaluate vendor'}</h2></div><button type="button" onClick={() => setOpen(false)}><X /></button></header>
      <div className="prc-vendor-form">
        <div className="prc-vendor-column">
        <fieldset><legend>Company profile</legend><label>Company name<input required readOnly={readOnly} value={form.name} onChange={update('name')} /></label><label>Business category<input readOnly={readOnly} value={form.category} onChange={update('category')} /></label><label>Contact person<input readOnly={readOnly} value={form.contact} onChange={update('contact')} /></label><label>Phone<input readOnly={readOnly} value={form.phone} onChange={update('phone')} /></label><label>Email<input readOnly={readOnly} value={form.email} onChange={update('email')} /></label><label>Address<input readOnly={readOnly} value={form.address} onChange={update('address')} /></label></fieldset>
        <fieldset><legend>Evaluation & final selection</legend><label className="wide">Evaluation criteria<textarea readOnly={readOnly} value={form.evaluationCriteria} onChange={update('evaluationCriteria')} /></label><label>Evaluation score (0–100)<input type="number" min="0" max="100" readOnly={readOnly} value={form.score} onChange={update('score')} /></label><label>Final selection<select disabled={readOnly} value={form.finalSelection} onChange={update('finalSelection')}><option>Under review</option><option>Approved</option><option>Conditional</option><option>Rejected</option><option>Review due</option></select></label><label className="wide">Exception / deviation<textarea readOnly={readOnly} value={form.exception} onChange={update('exception')} /></label></fieldset>
        </div>
        <div className="prc-vendor-column">
        <fieldset><legend>Registration document attachments</legend><Attachment field="tradeLicense" label="Trade licence" /><Attachment field="etin" label="e-TIN certificate" /><Attachment field="vat" label="VAT certificate" /><Attachment field="bin" label="BIN certificate" /><Attachment field="psr" label="PSR / tax return certificate" /><Attachment field="printerCertificate" label="Printer certificate" optional /><label className="check"><input type="checkbox" disabled={readOnly} checked={form.nda} onChange={update('nda')} /> Confidentiality undertaking received</label><label className="wide">Past performance and client contacts<textarea readOnly={readOnly} value={form.clients} onChange={update('clients')} /></label><label className="wide prc-multi-attachment">Other required papers{!readOnly && <><input className="prc-file-input" type="file" multiple accept=".pdf,.png,.jpg,.jpeg" onChange={attachMany} /><span className={`prc-upload-box${form.otherPapers.length ? ' attached' : ''}`}><UploadCloud size={19} /><b>{form.otherPapers.length ? `${form.otherPapers.length} papers selected` : 'Choose multiple papers'}</b><small>PDF, JPG or PNG · Multiple files allowed</small></span></>} {form.otherPapers.length > 0 && <span className="prc-file-list">{form.otherPapers.map((name) => <small key={name}><FileSearch size={13} />{name}</small>)}</span>}</label></fieldset>
        <fieldset><legend>Yearly evaluation</legend><label>Yearly score<input type="number" min="0" max="100" readOnly={readOnly} value={form.yearlyScore} onChange={update('yearlyScore')} /></label><label>Evaluation date<input type="date" readOnly={readOnly} value={form.yearlyReview} onChange={update('yearlyReview')} /></label><label className="wide">Remarks<textarea readOnly={readOnly} value={form.remarks} onChange={update('remarks')} /></label></fieldset>
        </div>
      </div>
      <footer><button type="button" onClick={() => setOpen(false)}>Close</button><button type="button" onClick={() => window.print()}><Printer size={13} /> Print / PDF</button>{!readOnly && <Button>Save vendor</Button>}</footer>
      <section className="prc-vendor-print"><header><img src={bankLogo} alt="Commercial Bank" /><div><strong>COMMERCIAL BANK OF CEYLON PLC</strong><span>Vendor Registration & Evaluation Report</span></div></header><h1>{form.name || 'New vendor'}</h1><p className="category">{form.category || 'Business category not stated'}</p>
        <dl>{[['Contact person', form.contact], ['Phone', form.phone], ['Email', form.email], ['Address', form.address], ['Trade licence attachment', form.tradeLicense], ['e-TIN attachment', form.etin], ['VAT attachment', form.vat], ['BIN attachment', form.bin], ['PSR attachment', form.psr], ['Printer certificate', form.printerCertificate || 'Not applicable'], ['Other required papers', form.otherPapers.join(', ') || 'None'], ['Confidentiality undertaking', form.nda ? 'Received' : 'Pending'], ['Evaluation score', form.score ? `${form.score}/100` : 'Not scored'], ['Final selection', form.finalSelection], ['Yearly evaluation', form.yearlyReview || 'Not completed'], ['Yearly score', form.yearlyScore ? `${form.yearlyScore}/100` : 'Not scored']].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || '—'}</dd></div>)}</dl>
        <section><h2>Past performance & client references</h2><p>{form.clients || '—'}</p></section><section><h2>Evaluation criteria</h2><p>{form.evaluationCriteria || '—'}</p></section><section><h2>Exception / deviation</h2><p>{form.exception || 'None recorded'}</p></section><section><h2>Remarks</h2><p>{form.remarks || '—'}</p></section><div className="sign"><span>Prepared by</span><span>Reviewed by</span><span>Approved by</span></div>
      </section>
    </form></div></div>}
  </div>;
}
function Tenders() { return <div><Title eyebrow="Competitive sourcing" title="Tender management" note="Approval, locked submissions, serial-numbered tender receipt, price analysis, MCAS, and reporting." action={<Button><Plus size={15} /> Create tender</Button>} /><Stats values={[[FileSearch, 'Active tenders', 3], [Archive, 'Sealed submissions', 12], [ClipboardCheck, 'Awaiting approval', 2], [BadgeCheck, 'Awarded this year', 18]]} /><Card title="Tender register" meta="Opening controls and bid receipt log"><Table rows={tenders} columns={[
  { key: 'id', label: 'Tender no.' }, { key: 'subject', label: 'Subject' }, { key: 'source', label: 'Source' }, { key: 'closes', label: 'Closing / opening' }, { key: 'bids', label: 'Bids' }, { key: 'status', label: 'Stage', render: (r) => <Status>{r.status}</Status> },
]} /></Card></div>; }
function WorkOrders() { return <div><Title eyebrow="Award to receipt" title="Work order management" note="Signed work orders, delivery deadlines, invoices, supporting documents, GRNs, asset tags, and stock updates." action={<Button><Plus size={15} /> Create work order</Button>} /><div className="prc-callout"><ShieldCheck /><div><strong>Approval threshold</strong><span>Orders above BDT 100,000 require Deputy CEO and COO approval.</span></div></div><Card title="Active work orders"><Table rows={orders} columns={[
  { key: 'id', label: 'Work order' }, { key: 'vendor', label: 'Vendor' }, { key: 'total', label: 'Approved price', render: (r) => money(r.total) }, { key: 'delivery', label: 'Delivery' }, { key: 'progress', label: 'Progress', render: (r) => <Status>{r.progress}</Status> }, { key: 'grn', label: 'GRN' },
]} /></Card></div>; }
function InteractiveDonut({ segments, centerValue, centerLabel, onSelect, compact = false }) {
  const [hovered, setHovered] = useState(null);
  const total = segments.reduce((sum, segment) => sum + segment.value, 0) || 1;
  const radius = compact ? 58 : 68;
  const stroke = compact ? 25 : 27;
  const circumference = 2 * Math.PI * radius;
  let progress = 0;
  return <div className={`prc-svg-donut${compact ? ' compact' : ''}`}>
    <svg viewBox="0 0 180 180" role="img" aria-label={`${centerLabel} donut chart`}>
      <circle className="track" cx="90" cy="90" r={radius} strokeWidth={stroke} />
      {segments.map((segment, index) => {
        const fraction = segment.value / total;
        const start = progress;
        const middleAngle = (start + fraction / 2) * Math.PI * 2 - Math.PI / 2;
        progress += fraction;
        const active = hovered === index;
        const offset = active ? 7 : 0;
        return <g key={segment.label} className={`slice${active ? ' active' : ''}`} transform={`translate(${Math.cos(middleAngle) * offset} ${Math.sin(middleAngle) * offset})`} onMouseEnter={() => setHovered(index)} onMouseLeave={() => setHovered(null)} onFocus={() => setHovered(index)} onBlur={() => setHovered(null)} onClick={() => onSelect(segment, index)} tabIndex="0" role="button" aria-label={`${segment.label}: ${segment.value}, ${Math.round(fraction * 100)} percent`}>
          <circle cx="90" cy="90" r={radius} fill="none" stroke={segment.color} strokeWidth={stroke} strokeDasharray={`${fraction * circumference} ${circumference}`} strokeDashoffset={-start * circumference} transform="rotate(-90 90 90)" />
        </g>;
      })}
    </svg>
    <span className="prc-donut-center"><b>{centerValue}</b>{centerLabel}</span>
    {hovered !== null && <div className="prc-donut-tooltip"><i style={{ background: segments[hovered].color }} /><strong>{segments[hovered].label}</strong><span>{segments[hovered].value} {segments[hovered].unit || 'units'} · {Math.round(segments[hovered].value / total * 100)}%</span><small>Click to view items</small></div>}
  </div>;
}
function Inventory() {
  const empty = { code: '', item: '', category: '', branch: '', department: '', location: '', type: 'General', qty: '', reorder: '', unitPrice: '', value: '', unit: 'Piece', description: '' };
  const [items, setItems] = useState(() => { try { return JSON.parse(localStorage.getItem('prc-general-inventory') || 'null') || stock; } catch { return stock; } });
  const [activities, setActivities] = useState(() => { try { return JSON.parse(localStorage.getItem('prc-inventory-activity') || 'null') || inventoryActivities; } catch { return inventoryActivities; } });
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('All');
  const [stockState, setStockState] = useState('All');
  const [sortBy, setSortBy] = useState('name-az');
  const [tab, setTab] = useState('overview');
  const [usagePeriod, setUsagePeriod] = useState('Month');
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('view');
  const [form, setForm] = useState(empty);
  const [movement, setMovement] = useState({ code: '', direction: 'Stock in', quantity: '', reference: '', date: new Date().toISOString().slice(0, 10), remarks: '' });
  const categories = [...new Set(items.map((item) => item.category))].sort();
  const rows = useMemo(() => items.filter((item) => JSON.stringify(item).toLowerCase().includes(q.toLowerCase()))
    .filter((item) => category === 'All' || item.category === category)
    .filter((item) => stockState === 'All' || (stockState === 'Below reorder' ? item.qty > 0 && item.qty <= item.reorder : stockState === 'In stock' ? item.qty > item.reorder : item.qty === 0))
    .sort((a, b) => sortBy === 'name-za' ? b.item.localeCompare(a.item) : sortBy === 'qty-high' ? b.qty - a.qty : sortBy === 'qty-low' ? a.qty - b.qty : sortBy === 'value-high' ? b.value - a.value : sortBy === 'recent' ? (b.lastMovement?.date || '').localeCompare(a.lastMovement?.date || '') : a.item.localeCompare(b.item)), [items, q, category, stockState, sortBy]);
  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  const updateBranch = (event) => setForm((current) => ({ ...current, branch: event.target.value, department: '', location: '' }));
  const updateDepartment = (event) => setForm((current) => ({ ...current, department: event.target.value, location: current.branch && event.target.value ? `${current.branch} · ${event.target.value}` : '' }));
  const updateMovement = (key) => (event) => setMovement((current) => ({ ...current, [key]: event.target.value }));
  const addItem = () => { setForm({ ...empty, code: `INV-${String(150 + items.length).padStart(4, '0')}` }); setMode('add'); setOpen(true); };
  const viewItem = (item) => {
    const matchedLocation = assetLocations.find(({ branch, departments }) => item.location?.startsWith(`${branch} · `) && departments.includes(item.location.slice(branch.length + 3)));
    setForm({
      ...empty,
      ...item,
      branch: item.branch || matchedLocation?.branch || '',
      department: item.department || (matchedLocation ? item.location.slice(matchedLocation.branch.length + 3) : ''),
      unitPrice: item.unitPrice ?? (item.qty ? Math.round(item.value / item.qty) : 0),
    });
    setMode('view');
    setOpen(true);
  };
  const editItem = () => setMode('edit');
  const openMovement = (code = '') => { setMovement({ code: code || items[0]?.code || '', direction: 'Stock in', quantity: '', reference: '', date: new Date().toISOString().slice(0, 10), remarks: '' }); setMode('movement'); setOpen(true); };
  const saveItem = (event) => {
    event.preventDefault();
    const qty = Number(form.qty || 0);
    const unitPrice = Number(form.unitPrice || 0);
    const location = form.branch && form.department ? `${form.branch} · ${form.department}` : form.location;
    const record = { ...form, location, qty, reorder: Number(form.reorder || 0), unitPrice, value: unitPrice ? Math.round(unitPrice * qty) : Number(form.value || 0) };
    setItems((current) => { const next = mode === 'add' ? [record, ...current] : current.map((item) => item.code === record.code ? record : item); localStorage.setItem('prc-general-inventory', JSON.stringify(next)); return next; });
    const activity = { at: new Date().toISOString(), ref: mode === 'add' ? 'ITEM-NEW' : 'ITEM-UPD', action: mode === 'add' ? 'Item created' : 'Item updated', item: record.item, qty: 0, balance: record.qty, actor: 'Admin & Procurement', destination: record.location };
    setActivities((current) => { const next = [activity, ...current]; localStorage.setItem('prc-inventory-activity', JSON.stringify(next)); return next; });
    setOpen(false);
  };
  const postMovement = (event) => {
    event.preventDefault();
    const quantity = Number(movement.quantity || 0);
    const selected = items.find((item) => item.code === movement.code);
    if (!selected) return;
    const nextQty = Math.max(0, selected.qty + (movement.direction === 'Stock in' ? quantity : -quantity));
    const activity = { at: new Date().toISOString(), ref: movement.reference, action: movement.direction, item: selected.item, qty: movement.direction === 'Stock in' ? quantity : -quantity, balance: nextQty, actor: 'Admin & Procurement', destination: selected.location };
    setItems((current) => { const next = current.map((item) => {
      if (item.code !== movement.code) return item;
      const unitValue = item.qty ? item.value / item.qty : 0;
      return { ...item, qty: nextQty, value: Math.round(unitValue * nextQty), lastMovement: movement };
    }); localStorage.setItem('prc-general-inventory', JSON.stringify(next)); return next; });
    setActivities((current) => { const next = [activity, ...current]; localStorage.setItem('prc-inventory-activity', JSON.stringify(next)); return next; });
    setOpen(false);
  };
  const exportInventory = () => {
    const headings = ['Code', 'Item', 'Category', 'Branch & Department', 'Class', 'Unit', 'On Hand', 'Reorder Level', 'Value BDT'];
    const csv = [headings, ...rows.map((item) => [item.code, item.item, item.category, item.location, item.type, item.unit || 'Piece', item.qty, item.reorder, item.value])]
      .map((line) => line.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'general-inventory.csv'; link.click(); URL.revokeObjectURL(url);
  };
  const totalUnits = items.reduce((sum, item) => sum + item.qty, 0);
  const totalValue = items.reduce((sum, item) => sum + item.value, 0);
  const lowStock = items.filter((item) => item.qty <= item.reorder);
  const categoryRows = categories.map((name) => {
    const grouped = items.filter((item) => item.category === name);
    return { name, products: grouped.length, units: grouped.reduce((sum, item) => sum + item.qty, 0), low: grouped.filter((item) => item.qty <= item.reorder).length, value: grouped.reduce((sum, item) => sum + item.value, 0) };
  });
  const usageSeries = {
    Week: [['Mon', 18], ['Tue', 27], ['Wed', 21], ['Thu', 34], ['Fri', 29], ['Sat', 8], ['Sun', 4]],
    Month: [['W1', 86], ['W2', 112], ['W3', 97], ['W4', 129]],
    Quarter: [['May', 318], ['Jun', 364], ['Jul', 424]],
    'Half yearly': [['Feb', 248], ['Mar', 291], ['Apr', 276], ['May', 318], ['Jun', 364], ['Jul', 424]],
    Yearly: [['Aug', 244], ['Sep', 268], ['Oct', 302], ['Nov', 286], ['Dec', 231], ['Jan', 258], ['Feb', 248], ['Mar', 291], ['Apr', 276], ['May', 318], ['Jun', 364], ['Jul', 424]],
    'Previous year': [['Q1', 752], ['Q2', 884], ['Q3', 927], ['Q4', 811]],
  };
  const chartData = usageSeries[usagePeriod];
  const maxUsage = Math.max(...chartData.map(([, value]) => value));
  const usageTotal = chartData.reduce((sum, [, value]) => sum + value, 0);
  const chartColors = ['#4f8df7', '#27c2a3', '#f2b84b', '#9a73f2', '#ef6f91', '#52b7e8', '#e8894f', '#6fc27c'];
  const healthyCount = items.length - lowStock.length;
  const movementGraph = activities.slice(0, 7).reverse().map((activity) => ({ label: new Date(activity.at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }), value: Math.abs(activity.qty || 0), direction: activity.qty >= 0 ? 'in' : 'out', item: activity.item, activity }));
  const maxMovement = Math.max(1, ...movementGraph.map((entry) => entry.value));
  const maxCategoryValue = Math.max(1, ...categoryRows.map((row) => row.value));
  const inventoryTable = <><div className="prc-inventory-toolbar"><label><Search size={15} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search code, item, category, location or any field" /></label><select value={category} onChange={(event) => setCategory(event.target.value)}><option>All</option>{categories.map((value) => <option key={value}>{value}</option>)}</select><select value={stockState} onChange={(event) => setStockState(event.target.value)}><option>All</option><option>In stock</option><option>Below reorder</option><option>Out of stock</option></select><select value={sortBy} onChange={(event) => setSortBy(event.target.value)}><option value="name-az">Item A–Z</option><option value="name-za">Item Z–A</option><option value="qty-high">Quantity: high to low</option><option value="qty-low">Quantity: low to high</option><option value="value-high">Value: high to low</option><option value="recent">Recently moved</option></select><button onClick={exportInventory}>Export CSV</button></div><Table rows={rows} onRowClick={viewItem} columns={[
    { key: 'code', label: 'Code' }, { key: 'item', label: 'Item' }, { key: 'category', label: 'Category' }, { key: 'location', label: 'Branch & department' }, { key: 'type', label: 'Class' },
    { key: 'qty', label: 'On hand', render: (r) => <b className={r.qty <= r.reorder ? 'danger' : ''}>{r.qty}</b> }, { key: 'reorder', label: 'Reorder at' }, { key: 'value', label: 'Value', render: (r) => money(r.value) },
  ]} /></>;
  return <div className="prc-general-inventory"><Title eyebrow="Stock control" title="General inventory" note="Real-time balances, item cost, reorder monitoring, branch inventory, and digital bin cards." action={<div className="prc-title-actions"><button className="prc-secondary" onClick={addItem}><Plus size={15} /> Add item</button><Button onClick={() => openMovement()}><ArrowRightLeft size={15} /> Record movement</Button></div>} />
    <div className="prc-inventory-tabs">{[['overview', 'Overall stats'], ['items', 'All items'], ['categories', 'By category'], ['low', `Low stock (${lowStock.length})`], ['analytics', 'Consumption analytics'], ['report', 'Reports']].map(([key, label]) => <button className={tab === key ? 'active' : ''} key={key} onClick={() => setTab(key)}>{label}</button>)}</div>
    {tab === 'overview' && <><div className="prc-overview-kpis">{[[Boxes, 'Total products', items.length, () => { setCategory('All'); setStockState('All'); setTab('items'); }], [PackageCheck, 'Units in central stock', totalUnits, () => { setCategory('All'); setStockState('In stock'); setSortBy('qty-high'); setTab('items'); }], [Gauge, 'Low-stock products', lowStock.length, () => setTab('low')], [ShoppingCart, 'Current stock value', money(totalValue), () => { setCategory('All'); setStockState('All'); setSortBy('value-high'); setTab('items'); }]].map(([Icon, label, value, action]) => <button key={label} onClick={action}><Icon /><span>{label}</span><strong>{value}</strong><small>Click to view details →</small></button>)}</div><div className="prc-overview-charts">
      <Card title="Stock distribution" meta="Hover for details · Click a slice or category to view items"><div className="prc-donut-layout"><InteractiveDonut segments={categoryRows.map((row, index) => ({ label: row.name, value: row.units, color: chartColors[index % chartColors.length] }))} centerValue={totalUnits} centerLabel="Total units" onSelect={(segment) => { setCategory(segment.label); setStockState('All'); setTab('items'); }} /><div className="prc-chart-legend">{categoryRows.map((row, index) => <button key={row.name} onClick={() => { setCategory(row.name); setTab('items'); }}><i style={{ background: chartColors[index % chartColors.length] }} /><span>{row.name}<small>{row.units} units · {Math.round(row.units / totalUnits * 100)}%</small></span></button>)}</div></div></Card>
      <Card title="Stock health" meta="Hover for details · Click a slice or status to review products"><div className="prc-health-chart"><InteractiveDonut compact segments={[{ label: 'Healthy products', value: healthyCount, color: '#29c49a', unit: 'products' }, { label: 'Low / reorder products', value: lowStock.length, color: '#ef6b75', unit: 'products' }]} centerValue={`${Math.round(healthyCount / items.length * 100)}%`} centerLabel="Healthy stock" onSelect={(_, index) => { if (index === 0) { setCategory('All'); setStockState('In stock'); setTab('items'); } else setTab('low'); }} /><div className="prc-health-numbers"><button className="prc-health-link" onClick={() => { setStockState('In stock'); setTab('items'); }}><i className="healthy" /><b>{healthyCount}</b>Healthy products</button><button className="prc-health-link" onClick={() => setTab('low')}><i className="low" /><b>{lowStock.length}</b>Low / reorder products</button><button onClick={() => setTab('low')}>Review low stock</button></div></div></Card>
      <Card title="Category stock value" meta="Current inventory value in BDT"><div className="prc-horizontal-chart">{categoryRows.map((row, index) => <button key={row.name} onClick={() => { setCategory(row.name); setTab('items'); }}><span>{row.name}</span><i><em style={{ width: `${row.value / maxCategoryValue * 100}%`, background: chartColors[index % chartColors.length] }} /></i><b>{money(row.value)}</b></button>)}</div></Card>
      <Card title="Recent stock movement" meta="Quantity received and issued in latest transactions"><div className="prc-movement-chart">{movementGraph.map((entry, index) => <button title={`Open ${entry.item}`} onClick={() => { const matched = items.find((item) => item.item === entry.item); if (matched) viewItem(matched); }} key={`${entry.label}-${entry.value}-${index}`}><span>{entry.value}</span><i><em className={entry.direction} style={{ height: `${Math.max(10, entry.value / maxMovement * 100)}%` }} /></i><b>{entry.label}</b></button>)}</div><div className="prc-movement-legend"><button onClick={() => { setStockState('All'); setSortBy('recent'); setTab('items'); }}><i className="in" />Stock received</button><button onClick={() => setTab('analytics')}><i className="out" />Stock issued</button></div></Card>
    </div></>}
    {tab === 'items' && <Card title="Central inventory list" meta={`${rows.length} products available to Admin & Procurement for distribution`}>{inventoryTable}</Card>}
    {tab === 'categories' && <Card title="Inventory by category" meta={`${categories.length} categories · Click All Items to view individual products`}><Table rows={categoryRows} onRowClick={(row) => { setCategory(row.name); setTab('items'); }} columns={[{ key: 'name', label: 'Category' }, { key: 'products', label: 'Number of products' }, { key: 'units', label: 'Units on hand' }, { key: 'low', label: 'Low-stock products', render: (r) => <b className={r.low ? 'danger' : ''}>{r.low}</b> }, { key: 'value', label: 'Stock value', render: (r) => money(r.value) }]} /></Card>}
    {tab === 'low' && <Card title="Low-stock and reorder items" meta="Products at or below their approved reorder level"><Table rows={lowStock} onRowClick={viewItem} columns={[{ key: 'code', label: 'Code' }, { key: 'item', label: 'Product' }, { key: 'category', label: 'Category' }, { key: 'qty', label: 'On hand', render: (r) => <b className="danger">{r.qty}</b> }, { key: 'reorder', label: 'Reorder level' }, { key: 'shortage', label: 'Suggested reorder', render: (r) => Math.max(r.reorder * 2 - r.qty, r.reorder) }, { key: 'value', label: 'Current value', render: (r) => money(r.value) }]} /></Card>}
    {tab === 'analytics' && <Card title="Item consumption and usage" meta="Issued quantities from Central Store across branches and departments"><div className="prc-period-tabs">{Object.keys(usageSeries).map((period) => <button className={usagePeriod === period ? 'active' : ''} onClick={() => setUsagePeriod(period)} key={period}>{period}</button>)}</div><div className="prc-analytics-summary"><span><b>{usageTotal}</b>Units consumed</span><span><b>{Math.round(usageTotal / chartData.length)}</b>Average per period</span><span><b>{chartData.reduce((best, current) => current[1] > best[1] ? current : best)[0]}</b>Highest usage period</span></div><div className="prc-usage-chart">{chartData.map(([label, value]) => <div key={label}><span>{value}</span><i><em style={{ height: `${Math.max(8, value / maxUsage * 100)}%` }} /></i><b>{label}</b></div>)}</div><Table rows={activities.filter((row) => row.qty < 0)} columns={[{ key: 'at', label: 'Usage date', render: (row) => new Date(row.at).toLocaleString('en-GB') }, { key: 'item', label: 'Product' }, { key: 'qty', label: 'Consumed', render: (row) => Math.abs(row.qty) }, { key: 'destination', label: 'Branch / department' }, { key: 'ref', label: 'Requisition / reference' }]} /></Card>}
    {tab === 'report' && <Card title="General inventory report" meta="The report uses the search, category, stock-status and sort selections below"><div className="prc-report-print">{inventoryTable}</div><div className="prc-report-actions"><span>{rows.length} matching products · {rows.reduce((sum, item) => sum + item.qty, 0)} units · {money(rows.reduce((sum, item) => sum + item.value, 0))}</span><button onClick={exportInventory}>Export CSV</button><button onClick={() => window.print()}><Printer size={14} /> Print / PDF</button></div></Card>}
    {open && <div className="prc-backdrop" onMouseDown={() => setOpen(false)}><div className="prc-modal prc-inventory-modal" onMouseDown={(event) => event.stopPropagation()}>
      {mode === 'view' ? <><header><div><span>Inventory item · {form.code}</span><h2>{form.item}</h2></div><button type="button" onClick={() => setOpen(false)}><X /></button></header>
        <div className="prc-inventory-detail"><dl>{[['Item code', form.code], ['Category', form.category], ['Class', form.type], ['Unit', form.unit || 'Piece'], ['Branch & department', form.location], ['On hand', form.qty], ['Reorder level', form.reorder], ['Unit price', money(form.unitPrice ?? (form.qty ? form.value / form.qty : 0))], ['Current value', money(form.value)], ['Description', form.description || 'No description recorded']].map(([label, value]) => <div className={label === 'Description' ? 'wide' : ''} key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>{form.qty < form.reorder && <div className="prc-stock-warning"><Gauge size={16} /><span><strong>Below reorder level</strong>This item requires replenishment review.</span></div>}</div>
        <footer><button type="button" onClick={() => setOpen(false)}>Close</button><button type="button" onClick={() => openMovement(form.code)}><ArrowRightLeft size={13} /> Record movement</button><Button type="button" onClick={editItem}>Edit item</Button></footer>
      </> : mode === 'movement' ? <form onSubmit={postMovement}><header><div><span>Inventory transaction</span><h2>Record stock movement</h2></div><button type="button" onClick={() => setOpen(false)}><X /></button></header>
        <div className="prc-inventory-form"><label className="wide">Inventory item<select required value={movement.code} onChange={updateMovement('code')}>{items.map((item) => <option key={item.code} value={item.code}>{item.code} · {item.item} · On hand {item.qty}</option>)}</select></label><label>Movement type<select value={movement.direction} onChange={updateMovement('direction')}><option>Stock in</option><option>Stock out</option></select></label><label>Quantity<input required type="number" min="1" value={movement.quantity} onChange={updateMovement('quantity')} /></label><label>Transaction date<input required type="date" value={movement.date} onChange={updateMovement('date')} /></label><label>Reference<input required value={movement.reference} onChange={updateMovement('reference')} placeholder="GRN / issue / transfer reference" /></label><label className="wide">Remarks<textarea value={movement.remarks} onChange={updateMovement('remarks')} /></label></div><footer><button type="button" onClick={() => setOpen(false)}>Cancel</button><Button>Post movement</Button></footer>
      </form> : <form onSubmit={saveItem}><header><div><span>{mode === 'add' ? 'New inventory record' : `Update inventory · ${form.code}`}</span><h2>{mode === 'add' ? 'Add inventory item' : form.item}</h2></div><button type="button" onClick={() => setOpen(false)}><X /></button></header>
        <div className="prc-inventory-form"><label>Item code<input required readOnly={mode === 'edit'} value={form.code} onChange={update('code')} /></label><label>Item name<input required value={form.item} onChange={update('item')} /></label><label>Category<input required value={form.category} onChange={update('category')} /></label><label>Class<select value={form.type} onChange={update('type')}><option>General</option><option>Fixed asset</option></select></label><label>Unit<select value={form.unit} onChange={update('unit')}><option>Piece</option><option>Box</option><option>Pack</option><option>Roll</option><option>Set</option><option>Unit</option></select></label><label>On-hand quantity<input required type="number" min="0" value={form.qty} onChange={update('qty')} /></label><label>Reorder level<input required type="number" min="0" value={form.reorder} onChange={update('reorder')} /></label><label>Unit price (BDT)<input required type="number" min="0" step="0.01" value={form.unitPrice} onChange={update('unitPrice')} placeholder="Price per unit" /></label><label>Total value (BDT)<input readOnly type="number" value={form.unitPrice !== '' && form.qty !== '' ? Number(form.unitPrice || 0) * Number(form.qty || 0) : form.value} title="Calculated automatically from unit price × on-hand quantity" /></label><label>Branch<select required value={form.branch} onChange={updateBranch}><option value="">Select branch</option>{assetLocations.map(({ branch }) => <option key={branch} value={branch}>{branch}</option>)}</select></label><label>Department<select required value={form.department} onChange={updateDepartment} disabled={!form.branch}><option value="">{form.branch ? 'Select department' : 'Select branch first'}</option>{assetLocations.find(({ branch }) => branch === form.branch)?.departments.map((department) => <option key={department} value={department}>{department}</option>)}</select></label><label className="wide">Description<textarea value={form.description} onChange={update('description')} /></label></div><footer><button type="button" onClick={() => setOpen(false)}>Cancel</button><Button>{mode === 'add' ? 'Add item' : 'Save changes'}</Button></footer>
      </form>}
    </div></div>}
  </div>;
}

function InventoryRequisitions() {
  const loadInventory = () => { try { return JSON.parse(localStorage.getItem('prc-general-inventory') || 'null') || stock; } catch { return stock; } };
  const [requests, setRequests] = useState(() => { try { return JSON.parse(localStorage.getItem('prc-inventory-requisitions') || 'null') || requisitionSeed; } catch { return requisitionSeed; } });
  const [inventory, setInventory] = useState(loadInventory);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('All');
  const [sort, setSort] = useState('newest');
  const [selected, setSelected] = useState(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ requester: '', destination: '', purpose: '', code: stock[0].code, quantity: 1, items: [] });
  const saveRequests = (next) => { setRequests(next); localStorage.setItem('prc-inventory-requisitions', JSON.stringify(next)); };
  const rows = useMemo(() => requests.filter((request) => JSON.stringify(request).toLowerCase().includes(q.toLowerCase())).filter((request) => status === 'All' || request.status === status).sort((a, b) => sort === 'oldest' ? a.requestedAt.localeCompare(b.requestedAt) : sort === 'destination' ? a.destination.localeCompare(b.destination) : sort === 'status' ? a.status.localeCompare(b.status) : b.requestedAt.localeCompare(a.requestedAt)), [requests, q, status, sort]);
  const product = (code) => inventory.find((item) => item.code === code) || stock.find((item) => item.code === code);
  const addLine = () => {
    const qty = Math.max(1, Number(form.quantity || 1));
    setForm((current) => ({ ...current, items: current.items.some((line) => line.code === current.code) ? current.items.map((line) => line.code === current.code ? { ...line, requested: line.requested + qty, approved: line.requested + qty } : line) : [...current.items, { code: current.code, requested: qty, approved: qty }] }));
  };
  const submit = (event) => {
    event.preventDefault();
    if (!form.items.length) return;
    const request = { id: `REQ-2026-${String(109 + requests.length).padStart(4, '0')}`, requestedAt: new Date().toISOString(), requester: form.requester, destination: form.destination, purpose: form.purpose, status: 'Pending Unit Approval', items: form.items };
    saveRequests([request, ...requests]); setCreating(false); setSelected(request);
  };
  const updateApproved = (code, value) => setSelected((current) => ({ ...current, items: current.items.map((line) => line.code === code ? { ...line, approved: Math.max(0, Number(value || 0)) } : line) }));
  const persistSelected = (request) => { saveRequests(requests.map((item) => item.id === request.id ? request : item)); setSelected(request); };
  const advance = () => {
    const nextStatus = { 'Pending Unit Approval': 'Pending Admin Approval', 'Pending Admin Approval': 'Pending Procurement', 'Pending Procurement': 'Ready to Distribute' }[selected.status];
    if (nextStatus) persistSelected({ ...selected, status: nextStatus });
  };
  const distribute = () => {
    const unavailable = selected.items.find((line) => (product(line.code)?.qty || 0) < line.approved);
    if (unavailable) { window.alert(`Insufficient central stock for ${product(unavailable.code)?.item}.`); return; }
    const activities = [];
    const nextInventory = inventory.map((item) => {
      const line = selected.items.find((entry) => entry.code === item.code);
      if (!line) return item;
      const nextQty = item.qty - line.approved;
      const unitValue = item.qty ? item.value / item.qty : 0;
      activities.push({ at: new Date().toISOString(), ref: selected.id, action: 'Distributed', item: item.item, qty: -line.approved, balance: nextQty, actor: 'Admin & Procurement', destination: selected.destination });
      return { ...item, qty: nextQty, value: Math.round(nextQty * unitValue), lastMovement: { date: new Date().toISOString().slice(0, 10), direction: 'Stock out', reference: selected.id } };
    });
    setInventory(nextInventory); localStorage.setItem('prc-general-inventory', JSON.stringify(nextInventory));
    let existing; try { existing = JSON.parse(localStorage.getItem('prc-inventory-activity') || 'null') || inventoryActivities; } catch { existing = inventoryActivities; }
    localStorage.setItem('prc-inventory-activity', JSON.stringify([...activities, ...existing]));
    persistSelected({ ...selected, status: 'Distributed', distributedAt: new Date().toISOString() });
  };
  const openNew = () => { setForm({ requester: '', destination: '', purpose: '', code: inventory[0]?.code || '', quantity: 1, items: [] }); setCreating(true); };
  const workflowLabel = { 'Pending Unit Approval': 'Approve as Unit Head', 'Pending Admin Approval': 'Approve as Admin', 'Pending Procurement': 'Confirm Procurement Review' }[selected?.status];
  return <div><Title eyebrow="Branch & department portal" title="Inventory requisitions" note="Request any centrally held item, route approvals, adjust allocation, and distribute with automatic stock deduction." action={<Button onClick={openNew}><Plus size={15} /> New requisition</Button>} />
    <Stats values={[[ClipboardCheck, 'Open requests', requests.filter((r) => r.status !== 'Distributed').length], [BadgeCheck, 'Ready to distribute', requests.filter((r) => r.status === 'Ready to Distribute').length], [Truck, 'Distributed', requests.filter((r) => r.status === 'Distributed').length], [Boxes, 'Central products', inventory.length]]} />
    <Card title="Requisition register" meta="Click any request to view items, approvals and distribution controls"><div className="prc-inventory-toolbar"><label><Search size={15} /><input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Search request, person, destination, purpose or item" /></label><select value={status} onChange={(event) => setStatus(event.target.value)}><option>All</option>{[...new Set(requests.map((request) => request.status))].map((value) => <option key={value}>{value}</option>)}</select><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="destination">Branch / department</option><option value="status">Status</option></select></div><Table rows={rows} onRowClick={setSelected} columns={[{ key: 'id', label: 'Requisition' }, { key: 'requestedAt', label: 'Requested', render: (r) => new Date(r.requestedAt).toLocaleString('en-GB') }, { key: 'requester', label: 'Requested by' }, { key: 'destination', label: 'Branch / department' }, { key: 'items', label: 'Products', render: (r) => `${r.items.length} product${r.items.length === 1 ? '' : 's'} · ${r.items.reduce((sum, item) => sum + item.requested, 0)} units` }, { key: 'status', label: 'Workflow status', render: (r) => <Status>{r.status}</Status> }]} /></Card>
    {creating && <div className="prc-backdrop"><div className="prc-modal prc-requisition-modal"><form onSubmit={submit}><header><div><span>Inventory requisition portal</span><h2>Request items from Central Store</h2></div><button type="button" onClick={() => setCreating(false)}><X /></button></header><div className="prc-requisition-form"><label>Requester name<input required value={form.requester} onChange={(e) => setForm({ ...form, requester: e.target.value })} /></label><label>Branch & department<select required value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })}><option value="">Select requesting unit</option>{assetLocations.filter((group) => group.branch !== 'Central Store').map(({ branch, departments }) => <optgroup key={branch} label={branch}>{departments.map((department) => <option key={department} value={`${branch} · ${department}`}>{branch} · {department}</option>)}</optgroup>)}</select></label><label className="wide">Purpose / justification<textarea required value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} /></label><div className="prc-line-entry"><label>Available product<select value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })}>{inventory.map((item) => <option key={item.code} value={item.code}>{item.item} · Available {item.qty} {item.unit}</option>)}</select></label><label>Quantity<input min="1" type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} /></label><button type="button" onClick={addLine}><Plus size={14} /> Add product</button></div><div className="wide"><Table rows={form.items} columns={[{ key: 'code', label: 'Code' }, { key: 'name', label: 'Product', render: (line) => product(line.code)?.item }, { key: 'requested', label: 'Requested' }, { key: 'available', label: 'Central stock', render: (line) => product(line.code)?.qty }, { key: 'remove', label: '', render: (line) => <button type="button" onClick={() => setForm((current) => ({ ...current, items: current.items.filter((item) => item.code !== line.code) }))}><Trash2 size={14} /></button> }]} /></div></div><footer><button type="button" onClick={() => setCreating(false)}>Cancel</button><Button>Submit requisition</Button></footer></form></div></div>}
    {selected && <div className="prc-backdrop" onMouseDown={() => setSelected(null)}><div className="prc-modal prc-requisition-modal" onMouseDown={(e) => e.stopPropagation()}><header><div><span>{selected.id} · {new Date(selected.requestedAt).toLocaleString('en-GB')}</span><h2>{selected.destination}</h2></div><button onClick={() => setSelected(null)}><X /></button></header><div className="prc-request-detail"><div className="prc-request-summary"><span><b>Requested by</b>{selected.requester}</span><span><b>Current stage</b><Status>{selected.status}</Status></span><span className="wide"><b>Purpose</b>{selected.purpose}</span></div><div className="prc-approval-flow">{['Unit Head', 'Administration', 'Procurement', 'Distribution'].map((step, index) => <span className={index <= ['Pending Unit Approval', 'Pending Admin Approval', 'Pending Procurement', 'Ready to Distribute', 'Distributed'].indexOf(selected.status) ? 'active' : ''} key={step}>{index + 1}<b>{step}</b></span>)}</div><Table rows={selected.items} columns={[{ key: 'code', label: 'Code' }, { key: 'product', label: 'Product', render: (line) => product(line.code)?.item }, { key: 'requested', label: 'Requested' }, { key: 'approved', label: 'Approved / issue qty', render: (line) => selected.status === 'Pending Procurement' ? <input className="prc-inline-qty" type="number" min="0" max={product(line.code)?.qty} value={line.approved} onChange={(e) => updateApproved(line.code, e.target.value)} /> : line.approved }, { key: 'available', label: 'Central stock', render: (line) => product(line.code)?.qty }, { key: 'after', label: 'Balance after issue', render: (line) => (product(line.code)?.qty || 0) - line.approved }]} /></div><footer><button onClick={() => setSelected(null)}>Close</button>{selected.status !== 'Distributed' && <button onClick={() => persistSelected({ ...selected, status: 'Returned for Modification' })}>Return for modification</button>}{workflowLabel && <Button onClick={advance}>{workflowLabel}</Button>}{selected.status === 'Ready to Distribute' && <Button onClick={distribute}><Truck size={14} /> Distribute & deduct stock</Button>}</footer></div></div>}
  </div>;
}

function InventoryReports() {
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key) || 'null') || fallback; } catch { return fallback; } };
  const inventory = read('prc-general-inventory', stock);
  const requests = read('prc-inventory-requisitions', requisitionSeed);
  const activities = read('prc-inventory-activity', inventoryActivities);
  const [type, setType] = useState('Stock summary');
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('All');
  const [sort, setSort] = useState('name');
  const source = type === 'Requisitions' ? requests : type === 'Distribution activity' ? activities : inventory.filter((item) => type !== 'Reorder report' || item.qty <= item.reorder);
  const options = type === 'Requisitions' ? [...new Set(requests.map((r) => r.status))] : type === 'Distribution activity' ? [...new Set(activities.map((r) => r.action))] : [...new Set(inventory.map((r) => r.category))];
  const rows = source.filter((row) => JSON.stringify(row).toLowerCase().includes(q.toLowerCase())).filter((row) => filter === 'All' || row.status === filter || row.action === filter || row.category === filter).sort((a, b) => sort === 'date' ? String(b.requestedAt || b.at || '').localeCompare(String(a.requestedAt || a.at || '')) : sort === 'quantity' ? (b.qty || 0) - (a.qty || 0) : sort === 'value' ? (b.value || 0) - (a.value || 0) : String(a.item || a.id || '').localeCompare(String(b.item || b.id || '')));
  const columns = type === 'Requisitions' ? [{ key: 'id', label: 'Requisition' }, { key: 'requestedAt', label: 'Date', render: (r) => new Date(r.requestedAt).toLocaleString('en-GB') }, { key: 'requester', label: 'Requester' }, { key: 'destination', label: 'Destination' }, { key: 'items', label: 'Quantity', render: (r) => r.items.reduce((sum, line) => sum + line.approved, 0) }, { key: 'status', label: 'Status' }] : type === 'Distribution activity' ? [{ key: 'at', label: 'Date', render: (r) => new Date(r.at).toLocaleString('en-GB') }, { key: 'ref', label: 'Reference' }, { key: 'action', label: 'Activity' }, { key: 'item', label: 'Product' }, { key: 'qty', label: 'Movement' }, { key: 'balance', label: 'Balance' }, { key: 'destination', label: 'Destination' }] : [{ key: 'code', label: 'Code' }, { key: 'item', label: 'Product' }, { key: 'category', label: 'Category' }, { key: 'unit', label: 'Unit' }, { key: 'qty', label: 'On hand' }, { key: 'reorder', label: 'Reorder' }, { key: 'value', label: 'Value', render: (r) => money(r.value) }];
  const exportCsv = () => { const csv = [columns.map((c) => c.label), ...rows.map((row) => columns.map((c) => c.key === 'items' ? row.items.reduce((sum, line) => sum + line.approved, 0) : row[c.key]))].map((line) => line.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(',')).join('\n'); const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); const link = document.createElement('a'); link.href = url; link.download = `${type.toLowerCase().replaceAll(' ', '-')}.csv`; link.click(); URL.revokeObjectURL(url); };
  return <div><Title eyebrow="Management information" title="Inventory reports" note="Build stock, reorder, requisition and distribution reports from the current filters and sorting." /><Card title="Report builder" meta={`${rows.length} matching records`}><div className="prc-inventory-toolbar"><select value={type} onChange={(e) => { setType(e.target.value); setFilter('All'); }}><option>Stock summary</option><option>Reorder report</option><option>Requisitions</option><option>Distribution activity</option></select><label><Search size={15} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search anything in this report" /></label><select value={filter} onChange={(e) => setFilter(e.target.value)}><option>All</option>{options.map((value) => <option key={value}>{value}</option>)}</select><select value={sort} onChange={(e) => setSort(e.target.value)}><option value="name">Name / reference</option><option value="date">Latest date</option><option value="quantity">Highest quantity</option><option value="value">Highest value</option></select><button onClick={exportCsv}>Export filtered CSV</button><button onClick={() => window.print()}><Printer size={14} /> Print / PDF</button></div><div className="prc-report-print"><div className="prc-report-heading"><img src={bankLogo} alt="CBC" /><div><b>Commercial Bank of Ceylon PLC</b><span>{type} · Generated {new Date().toLocaleString('en-GB')}</span></div></div><Table rows={rows} columns={columns} /></div></Card></div>;
}

function Assets() {
  const empty = { tag: '', asset: '', serial: '', category: '', location: '', branch: '', purchased: '', value: '', depreciationRate: '20', bookValue: '', warranty: '', warrantyExpiry: '', vendor: '', invoice: '', status: 'In use', serviceHistory: [], transferHistory: [], disposal: '' };
  const [rows, setRows] = useState(assets);
  const [form, setForm] = useState(empty);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('view');
  const [workflow, setWorkflow] = useState('');
  const [workflowData, setWorkflowData] = useState({ assetTag: '', destination: '', reference: '', date: '', work: '', provider: '', cost: '', method: 'Write-off', reason: '' });
  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  const nextAssetTag = () => `CBC-AST-${String(2200 + rows.length).padStart(6, '0')}`;
  const add = () => { setForm({ ...empty, tag: nextAssetTag() }); setMode('add'); setOpen(true); };
  const view = (asset) => {
    setForm({ ...empty, ...asset, serial: asset.serial || 'SN-' + asset.tag.slice(-6), category: asset.category || 'Equipment', branch: asset.location?.split(' · ')[0] || asset.location, depreciationRate: asset.depreciationRate || '20', bookValue: asset.bookValue || Math.round(asset.value * .72), warrantyExpiry: asset.warrantyExpiry || '2027-02-14', vendor: asset.vendor || 'Techno Systems Ltd.', invoice: asset.invoice || 'INV-2026-00841', serviceHistory: asset.serviceHistory || [{ date: '2026-06-18', work: 'Preventive inspection and cleaning', provider: 'Authorised service partner', cost: 3500 }, { date: '2026-03-05', work: 'Firmware and functional check', provider: 'Internal IT', cost: 0 }], transferHistory: asset.transferHistory || [{ date: '2026-04-12', from: 'Central Store', to: asset.location, reference: 'TRF-2026-0182' }] });
    setMode('view'); setOpen(true);
  };
  const save = (event) => {
    event.preventDefault();
    const record = { ...form, tag: form.tag || `CBC-AST-${String(2200 + rows.length).padStart(6, '0')}`, value: Number(form.value || 0), location: form.location || form.branch, warranty: form.warranty || 'Not stated' };
    setRows((current) => [record, ...current]); setOpen(false);
  };
  const launchWorkflow = (name, assetTag = '') => {
    if (name === 'purchase') { add(); return; }
    setWorkflowData({ assetTag: assetTag || rows[0]?.tag || '', destination: '', reference: '', date: new Date().toISOString().slice(0, 10), work: '', provider: '', cost: '', method: 'Write-off', reason: '' });
    setWorkflow(name);
  };
  const updateWorkflow = (key) => (event) => setWorkflowData((current) => ({ ...current, [key]: event.target.value }));
  const submitWorkflow = (event) => {
    event.preventDefault();
    setRows((current) => current.map((asset) => {
      if (asset.tag !== workflowData.assetTag) return asset;
      if (workflow === 'transfer') return { ...asset, location: workflowData.destination, transferHistory: [...(asset.transferHistory || []), { date: workflowData.date, from: asset.location, to: workflowData.destination, reference: workflowData.reference || 'Pending reference' }] };
      if (workflow === 'service') return { ...asset, status: 'In use', serviceHistory: [...(asset.serviceHistory || []), { date: workflowData.date, work: workflowData.work, provider: workflowData.provider, cost: Number(workflowData.cost || 0) }] };
      if (workflow === 'disposal') return { ...asset, status: 'Disposed', disposal: `${workflowData.method}: ${workflowData.reason}` };
      return asset;
    }));
    setWorkflow('');
  };
  const selectedWorkflowAsset = rows.find((asset) => asset.tag === workflowData.assetTag);
  return <div><Title eyebrow="Lifecycle register" title="Fixed assets management" note="Maintain barcode-tagged assets through purchase, depreciation, warranty, transfer, service, and disposal." action={<Button onClick={add}><Plus size={15} /> Add asset</Button>} />
    <div className="prc-asset-capabilities">{[[Barcode, 'Barcode inventory', 'Unique asset tags and serial numbers', 'barcode'], [ShoppingCart, 'Purchase & value', 'Invoice, cost and depreciation', 'purchase'], [ArrowRightLeft, 'Branch transfer', 'Location and custody history', 'transfer'], [History, 'Service history', 'Maintenance activity and costs', 'service'], [Trash2, 'Asset disposal', 'Controlled approval and closure', 'disposal']].map(([Icon, title, note, action]) => <button type="button" onClick={() => launchWorkflow(action)} key={title}><Icon /><span><strong>{title}</strong><small>{note}</small></span><em>Open</em></button>)}</div>
    <Card title="Asset register" meta={`${rows.length} assets · Click an asset to view its complete lifecycle`}><Table rows={rows} onRowClick={view} columns={[
      { key: 'tag', label: 'Barcode / asset tag', render: (asset) => <AssetBarcode value={asset.tag} compact /> }, { key: 'asset', label: 'Description' }, { key: 'location', label: 'Current location' }, { key: 'purchased', label: 'Purchased' }, { key: 'value', label: 'Purchase value', render: (r) => money(r.value) }, { key: 'warranty', label: 'Warranty' }, { key: 'status', label: 'Status', render: (r) => <Status>{r.status}</Status> },
    ]} /></Card>
    {open && <div className="prc-backdrop" onMouseDown={() => setOpen(false)}><div className="prc-modal prc-asset-modal" onMouseDown={(event) => event.stopPropagation()}><form onSubmit={save}>
      <header><div><span>{mode === 'add' ? 'New fixed asset' : `Asset lifecycle · ${form.tag}`}</span><h2>{mode === 'add' ? 'Register fixed asset' : form.asset}</h2></div><button type="button" onClick={() => setOpen(false)}><X /></button></header>
      {mode === 'add' ? <div className="prc-asset-form">
        <fieldset><legend>Identification & tagging</legend><div className="prc-barcode-preview"><AssetBarcode value={form.tag} /></div><label>Asset description<input required value={form.asset} onChange={update('asset')} /></label><label>Category<input value={form.category} onChange={update('category')} /></label><label>Barcode / asset tag<input value={form.tag} onChange={update('tag')} /></label><label>Serial number<input value={form.serial} onChange={update('serial')} /></label><label className="wide">Current branch & department<select required value={form.location} onChange={update('location')}><option value="">Select current assignment</option>{assetLocations.map(({ branch, departments }) => <optgroup key={branch} label={branch}>{departments.map((department) => <option key={`${branch}-${department}`} value={`${branch} · ${department}`}>{branch} · {department}</option>)}</optgroup>)}</select></label></fieldset>
        <fieldset><legend>Purchase, value & warranty</legend><label>Purchase date<input type="date" value={form.purchased} onChange={update('purchased')} /></label><label>Purchase value (BDT)<input type="number" min="0" value={form.value} onChange={update('value')} /></label><label>Vendor<input value={form.vendor} onChange={update('vendor')} /></label><label>Invoice / work order<input value={form.invoice} onChange={update('invoice')} /></label><label>Depreciation rate (%)<input type="number" min="0" max="100" value={form.depreciationRate} onChange={update('depreciationRate')} /></label><label>Warranty<input value={form.warranty} onChange={update('warranty')} /></label><label>Warranty expiry<input type="date" value={form.warrantyExpiry} onChange={update('warrantyExpiry')} /></label><label>Status<select value={form.status} onChange={update('status')}><option>In use</option><option>In store</option><option>Service due</option><option>Under repair</option></select></label></fieldset>
      </div> : <div className="prc-asset-detail">
        <div className="prc-asset-barcode-head"><div><span>Scannable Code 39 asset barcode</span><strong>{form.asset}</strong></div><AssetBarcode value={form.tag} /></div>
        <dl>{[['Barcode / asset tag', form.tag], ['Serial number', form.serial], ['Category', form.category], ['Current location', form.location], ['Purchase date', form.purchased], ['Vendor', form.vendor], ['Invoice / work order', form.invoice], ['Purchase value', money(form.value)], ['Depreciation rate', `${form.depreciationRate}% per annum`], ['Current book value', money(form.bookValue)], ['Warranty', form.warranty], ['Warranty expiry', form.warrantyExpiry], ['Status', form.status]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || '—'}</dd></div>)}</dl>
        <div className="prc-asset-lifecycle"><section><header><div><h3><ArrowRightLeft /> Transfer history</h3><p>Purchase, tagging and movement to branches</p></div><button type="button" onClick={() => { setOpen(false); launchWorkflow('transfer', form.tag); }}>Record transfer</button></header>{form.transferHistory.map((item) => <div className="prc-history-row" key={`${item.date}-${item.reference}`}><b>{item.date}</b><span>{item.from} → {item.to}<small>{item.reference}</small></span></div>)}</section>
          <section><header><div><h3><History /> Service history & costs</h3><p>Maintenance and repair expenditure</p></div><button type="button" onClick={() => { setOpen(false); launchWorkflow('service', form.tag); }}>Log service</button></header>{form.serviceHistory.map((item) => <div className="prc-history-row" key={`${item.date}-${item.work}`}><b>{item.date}</b><span>{item.work}<small>{item.provider} · {money(item.cost)}</small></span></div>)}</section>
          <section className="disposal"><header><div><h3><Trash2 /> Asset disposal</h3><p>Controlled write-off, sale, donation or destruction</p></div><button type="button" onClick={() => { setOpen(false); launchWorkflow('disposal', form.tag); }}>Start disposal</button></header><p>{form.disposal || 'No disposal process has been initiated for this asset.'}</p></section></div>
      </div>}
      <footer><button type="button" onClick={() => setOpen(false)}>Close</button>{mode === 'add' && <Button>Save asset</Button>}</footer>
    </form></div></div>}
    {workflow && <div className="prc-backdrop" onMouseDown={() => setWorkflow('')}><div className="prc-modal prc-asset-workflow" onMouseDown={(event) => event.stopPropagation()}>
      {workflow === 'barcode' ? <><header><div><span>Fixed asset control</span><h2>Barcode inventory register</h2></div><button type="button" onClick={() => setWorkflow('')}><X /></button></header>
        <Table rows={rows} onRowClick={(asset) => { setWorkflow(''); view(asset); }} columns={[{ key: 'tag', label: 'Barcode / asset tag', render: (asset) => <AssetBarcode value={asset.tag} compact /> }, { key: 'serial', label: 'Serial number', render: (asset) => asset.serial || `SN-${asset.tag.slice(-6)}` }, { key: 'asset', label: 'Asset' }, { key: 'location', label: 'Location' }, { key: 'status', label: 'Status', render: (asset) => <Status>{asset.status}</Status> }]} />
        <footer><button type="button" onClick={() => setWorkflow('')}>Close</button><Button type="button" onClick={() => { setWorkflow(''); add(); }}><Plus size={13} /> Tag new asset</Button></footer>
      </> : <form onSubmit={submitWorkflow}><header><div><span>Asset lifecycle transaction</span><h2>{workflow === 'transfer' ? 'Transfer asset to branch' : workflow === 'service' ? 'Log service history and cost' : 'Manage asset disposal'}</h2></div><button type="button" onClick={() => setWorkflow('')}><X /></button></header>
        <div className="prc-workflow-form"><label className="wide">Select asset<select required value={workflowData.assetTag} onChange={updateWorkflow('assetTag')}>{rows.filter((asset) => asset.status !== 'Disposed').map((asset) => <option key={asset.tag} value={asset.tag}>{asset.tag} · {asset.asset} · {asset.location}</option>)}</select></label>
          {workflow === 'transfer' && <><label className="wide">Current branch & department<input readOnly value={selectedWorkflowAsset?.location || 'Not assigned'} /></label><label>Transfer date<input required type="date" value={workflowData.date} onChange={updateWorkflow('date')} /></label><label>Transfer reference<input value={workflowData.reference} onChange={updateWorkflow('reference')} placeholder="TRF-2026-..." /></label><label className="wide">Destination branch & department<select required value={workflowData.destination} onChange={updateWorkflow('destination')}><option value="">Select destination</option>{assetLocations.map(({ branch, departments }) => <optgroup key={branch} label={branch}>{departments.map((department) => { const value = `${branch} · ${department}`; return <option disabled={value === selectedWorkflowAsset?.location} key={value} value={value}>{value}</option>; })}</optgroup>)}</select></label></>}
          {workflow === 'service' && <><label>Service date<input required type="date" value={workflowData.date} onChange={updateWorkflow('date')} /></label><label>Service cost (BDT)<input type="number" min="0" value={workflowData.cost} onChange={updateWorkflow('cost')} /></label><label>Service provider<input required value={workflowData.provider} onChange={updateWorkflow('provider')} /></label><label className="wide">Work performed<textarea required value={workflowData.work} onChange={updateWorkflow('work')} /></label></>}
          {workflow === 'disposal' && <><label>Disposal date<input required type="date" value={workflowData.date} onChange={updateWorkflow('date')} /></label><label>Disposal method<select value={workflowData.method} onChange={updateWorkflow('method')}><option>Write-off</option><option>Sale</option><option>Donation</option><option>Destruction</option></select></label><label className="wide">Reason and approval reference<textarea required value={workflowData.reason} onChange={updateWorkflow('reason')} /></label></>}
        </div><footer><button type="button" onClick={() => setWorkflow('')}>Cancel</button><Button>{workflow === 'transfer' ? 'Complete transfer' : workflow === 'service' ? 'Save service record' : 'Complete disposal'}</Button></footer>
      </form>}
    </div></div>}
  </div>;
}
function Audit() { return <div><Title eyebrow="Assurance" title="Audit & compliance" note="Physical verification, open issues, policy compliance, finance consumption and custom board reports." /><Stats values={[[ClipboardCheck, 'Last physical check', '18 Jun 2026'], [Gauge, 'Next verification', '15 Sep 2026'], [Wrench, 'Open action points', 4], [ShieldCheck, 'Policy compliance', '96%']]} /><div className="prc-grid"><Card title="Open audit issues"><Table rows={[
  { issue: 'Asset location mismatch', owner: 'Motijheel Branch', due: '30 Jul 2026', priority: 'High' }, { issue: 'Missing vendor delivery note', owner: 'Procurement', due: '02 Aug 2026', priority: 'Medium' }, { issue: 'Obsolete equipment disposal', owner: 'Administration', due: '14 Aug 2026', priority: 'Medium' },
]} columns={[{ key: 'issue', label: 'Issue' }, { key: 'owner', label: 'Owner' }, { key: 'due', label: 'Due' }, { key: 'priority', label: 'Priority', render: (r) => <Status>{r.priority}</Status> }]} /></Card><Card title="Finance consumption report"><div className="prc-costs">{[['Head Office · IT', 685000, 78], ['Operations', 412000, 47], ['Gulshan Branch', 286000, 33], ['Motijheel Branch', 214000, 25]].map(([a, b, c]) => <div key={a}><span>{a}<b>{money(b)}</b></span><i><em style={{ width: `${c}%` }} /></i></div>)}</div></Card></div></div>; }
function Stats({ values }) { return <div className="prc-kpis compact">{values.map(([Icon, label, value]) => <article key={label}><Icon /><span>{label}</span><strong>{value}</strong></article>)}</div>; }

const links = [
  ['Dashboard', '', Gauge], ['RFQs', 'rfqs', FileSearch], ['Vendors', 'vendors', Users], ['Tenders', 'tenders', Archive],
  ['Work orders & GRN', 'work-orders', Truck], ['General inventory', 'stock', Boxes], ['Inventory requisitions', 'requisitions', ClipboardCheck], ['Fixed assets', 'assets', Tags], ['Inventory reports', 'reports', FileSearch], ['Audit & compliance', 'audit', ShieldCheck],
];
function Nav() { return <aside className="prc-sidebar"><div className="prc-brand"><img src={logo} alt="CBC logo" /><div><strong>Procurement & Inventory</strong><small>CBC Bank · v1.0</small></div></div><nav>{links.map(([label, path, Icon], i) => <div key={label}>{[1, 4, 5, 9].includes(i) && <small>{{ 1: 'Sourcing', 4: 'Purchasing', 5: 'Inventory control', 9: 'Assurance' }[i]}</small>}<NavLink end={!path} to={`/procurement-inventory${path ? `/${path}` : ''}`}><Icon size={16} />{label}</NavLink></div>)}</nav><footer><PackageCheck size={15} /> Controlled lifecycle</footer></aside>; }
export default function PrcModule() {
  return <div className="prc-module"><Nav /><main><header className="prc-topbar"><div><strong>Commercial Bank of Ceylon PLC</strong><span>Bangladesh Operations · Procurement & Asset Inventory</span></div><b><i /> Live controls</b></header><div className="prc-content"><Routes>
    <Route index element={<Dashboard />} /><Route path="rfqs" element={<RFQs />} /><Route path="vendors" element={<Vendors />} /><Route path="tenders" element={<Tenders />} /><Route path="work-orders" element={<WorkOrders />} /><Route path="stock" element={<Inventory />} /><Route path="requisitions" element={<InventoryRequisitions />} /><Route path="assets" element={<Assets />} /><Route path="reports" element={<InventoryReports />} /><Route path="audit" element={<Audit />} /><Route path="*" element={<Navigate to="/procurement-inventory" replace />} />
  </Routes></div></main></div>;
}
