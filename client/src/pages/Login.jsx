/**
 * Login.jsx – email + password form with client-side validation, API error
 * display and redirect back to the page the user came from (?next=).
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
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    setApiError('');
    if (!validate()) return;
    setBusy(true);
    try {
      await login(form.email.trim(), form.password);
      navigate(params.get('next') || '/');
    } catch (err) {
      setApiError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const set = (k) => (ev) => setForm((f) => ({ ...f, [k]: ev.target.value }));

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={submit} noValidate>
        <h1>Log in</h1>
        <p className="muted small">Welcome back – pick up where you left off.</p>

        {apiError && <div className="banner banner-error">{apiError}</div>}

        <label className={errors.email ? 'field field-error' : 'field'}>
          <span>Email</span>
          <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" autoComplete="email" />
          {errors.email && <em className="field-msg">{errors.email}</em>}
        </label>

        <label className={errors.password ? 'field field-error' : 'field'}>
          <span>Password</span>
          <input type="password" value={form.password} onChange={set('password')} placeholder="••••••••" autoComplete="current-password" />
          {errors.password && <em className="field-msg">{errors.password}</em>}
        </label>

        <button className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Logging in…' : 'Continue'}</button>

        <div className="demo-hint">
          <strong>Demo accounts</strong>
          <ul>
            <li>john@example.com / password123 <span className="muted">(guest)</span></li>
            <li>jane@example.com / password321 <span className="muted">(host)</span></li>
            <li>admin@airbnb.com / admin123 <span className="muted">(admin)</span></li>
          </ul>
        </div>
      </form>
    </main>
  );
}
