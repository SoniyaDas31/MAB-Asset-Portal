import React, { useState } from 'react';
import { saveSupabaseConfig, supabase } from '../db/supabase';
import { seedDatabase } from '../db/initialData';

export default function SetupWizard({ onConnected }) {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);

  const handleConnect = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!url.startsWith('https://')) {
      setError('Project URL must start with https://');
      setLoading(false);
      return;
    }

    // Try saving and initializing client
    const success = saveSupabaseConfig(url.trim(), anonKey.trim());
    
    if (success && supabase) {
      try {
        // Test query to verify connection to 'albums' table
        const { error: testError } = await supabase.from('albums').select('id').limit(1);
        
        if (testError && testError.code !== 'PGRST116') { // PGRST116 is empty table / no rows, which is fine
          // If table doesn't exist, it means the SQL wasn't run yet, but credentials could be correct.
          // Let's check code or message
          if (testError.message.includes('relation "public.albums" does not exist')) {
            setError('Connected, but the "albums" table was not found. Please paste and run the SQL script in your Supabase SQL Editor first.');
            setLoading(false);
            return;
          }
          throw testError;
        }

        setConnected(true);
      } catch (err) {
        console.error(err);
        setError(`Failed to connect to Supabase: ${err.message || 'Check your keys and network connection.'}`);
      }
    } else {
      setError('Invalid URL or API Key format. Could not initialize client.');
    }
    setLoading(false);
  };

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      const success = await seedDatabase(supabase);
      if (success) {
        setSeedSuccess(true);
        setTimeout(() => {
          onConnected();
        }, 1500);
      } else {
        setError('Database could not be seeded (it might already contain data or has schemas issues).');
      }
    } catch (err) {
      setError(`Seeding failed: ${err.message}`);
    }
    setSeeding(false);
  };

  const handleSkipSeeding = () => {
    onConnected();
  };

  return (
    <div className="setup-container">
      <div className="setup-card">
        <div className="setup-header">
          <div className="setup-logo">
            <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" strokeWidth="2" fill="currentColor" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2Z"/>
              <path d="M12 18C13.1 18 14 18.9 14 20C14 21.1 13.1 22 12 22C10.9 22 10 21.1 10 20C10 18.9 10.9 18 12 18Z"/>
              <path d="M2 12C2 10.9 2.9 10 4 10C5.1 10 6 10.9 6 12C6 13.1 5.1 14 4 14C2.9 14 2 13.1 2 12Z"/>
              <path d="M18 12C18 10.9 18.9 10 20 10C21.1 10 22 10.9 22 12C22 13.1 21.1 14 20 14C18.9 14 18 13.1 18 12Z"/>
              <path d="M6.3 6.3C7.2 5.4 8.7 5.4 9.6 6.3C10.5 7.2 10.5 8.7 9.6 9.6C8.7 10.5 7.2 10.5 6.3 9.6C5.4 8.7 5.4 7.2 6.3 6.3Z"/>
              <path d="M17.7 6.3C18.6 5.4 20.1 5.4 21 6.3C21.9 7.2 21.9 8.7 21 9.6C20.1 10.5 18.6 10.5 17.7 9.6C16.8 8.7 16.8 7.2 17.7 6.3Z"/>
              <path d="M6.3 17.7C7.2 16.8 8.7 16.8 9.6 17.7C10.5 18.6 10.5 20.1 9.6 21C8.7 21.9 7.2 21.9 6.3 21C5.4 20.1 5.4 18.6 6.3 17.7Z"/>
              <path d="M17.7 17.7C18.6 16.8 20.1 16.8 21 17.7C21.9 18.6 21.9 20.1 21 21C20.1 21.9 18.6 21.9 17.7 21C16.8 20.1 16.8 18.6 17.7 17.7Z"/>
            </svg>
            <span>Family Dairy</span>
          </div>
          <h1>Database Connection Wizard</h1>
          <p className="subtitle">Connect your Supabase instance to enable full-featured Digital Asset Management.</p>
        </div>

        {!connected ? (
          <form onSubmit={handleConnect} className="setup-form">
            <div className="setup-steps">
              <h3>Setup Instructions:</h3>
              <ol>
                <li>
                  Create a new project at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer">supabase.com</a>.
                </li>
                <li>
                  Open the <strong>SQL Editor</strong> in Supabase, copy the contents of the file <code>supabase_setup.sql</code> in your project folder, paste it, and click <strong>Run</strong>.
                </li>
                <li>
                  <strong>Option 1 (Recommended for development):</strong> Create a <code>.env</code> file in your project root (copy <code>.env.example</code>) and fill in your <strong>Project URL</strong> and <strong>anon public API key</strong> from <strong>Project Settings &gt; API</strong>. Then restart your dev server.
                </li>
                <li>
                  <strong>Option 2:</strong> Paste your <strong>Project URL</strong> and <strong>anon public API key</strong> below to connect (they will be saved in your browser's localStorage for future visits).
                </li>
              </ol>
            </div>

            {error && <div className="setup-error">{error}</div>}

            <div className="form-group">
              <label htmlFor="supabaseUrl">Supabase Project URL</label>
              <input
                id="supabaseUrl"
                type="url"
                required
                placeholder="https://xxxxxxxxx.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="supabaseKey">Supabase Anon Public API Key</label>
              <input
                id="supabaseKey"
                type="password"
                required
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                disabled={loading}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block btn-glowing" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner"></span> Connecting...
                </>
              ) : (
                'Connect to Supabase'
              )}
            </button>
          </form>
        ) : (
          <div className="setup-success-view">
            <div className="success-icon animate-bounce">
              <svg viewBox="0 0 24 24" width="64" height="64" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h2>Successfully Connected!</h2>
            <p>Your application is now linked to your Supabase project.</p>

            {error && <div className="setup-error">{error}</div>}

            <div className="success-actions">
              {!seedSuccess ? (
                <>
                  <p className="seeding-note">Would you like to seed the database with beautiful, high-resolution demo albums and media items to get started?</p>
                  <button onClick={handleSeedData} className="btn btn-success btn-block btn-glowing" disabled={seeding}>
                    {seeding ? (
                      <>
                        <span className="spinner"></span> Seeding Database...
                      </>
                    ) : (
                      'Yes, Seed Demo Data'
                    )}
                  </button>
                  <button onClick={handleSkipSeeding} className="btn btn-secondary btn-block" disabled={seeding}>
                    No, Start Empty
                  </button>
                </>
              ) : (
                <div className="seed-done">
                  <p>Database seeded successfully! Entering application...</p>
                  <span className="spinner spinner-large"></span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
