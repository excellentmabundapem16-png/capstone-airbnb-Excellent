/**
 * Reservations.jsx – protected page listing the logged-in guest's
 * reservations in a table, with cancel action.
 */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, money, fmtDate } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Reservations() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');

  const load = () =>
    api('/reservations/user', { token })
      .then(setRows)
      .catch((e) => setError(e.message));

  useEffect(() => {
    if (!user) { navigate('/login?next=/reservations'); return; }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, token]);

  const cancel = async (id) => {
    try {
      await api(`/reservations/${id}`, { method: 'DELETE', token });
      toast('Reservation cancelled');
      load();
    } catch (e) {
      toast(e.message, 'error');
    }
  };

  if (!user) return null;

  return (
    <main className="table-page">
      <h1>Your reservations</h1>
      {error && <div className="banner banner-error">{error}</div>}
      {!rows && !error && <p className="muted">Loading…</p>}
      {rows && rows.length === 0 && (
        <div className="empty-state">
          <h3>No trips booked yet</h3>
          <p className="muted">When you reserve a stay it will show up here.</p>
          <button className="btn btn-primary" onClick={() => navigate('/location')}>Find a stay</button>
        </div>
      )}
      {rows && rows.length > 0 && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Listing</th><th>Location</th><th>Check-in</th><th>Check-out</th><th>Guests</th><th>Total</th><th>Status</th><th /></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r._id}>
                  <td className="cell-listing">
                    {r.accommodation_id?.images?.[0] && <img src={r.accommodation_id.images[0]} alt="" />}
                    <span>{r.accommodation_id?.title || 'Removed listing'}</span>
                  </td>
                  <td>{r.accommodation_id?.location}</td>
                  <td>{fmtDate(r.checkIn)}</td>
                  <td>{fmtDate(r.checkOut)}</td>
                  <td>{r.guests}</td>
                  <td><strong>{money(r.costBreakdown?.totalCost)}</strong></td>
                  <td><span className={`chip ${r.status === 'confirmed' ? 'chip-ok' : 'chip-off'}`}>{r.status}</span></td>
                  <td>
                    {r.status === 'confirmed' && (
                      <button className="btn btn-outline btn-sm" onClick={() => cancel(r._id)}>Cancel</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
