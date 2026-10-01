/** main.jsx – admin dashboard bootstrap (basename /admin in prod & dev). */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* FIX: the basename was removed, so the router saw "/admin/login" as an
        unknown route and every admin page rendered the 404. BASE_URL comes
        from `base` in vite.config.js ("/admin/" by default). */}
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
