import { resolveAssetUrl } from '../config';

export default function ListingCard({ listing }) {
  const navigate = useNavigate();
  return (
    <article className="loc-card" onClick={() => navigate(`/listing/${listing._id}`)} tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/listing/${listing._id}`)}>
      <div className="loc-card-img">
        <img src={resolveAssetUrl(listing.images[0])} alt={listing.title} loading="lazy" />
        <span className="loc-card-type">{listing.type}</span>
      </div>
