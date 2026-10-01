/**
 * vite.config.js – admin dashboard
 * base '/admin/' so the built app can be served by Express under /admin
 * while the dev server also runs it at http://localhost:5174/admin/.
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // FIX: back to an absolute '/admin/'. The relative './' base broke every
  // nested URL: a refresh on /admin/listings/<id>/edit asked for
  // /admin/listings/<id>/assets/index.js and got HTML back (blank page).
  // main.jsx reads this same value for the router basename, so the two can't
  // drift apart again. Set ADMIN_BASE=/ only if you host the admin on its own.
  base: process.env.ADMIN_BASE || '/admin/',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5174,
    allowedHosts: true,
    proxy: {
      '/api': 'http://localhost:5000',
      '/images': 'http://localhost:5000',
      '/uploads': 'http://localhost:5000',
    },
  },
});
