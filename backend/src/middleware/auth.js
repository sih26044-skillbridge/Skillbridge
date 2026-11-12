const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

/**
 * Middleware to verify JWT Bearer token.
 * Attaches `req.user` with the full User record from DB on success.
 */
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ detail: 'Authentication credentials were not provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user) {
      return res.status(401).json({ detail: 'User not found. Token may be stale.' });
    }
    if (!user.isActive) {
      return res.status(403).json({ detail: 'This account has been disabled.' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ detail: 'Token has expired. Please login again.' });
    }
    return res.status(401).json({ detail: 'Invalid token.' });
  }
};

/**
 * Optional auth middleware — attaches user if token present, but does not block.
 */
const optionalToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (user && user.isActive) req.user = user;
  } catch (_) {
    // silently ignore invalid tokens for optional auth
  }
  next();
};

module.exports = { verifyToken, optionalToken };
