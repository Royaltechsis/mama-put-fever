import { Platform } from 'react-native';
import { totalStars, type Save2 } from './save2';

export type User = { id: number; username: string; email: string };
type Res = { ok: boolean; error?: string; user?: User | null; save?: any };

/** Accounts need the game's own API (the Vercel deployment). The static copies on sites.tab.bot have none. */
export function accountsAvailable() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return false;
  const h = window.location.hostname;
  return !(h.endsWith('sites.tab.bot') || h === 'localhost' || h === '127.0.0.1');
}
async function api(path: string, method = 'GET', body?: unknown): Promise<Res> {
  try {
    const r = await fetch(path, { method, credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
    const ct = r.headers.get('content-type') || '';
    if (!ct.includes('application/json')) return { ok: false, error: 'Accounts are not available on this link.' };
    return (await r.json()) as Res;
  } catch { return { ok: false, error: 'No connection. Try again.' }; }
}
export const me = () => api('/api/auth/me');
export const signup = (username: string, email: string, password: string) => api('/api/auth/signup', 'POST', { username, email, password });
export const login = (loginId: string, password: string) => api('/api/auth/login', 'POST', { login: loginId, password });
export const logout = () => api('/api/auth/logout', 'POST');
export const getSave = () => api('/api/save');
export const putSave = (save: Save2) => api('/api/save', 'PUT', { save });
/** higher = more progress: stars first, then days played, then coins */
export const progressScore = (s: Save2) => totalStars(s) * 1e9 + (s.day ?? 1) * 1e5 + Math.min(99999, s.coins ?? 0);
