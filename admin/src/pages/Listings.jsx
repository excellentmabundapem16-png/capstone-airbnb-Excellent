/**
 * Listings.jsx – view listings page: every listing with key details (main
 * image, title, location, price) plus update and delete actions.
 */
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, money } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Listings() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [listings, setListings] = useState(null);
  const [error, setError] = useState('');
  const [confirmId, setConfirmId] = useState(null);

  const load = useCallback(() => {
    api('/accommodations')
      .then(setListings)
      .catch((e) => setError(e.message));
  }, []);

  useEffect(load, [load]);

  const remove = async (id) => {
    try {
      await api(`/accommodations/${id}`, { method: 'DELETE', token });
      toast('Listing deleted');
      setConfirmId(null);
      load();
    } catch (e) {
      toast(e.message, 'error');
    }
  };

  return (
    <main className="admin-page">
      <div className="page-head">
        <div>
          <h1>Listings</h1>
          <p className="muted small">Signed in as {user?.username} ({user?.role}) – {listings ? listings.length : '…'} listings</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/listings/new')}>+ Create listing</button>
      </div>

      {error && <div className="banner banner-error">{error}</div>}
      {!listings && !error && <p className="muted">Loading listings…</p>}

      {listings && listings.length === 0 && (
        <div className="empty-state">
          <h3>No listings yet</h3>
          <p className="muted">Create your first listing to get started.</p>
        </div>
      )}

      <div className="admin-grid">
        {(listings || []).map((l) => (
          <article className="admin-card" key={l._id}>
            <img src={l.images[0]} alt={l.title} loading="lazy" />
            <div className="admin-card-body">
              <div className="admin-card-top">
                <h3>{l.title}</h3>
                <span className="price">{money(l.price)} <span className="muted small">/ night</span></span>
              </div>
              <p className="muted small">{l.type} · {l.location} · sleeps {l.guests} · ★ {l.rating.toFixed(1)} ({l.reviews})</p>
              <div className="admin-card-actions">
                <button className="btn btn-outline btn-sm" onClick={() => navigate(`/listings/${l._id}/edit`)}>Update</button>
                {confirmId === l._id ? (
                  <span className="confirm-inline">
                    <span className="muted small">Delete?</span>
                    <button className="btn btn-danger btn-sm" onClick={() => remove(l._id)}>Yes</button>
                    <button className="btn btn-outline btn-sm" onClick={() => setConfirmId(null)}>No</button>
                  </span>
                ) : (
                  <button className="btn btn-danger-outline btn-sm" onClick={() => setConfirmId(l._id)}>Delete</button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
