/**
 * utils/pricing.js
 * ----------------
 * Single source of truth for the cost calculator (used by the reservation
 * controller AND exposed to the frontend via GET /api/accommodations/:id/quote).
 *
 * Rules:
 *  - nightlyTotal     = price x nights
 *  - weeklyDiscount   = (weeklyDiscount % off) applied to every night that is
 *                       part of a full week (7 nights) stayed
 *  - cleaningFee / serviceFee / occupancyTaxes are flat fees from the listing
 *  - totalCost        = nightlyTotal - discount + fees
 */
const calcNights = (checkIn, checkOut) => {
  const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
};

const buildQuote = (accommodation, checkIn, checkOut) => {
  const nights = calcNights(checkIn, checkOut);
  const nightlyTotal = nights * accommodation.price;
  const fullWeeks = Math.floor(nights / 7);
  const discountedNights = fullWeeks * 7;
  const weeklyDiscount = Math.round(nightlyTotal * 0 + discountedNights * accommodation.price * (accommodation.weeklyDiscount / 100));
  const cleaningFee = accommodation.cleaningFee || 0;
  const serviceFee = accommodation.serviceFee || 0;
  const occupancyTaxes = accommodation.occupancyTaxes || 0;
  const totalCost = nightlyTotal - weeklyDiscount + cleaningFee + serviceFee + occupancyTaxes;
  return {
    nights,
    fullWeeks,
    nightlyTotal,
    weeklyDiscount,
    cleaningFee,
    serviceFee,
    occupancyTaxes,
    totalCost,
  };
};

module.exports = { calcNights, buildQuote };
