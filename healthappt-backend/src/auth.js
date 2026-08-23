// ---------------------------------------------------------------------------
// auth.js — checks that each request carries a valid Microsoft Entra ID token,
// and provides a helper to require a specific app role (Patient/Provider/Admin).
// ---------------------------------------------------------------------------
require('dotenv').config();
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const tenant = process.env.ENTRA_TENANT_ID;

// Microsoft's common signing keys — validates tokens from ANY tenant / personal
// account (needed for multi-tenant sign-in). For single-tenant only, use:
//   `https://login.microsoftonline.com/${tenant}/discovery/v2.0/keys`
const client = jwksClient({
  jwksUri: 'https://login.microsoftonline.com/common/discovery/v2.0/keys'
});

function getKey(header, cb) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return cb(err);
    cb(null, key.getPublicKey());
  });
}

// Express middleware: rejects the request unless the bearer token is valid.
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing bearer token' });

  jwt.verify(
    token,
    getKey,
    {
      // Accept the audience as either the API client-id GUID or the api://<id> form.
      // (We validate audience + Microsoft's signature; issuer is left open so tokens
      //  from any tenant / personal account are accepted for multi-tenant sign-in.)
      audience: [process.env.API_AUDIENCE, `api://${process.env.API_AUDIENCE}`],
      algorithms: ['RS256']
    },
    (err, decoded) => {
      if (err) return res.status(401).json({ error: 'Invalid token', detail: err.message });
      req.user = {
        oid: decoded.oid,                      // unique Entra user id
        name: decoded.name,
        email: decoded.preferred_username,
        roles: decoded.roles || []             // app roles assigned to the user
      };
      next();
    }
  );
}

// Use like:  router.get('/schedule', requireRole('Provider'), handler)
function requireRole(role) {
  return (req, res, next) => {
    if (!req.user.roles.includes(role)) {
      return res.status(403).json({ error: `Requires role: ${role}` });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
