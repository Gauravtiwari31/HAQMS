const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('[FATAL] JWT_SECRET environment variable is not set. Server cannot start safely.');
  process.exit(1);
}

// ─── Authentication Middleware ────────────────────────────────────────────────
// Verifies the Bearer JWT token, rejects expired tokens, and attaches user payload to req.user
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // FIX: Removed `ignoreExpiration: true` — tokens now properly expire
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    // FIX: Do not leak specific JWT error details to client
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ error: 'Invalid or malformed token.' });
  }
};

// ─── Role Authorization Middleware ────────────────────────────────────────────
// Usage: router.delete('/:id', authenticate, authorize(['ADMIN']), handler)
const authorize = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized. User context missing.' });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden. Insufficient permissions.' });
    }

    next();
  };
};

// ─── Admin-Only Authorization ─────────────────────────────────────────────────
// FIX: Re-enabled the actual ADMIN role check that was intentionally commented out
const authorizeAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden. Admin access required.' });
  }

  next();
};

module.exports = {
  authenticate,
  authorize,
  authorizeAdmin,
  // Keep legacy name as alias so existing imports don't break
  authorizeAdminOnlyLegacy: authorizeAdmin,
};
