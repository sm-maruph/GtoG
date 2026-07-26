/**
 * API CLIENT
 * ---------------------------------------------------------------------------
 * Token strategy (this is the VAPT-relevant part):
 *
 *   access token  -> held in a module variable. IN MEMORY ONLY.
 *   refresh token -> httpOnly + Secure + SameSite=Strict cookie, set by the API.
 *                    JS never sees it. That is the entire point.
 *
 * Nothing here touches localStorage. A token in localStorage is readable by any
 * XSS payload on the page, and it is a guaranteed pentest finding. The cost is
 * that a hard refresh loses the access token — which is why bootstrap() below
 * silently calls /auth/refresh on app load to get a new one from the cookie.
 */

import axios from 'axios';
import { installMock } from './mock';
import { recordAudit } from '../audit/store';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

let accessToken = null;
let onAuthFailure = null;

export const setAccessToken = (t) => { accessToken = t; };
export const getAccessToken = () => accessToken;
export const setAuthFailureHandler = (fn) => { onAuthFailure = fn; };

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE ?? '/api',
  withCredentials: true,          // required: sends the refresh cookie
  timeout: 20000,
});

if (USE_MOCK) installMock(api);

/* --------------------------------------------------------------------------
   CSRF: the refresh cookie is sent automatically by the browser, which is
   exactly what makes cookie auth CSRF-able. The API also sets a readable
   `csrfToken` cookie; we echo it in a header. An attacker's site can cause the
   cookie to be sent but cannot read it to set the header. Double-submit.
   -------------------------------------------------------------------------- */
function readCookie(name) {
  const match = document.cookie.match(new RegExp(`(^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[2]) : null;
}

const SAFE_METHODS = ['get', 'head', 'options'];

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  if (!SAFE_METHODS.includes((config.method ?? 'get').toLowerCase())) {
    const csrf = readCookie('csrfToken');
    if (csrf) config.headers['X-CSRF-Token'] = csrf;
  }
  return config;
});

/* --------------------------------------------------------------------------
   Single-flight refresh.
   Why the shared promise matters: the dashboard fires ~5 requests on mount. If
   the access token has expired they all 401 at once. Without this, each one
   independently POSTs /auth/refresh — the API sees the same refresh token
   redeemed 5 times, reads that as token replay, and revokes the entire token
   family. The user gets logged out for loading a page. Refresh exactly once and
   let the others queue behind it.
   -------------------------------------------------------------------------- */
let refreshPromise = null;

function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${api.defaults.baseURL}/auth/refresh`, {}, {
        withCredentials: true,
        headers: { 'X-CSRF-Token': readCookie('csrfToken') ?? '' },
      })
      .then((res) => {
        setAccessToken(res.data.accessToken);
        return res.data.accessToken;
      })
      .finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

api.interceptors.response.use(
  (res) => {
    const method = (res.config?.method ?? 'get').toLowerCase();
    const url = String(res.config?.url ?? '');
    if (!['get', 'head', 'options'].includes(method) && !url.includes('/auth/')) {
      const first = url.replace(/^\//, '').split('/')[0] || 'core';
      const moduleCode = ['vbs', 'inv', 'ins', 'utl', 'ppr', 'adm'].includes(first) ? first : 'core';
      recordAudit({
        moduleCode,
        action: `${method.toUpperCase()} ${url.split('?')[0]}`,
        detail: `Successful data change through ${method.toUpperCase()} ${url.split('?')[0]}.`,
        route: url,
      });
    }
    return res;
  },
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    const isAuthCall = original?.url?.includes('/auth/');

    if (status === 401 && original && !original._retried && !isAuthCall) {
      original._retried = true;
      try {
        await refreshAccessToken();
        return api(original);
      } catch {
        setAccessToken(null);
        onAuthFailure?.();
        return Promise.reject(error);
      }
    }

    /* 403 is NOT an auth failure. The user is authenticated and simply lacks the
       permission — or the record is outside their scope. Bouncing them to /login
       here would be maddening and would hide a real permissions bug. Let it
       surface. */
    const failedMethod = (original?.method ?? 'get').toLowerCase();
    const failedUrl = String(original?.url ?? '');
    if (!['get', 'head', 'options'].includes(failedMethod) && !failedUrl.includes('/auth/')) {
      const first = failedUrl.replace(/^\//, '').split('/')[0] || 'core';
      recordAudit({
        moduleCode: ['vbs', 'inv', 'ins', 'utl', 'ppr', 'adm'].includes(first) ? first : 'core',
        action: `${failedMethod.toUpperCase()} ${failedUrl.split('?')[0]}`,
        detail: error.response?.data?.error ?? error.message ?? 'Data change failed.',
        status: 'FAILED', route: failedUrl,
      });
    }
    return Promise.reject(error);
  }
);

/* --------------------------------------------------------------------------
   Public surface
   -------------------------------------------------------------------------- */
export async function login(username, password) {
  const res = await api.post('/auth/login', { username, password });
  setAccessToken(res.data.accessToken);
  return res.data;
}

export async function logout() {
  try { await api.post('/auth/logout'); } finally { setAccessToken(null); }
}

export async function fetchMe() {
  const res = await api.get('/me');
  return res.data;
}

/** Called once on app load: turns the surviving refresh cookie back into a session. */
export async function bootstrap() {
  await refreshAccessToken();
  return fetchMe();
}
