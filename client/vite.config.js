/**
 * vite.config.js – guest frontend
 * Dev server proxies API + static image routes to the Express backend so the
 * browser only ever talks to one origin (no CORS / localhost issues).
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
    proxy: {
      '/api': 'http://localhost:5000',
      '/images': 'http://localhost:5000',
      '/uploads': 'http://localhost:5000',
    },
  },
});
