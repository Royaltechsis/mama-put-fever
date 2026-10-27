const L = require('./_lib');
module.exports = L.guard(async (req, res) => {
  const u = await L.currentUser(req);
  if (!u) return L.send(res, { ok: false, error: 'Not logged in' });
  if (req.method === 'GET') {
    const rows = await L.q('SELECT data, updated_at FROM mp_saves WHERE user_id = $1', [u.id]);
    return L.send(res, { ok: true, save: rows[0] ? rows[0].data : null, updated_at: rows[0] ? rows[0].updated_at : null });
  }
  if (req.method === 'PUT' || req.method === 'POST') {
    const b = await L.body(req);
    if (!b.save || typeof b.save !== 'object') return L.send(res, { ok: false, error: 'No save sent' });
    const json = JSON.stringify(b.save);
    if (json.length > 200000) return L.send(res, { ok: false, error: 'Save too big' });
    await L.q('INSERT INTO mp_saves (user_id, data, updated_at) VALUES ($1, $2::jsonb, now()) ON CONFLICT (user_id) DO UPDATE SET data = EXCLUDED.data, updated_at = now()', [u.id, json]);
    return L.send(res, { ok: true });
  }
  L.send(res, { ok: false, error: 'GET or PUT' });
});
