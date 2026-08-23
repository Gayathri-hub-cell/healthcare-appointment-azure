// ---------------------------------------------------------------------------
// /api/appointments — book a slot, list my appointments, cancel, and a
// provider-only schedule view.
// ---------------------------------------------------------------------------
const router = require('express').Router();
const { sql, getPool } = require('../db');
const { requireRole } = require('../auth');

// Look up the Users.Id for the signed-in Entra user.
async function userIdFor(pool, oid) {
  const r = await pool.request()
    .input('oid', sql.UniqueIdentifier, oid)
    .query('SELECT Id FROM Users WHERE EntraOid=@oid');
  return r.recordset[0]?.Id;
}

// POST /api/appointments  { slotId }  -> book a slot
router.post('/', async (req, res) => {
  const { slotId } = req.body;
  const pool = await getPool();
  const patientId = await userIdFor(pool, req.user.oid);
  const tx = new sql.Transaction(pool);
  try {
    await tx.begin();
    // Lock the slot row so two people can't book it at the same time.
    const lock = await new sql.Request(tx)
      .input('sid', sql.Int, slotId)
      .query('SELECT IsBooked FROM Slots WITH (UPDLOCK) WHERE Id=@sid');

    if (!lock.recordset.length) { await tx.rollback(); return res.status(404).json({ error: 'Slot not found' }); }
    if (lock.recordset[0].IsBooked) { await tx.rollback(); return res.status(409).json({ error: 'Slot already booked' }); }

    await new sql.Request(tx).input('sid', sql.Int, slotId)
      .query('UPDATE Slots SET IsBooked=1 WHERE Id=@sid');
    const ins = await new sql.Request(tx)
      .input('sid', sql.Int, slotId)
      .input('pid', sql.Int, patientId)
      .query(`INSERT INTO Appointments (SlotId, PatientUserId)
              OUTPUT inserted.Id VALUES (@sid, @pid)`);
    await tx.commit();
    res.status(201).json({ id: ins.recordset[0].Id });
  } catch (e) {
    await tx.rollback();
    res.status(500).json({ error: e.message });
  }
});

// GET /api/appointments  -> my appointments
router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    const patientId = await userIdFor(pool, req.user.oid);
    const r = await pool.request()
      .input('pid', sql.Int, patientId)
      .query(`SELECT a.Id, a.Status, s.StartsAt, p.Name AS Provider, p.Specialty
              FROM Appointments a
              JOIN Slots s ON s.Id=a.SlotId
              JOIN Providers p ON p.Id=s.ProviderId
              WHERE a.PatientUserId=@pid ORDER BY s.StartsAt`);
    res.json(r.recordset);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/appointments/:id/cancel  -> cancel and free the slot
router.put('/:id/cancel', async (req, res) => {
  try {
    const pool = await getPool();
    const patientId = await userIdFor(pool, req.user.oid);
    const r = await pool.request()
      .input('id', sql.Int, req.params.id)
      .input('pid', sql.Int, patientId)
      .query(`UPDATE Appointments SET Status='Cancelled'
              OUTPUT inserted.SlotId
              WHERE Id=@id AND PatientUserId=@pid AND Status='Booked'`);
    if (!r.recordset.length) return res.status(404).json({ error: 'Not found' });
    await pool.request().input('sid', sql.Int, r.recordset[0].SlotId)
      .query('UPDATE Slots SET IsBooked=0 WHERE Id=@sid');
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/appointments/provider/schedule  -> all appointments (Provider role only)
router.get('/provider/schedule', requireRole('Provider'), async (_req, res) => {
  try {
    const pool = await getPool();
    const r = await pool.request().query(
      `SELECT a.Id, a.Status, s.StartsAt, p.Name AS Provider, u.DisplayName AS Patient
       FROM Appointments a
       JOIN Slots s ON s.Id=a.SlotId
       JOIN Providers p ON p.Id=s.ProviderId
       JOIN Users u ON u.Id=a.PatientUserId
       ORDER BY s.StartsAt`);
    res.json(r.recordset);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
