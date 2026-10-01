/**
 * server.js
 * ---------
 * Entry point for the Airbnb-clone API (Express + Mongoose + JWT).
 * Also serves: /uploads (Multer images), /images (seed photos) and – when the
 * frontends have been built – the guest SPA at / and the admin SPA at /admin.
 */
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const userRoutes = require('./routes/userRoutes');
const accommodationRoutes = require('./routes/accommodationRoutes');
const reservationRoutes = require('./routes/reservationRoutes');

const app = express();

// --- Global middleware -----------------------------------------------------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// --- Static assets ----------------------------------------------------------
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// --- API routes ---------------------------------------------------------------
app.get('/api/health', (req, res) => res.json({ status: 'ok', uptime: process.uptime() }));
app.use('/api/users', userRoutes);
app.use('/api/accommodations', accommodationRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api', (req, res, next) => notFound(req, res, next)); // unknown /api/* -> 404 JSON

// --- Built frontends (optional; only when `npm run build` has been run) ------
const clientDist = path.join(__dirname, '..', 'client', 'dist');
const adminDist = path.join(__dirname, '..', 'admin', 'dist');

if (fs.existsSync(adminDist)) {
  app.use('/admin', express.static(adminDist));
  app.get(/^\/admin(\/.*)?$/, (req, res) => res.sendFile(path.join(adminDist, 'index.html')));
}
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  // SPA fallback for any non-API GET (the client router owns these paths).
  // Implemented as middleware because Express 5 removed the bare "*" route.
  app.use((req, res, next) => {
    if (req.method !== 'GET') return next();
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/images')) return next();
    return res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// --- Error handling -----------------------------------------------------------
app.use(notFound);
app.use(errorHandler);

// --- Boot ----------------------------------------------------------------------
const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => console.log(`[server] API ready on http://0.0.0.0:${PORT}`));
  })
  .catch((err) => {
    console.error('[server] Failed to start:', err.message);
    process.exit(1);
  });

// Graceful shutdown (also stops the sandbox mongod if we started one)
process.on('SIGTERM', async () => {
  if (global.__MONGO_MEMORY_SERVER) await global.__MONGO_MEMORY_SERVER.stop();
  process.exit(0);
});
