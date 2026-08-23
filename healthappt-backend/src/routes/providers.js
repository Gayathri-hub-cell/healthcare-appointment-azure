// ---------------------------------------------------------------------------
// /api/providers — list doctors, and list a doctor's open appointment slots.
// ---------------------------------------------------------------------------
const router = require('express').Router();
const { sql, getPool } = require('../db');

// GET /api/providers  -> all providers
router.get('/', async (_req, res) => {
  try {
    const pool = await getPool();
    const r = await pool.request()
      .query('SELECT Id, Name, Specialty, Clinic FROM Providers ORDER BY Name');
    res.json(r.recordset);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/providers/:id/slots  -> that provider's free, future slots
router.get('/:id/slots', async (req, res) => {
  try {
    const pool = await getPool();
    const r = await pool.request()
      .input('pid', sql.Int, req.params.id)
      .query(`SELECT Id, StartsAt, DurationMin FROM Slots
              WHERE ProviderId=@pid AND IsBooked=0 AND StartsAt > SYSUTCDATETIME()
              ORDER BY StartsAt`);
    res.json(r.recordset);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
