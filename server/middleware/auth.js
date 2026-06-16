const jwt = require('jsonwebtoken');

const DEFAULT_JWT_SECRET = 'dev-local-unsafe-jwt-secret';
const JWT_SECRET = process.env.JWT_SECRET || DEFAULT_JWT_SECRET;

const auth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }
  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token.' });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Access denied.' });
  }
  next();
};

module.exports = { auth, requireRole };
