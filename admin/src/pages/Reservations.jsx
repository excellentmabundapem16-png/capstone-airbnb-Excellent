/**
 * Reservations.jsx – "view reservations" from the profile dropdown:
 * reservations for the signed-in host's listings, in table format.
 */
import { useCallback, useEffect, useState } from 'react';
import { api, money, fmtDate } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Reservations() {
  const { token, user } = useAuth();
  const toast = useToast();
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    api('/reservations/host', { token })
      .then(setRows)
      .catch((e) => setError(e.message));
  }, [token]);

  useEffect(load, [load]);

  const cancel = async (id) => {
    try {
      await api(`/reservations/${id}`, { method: 'DELETE', token });
      toast('Reservation cancelled');
      load();
    } catch (e) {
      toast(e.message, 'error');
    }
  };

  return (
    <main className="admin-page">
      <div className="page-head">
        <div>
          <h1>Reservations</h1>
          <p className="muted small">Bookings for {user?.username}'s listings</p>
        </div>
      </div>

      {error && <div className="banner banner-error">{error}</div>}
      {!rows && !error && <p className="muted">Loading reservations…</p>}
      {rows && rows.length === 0 && (
        <div className="empty-state"><h3>No reservations yet</h3><p className="muted">New bookings will appear here.</p></div>
      )}

      {rows && rows.length > 0 && (
        <div className="table-wrap card-white">
          <table className="data-table">
            <thead>
              <tr><th>Listing</th><th>Guest</th><th>Check-in</th><th>Check-out</th><th>Guests</th><th>Nights</th><th>Total</th><th>Status</th><th /></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r._id}>
                  <td className="cell-listing">
                    {r.accommodation_id?.images?.[0] && <img src={r.accommodation_id.images[0]} alt="" />}
                    <span>{r.accommodation_id?.title || 'Removed listing'}</span>
                  </td>
                  <td>{r.user_id?.username || '—'}</td>
                  <td>{fmtDate(r.checkIn)}</td>
                  <td>{fmtDate(r.checkOut)}</td>
                  <td>{r.guests}</td>
                  <td>{r.nights}</td>
                  <td><strong>{money(r.costBreakdown?.totalCost)}</strong></td>
                  <td><span className={`chip ${r.status === 'confirmed' ? 'chip-ok' : 'chip-off'}`}>{r.status}</span></td>
                  <td>{r.status === 'confirmed' && <button className="btn btn-danger-outline btn-sm" onClick={() => cancel(r._id)}>Cancel</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
