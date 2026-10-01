/**
 * ListingDetails.jsx – the location details page.
 * Heading + subheading, image gallery (1 large + 4 small), two-column layout:
 * static accommodation info on the left, dynamic cost calculator with date
 * pickers / guest count and the reservation button on the right.
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, money, money2 } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Stars from '../components/Stars';

const iso = (d) => new Date(d).toISOString().slice(0, 10);
const addDays = (days) => { const d = new Date(); d.setDate(d.getDate() + days); return iso(d); };

const AMENITY_ICONS = {
  wifi: 'M2 8.8a15 15 0 0 1 20 0M5.5 12.5a10 10 0 0 1 13 0M9 16.2a5 5 0 0 1 6 0M12 20h.01',
  kitchen: 'M4 3h16v18H4zM4 10h16M9 3v7',
  'free parking': 'M5 13l1.5-4.5h11L19 13M5 13h14v5H5zM7.5 16h.01M16.5 16h.01',
  pool: 'M2 16c2 0 2-1.5 4-1.5S8 16 10 16s2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5M2 20c2 0 2-1.5 4-1.5S8 20 10 20s2-1.5 4-1.5 2 1.5 4 1.5 2-1.5 4-1.5M6 12V5a2 2 0 0 1 4 0M14 12V5a2 2 0 0 1 4 0',
  'hot tub': 'M4 12h16v4a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4zM8 8c0-2 2-2 2-4M14 8c0-2 2-2 2-4',
  'air conditioning': 'M12 3v18M12 3l3 3M12 3L9 6M12 21l3-3M12 21l-3-3M3 12h18',
  workspace: 'M3 5h18v11H3zM8 20h8M12 16v4',
  gym: 'M6.5 6.5v11M17.5 6.5v11M3 9.5v5M21 9.5v5M6.5 12h11',
  washer: 'M4 3h16v18H4zM12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM7 5.5h.01',
  breakfast: 'M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM17 9h2a3 3 0 0 1 0 6h-2M7 4c0-1 1-1 1-2M11 4c0-1 1-1 1-2',
};

const Icon = ({ d }) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

export default function ListingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const toast = useToast();

  const [listing, setListing] = useState(null);
  const [error, setError] = useState('');
  const [checkIn, setCheckIn] = useState(addDays(7));
  const [checkOut, setCheckOut] = useState(addDays(14));
  const [guests, setGuests] = useState(2);
  const [reserving, setReserving] = useState(false);
  const [reserveError, setReserveError] = useState('');

  useEffect(() => {
    api(`/accommodations/${id}`)
      .then((d) => { setListing(d); setGuests(Math.min(2, d.guests)); })
      .catch((e) => setError(e.message));
  }, [id]);

  // Live quote (client-side mirror of the server pricing rules)
  const quote = useMemo(() => {
    if (!listing) return null;
    const nights = Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000);
    if (!nights || nights <= 0) return null;
    const nightlyTotal = nights * listing.price;
    const fullWeeks = Math.floor(nights / 7);
    const weeklyDiscount = Math.round(fullWeeks * 7 * listing.price * (listing.weeklyDiscount / 100));
    const total = nightlyTotal - weeklyDiscount + listing.cleaningFee + listing.serviceFee + listing.occupancyTaxes;
    return { nights, nightlyTotal, weeklyDiscount, cleaningFee: listing.cleaningFee, serviceFee: listing.serviceFee, occupancyTaxes: listing.occupancyTaxes, total };
  }, [listing, checkIn, checkOut]);

  const reserve = async () => {
    setReserveError('');
    if (!user) {
      toast('Log in to reserve this stay', 'error');
      navigate(`/login?next=${encodeURIComponent(`/listing/${id}`)}`);
      return;
    }
    if (!quote) { setReserveError('Check-out must be after check-in.'); return; }
    setReserving(true);
    try {
      await api('/reservations', { method: 'POST', token, body: { accommodation_id: id, checkIn, checkOut, guests } });
      toast('Reservation confirmed! See you soon ✈️');
      navigate('/reservations');
    } catch (e) {
      setReserveError(e.message);
    } finally {
      setReserving(false);
    }
  };

  if (error) return <main className="detail-page"><div className="banner banner-error">{error}</div></main>;
  if (!listing) return <main className="detail-page"><p className="muted">Loading stay…</p></main>;

  const [mainImg, ...rest] = listing.images;
  const smalls = [...rest, ...rest].slice(0, 4);

  return (
    <main className="detail-page">
      <h1 className="detail-title">{listing.type} in {listing.location}</h1>
      <p className="detail-sub">
        <Stars rating={listing.rating} size={13} /> <strong>{listing.rating.toFixed(2)}</strong>
        <span className="dot">·</span>{listing.reviews} reviews
        <span className="dot">·</span>
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s-7-5.5-7-11a7 7 0 1 1 14 0c0 5.5-7 11-7 11z"/><circle cx="12" cy="10" r="2.6"/></svg>
        {listing.location}
      </p>

      {/* Gallery: large image left, four smaller stacked 2-over-2 right */}
      <div className="gallery">
        <img className="gallery-main" src={mainImg} alt={listing.title} />
        <div className="gallery-side">
          {smalls.map((src, i) => <img key={i} src={src} alt={`${listing.title} photo ${i + 2}`} loading="lazy" />)}
        </div>
      </div>

      <div className="detail-cols">
        {/* LEFT – accommodation details & static sections */}
        <div className="detail-left">
          <div className="host-row">
            <div>
              <h2>{listing.title}</h2>
              <p className="muted">{listing.type} hosted by {listing.host} · {listing.guests} guests · {listing.bedrooms} bedrooms · {listing.bathrooms} bathrooms</p>
            </div>
            <span className="avatar avatar-lg">{listing.host.charAt(0)}</span>
          </div>

          <ul className="highlights">
            {listing.enhancedCleaning && <li><strong>Enhanced clean.</strong> This Host committed to Airbnb's 5-step cleaning process.</li>}
            {listing.selfCheckIn && <li><strong>Self check-in.</strong> Let yourself in with the keypad.</li>}
            <li><strong>Great location.</strong> {Math.min(5, listing.specificRatings.location).toFixed(1)}/5 guests rated the location.</li>
            <li><strong>Free cancellation for 48 hours.</strong> Full refund if you change your mind.</li>
          </ul>

          <hr className="rule" />
          <h3>Where you'll sleep</h3>
          <div className="sleep-boxes">
            {Array.from({ length: Math.max(1, listing.bedrooms) }).map((_, i) => (
              <div className="sleep-box" key={i}>
                <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#222" strokeWidth="1.6"><path d="M3 18v-8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8M3 18h18M3 18v2M21 18v2M6 8V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"/></svg>
                <strong>Bedroom {i + 1}</strong>
                <span className="muted small">{i === 0 ? '1 queen bed' : '1 double bed'}</span>
              </div>
            ))}
          </div>

          <hr className="rule" />
          <h3>What this place offers</h3>
          <div className="amenities-grid">
            {listing.amenities.map((a) => (
              <span key={a} className="amenity"><Icon d={AMENITY_ICONS[a] || 'M5 12l5 5L20 7'} /> {a}</span>
            ))}
          </div>

          <hr className="rule" />
          <h3>{quote ? `${quote.nights} nights in ${listing.location}` : `7 nights in ${listing.location}`}</h3>
          <p className="muted small">{checkIn} → {checkOut}</p>

          <hr className="rule" />
          <h3 className="reviews-title"><Stars rating={listing.rating} size={15} /> {listing.rating.toFixed(2)} · {listing.reviews} reviews</h3>
          <div className="rating-bars">
            {Object.entries(listing.specificRatings).map(([k, v]) => (
              <div className="rating-row" key={k}>
                <span className="rating-label">{{ cleanliness: 'Cleanliness', communication: 'Communication', checkIn: 'Check-in', accuracy: 'Accuracy', location: 'Location', value: 'Value' }[k] || k}</span>
                <span className="rating-bar"><span style={{ width: `${(v / 5) * 100}%` }} /></span>
                <span className="rating-val">{v.toFixed(1)}</span>
              </div>
            ))}
          </div>
          <div className="review-cards">
            <blockquote>
              <p>"Exactly like the photos – the {listing.location.toLowerCase()} light at golden hour is unreal. Host communication was instant."</p>
              <footer>— Thandi, {listing.location === 'Cape Town' ? 'Johannesburg' : 'Cape Town'}</footer>
            </blockquote>
            <blockquote>
              <p>"Check-in took two minutes, the kitchen had everything, and we worked remotely the whole week without one wifi wobble."</p>
              <footer>— Marco, Lisbon</footer>
            </blockquote>
          </div>

          <hr className="rule" />
          <h3>Hosted by {listing.host}</h3>
          <div className="host-detail">
            <span className="avatar avatar-lg">{listing.host.charAt(0)}</span>
            <div>
              <p><strong>{listing.host}</strong> · Superhost</p>
              <p className="muted small">{listing.reviews} reviews · Responds within an hour · Hosting since 2019</p>
              <button className="btn btn-outline btn-sm" onClick={() => !user && navigate('/login')}>Contact Host</button>
            </div>
          </div>

          <hr className="rule" />
          <div className="policy-cols">
            <div>
              <h4>House rules</h4>
              <p className="muted small">Check-in after 15:00 · Check-out 11:00 · {listing.guests} guests max · No smoking · No parties</p>
            </div>
            <div>
              <h4>Health &amp; safety</h4>
              <p className="muted small">{listing.enhancedCleaning ? 'Enhanced cleaning committed' : 'Standard cleaning guidance applies'} · Smoke alarm · Carbon monoxide alarm</p>
            </div>
            <div>
              <h4>Cancellation policy</h4>
              <p className="muted small">Free cancellation for 48 hours. After that, cancel up to 7 days before check-in for a 50% refund.</p>
            </div>
          </div>
        </div>

        {/* RIGHT – dynamic cost calculator */}
        <aside className="calc-card">
          <p className="calc-price"><strong>{money(listing.price)}</strong> / night</p>
          <div className="calc-dates">
            <label>
              <span className="filter-label">Check-in</span>
              <input type="date" value={checkIn} min={iso(new Date())} onChange={(e) => { setCheckIn(e.target.value); if (e.target.value >= checkOut) setCheckOut(addDaysSafe(e.target.value, 1)); }} />
            </label>
            <label>
              <span className="filter-label">Check-out</span>
              <input type="date" value={checkOut} min={checkIn} onChange={(e) => setCheckOut(e.target.value)} />
            </label>
          </div>
          <div className="calc-guests">
            <span className="filter-label" style={{ display: 'block' }}>Guests</span>
            <div className="stepper">
              <button type="button" aria-label="Fewer guests" onClick={() => setGuests((g) => Math.max(1, g - 1))}>−</button>
              <span>{guests} guest{guests === 1 ? '' : 's'}</span>
              <button type="button" aria-label="More guests" onClick={() => setGuests((g) => Math.min(listing.guests, g + 1))}>+</button>
            </div>
          </div>

          {quote ? (
            <div className="calc-lines">
              <div className="calc-line"><span>{money(listing.price)} × {quote.nights} nights</span><span>{money(quote.nightlyTotal)}</span></div>
              {quote.weeklyDiscount > 0 && (
                <div className="calc-line discount"><span>Weekly discount</span><span>−{money(quote.weeklyDiscount)}</span></div>
              )}
              <div className="calc-line"><span>Cleaning fee</span><span>{money2(quote.cleaningFee)}</span></div>
              <div className="calc-line"><span>Service fee</span><span>{money2(quote.serviceFee)}</span></div>
              <div className="calc-line"><span>Occupancy taxes and fees</span><span>{money2(quote.occupancyTaxes)}</span></div>
              <div className="calc-line calc-total"><span>Total before taxes</span><span>{money2(quote.total)}</span></div>
            </div>
          ) : (
            <p className="banner banner-error small">Check-out must be after check-in.</p>
          )}

          <button className="btn btn-primary btn-block" disabled={reserving || !quote} onClick={reserve}>
            {reserving ? 'Reserving…' : 'Reserve'}
          </button>
          {reserveError && <p className="banner banner-error small">{reserveError}</p>}
          <p className="muted small center">You won't be charged yet</p>
        </aside>
      </div>
    </main>
  );
}

/** helper: next-day string for auto-correcting check-out */
function addDaysSafe(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return iso(d);
}
