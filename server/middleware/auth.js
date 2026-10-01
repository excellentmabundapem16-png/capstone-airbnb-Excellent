/**
 * middleware/auth.js
 * ------------------
 * JWT protection + role based authorization.
 *  - protect:        requires a valid "Bearer <token>" header
 *  - authorize(...): restricts a route to specific roles
 */
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/** Verify the JWT on the request and attach the user document. */
const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized: no token supplied' });
    }
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Not authorized: user no longer exists' });
    }
    req.user = user;
    return next();
  } catch (err) {
    const message = err.name === 'TokenExpiredError' ? 'Session expired, please log in again' : 'Not authorized: invalid token';
    return res.status(401).json({ message });
  }
};

/** Role guard factory – usage: authorize('host', 'admin') */
const authorize = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Not authorized' });
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: `Forbidden: requires role ${roles.join(' or ')}` });
  }
  return next();
};

module.exports = { protect, authorize };
