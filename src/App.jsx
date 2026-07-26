/**
 * ROUTING — landing-first.
 * ---------------------------------------------------------------------------
 *   /              public landing directory (no auth)
 *   /login         generic sign-in
 *   <routePath>/*  one system, gated by ModuleGateway (login -> dashboard)
 *
 * System routes are generated from the catalog, so adding a system is a
 * one-line catalog edit + its component in moduleRegistry — never a routing
 * change here.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './core/auth/AuthContext';
import { MODULE_CATALOG } from './core/catalog';
import ModuleGateway from './core/layout/ModuleGateway';
import LandingPage from './pages/landing/LandingPage';
import LoginPage from './pages/LoginPage';
import { ThemeProvider } from './core/theme/ThemeContext';
import './styles/tokens.css';
import './styles/theme-overrides.css';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {MODULE_CATALOG.map((entry) => (
            <Route
              key={entry.code}
              path={`${entry.routePath}/*`}
              element={<ModuleGateway entry={entry} />}
            />
          ))}

          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
