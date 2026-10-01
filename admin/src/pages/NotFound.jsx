/** NotFound.jsx – admin 404. */
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <main className="empty-state" style={{ paddingTop: 80 }}>
      <h1 style={{ fontSize: 56, margin: 0 }}>404</h1>
      <h3>Page not found</h3>
      <p className="muted">The page you're looking for doesn't exist in the admin dashboard.</p>
      <button className="btn btn-primary" onClick={() => navigate('/listings')}>Back to listings</button>
    </main>
  );
}
