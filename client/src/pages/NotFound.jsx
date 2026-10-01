/** NotFound.jsx – friendly 404 for unknown routes. */
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <main className="empty-state" style={{ paddingTop: 80 }}>
      <h1 style={{ fontSize: 56, margin: 0 }}>404</h1>
      <h3>Oops! We can't seem to find the page you're looking for.</h3>
      <p className="muted">Error code: 404 – page not found</p>
      <button className="btn btn-primary" onClick={() => navigate('/')}>Go home</button>
    </main>
  );
}
