/**
 * utils/seed.js
 * -------------
 * Demo data seeder: wipes the collections then inserts users, listings and
 * reservations so the app is instantly explorable. Run with `npm run seed`.
 */
// FIX: load .env first. This used to set MONGO_URI to '' before dotenv ran,
// and dotenv never overwrites a variable that already exists, so the seeder
// always ignored MONGO_URI and filled the sandbox database instead of yours.
require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');
const Accommodation = require('../models/Accommodation');
const Reservation = require('../models/Reservation');

const day = 24 * 60 * 60 * 1000;
const fromNow = (days) => new Date(Date.now() + days * day).toISOString();

const seed = async () => {
  await connectDB();

  await Reservation.deleteMany();
  await Accommodation.deleteMany();
  await User.deleteMany();

  // --- Users (brief's recommended data + an admin account) -----------------
  const [john, jane, admin] = await User.create(
    { username: 'John Doe', email: 'john@example.com', password: 'password123', role: 'user' },
    { username: 'Jane Doe', email: 'jane@example.com', password: 'password321', role: 'host' },
    { username: 'Admin', email: 'admin@airbnb.com', password: 'admin123', role: 'admin' }
  );

  // --- Listings -------------------------------------------------------------
  const listings = await Accommodation.create([
    {
      title: 'Modern Apartment in New York',
      description:
        'Stay in the heart of New York City... A light-filled, fully renovated two bedroom apartment steps from the subway, with skyline views, a chef-grade kitchen and fast fibre wifi. Perfect for families or small teams.',
      type: 'Entire apartment',
      location: 'New York',
      guests: 4,
      bedrooms: 2,
      bathrooms: 2,
      price: 320,
      amenities: ['wifi', 'kitchen', 'free parking', 'air conditioning', 'workspace'],
      images: ['/images/new-york-1.jpg', '/images/new-york-2.jpg', '/images/new-york-3.jpg', '/images/new-york-4.jpg', '/images/new-york-5.jpg'],
      rating: 4.5,
      reviews: 320,
      host: jane.username,
      host_id: jane._id,
      weeklyDiscount: 10,
      cleaningFee: 50,
      serviceFee: 50,
      occupancyTaxes: 30,
      enhancedCleaning: true,
      selfCheckIn: true,
      specificRatings: { cleanliness: 4.8, communication: 4.7, checkIn: 4.9, accuracy: 4.6, location: 4.9, value: 4.5 },
    },
    {
      title: 'Sunlit SoHo Loft with Skyline Views',
      description:
        'A mid-century inspired loft in SoHo with original brick, 4m ceilings and a curated art wall. Walk to everywhere that matters, then come home to a very quiet, very fast wifi sanctuary.',
      type: 'Loft',
      location: 'New York',
      guests: 2,
      bedrooms: 1,
      bathrooms: 1,
      price: 180,
      amenities: ['wifi', 'kitchen', 'workspace', 'washer'],
      images: ['/images/new-york-2.jpg', '/images/new-york-4.jpg', '/images/new-york-1.jpg', '/images/new-york-5.jpg', '/images/new-york-3.jpg'],
      rating: 4.8,
      reviews: 154,
      host: jane.username,
      host_id: jane._id,
      weeklyDiscount: 5,
      cleaningFee: 35,
      serviceFee: 30,
      occupancyTaxes: 20,
      enhancedCleaning: false,
      selfCheckIn: true,
      specificRatings: { cleanliness: 4.9, communication: 4.8, checkIn: 4.7, accuracy: 4.8, location: 4.9, value: 4.6 },
    },
    {
      title: 'Atlantic Vista Villa & Infinity Pool',
      description:
        'Perched between Table Mountain and the Atlantic, this four bedroom villa comes with an infinity pool, sun-drenched patio and sunsets that ruin all other sunsets. Staffed housekeeping twice weekly.',
      type: 'Villa',
      location: 'Cape Town',
      guests: 8,
      bedrooms: 4,
      bathrooms: 3,
      price: 250,
      amenities: ['wifi', 'kitchen', 'free parking', 'pool', 'hot tub', 'air conditioning', 'gym'],
      images: ['/images/cape-town-1.jpg', '/images/cape-town-2.jpg', '/images/cape-town-3.jpg', '/images/cape-town-4.jpg', '/images/cape-town-5.jpg'],
      rating: 4.9,
      reviews: 87,
      host: jane.username,
      host_id: jane._id,
      weeklyDiscount: 15,
      cleaningFee: 80,
      serviceFee: 60,
      occupancyTaxes: 45,
      enhancedCleaning: true,
      selfCheckIn: false,
      specificRatings: { cleanliness: 4.9, communication: 5.0, checkIn: 4.8, accuracy: 4.9, location: 5.0, value: 4.7 },
    },
    {
      title: 'Seine View Studio with French Balcony',
      description:
        'A classic Parisian studio on the fourth floor (no lift, great calves) with herringbone parquet, gold-leaf trim and a balcony that frames the Seine. Bread, cheese and romance within 100m.',
      type: 'Studio',
      location: 'Paris',
      guests: 2,
      bedrooms: 1,
      bathrooms: 1,
      price: 210,
      amenities: ['wifi', 'kitchen', 'workspace'],
      images: ['/images/paris-1.jpg', '/images/paris-2.jpg', '/images/paris-3.jpg', '/images/paris-4.jpg', '/images/paris-5.jpg'],
      rating: 4.7,
      reviews: 203,
      host: jane.username,
      host_id: jane._id,
      weeklyDiscount: 0,
      cleaningFee: 40,
      serviceFee: 45,
      occupancyTaxes: 25,
      enhancedCleaning: false,
      selfCheckIn: true,
      specificRatings: { cleanliness: 4.6, communication: 4.8, checkIn: 4.7, accuracy: 4.7, location: 4.9, value: 4.4 },
    },
    {
      title: 'Shibuya Sky Minimalist Apartment',
      description:
        'Karimoku-style oak, paper lanterns and a view of the Shibuya scramble from the 21st floor. A calm, minimalist base with everything labelled in three languages and a bathtub worth cancelling plans for.',
      type: 'Entire apartment',
      location: 'Tokyo',
      guests: 3,
      bedrooms: 2,
      bathrooms: 1,
      price: 175,
      amenities: ['wifi', 'kitchen', 'air conditioning', 'washer', 'workspace'],
      images: ['/images/tokyo-1.jpg', '/images/tokyo-2.jpg', '/images/tokyo-3.jpg', '/images/tokyo-4.jpg', '/images/tokyo-5.jpg'],
      rating: 4.6,
      reviews: 141,
      host: jane.username,
      host_id: jane._id,
      weeklyDiscount: 8,
      cleaningFee: 30,
      serviceFee: 35,
      occupancyTaxes: 22,
      enhancedCleaning: true,
      selfCheckIn: true,
      specificRatings: { cleanliness: 4.8, communication: 4.6, checkIn: 4.8, accuracy: 4.5, location: 4.8, value: 4.6 },
    },
    {
      title: 'Mara Safari Lodge Tented Suite',
      description:
        'A canvas-walled suite in the African bush with a four-poster bed, lantern light and a veranda where elephants occasionally review your breakfast. Guided game drives included at sunrise.',
      type: 'Private room',
      location: 'Nairobi',
      guests: 2,
      bedrooms: 1,
      bathrooms: 1,
      price: 295,
      amenities: ['free parking', 'breakfast', 'hot tub', 'workspace'],
      images: ['/images/safari-1.jpg', '/images/safari-2.jpg', '/images/safari-3.jpg', '/images/safari-4.jpg', '/images/safari-5.jpg'],
      rating: 4.9,
      reviews: 64,
      host: jane.username,
      host_id: jane._id,
      weeklyDiscount: 12,
      cleaningFee: 25,
      serviceFee: 40,
      occupancyTaxes: 18,
      enhancedCleaning: false,
      selfCheckIn: false,
      specificRatings: { cleanliness: 4.8, communication: 4.9, checkIn: 4.8, accuracy: 4.9, location: 5.0, value: 4.6 },
    },
  ]);

  // --- Reservations (John as guest; Jane sees them in her host view) --------
  await Reservation.create([
    {
      user_id: john._id,
      accommodation_id: listings[2]._id,
      checkIn: fromNow(14),
      checkOut: fromNow(21),
      guests: 6,
      nights: 7,
      costBreakdown: { nightlyTotal: 1750, weeklyDiscount: -262.5, cleaningFee: 80, serviceFee: 60, occupancyTaxes: 45, totalCost: 1672.5 },
    },
    {
      user_id: john._id,
      accommodation_id: listings[4]._id,
      checkIn: fromNow(40),
      checkOut: fromNow(45),
      guests: 2,
      nights: 5,
      costBreakdown: { nightlyTotal: 875, weeklyDiscount: 0, cleaningFee: 30, serviceFee: 35, occupancyTaxes: 22, totalCost: 962 },
    },
    {
      user_id: john._id,
      accommodation_id: listings[0]._id,
      checkIn: fromNow(-30),
      checkOut: fromNow(-25),
      guests: 4,
      nights: 5,
      costBreakdown: { nightlyTotal: 1600, weeklyDiscount: 0, cleaningFee: 50, serviceFee: 50, occupancyTaxes: 30, totalCost: 1730 },
    },
  ]);

  console.log('Seeded: 3 users, 6 listings, 3 reservations.');
  console.log('Logins:  john@example.com / password123  (user)');
  console.log('         jane@example.com / password321  (host)');
  console.log('         admin@airbnb.com / admin123     (admin)');
  process.exit(0);
};

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
