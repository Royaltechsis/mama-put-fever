const L = require('../_lib');
module.exports = L.guard(async (req, res) => {
  if (req.method !== 'POST') return L.send(res, { ok: false, error: 'POST only' });
  const b = await L.body(req);
  const username = String(b.username || '').trim(); const email = String(b.email || '').trim().toLowerCase(); const password = String(b.password || '');
  const bad = L.validateSignup({ username, email, password });
  if (bad) return L.send(res, { ok: false, error: bad });
  await L.ensureTables();
  const taken = await L.q('SELECT username, email FROM mp_users WHERE lower(username) = lower($1) OR email = $2', [username, email]);
  if (taken.length) return L.send(res, { ok: false, error: taken[0].email === email ? 'That email already has an account. Log in instead.' : 'That username is taken.' });
  const hash = await L.bcrypt.hash(password, 10);
  const rows = await L.q('INSERT INTO mp_users (username, email, pass_hash) VALUES ($1, $2, $3) RETURNING id, username, email', [username, email, hash]);
  L.setSession(res, rows[0].id);
  L.send(res, { ok: true, user: L.publicUser(rows[0]) });
});
