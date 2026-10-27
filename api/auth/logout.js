const L = require('../_lib');
module.exports = async (req, res) => { L.clearSession(res); L.send(res, { ok: true }); };
