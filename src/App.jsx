import React, { useState, useEffect } from 'react';
import { supabase, getSupabaseConfig } from './db/supabase';
import SetupWizard from './components/SetupWizard';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import Slider from './components/Slider';
import AlbumCard from './components/AlbumCard';
import AlbumDetail from './components/AlbumDetail';
import EventPage from './components/EventPage';

// Simple Access Password Component
function AccessPassword({ onSuccess }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // You can change this password to whatever you want!
  const CORRECT_PASSWORD = 'mab2026';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === CORRECT_PASSWORD) {
      localStorage.setItem('accessGranted', 'true');
      onSuccess();
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  return (
    <div className="empty-placeholder" style={{ padding: '6rem 2rem' }}>
      <svg viewBox="0 0 24 24" width="64" height="64" stroke="currentColor" strokeWidth="1.5" fill="currentColor">
        <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2Z"/>
        <path d="M12 18C13.1 18 14 18.9 14 20C14 21.1 13.1 22 12 22C10.9 22 10 21.1 10 20C10 18.9 10.9 18 12 18Z"/>
        <path d="M2 12C2 10.9 2.9 10 4 10C5.1 10 6 10.9 6 12C6 13.1 5.1 14 4 14C2.9 14 2 13.1 2 12Z"/>
        <path d="M18 12C18 10.9 18.9 10 20 10C21.1 10 22 10.9 22 12C22 13.1 21.1 14 20 14C18.9 14 18 13.1 18 12Z"/>
        <path d="M6.3 6.3C7.2 5.4 8.7 5.4 9.6 6.3C10.5 7.2 10.5 8.7 9.6 9.6C8.7 10.5 7.2 10.5 6.3 9.6C5.4 8.7 5.4 7.2 6.3 6.3Z"/>
        <path d="M17.7 6.3C18.6 5.4 20.1 5.4 21 6.3C21.9 7.2 21.9 8.7 21 9.6C20.1 10.5 18.6 10.5 17.7 9.6C16.8 8.7 16.8 7.2 17.7 6.3Z"/>
        <path d="M6.3 17.7C7.2 16.8 8.7 16.8 9.6 17.7C10.5 18.6 10.5 20.1 9.6 21C8.7 21.9 7.2 21.9 6.3 21C5.4 20.1 5.4 18.6 6.3 17.7Z"/>
        <path d="M17.7 17.7C18.6 16.8 20.1 16.8 21 17.7C21.9 18.6 21.9 20.1 21 21C20.1 21.9 18.6 21.9 17.7 21C16.8 20.1 16.8 18.6 17.7 17.7Z"/>
      </svg>
      <h2 style={{ marginTop: '1.5rem', marginBottom: '0.8rem' }}>Welcome to Family Dairy</h2>
      <p style={{ maxWidth: '500px', margin: '0 auto 2rem auto', color: 'var(--text-muted)' }}>
        Please enter the access code to view the albums.
      </p>
      
      <form onSubmit={handleSubmit} style={{ maxWidth: '350px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input
          type="password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(''); }}
          placeholder="Enter access code"
          style={{ 
            padding: '1rem', 
            borderRadius: 'var(--radius-md)', 
            border: '1px solid var(--border-color)', 
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text)',
            fontSize: '1rem'
          }}
        />
        {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
        <button type="submit" className="btn btn-primary btn-glowing">
          Enter
        </button>
      </form>
    </div>
  );
}

export default function App() {
  const [route, setRoute] = useState({ path: 'home', param: null });
  const [dbConfigured, setDbConfigured] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [albums, setAlbums] = useState([]);
  const [loadingAlbums, setLoadingAlbums] = useState(false);
  const [accessGranted, setAccessGranted] = useState(false);

  // 1. Monitor Hash Routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '#/';
      if (hash.startsWith('#/album/')) {
        const slug = hash.replace('#/album/', '');
        setRoute({ path: 'album-detail', param: slug });
      } else if (hash.startsWith('#/event/')) {
        const slug = hash.replace('#/event/', '');
        setRoute({ path: 'event-page', param: slug });
      } else if (hash === '#/admin') {
        setRoute({ path: 'admin', param: null });
      } else {
        setRoute({ path: 'home', param: null });
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // trigger initial load

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Check for access on mount
  useEffect(() => {
    const isAccessGranted = localStorage.getItem('accessGranted') === 'true';
    setAccessGranted(isAccessGranted);
  }, []);

  // 2. Validate Database Configuration & Auth Session on mount
  useEffect(() => {
    checkConnection();
  }, [route.path]);

  const checkConnection = async () => {
    const config = getSupabaseConfig();
    setDbConfigured(config.isConfigured);

    if (config.isConfigured && supabase) {
      // Fetch active session
      const { data: { session } } = await supabase.auth.getSession();
      setIsAdmin(!!session);

      // Fetch albums for homepage
      fetchAlbums();
    }
  };

  const fetchAlbums = async () => {
    if (!supabase) return;
    setLoadingAlbums(true);
    try {
      const { data, error } = await supabase
        .from('albums')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlbums(data || []);
    } catch (err) {
      console.error('Error fetching home albums:', err);
    } finally {
      setLoadingAlbums(false);
    }
  };

  const navigateTo = (path) => {
    window.location.hash = path;
  };

  const handleLogoClick = (e) => {
    e.preventDefault();
    navigateTo('#/');
  };

  return (
    <div className="app">
      {/* Dynamic Header (hidden inside fullscreen modal states or setup pages if necessary, but beautiful everywhere) */}
      <header className="app-header">
        <a href="#/" onClick={handleLogoClick} className="header-brand">
          <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2Z" fill="currentColor"/>
            <path d="M12 18C13.1 18 14 18.9 14 20C14 21.1 13.1 22 12 22C10.9 22 10 21.1 10 20C10 18.9 10.9 18 12 18Z" fill="currentColor"/>
            <path d="M2 12C2 10.9 2.9 10 4 10C5.1 10 6 10.9 6 12C6 13.1 5.1 14 4 14C2.9 14 2 13.1 2 12Z" fill="currentColor"/>
            <path d="M18 12C18 10.9 18.9 10 20 10C21.1 10 22 10.9 22 12C22 13.1 21.1 14 20 14C18.9 14 18 13.1 18 12Z" fill="currentColor"/>
            <path d="M6.3 6.3C7.2 5.4 8.7 5.4 9.6 6.3C10.5 7.2 10.5 8.7 9.6 9.6C8.7 10.5 7.2 10.5 6.3 9.6C5.4 8.7 5.4 7.2 6.3 6.3Z" fill="currentColor"/>
            <path d="M17.7 6.3C18.6 5.4 20.1 5.4 21 6.3C21.9 7.2 21.9 8.7 21 9.6C20.1 10.5 18.6 10.5 17.7 9.6C16.8 8.7 16.8 7.2 17.7 6.3Z" fill="currentColor"/>
            <path d="M6.3 17.7C7.2 16.8 8.7 16.8 9.6 17.7C10.5 18.6 10.5 20.1 9.6 21C8.7 21.9 7.2 21.9 6.3 21C5.4 20.1 5.4 18.6 6.3 17.7Z" fill="currentColor"/>
            <path d="M17.7 17.7C18.6 16.8 20.1 16.8 21 17.7C21.9 18.6 21.9 20.1 21 21C20.1 21.9 18.6 21.9 17.7 21C16.8 20.1 16.8 18.6 17.7 17.7Z" fill="currentColor"/>
          </svg>
          <span>Family Dairy</span>
        </a>
        
        <nav className="header-nav">
          <a 
            href="#/" 
            onClick={(e) => { e.preventDefault(); navigateTo('#/'); }}
            className={`header-link ${route.path === 'home' || route.path === 'album-detail' ? 'active' : ''}`}
          >
            Home / Albums
          </a>
          <button 
            onClick={() => navigateTo('#/admin')} 
            className={`btn ${route.path === 'admin' ? 'btn-primary btn-glowing' : 'btn-secondary'}`}
          >
            {isAdmin ? 'Admin Dashboard' : 'Admin Login'}
          </button>
        </nav>
      </header>

      {/* Main View Router */}
      <main className="main-content">
        {/* Setup Wizard */}
        {!dbConfigured && route.path === 'admin' ? (
          <SetupWizard onConnected={() => checkConnection()} />
        ) : !dbConfigured ? (
          // Setup Wizard prompt banner for landing pages if not connected
          <div className="empty-placeholder" style={{ padding: '6rem 2rem' }}>
            <svg viewBox="0 0 24 24" width="64" height="64" stroke="currentColor" strokeWidth="1.5" fill="none">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l-7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            </svg>
            <h2 style={{ marginTop: '1.5rem', marginBottom: '0.8rem' }}>Database Configuration Required</h2>
            <p style={{ maxWidth: '500px', margin: '0 auto 2rem auto', color: 'var(--text-muted)' }}>
              To view photos, upload videos, and build Event Pages, connect your Supabase database in the Admin panel.
            </p>
            <button onClick={() => navigateTo('#/admin')} className="btn btn-primary btn-glowing">
              Go to Connection Wizard
            </button>
          </div>
        ) : route.path === 'admin' ? (
          // Admin route - no password needed
          isAdmin ? (
            <AdminPanel onLogout={() => setIsAdmin(false)} />
          ) : (
            <Login 
              onSuccess={() => setIsAdmin(true)} 
              onBack={() => navigateTo('#/')} 
            />
          )
        ) : !accessGranted ? (
          // Show access password for home/album/event pages
          <AccessPassword onSuccess={() => setAccessGranted(true)} />
        ) : (
          /* Normal routing when db is connected and access granted */
          <>
            {/* 1. Root / Homepage View */}
            {route.path === 'home' && (
              <div className="animate-fadeIn">
                {/* Events Slider Header */}
                <Slider 
                  albums={albums} 
                  onSelectAlbum={(slug) => navigateTo(`#/album/${slug}`)} 
                />

                {/* Album grid view */}
                <div className="albums-section">
                  <h2 className="section-title">Photo &amp; Video Albums</h2>
                  
                  {loadingAlbums ? (
                    <div className="empty-placeholder">
                      <span className="spinner spinner-large"></span>
                      <p style={{ marginTop: '1rem' }}>Fetching albums from database...</p>
                    </div>
                  ) : albums.length === 0 ? (
                    <div className="empty-placeholder">
                      <p>No albums found in database. Log into Admin panel to create folders.</p>
                    </div>
                  ) : (
                    <div className="albums-grid">
                      {albums.map((album) => (
                        <AlbumCard
                          key={album.id}
                          album={album}
                          onSelect={(slug) => navigateTo(`#/album/${slug}`)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. Album Details View */}
            {route.path === 'album-detail' && (
              <AlbumDetail
                albumSlug={route.param}
                onBack={() => navigateTo('#/')}
              />
            )}

            {/* 3. Custom Tabbed Event Page View */}
            {route.path === 'event-page' && (
              <EventPage
                pageSlug={route.param}
                onBack={() => navigateTo('#/')}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
