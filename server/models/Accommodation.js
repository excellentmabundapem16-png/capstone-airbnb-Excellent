/**
 * models/Accommodation.js
 * -----------------------
 * Property listing schema – mirrors the data structure recommended in the
 * project brief (images, type, location, guests, bedrooms, bathrooms,
 * amenities, rating, reviews, price, title, host, host_id, weeklyDiscount,
 * cleaningFee, serviceFee, occupancyTaxes, enhancedCleaning, selfCheckIn,
 * description, specificRatings).
 */
const mongoose = require('mongoose');

const ACCOMMODATION_TYPES = [
  'Entire apartment',
  'Entire house',
  'Private room',
  'Shared room',
  'Villa',
  'Cabin',
  'Loft',
  'Studio',
];

const accommodationSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true },
    description: { type: String, required: [true, 'Description is required'] },
    type: { type: String, enum: ACCOMMODATION_TYPES, required: [true, 'Accommodation type is required'] },
    location: { type: String, required: [true, 'Location is required'], trim: true, index: true },
    guests: { type: Number, required: [true, 'Guest capacity is required'], min: 1 },
    bedrooms: { type: Number, required: [true, 'Bedroom count is required'], min: 0 },
    bathrooms: { type: Number, required: [true, 'Bathroom count is required'], min: 0 },
    price: { type: Number, required: [true, 'Price per night is required'], min: 0 },
    amenities: { type: [String], default: [] },
    images: { type: [String], default: [] },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    reviews: { type: Number, default: 0, min: 0 },
    host: { type: String, required: [true, 'Host name is required'] },
    host_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    weeklyDiscount: { type: Number, default: 0, min: 0, max: 100 }, // % off each full week stayed
    cleaningFee: { type: Number, default: 0, min: 0 },
    serviceFee: { type: Number, default: 0, min: 0 },
    occupancyTaxes: { type: Number, default: 0, min: 0 },
    enhancedCleaning: { type: Boolean, default: false },
    selfCheckIn: { type: Boolean, default: false },
    specificRatings: {
      cleanliness: { type: Number, default: 4.8 },
      communication: { type: Number, default: 4.7 },
      checkIn: { type: Number, default: 4.9 },
      accuracy: { type: Number, default: 4.6 },
      location: { type: Number, default: 4.9 },
      value: { type: Number, default: 4.5 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Accommodation', accommodationSchema);
module.exports.ACCOMMODATION_TYPES = ACCOMMODATION_TYPES;
