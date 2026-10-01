/**
 * Home.jsx – landing page: hero banner, inspiration cards, experiences,
 * "things to do" panels, ShopAirbnb, future-getaways tabs, footers.
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

const EXPERIENCES = [
  { title: 'Pastry mornings in Paris', sub: 'Bake croissants with a Meilleur Ouvrier de France', img: '/images/paris-3.jpg' },
  { title: 'Neon nights in Tokyo', sub: 'A guided izakaya crawl through Shibuya & Shinjuku', img: '/images/tokyo-2.jpg' },
  { title: 'Ocean brunch in Cape Town', sub: 'Sea-point promenade ride ending in a coastal feast', img: '/images/cape-town-4.jpg' },
];

const GETAWAY_TABS = {
  Trending: ['Cape Town, South Africa', 'Lisbon, Portugal', 'Mexico City, Mexico', 'Seoul, South Korea', 'Reykjavík, Iceland'],
  Beachfront: ['Zanzibar, Tanzania', 'Byron Bay, Australia', 'Tulum, Mexico', 'Phuket, Thailand', 'Nice, France'],
  Mountains: ['Queenstown, New Zealand', 'Banff, Canada', 'Chamonix, France', 'Patagonia, Argentina', 'Hakone, Japan'],
  'City breaks': ['New York, USA', 'Tokyo, Japan', 'Paris, France', 'Barcelona, Spain', 'Nairobi, Kenya'],
};

export default function Home() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('Trending');

  useEffect(() => {
    api('/accommodations')
      .then(setListings)
      .catch((e) => setError(e.message));
  }, []);

  // One inspiration card per location (first listing image + stay count)
  const inspiration = useMemo(() => {
    const byLoc = {};
    listings.forEach((l) => {
      byLoc[l.location] = byLoc[l.location] || { location: l.location, img: l.images[0], count: 0 };
      byLoc[l.location].count += 1;
    });
    return Object.values(byLoc);
  }, [listings]);

  return (
    <main className="home">
      {/* Hero banner with clear call-to-action */}
      <section className="hero" style={{ backgroundImage: 'url(/images/hero-1.jpg)' }}>
        <div className="hero-copy">
          <h1>Find your next stay</h1>
          <p>Search deals on homes, cabins, villas and safari lodges around the world.</p>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/location?location=New York')}>
            Explore stays
          </button>
        </div>
      </section>

      {error && <div className="banner banner-error">Could not load stays: {error}</div>}

      {/* Inspiration for your next trip */}
      <section className="section">
        <h2 className="section-title">Inspiration for your next trip</h2>
        <div className="inspo-grid">
          {inspiration.map((i) => (
            <button key={i.location} className="inspo-card" onClick={() => navigate(`/location?location=${encodeURIComponent(i.location)}`)}>
              <img src={i.img} alt={i.location} loading="lazy" />
              <div className="inspo-meta">
                <strong>{i.location}</strong>
                <span className="muted small">{i.count} stay{i.count === 1 ? '' : 's'} available</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Discover Airbnb Experiences */}
      <section className="section">
        <h2 className="section-title">Discover Airbnb Experiences</h2>
        <div className="exp-grid">
          {EXPERIENCES.map((e) => (
            <article key={e.title} className="exp-card">
              <img src={e.img} alt={e.title} loading="lazy" />
              <div className="exp-body">
                <h3>{e.title}</h3>
                <p className="muted small">{e.sub}</p>
                <button className="btn btn-outline btn-sm" onClick={() => navigate('/location')}>Find similar</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Things to do on your trip / at home */}
      <section className="section duo">
        <div className="duo-panel" style={{ backgroundImage: 'url(/images/hero-2.jpg)' }}>
          <div className="duo-copy">
            <h3>Things to do on your trip</h3>
            <button className="btn btn-light">Browse experiences</button>
          </div>
        </div>
        <div className="duo-panel" style={{ backgroundImage: 'url(/images/hero-3.jpg)' }}>
          <div className="duo-copy">
            <h3>Things to do at home</h3>
            <button className="btn btn-light">Host an experience</button>
          </div>
        </div>
      </section>

      {/* ShopAirbnb – gift cards */}
      <section className="section shop">
        <div className="shop-copy">
          <h2>ShopAirbnb</h2>
          <p>Give the gift of travel. ShopAirbnb gift cards work on stays and experiences, in every country we operate.</p>
          <button className="btn btn-primary">Buy a gift card</button>
        </div>
        <div className="shop-img">
          <img src="/images/hero-4.jpg" alt="ShopAirbnb gift cards" loading="lazy" />
        </div>
      </section>

      {/* Inspiration for future getaways – static tabs, list content */}
      <section className="section">
        <h2 className="section-title">Inspiration for future getaways</h2>
        <div className="tabs" role="tablist">
          {Object.keys(GETAWAY_TABS).map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} className={`tab ${tab === t ? 'tab-active' : ''}`} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </div>
        <ul className="getaway-list">
          {GETAWAY_TABS[tab].map((d) => (
            <li key={d}>
              <button className="getaway-link" onClick={() => navigate('/location')}>{d}</button>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
