/**
 * routes/accommodationRoutes.js
 * -----------------------------
 * GET    /api/accommodations            – list (filterable)
 * GET    /api/accommodations/locations  – distinct locations for filters
 * GET    /api/accommodations/:id        – single listing
 * GET    /api/accommodations/:id/quote  – cost calculator quote
 * POST   /api/accommodations            – create   (host/admin, Multer images)
 * PUT    /api/accommodations/:id        – update   (owner host/admin)
 * DELETE /api/accommodations/:id        – delete   (owner host/admin)
 */
const express = require('express');
const {
  getAccommodations,
  getLocations,
  getAccommodationById,
  getQuote,
  createAccommodation,
  updateAccommodation,
  deleteAccommodation,
} = require('../controllers/accommodationController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.route('/').get(getAccommodations).post(protect, authorize('host', 'admin'), upload.array('images', 6), createAccommodation);
router.route('/locations').get(getLocations);
router.route('/:id').get(getAccommodationById);
router.route('/:id/quote').get(getQuote);
router.route('/:id').put(protect, authorize('host', 'admin'), upload.array('images', 6), updateAccommodation);
router.route('/:id').delete(protect, authorize('host', 'admin'), deleteAccommodation);

module.exports = router;
