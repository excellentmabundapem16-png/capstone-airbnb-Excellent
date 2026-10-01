/**
 * controllers/userController.js
 * -----------------------------
 * Authentication endpoints (login + current profile/session check).
 */
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

/**
 * POST /api/users/login
 * body: { email, password }  – email field also accepts a username.
 * Returns the JWT plus a safe user object.
 */
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400);
      throw new Error('Email and password are both required');
    }
    const identifier = String(email).trim().toLowerCase();
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: new RegExp(`^${identifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }],
    }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      throw new Error('Invalid email or password');
    }

    res.json({
      token: generateToken(user._id),
      user: { _id: user._id, username: user.username, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/users/profile   (protected)
 * Returns the logged-in user – used by the frontends to validate a session.
 */
const getProfile = async (req, res) => {
  res.json({ _id: req.user._id, username: req.user.username, email: req.user.email, role: req.user.role });
};

module.exports = { loginUser, getProfile };
