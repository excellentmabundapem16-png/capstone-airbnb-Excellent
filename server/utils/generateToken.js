/**
 * utils/generateToken.js
 * ----------------------
 * Signs a JWT for a user id (30 day expiry).
 */
const jwt = require('jsonwebtoken');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '30d' });

module.exports = generateToken;
