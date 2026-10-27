const L = require('../_lib');
module.exports = L.guard(async (req, res) => {
  const u = await L.currentUser(req);
  L.send(res, { ok: true, user: u ? L.publicUser(u) : null });
});
