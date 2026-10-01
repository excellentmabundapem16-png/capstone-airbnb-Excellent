/**
 * models/Reservation.js
 * ---------------------
 * A reservation links a guest (user) to an accommodation for a date range.
 * The price breakdown is recalculated server-side when the reservation is
 * created so clients cannot tamper with totals.
 */
const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    accommodation_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Accommodation', required: true },
    checkIn: { type: Date, required: [true, 'Check-in date is required'] },
    checkOut: { type: Date, required: [true, 'Check-out date is required'] },
    guests: { type: Number, required: true, min: 1 },
    nights: { type: Number, required: true, min: 1 },
    costBreakdown: {
      nightlyTotal: Number, // price x nights
      weeklyDiscount: Number, // negative amount (discount applied)
      cleaningFee: Number,
      serviceFee: Number,
      occupancyTaxes: Number,
      totalCost: Number,
    },
    status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
  },
  { timestamps: true }
);

// Convenience virtual: how many full weeks are discounted.
reservationSchema.virtual('fullWeeks').get(function fullWeeks() {
  return Math.floor(this.nights / 7);
});

module.exports = mongoose.model('Reservation', reservationSchema);
