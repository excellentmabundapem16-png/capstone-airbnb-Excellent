/**
 * ListingCard.jsx – horizontal card used on the Location page:
 * image on the left, details on the right (type, name, amenities, average
 * star ranking, total reviews, cost per night).
 */
import { useNavigate } from 'react-router-dom';
import Stars from './Stars';
import { money } from '../api';

export default function ListingCard({ listing }) {
  const navigate = useNavigate();
  return (
    <article className="loc-card" onClick={() => navigate(`/listing/${listing._id}`)} tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/listing/${listing._id}`)}>
      <div className="loc-card-img">
        <img src={listing.images[0]} alt={listing.title} loading="lazy" />
        <span className="loc-card-type">{listing.type}</span>
      </div>
      <div className="loc-card-body">
        <div className="loc-card-top">
          <h3>{listing.title}</h3>
          <span className="loc-card-rating">
            <Stars rating={listing.rating} /> {listing.rating.toFixed(1)}
          </span>
        </div>
        <p className="loc-card-amenities">{listing.amenities.slice(0, 4).join(' · ')}</p>
        <p className="muted small">
          {listing.bedrooms} bedroom{listing.bedrooms === 1 ? '' : 's'} · {listing.bathrooms} bath{listing.bathrooms === 1 ? '' : 's'} · sleeps {listing.guests}
        </p>
        <div className="loc-card-bottom">
          <span className="reviews muted small">{listing.reviews} reviews</span>
          <span className="loc-card-price">
            <strong>{money(listing.price)}</strong> / night
          </span>
        </div>
      </div>
    </article>
  );
}
