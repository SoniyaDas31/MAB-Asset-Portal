import React, { useState } from 'react';
import { supabase } from '../db/supabase';

export default function Login({ onSuccess, onBack }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!supabase) {
      setError('Supabase client is not initialized.');
      setLoading(false);
      return;
    }

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (authError) throw authError;

      if (data?.user) {
        onSuccess();
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <button onClick={onBack} className="btn btn-secondary" style={{ marginBottom: '1.5rem', alignSelf: 'flex-start', padding: '0.4rem 0.8rem' }}>
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          Back
        </button>

        <h2>Admin Portal</h2>
        <p>Log in with your Supabase account to manage albums, assets, and event pages.</p>

        {error && <div className="setup-error">{error}</div>}

        <form onSubmit={handleLogin} className="setup-form">
          <div className="form-group">
            <label htmlFor="loginEmail">Email Address</label>
            <input
              id="loginEmail"
              type="email"
              required
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="loginPassword">Password</label>
            <input
              id="loginPassword"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-glowing" style={{ marginTop: '1.5rem' }} disabled={loading}>
            {loading ? <span className="spinner"></span> : 'Log In'}
          </button>
        </form>

        <div className="setup-steps" style={{ marginTop: '2rem', padding: '1rem' }}>
          <h4 style={{ fontSize: '0.8rem', color: 'var(--secondary)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Supabase Auth Hint:</h4>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dark)', lineHeight: '1.4' }}>
            Before logging in, make sure you have added a user in your <strong>Supabase Dashboard &gt; Authentication &gt; Users</strong> table.
          </p>
        </div>
      </div>
    </div>
  );
}
