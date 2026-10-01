/**
 * Stars.jsx – star rating with fractional fill (e.g. 4.5 shows a half star).
 */
export default function Stars({ rating = 0, size = 12 }) {
  const pct = Math.max(0, Math.min(100, (rating / 5) * 100));
  const row = (color) => (
    <span style={{ color }} aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} viewBox="0 0 24 24" width={size} height={size} fill="currentColor" style={{ marginRight: 1 }}>
          <path d="M12 1.8l3.1 6.7 7.1.9-5.2 5 1.3 7.1L12 18l-6.3 3.5 1.3-7.1-5.2-5 7.1-.9z" />
        </svg>
      ))}
    </span>
  );
  return (
    <span className="stars" role="img" aria-label={`Rated ${rating} out of 5`}>
      {row('#ddd')}
      <span className="stars-fill" style={{ width: `${pct}%` }}>
        {row('#222')}
      </span>
    </span>
  );
}
