import { resolveAssetUrl } from '../config';

const [mainImg, ...rest] = listing.images;
const smalls = [...rest, ...rest].slice(0, 4);

return (
  <main className="detail-page">
    ...
    <div className="gallery">
      <img className="gallery-main" src={resolveAssetUrl(mainImg)} alt={listing.title} />
      <div className="gallery-side">
        {smalls.map((src, i) => <img key={i} src={resolveAssetUrl(src)} alt={`${listing.title} photo ${i + 2}`} loading="lazy" />)}
      </div>
    </div>
