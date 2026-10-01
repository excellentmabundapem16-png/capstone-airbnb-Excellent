/**
 * controllers/accommodationController.js
 * --------------------------------------
 * CRUD operations for accommodation listings.
 * Create/update/delete require a logged-in host (or admin); reads are public.
 */
const fs = require('fs');
const path = require('path');
const Accommodation = require('../models/Accommodation');
const Reservation = require('../models/Reservation');
const { buildQuote } = require('../utils/pricing');

/** Collect uploaded files (Multer) + url strings from the body into one array. */
const collectImages = (req) => {
  const uploaded = (req.files || []).map((f) => `/uploads/${f.filename}`);
  let fromBody = req.body.images || [];
  if (typeof fromBody === 'string') {
    try {
      fromBody = JSON.parse(fromBody); // FormData arrays may arrive JSON-encoded
    } catch {
      fromBody = fromBody.split(',').map((s) => s.trim()).filter(Boolean);
    }
  }
  return [...fromBody, ...uploaded].filter(Boolean);
};

/** Field level validation with friendly messages (400). */
const validatePayload = (body) => {
  const errors = [];
  const num = (v) => (v === '' || v === undefined || v === null ? NaN : Number(v));

  if (!body.title || !String(body.title).trim()) errors.push('Title is required');
  if (!body.description || !String(body.description).trim()) errors.push('Description is required');
  if (!body.location || !String(body.location).trim()) errors.push('Location is required');
  if (!body.type) errors.push('Accommodation type is required');
  if (!Number.isInteger(num(body.guests)) || num(body.guests) < 1) errors.push('Guests must be a whole number of at least 1');
  if (!Number.isInteger(num(body.bedrooms)) || num(body.bedrooms) < 0) errors.push('Bedrooms must be a whole number of at least 0');
  if (!Number.isInteger(num(body.bathrooms)) || num(body.bathrooms) < 0) errors.push('Bathrooms must be a whole number of at least 0');
  if (Number.isNaN(num(body.price)) || num(body.price) < 0) errors.push('Price per night must be a number of 0 or more');
  ['weeklyDiscount', 'cleaningFee', 'serviceFee', 'occupancyTaxes'].forEach((f) => {
    if (body[f] !== undefined && body[f] !== '' && (Number.isNaN(num(body[f])) || num(body[f]) < 0)) {
      errors.push(`${f} must be a number of 0 or more`);
    }
  });
  if (body.weeklyDiscount !== undefined && body.weeklyDiscount !== '' && num(body.weeklyDiscount) > 100) {
    errors.push('weeklyDiscount must be a percentage between 0 and 100');
  }
  return errors;
};

/** GET /api/accommodations?location=&type=&guests=&maxPrice= */
const getAccommodations = async (req, res, next) => {
  try {
    const { location, type, guests, maxPrice } = req.query;
    const filter = {};
    if (location && location !== 'Any') filter.location = new RegExp(`^${location.trim()}$`, 'i');
    if (type && type !== 'Any') filter.type = type;
    if (guests) filter.guests = { $gte: Number(guests) };
    if (maxPrice) filter.price = { $lte: Number(maxPrice) };
    const accommodations = await Accommodation.find(filter).sort({ createdAt: -1 });
    res.json(accommodations);
  } catch (err) {
    next(err);
  }
};

/** GET /api/accommodations/locations – distinct locations for the filter UI. */
const getLocations = async (req, res, next) => {
  try {
    const locations = await Accommodation.distinct('location');
    res.json(locations.sort());
  } catch (err) {
    next(err);
  }
};

/** GET /api/accommodations/:id */
const getAccommodationById = async (req, res, next) => {
  try {
    const accommodation = await Accommodation.findById(req.params.id);
    if (!accommodation) {
      res.status(404);
      throw new Error('Accommodation not found');
    }
    res.json(accommodation);
  } catch (err) {
    next(err);
  }
};

/** GET /api/accommodations/:id/quote?checkIn=&checkOut= – live cost calculator. */
const getQuote = async (req, res, next) => {
  try {
    const { checkIn, checkOut } = req.query;
    if (!checkIn || !checkOut) {
      res.status(400);
      throw new Error('checkIn and checkOut query parameters are required');
    }
    if (new Date(checkOut) <= new Date(checkIn)) {
      res.status(400);
      throw new Error('Check-out must be after check-in');
    }
    const accommodation = await Accommodation.findById(req.params.id);
    if (!accommodation) {
      res.status(404);
      throw new Error('Accommodation not found');
    }
    res.json(buildQuote(accommodation, checkIn, checkOut));
  } catch (err) {
    next(err);
  }
};

/** POST /api/accommodations  (host/admin, multipart or json) */
const createAccommodation = async (req, res, next) => {
  try {
    const errors = validatePayload(req.body);
    const images = collectImages(req);
    if (images.length === 0) errors.push('At least one image is required');
    if (errors.length) {
      // remove uploaded files again so we do not orphan them
      (req.files || []).forEach((f) => fs.unlink(f.path, () => {}));
      res.status(400);
      throw new Error(errors.join('; '));
    }

    const accommodation = await Accommodation.create({
      ...req.body,
      images,
      host: req.user.username,
      host_id: req.user._id,
    });
    res.status(201).json(accommodation);
  } catch (err) {
    next(err);
  }
};

/** PUT /api/accommodations/:id  (owner host or admin) */
const updateAccommodation = async (req, res, next) => {
  try {
    const accommodation = await Accommodation.findById(req.params.id);
    if (!accommodation) {
      res.status(404);
      throw new Error('Accommodation not found');
    }
    const isOwner = String(accommodation.host_id) === String(req.user._id);
    if (!isOwner && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Forbidden: you can only update your own listings');
    }

    const errors = validatePayload(req.body);
    if (errors.length) {
      (req.files || []).forEach((f) => fs.unlink(f.path, () => {}));
      res.status(400);
      throw new Error(errors.join('; '));
    }

    const images = collectImages(req);
    if (images.length === 0) errors.push('At least one image is required');

    const editable = [
      'title', 'description', 'type', 'location', 'guests', 'bedrooms', 'bathrooms',
      'price', 'amenities', 'weeklyDiscount', 'cleaningFee', 'serviceFee',
      'occupancyTaxes', 'enhancedCleaning', 'selfCheckIn',
    ];
    editable.forEach((field) => {
      if (req.body[field] !== undefined) accommodation[field] = req.body[field];
    });
    if (images.length) accommodation.images = images;

    const updated = await accommodation.save();
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

/** DELETE /api/accommodations/:id  (owner host or admin) */
const deleteAccommodation = async (req, res, next) => {
  try {
    const accommodation = await Accommodation.findById(req.params.id);
    if (!accommodation) {
      res.status(404);
      throw new Error('Accommodation not found');
    }
    const isOwner = String(accommodation.host_id) === String(req.user._id);
    if (!isOwner && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Forbidden: you can only delete your own listings');
    }
    await Reservation.deleteMany({ accommodation_id: accommodation._id });
    await accommodation.deleteOne();
    res.json({ message: 'Listing removed', _id: req.params.id });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAccommodations,
  getLocations,
  getAccommodationById,
  getQuote,
  createAccommodation,
  updateAccommodation,
  deleteAccommodation,
};
