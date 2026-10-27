const L = require('../_lib');
module.exports = L.guard(async (req, res) => {
  if (req.method !== 'POST') return L.send(res, { ok: false, error: 'POST only' });
  const b = await L.body(req);
  const id = String(b.login || b.email || b.username || '').trim(); const password = String(b.password || '');
  if (!id || !password) return L.send(res, { ok: false, error: 'Enter your email or username and password.' });
  await L.ensureTables();
  const rows = await L.q('SELECT id, username, email, pass_hash FROM mp_users WHERE email = lower($1) OR lower(username) = lower($1)', [id]);
  const u = rows[0];
  if (!u || !(await L.bcrypt.compare(password, u.pass_hash))) return L.send(res, { ok: false, error: 'Wrong email/username or password.' });
  L.setSession(res, u.id);
  L.send(res, { ok: true, user: L.publicUser(u) });
});
