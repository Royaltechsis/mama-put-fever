// Shared helpers for the Mamaput account API (Vercel serverless functions).
// Needs two env vars in Vercel: DATABASE_URL (Neon Postgres) and SESSION_SECRET (any long random string).
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

let _sql = null;
async function q(text, params = []) {
  if (globalThis.__mp_q) return globalThis.__mp_q(text, params); // local tests inject an in-memory Postgres
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
  if (!_sql) { const { neon } = require('@neondatabase/serverless'); _sql = neon(process.env.DATABASE_URL); }
  const r = typeof _sql.query === 'function' ? await _sql.query(text, params) : await _sql(text, params);
  return Array.isArray(r) ? r : r.rows;
}

let ready = false;
async function ensureTables() {
  if (ready) return;
  await q(`CREATE TABLE IF NOT EXISTS mp_users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    pass_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`);
  await q(`CREATE TABLE IF NOT EXISTS mp_saves (
    user_id INTEGER PRIMARY KEY REFERENCES mp_users(id) ON DELETE CASCADE,
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`);
  ready = true;
}

const secret = () => process.env.SESSION_SECRET || '';
const b64u = (b) => Buffer.from(b).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
function signToken(uid) {
  const body = b64u(JSON.stringify({ uid, exp: Date.now() + 1000 * 60 * 60 * 24 * 60 }));
  const sig = b64u(crypto.createHmac('sha256', secret()).update(body).digest());
  return `${body}.${sig}`;
}
function readToken(tok) {
  if (!tok || !secret()) return null;
  const [body, sig] = String(tok).split('.');
  if (!body || !sig) return null;
  const want = b64u(crypto.createHmac('sha256', secret()).update(body).digest());
  if (want.length !== sig.length || !crypto.timingSafeEqual(Buffer.from(want), Buffer.from(sig))) return null;
  try { const p = JSON.parse(Buffer.from(body.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString()); return p.exp > Date.now() ? p.uid : null; } catch { return null; }
}
const COOKIE = 'mp_session';
function cookieOf(req) {
  const raw = (req.headers && req.headers.cookie) || '';
  const m = raw.split(/;\s*/).find((c) => c.startsWith(COOKIE + '='));
  return m ? decodeURIComponent(m.slice(COOKIE.length + 1)) : null;
}
function setSession(res, uid) {
  res.setHeader('Set-Cookie', `${COOKIE}=${encodeURIComponent(signToken(uid))}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${60 * 60 * 24 * 60}`);
}
function clearSession(res) { res.setHeader('Set-Cookie', `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`); }

// Always answer 200 with { ok } so a failed login doesn't throw red errors in the browser console.
function send(res, obj) { res.statusCode = 200; res.setHeader('Content-Type', 'application/json'); res.setHeader('Cache-Control', 'no-store'); res.end(JSON.stringify(obj)); }

async function body(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') { try { return JSON.parse(req.body); } catch { return {}; } }
  return await new Promise((resolve) => { let d = ''; req.on('data', (c) => (d += c)); req.on('end', () => { try { resolve(JSON.parse(d || '{}')); } catch { resolve({}); } }); req.on('error', () => resolve({})); });
}

const USER_RE = /^[A-Za-z0-9_]{3,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
function validateSignup({ username, email, password }) {
  if (!USER_RE.test(username || '')) return 'Username: 3–20 letters, numbers or _';
  if (!EMAIL_RE.test(email || '')) return 'That email doesn\'t look right';
  if (!password || String(password).length < 6) return 'Password needs at least 6 characters';
  if (String(password).length > 100) return 'Password is too long';
  return null;
}
const publicUser = (u) => ({ id: u.id, username: u.username, email: u.email });

async function currentUser(req) {
  const uid = readToken(cookieOf(req));
  if (!uid) return null;
  await ensureTables();
  const rows = await q('SELECT id, username, email FROM mp_users WHERE id = $1', [uid]);
  return rows[0] || null;
}

function guard(fn) {
  return async (req, res) => {
    try {
      if (!process.env.DATABASE_URL && !globalThis.__mp_q) return send(res, { ok: false, error: 'Accounts are not set up on this server yet.' });
      if (!secret()) return send(res, { ok: false, error: 'Accounts are not set up on this server yet.' });
      await fn(req, res);
    } catch (e) {
      console.error('[mamaput api]', e && e.message);
      send(res, { ok: false, error: 'Server error, try again.' });
    }
  };
}

module.exports = { q, ensureTables, bcrypt, setSession, clearSession, send, body, validateSignup, publicUser, currentUser, guard, signToken, readToken };
