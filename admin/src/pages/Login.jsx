/**
 * Login.jsx – admin login: email + password, validation, error feedback,
 * redirect to the dashboard on success.
 */
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [busy, setBusy] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) e.email = 'Enter a valid email address';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    setApiError('');
    if (!validate()) return;
    setBusy(true);
    try {
      const user = await login(form.email.trim(), form.password);
      // Successful login lands on the admin dashboard
      navigate(params.get('next') || '/listings');
      void user;
    } catch (err) {
      setApiError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="admin-login-page">
      <form className="auth-card" onSubmit={submit} noValidate>
        <h1>Admin login</h1>
        <p className="muted small">Manage your property listings and reservations.</p>
        {apiError && <div className="banner banner-error">{apiError}</div>}
        <label className={errors.email ? 'field field-error' : 'field'}>
          <span>Email</span>
          <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="you@example.com" autoComplete="email" />
          {errors.email && <em className="field-msg">{errors.email}</em>}
        </label>
        <label className={errors.password ? 'field field-error' : 'field'}>
          <span>Password</span>
          <input type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="••••••••" autoComplete="current-password" />
          {errors.password && <em className="field-msg">{errors.password}</em>}
        </label>
        <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
        <div className="demo-hint">
          <strong>Host / admin accounts</strong>
          <ul>
            <li>jane@example.com / password321 <span className="muted">(host)</span></li>
            <li>admin@airbnb.com / admin123 <span className="muted">(admin)</span></li>
          </ul>
        </div>
      </form>
    </main>
  );
}
