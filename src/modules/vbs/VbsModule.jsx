/**
 * VBS module — content only; chrome comes from ModuleGateway -> ModuleLayout.
 * Three-way fork by permission (the two-stage approval flow):
 *
 *   can('vbs.assign.create')   -> AdminDashboard    (Procurement / Super Admin)
 *                                 final approval + vehicle assignment
 *   can('vbs.request.approve') -> ApproverDashboard (Branch Manager / Dept Head)
 *                                 first-level approve/reject, scoped to their unit
 *   else                       -> Dashboard         (Branch / Dept user)
 *                                 create + track own requests
 *
 * Order matters: an admin also holds view/create, so assign.create is checked
 * FIRST. A manager holds approve but not assign, so they fall to the approver
 * view. Everyone else is an employee.
 */

import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../../core/auth/AuthContext';
import Dashboard from './screens/Dashboard';
import ApproverDashboard from './screens/ApproverDashboard';
import AdminDashboard from './screens/AdminDashboard';
import NewRequest from './screens/NewRequest';
import RequestPage from './screens/RequestPage';
import ReportScreen from './screens/ReportScreen';
import FleetScreen from './screens/FleetScreen';

function Home() {
  const { can } = useAuth();
  if (can('vbs.assign.create')) return <AdminDashboard />;
  if (can('vbs.request.approve')) return <ApproverDashboard />;
  return <Dashboard />;
}

export default function VbsModule() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="new" element={<NewRequest />} />
      <Route path="request/:id" element={<RequestPage />} />
      <Route path="report" element={<ReportScreen />} />
      <Route path="fleet" element={<FleetScreen />} />
    </Routes>
  );
}