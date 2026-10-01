/**
 * App.jsx – admin dashboard router.
 * /login public; everything else behind ProtectedRoute (JWT session).
 */
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Listings from './pages/Listings';
import CreateListing from './pages/CreateListing';
import EditListing from './pages/EditListing';
import Reservations from './pages/Reservations';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <div className="admin-shell">
      <Header />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/listings" element={<ProtectedRoute><Listings /></ProtectedRoute>} />
        <Route path="/listings/new" element={<ProtectedRoute><CreateListing /></ProtectedRoute>} />
        <Route path="/listings/:id/edit" element={<ProtectedRoute><EditListing /></ProtectedRoute>} />
        <Route path="/reservations" element={<ProtectedRoute><Reservations /></ProtectedRoute>} />
        <Route path="/" element={<Navigate to="/listings" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}
