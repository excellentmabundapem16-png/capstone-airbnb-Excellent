/**
 * LocationPage.jsx – search results page.
 * Functional filter (location / type / guests) with a default value, heading
 * with total accommodations, and horizontal location cards.
 */
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api';
import ListingCard from '../components/ListingCard';

const TYPES = ['Any', 'Entire apartment', 'Entire house', 'Private room', 'Shared room', 'Villa', 'Cabin', 'Loft', 'Studio'];

export default function LocationPage() {
  const [params, setParams] = useSearchParams();
  const location = params.get('location') || 'New York'; // default value
  const type = params.get('type') || 'Any';
  const guests = params.get('guests') || '';

  const [locations, setLocations] = useState(['New York']);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/accommodations/locations').then(setLocations).catch(() => {});
  }, []);

  // Refetch whenever the filter (query string) changes – URL always reflects view
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    const qs = new URLSearchParams();
    if (location && location !== 'Any') qs.set('location', location);
    if (type && type !== 'Any') qs.set('type', type);
    if (guests) qs.set('guests', guests);
    api(`/accommodations?${qs.toString()}`)
      .then((d) => !cancelled && setListings(d))
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [location, type, guests]);

  const update = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  };

  return (
    <main className="location-page">
      <div className="filter-bar" role="search">
        <label>
          <span className="filter-label">Location</span>
          <select value={location} onChange={(e) => update('location', e.target.value)}>
            {locations.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </label>
        <label>
          <span className="filter-label">Type of place</span>
          <select value={type} onChange={(e) => update('type', e.target.value)}>
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <label>
          <span className="filter-label">Guests</span>
          <select value={guests} onChange={(e) => update('guests', e.target.value)}>
            <option value="">Any</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((g) => <option key={g} value={g}>{g}+ guests</option>)}
          </select>
        </label>
        <button className="btn btn-primary" onClick={() => setParams(new URLSearchParams({ location }))}>
          Reset filters
        </button>
      </div>

      <h1 className="location-heading">
        {loading ? 'Searching…' : `${listings.length} stay${listings.length === 1 ? '' : 's'} in ${location}`}
      </h1>

      {error && <div className="banner banner-error">{error}</div>}
      {!loading && !error && listings.length === 0 && (
        <div className="empty-state">
          <h3>No exact matches in {location}</h3>
          <p className="muted">Try changing or removing some of your filters.</p>
        </div>
      )}

      <div className="loc-list">
        {listings.map((l) => <ListingCard key={l._id} listing={l} />)}
      </div>
    </main>
  );
}
