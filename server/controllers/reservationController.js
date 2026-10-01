/**
 * controllers/reservationController.js
 * ------------------------------------
 * Reservation CRUD: create (any logged-in user), list by host, list by user,
 * delete (guest, host of the listing, or admin).
 */
const Accommodation = require('../models/Accommodation');
const Reservation = require('../models/Reservation');
const { buildQuote } = require('../utils/pricing');

/** POST /api/reservations  body: { accommodation_id, checkIn, checkOut, guests } */
const createReservation = async (req, res, next) => {
  try {
    const { accommodation_id, checkIn, checkOut, guests } = req.body;
    if (!accommodation_id || !checkIn || !checkOut || !guests) {
      res.status(400);
      throw new Error('accommodation_id, checkIn, checkOut and guests are required');
    }
    if (new Date(checkOut) <= new Date(checkIn)) {
      res.status(400);
      throw new Error('Check-out date must be after check-in date');
    }
    const accommodation = await Accommodation.findById(accommodation_id);
    if (!accommodation) {
      res.status(404);
      throw new Error('Accommodation not found');
    }
    if (Number(guests) > accommodation.guests) {
      res.status(400);
      throw new Error(`This accommodation sleeps a maximum of ${accommodation.guests} guests`);
    }

    const quote = buildQuote(accommodation, checkIn, checkOut);
    const reservation = await Reservation.create({
      user_id: req.user._id,
      accommodation_id: accommodation._id,
      checkIn,
      checkOut,
      guests: Number(guests),
      nights: quote.nights,
      costBreakdown: {
        nightlyTotal: quote.nightlyTotal,
        weeklyDiscount: -quote.weeklyDiscount,
        cleaningFee: quote.cleaningFee,
        serviceFee: quote.serviceFee,
        occupancyTaxes: quote.occupancyTaxes,
        totalCost: quote.totalCost,
      },
    });

    res.status(201).json(await reservation.populate('accommodation_id'));
  } catch (err) {
    next(err);
  }
};

/** GET /api/reservations/host  (host/admin) – reservations for my listings. */
const getReservationsByHost = async (req, res, next) => {
  try {
    // First find the ids of every listing this host owns...
    const myListings = await Accommodation.find({ host_id: req.user._id }).select('_id');
    const ids = myListings.map((l) => l._id);
    // ...then return all reservations against those listings.
    const result = await Reservation.find({ accommodation_id: { $in: ids } })
      .populate({ path: 'accommodation_id', select: 'title location images price type' })
      .populate({ path: 'user_id', select: 'username email' })
      .sort({ createdAt: -1 });
    res.json(result);
  } catch (err) {
    next(err);
  }
};

/** GET /api/reservations/user – my own reservations as a guest. */
const getReservationsByUser = async (req, res, next) => {
  try {
    const reservations = await Reservation.find({ user_id: req.user._id })
      .populate({ path: 'accommodation_id', select: 'title location images price type' })
      .sort({ createdAt: -1 });
    res.json(reservations);
  } catch (err) {
    next(err);
  }
};

/** DELETE /api/reservations/:id – guest, listing host or admin. */
const deleteReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      res.status(404);
      throw new Error('Reservation not found');
    }
    const isGuest = String(reservation.user_id) === String(req.user._id);
    const listing = await Accommodation.findById(reservation.accommodation_id).select('host_id');
    const isHost = listing && String(listing.host_id) === String(req.user._id);
    if (!isGuest && !isHost && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Forbidden: you cannot cancel this reservation');
    }
    await reservation.deleteOne();
    res.json({ message: 'Reservation cancelled', _id: req.params.id });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createReservation,
  getReservationsByHost,
  getReservationsByUser,
  deleteReservation,
};
