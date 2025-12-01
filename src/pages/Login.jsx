import { useState } from 'react';
import './Login.css';

function Login() {
  const [form, setForm] = useState({ username: '', password: '', remember: false });
  const [status, setStatus] = useState('');

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setStatus('Authentication coming soon. For now, jump straight to the Route Finder.');
  };

  return (
    <section className="login-page">
      <div className="section-card login-card">
        <h1>Sign in</h1>
        <p className="muted">
          Authentication and workspace roles are on the roadmap. This placeholder demonstrates
          the future flow.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="you@hydra.xyz"
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
          />

          <label className="remember-row">
            <input
              type="checkbox"
              name="remember"
              checked={form.remember}
              onChange={handleChange}
            />
            Remember this device
          </label>

          <button type="submit" className="primary">
            Continue
          </button>
        </form>

        {status && <p className="status success">{status}</p>}
      </div>
    </section>
  );
}

export default Login;

