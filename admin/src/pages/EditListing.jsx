/**
 * EditListing.jsx – update flow: loads the listing and pre-fills the form so
 * changes are saved and reflected correctly.
 */
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import ListingForm from '../components/ListingForm';

export default function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api(`/accommodations/${id}`)
      .then(setListing)
      .catch((e) => setError(e.message));
  }, [id]);

  return (
    <main className="admin-page">
      <div className="page-head">
        <h1>Update listing</h1>
        <button className="btn btn-outline" onClick={() => navigate('/listings')}>Back to listings</button>
      </div>
      {error && <div className="banner banner-error">{error}</div>}
      {!listing && !error && <p className="muted">Loading listing…</p>}
      {listing && <ListingForm initial={listing} existingId={listing._id} onSaved={() => navigate('/listings')} />}
    </main>
  );
}
