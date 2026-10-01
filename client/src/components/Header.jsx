/**
 * Header.jsx – top header shared by all guest pages.
 * Logo | search pill (location filter) | Become a host + profile dropdown.
 */
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Logo = () => (
  <svg viewBox="0 0 32 32" width="32" height="32" aria-hidden="true">
    <path
      fill="#FF385C"
      d="M16 2c-3 0-4.8 2.2-4.8 5 0 4.6 4.8 12.4 4.8 12.4S20.8 11.6 20.8 7c0-2.8-1.8-5-4.8-5zm-7.4 9.6c-2.6 0-4.6 2-4.6 4.7 0 5 6.9 11.9 11 13.4-2.9-3.9-6.6-10.4-6.6-14.2 0-1.5.4-2.8 1.2-3.9h-1zm14.8 0h-1c.8 1.1 1.2 2.4 1.2 3.9 0 3.8-3.7 10.3-6.6 14.2 4.1-1.5 11-8.4 11-13.4 0-2.7-2-4.7-4.6-4.7z"
    />
  </svg>
);

export default function Header({ locations = [], defaultLocation = '' }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const route = useLocation();
  const [loc, setLoc] = useState(defaultLocation || 'New York');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // keep the pill in sync when arriving via links with ?location=
  useEffect(() => {
    if (defaultLocation) setLoc(defaultLocation);
  }, [defaultLocation]);

  // close dropdown on outside click
  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const submitSearch = (e) => {
    e.preventDefault();
    navigate(`/location?location=${encodeURIComponent(loc)}`);
  };

  return (
    <header className="site-header">
      <div className="header-inner">
        <a className="logo" to="/" onClick={(e) => { e.preventDefault(); navigate('/'); }} href="/" aria-label="Airbnb home">
          <Logo />
          <span>airbnb</span>
        </a>

        <form className="search-pill" onSubmit={submitSearch} role="search">
          <input
            list="header-locations"
            className="pill-loc"
            value={loc}
            placeholder="Anywhere"
            aria-label="Search destination"
            onChange={(e) => setLoc(e.target.value)}
          />
          <datalist id="header-locations">
            {(locations.length ? locations : ['New York', 'Cape Town', 'Paris', 'Tokyo', 'Nairobi']).map((l) => (
              <option key={l} value={l} />
            ))}
          </datalist>
          <span className="pill-divider" />
          <span className="pill-text">Any week</span>
          <span className="pill-divider" />
          <span className="pill-text muted">Add guests</span>
          <button className="pill-search" type="submit" aria-label="Search">
            <svg viewBox="0 0 32 32" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="4">
              <circle cx="13" cy="13" r="8" />
              <path d="m20 20 8 8" strokeLinecap="round" />
            </svg>
          </button>
        </form>

        <nav className="header-right">
          <a href="/location" className="host-link" onClick={(e) => { e.preventDefault(); navigate('/location'); }}>
            Become a host
          </a>
          <svg className="globe" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2c3 3.6 3 16.4 0 20M12 2c-3 3.6-3 16.4 0 20" />
          </svg>

          <div className="profile-menu" ref={menuRef}>
            <button className="profile-btn" onClick={() => setMenuOpen((o) => !o)} aria-haspopup="menu" aria-expanded={menuOpen}>
              <svg viewBox="0 0 32 32" width="16" height="16" fill="none" stroke="#5f5f5f" strokeWidth="3" aria-hidden="true">
                <path d="M4 10h24M4 16h24M4 22h24" strokeLinecap="round" />
              </svg>
              {user ? (
                <span className="avatar">{user.username.charAt(0).toUpperCase()}</span>
              ) : (
                <svg viewBox="0 0 32 32" width="26" height="26" fill="#5f5f5f" aria-hidden="true">
                  <path d="M16 2a7 7 0 1 1 0 14 7 7 0 0 1 0-14zm0 16c7 0 13 3.6 13 8v4H3v-4c0-4.4 6-8 13-8z" />
                </svg>
              )}
            </button>
            {menuOpen && (
              <div className="dropdown" role="menu">
                {user ? (
                  <>
                    <div className="dropdown-greet">Hi, {user.username.split(' ')[0]} 👋</div>
                    <button className="dropdown-item" onClick={() => { setMenuOpen(false); navigate('/reservations'); }}>
                      View reservations
                    </button>
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        setMenuOpen(false);
                        logout();
                        navigate('/');
                      }}
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <button className="dropdown-item" onClick={() => { setMenuOpen(false); navigate(`/login?next=${encodeURIComponent(route.pathname + route.search)}`); }}>
                      Log in
                    </button>
                    <button className="dropdown-item" onClick={() => { setMenuOpen(false); navigate('/reservations'); }}>
                      View reservations
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
