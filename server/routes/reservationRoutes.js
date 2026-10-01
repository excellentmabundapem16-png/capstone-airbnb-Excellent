/**
 * routes/reservationRoutes.js
 * ---------------------------
 * POST   /api/reservations       – create reservation (any logged-in user)
 * GET    /api/reservations/host  – reservations for my listings (host/admin)
 * GET    /api/reservations/user  – my reservations as a guest
 * DELETE /api/reservations/:id   – cancel (guest / listing host / admin)
 */
const express = require('express');
const {
  createReservation,
  getReservationsByHost,
  getReservationsByUser,
  deleteReservation,
} = require('../controllers/reservationController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.route('/').post(protect, createReservation);
router.route('/host').get(protect, authorize('host', 'admin'), getReservationsByHost);
router.route('/user').get(protect, getReservationsByUser);
router.route('/:id').delete(protect, deleteReservation);

module.exports = router;
