import { Navigate, Route, Routes } from 'react-router-dom';
import { InventoryProvider, useInventory } from './InvContext';
import InvNav from './components/InvNav';
import Dashboard from './screens/Dashboard';
import Requests from './screens/Requests';
import NewRequest from './screens/NewRequest';
import RequestDetail from './screens/RequestDetail';
import CenterStock from './screens/CenterStock';
import StockIn from './screens/StockIn';
import BranchStock from './screens/BranchStock';
import Consumption from './screens/Consumption';
import Masters from './screens/Masters';
import Transactions from './screens/Transactions';
import Reports from './screens/Reports';
import './inv.css';

function ProcurementOnly({ children }) {
  const { isProcurement } = useInventory();
  return isProcurement ? children : <Navigate to="/inventory" replace />;
}


function RequesterOnly({ children }) {
  const { isProcurement } = useInventory();
  return isProcurement ? <Navigate to="/inventory/requests" replace /> : children;
}

function InventoryShell() {
  return (
    <div className="inv-module">
      <InvNav />
      <main className="inv-main">
        <header className="inv-topbar">
          <div>
            <strong>Commercial Bank of Ceylon PLC</strong>
            <span>Bangladesh Operations · Stationery Inventory Management</span>
          </div>
          <div className="inv-version">FIFO · v4.0</div>
        </header>

        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="requests" element={<Requests />} />
          <Route path="new" element={<RequesterOnly><NewRequest /></RequesterOnly>} />
          <Route path="requisition/:id" element={<RequestDetail />} />
          <Route path="branch-stock" element={<BranchStock />} />
          <Route path="consumption" element={<Consumption />} />
          <Route path="reports" element={<Reports />} />

          <Route path="center-stock" element={<ProcurementOnly><CenterStock /></ProcurementOnly>} />
          <Route path="stock-in" element={<ProcurementOnly><StockIn /></ProcurementOnly>} />
          <Route path="masters" element={<ProcurementOnly><Masters /></ProcurementOnly>} />
          <Route path="transactions" element={<ProcurementOnly><Transactions /></ProcurementOnly>} />

          <Route path="*" element={<Navigate to="/inventory" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function InvModule() {
  return (
    <InventoryProvider>
      <InventoryShell />
    </InventoryProvider>
  );
}
