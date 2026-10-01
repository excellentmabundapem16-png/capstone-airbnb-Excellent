/**
 * App.jsx – router + shared layout (header/footer) for the guest frontend.
 */
import { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import LocationPage from './pages/LocationPage';
import ListingDetails from './pages/ListingDetails';
import Login from './pages/Login';
import Reservations from './pages/Reservations';
import NotFound from './pages/NotFound';
import { api } from './api';

export default function App() {
  const [locations, setLocations] = useState([]);
  const location = useLocation();

  useEffect(() => {
    api('/accommodations/locations').then(setLocations).catch(() => {});
  }, []);

  return (
    <div className="app-shell">
      <Header locations={locations} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/location" element={<LocationPage />} />
        <Route path="/listing/:id" element={<ListingDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reservations" element={<Reservations />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </div>
  );
}
