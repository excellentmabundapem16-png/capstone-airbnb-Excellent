/**
 * routes/userRoutes.js
 * --------------------
 * POST /api/users/login   – authenticate (JWT)
 * GET  /api/users/profile – current session user (protected)
 */
const express = require('express');
const { loginUser, getProfile } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/login').post(loginUser);
router.route('/profile').get(protect, getProfile);

module.exports = router;
