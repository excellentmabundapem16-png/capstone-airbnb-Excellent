/**
 * Header.jsx – admin top header: logo, nav links, greeting + dropdown
 * (view reservations / log out) when logged in, "Become a host" when not.
 */
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Logo = () => (
  <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true">
    <path
      fill="#FF385C"
      d="M16 2c-3 0-4.8 2.2-4.8 5 0 4.6 4.8 12.4 4.8 12.4S20.8 11.6 20.8 7c0-2.8-1.8-5-4.8-5zm-7.4 9.6c-2.6 0-4.6 2-4.6 4.7 0 5 6.9 11.9 11 13.4-2.9-3.9-6.6-10.4-6.6-14.2 0-1.5.4-2.8 1.2-3.9h-1zm14.8 0h-1c.8 1.1 1.2 2.4 1.2 3.9 0 3.8-3.7 10.3-6.6 14.2 4.1-1.5 11-8.4 11-13.4 0-2.7-2-4.7-4.6-4.7z"
    />
  </svg>
);

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <header className="admin-header">
      <div className="admin-header-inner">
        <NavLink to="/listings" className="admin-logo">
          <Logo />
          <span>airbnb <em>admin</em></span>
        </NavLink>

        <nav className="admin-nav">
          <NavLink to="/listings" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>Listings</NavLink>
          <NavLink to="/listings/new" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>Create listing</NavLink>
          <NavLink to="/reservations" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>Reservations</NavLink>
        </nav>

        <div className="admin-header-right">
          {user ? (
            <>
              <span className="greet">Hi, {user.username}</span>
              <div className="profile-menu" ref={ref}>
                <button className="profile-btn" onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open}>
                  <span className="avatar">{user.username.charAt(0).toUpperCase()}</span>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m6 9 6 6 6-6"/></svg>
                </button>
                {open && (
                  <div className="dropdown" role="menu">
                    <div className="dropdown-greet">{user.username} · {user.role}</div>
                    <button className="dropdown-item" onClick={() => { setOpen(false); navigate('/reservations'); }}>View reservations</button>
                    <button className="dropdown-item" onClick={() => { setOpen(false); logout(); navigate('/login'); }}>Log out</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            // FIX: was a hardcoded href="/admin/listings"; Link adds the basename itself.
            <Link className="host-link" to="/listings">Become a host</Link>
          )}
        </div>
      </div>
    </header>
  );
}
