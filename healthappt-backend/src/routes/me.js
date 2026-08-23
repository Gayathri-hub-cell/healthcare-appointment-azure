// ---------------------------------------------------------------------------
// /api/me — makes sure the signed-in user has a row in the Users table and
// returns their profile (used by the React app right after login).
// ---------------------------------------------------------------------------
const router = require('express').Router();
const { sql, getPool } = require('../db');

router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    const role = req.user.roles[0] || 'Patient';
    const result = await pool.request()
      .input('oid', sql.UniqueIdentifier, req.user.oid)
      .input('name', sql.NVarChar, req.user.name || '')
      .input('email', sql.NVarChar, req.user.email || '')
      .input('role', sql.NVarChar, role)
      .query(`
        MERGE Users AS t
        USING (SELECT @oid AS EntraOid) AS s ON t.EntraOid = s.EntraOid
        WHEN MATCHED THEN UPDATE SET DisplayName=@name, Email=@email, Role=@role
        WHEN NOT MATCHED THEN
          INSERT (EntraOid, DisplayName, Email, Role) VALUES (@oid, @name, @email, @role)
        OUTPUT inserted.Id, inserted.DisplayName, inserted.Email, inserted.Role;
      `);
    res.json(result.recordset[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
