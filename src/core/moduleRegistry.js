/**
 * MODULE COMPONENT REGISTRY
 * ---------------------------------------------------------------------------
 * Maps a system code to its lazy-loaded dashboard component. Separate from
 * catalog.js on purpose: the catalog is public metadata (safe to ship to a
 * signed-out visitor), while this wires up the actual application code, loaded
 * only when a user with access enters the system.
 *
 * Adding system #8: add one line here + one entry in catalog.js. Done.
 */

import { lazy } from 'react';

const MODULE_COMPONENTS = {
  ann: lazy(() => import('../modules/ann/AnnModule.jsx')),
  emp: lazy(() => import('../modules/emp/EmpModule.jsx')),
  exb: lazy(() => import('../modules/exb/ExbModule.jsx')),
  vbs: lazy(() => import('../modules/vbs/VbsModule.jsx')),
  inv: lazy(() => import('../modules/inv/InvModule.jsx')),
  prc: lazy(() => import('../modules/prc/PrcModule.jsx')),
  utl: lazy(() => import('../modules/utl/UtlModule.jsx')),
  ins: lazy(() => import('../modules/ins/InsModule.jsx')),
  ppr: lazy(() => import('../modules/ppr/PprModule.jsx')),
  adm: lazy(() => import('../modules/adm/AdmModule.jsx')),
};

export const getModuleComponent = (code) => MODULE_COMPONENTS[code] ?? null;
export const isImplemented = (code) => Boolean(MODULE_COMPONENTS[code]);
