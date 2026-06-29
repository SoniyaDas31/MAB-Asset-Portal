import React, { useState, useEffect } from 'react';
import { supabase, clearSupabaseConfig } from '../db/supabase';
import AssetManager from './AssetManager';

export default function AdminPanel({ onLogout }) {
  const [activeTab, setActiveTab] = useState('assets'); // 'assets', 'settings'
  const [adminEmail, setAdminEmail] = useState('');

  useEffect(() => {
    async function getAdminUser() {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setAdminEmail(user.email);
      }
    }
    getAdminUser();
  }, []);

  const handleLogout = async () => {
    if (!supabase) return;
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error(err);
    }
    onLogout();
  };

  const handleDisconnectDb = () => {
    if (window.confirm('WARNING: Are you sure you want to disconnect this Supabase instance? This will clear your credentials from this browser. Your actual database and storage data on Supabase will remain intact.')) {
      clearSupabaseConfig();
      // Force reload to setup wizard
      window.location.reload();
    }
  };

  return (
    <div className="admin-layout animate-fadeIn">
      {/* Admin Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-nav">
          <button
            onClick={() => setActiveTab('assets')}
            className={`admin-nav-item ${activeTab === 'assets' ? 'active' : ''}`}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
            Asset Manager
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`admin-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            Database Settings
          </button>
        </div>

        {/* User profile section */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Logged in as:</div>
          <div style={{ fontSize: '0.85rem', color: '#fff', wordBreak: 'break-all', fontWeight: '500' }}>{adminEmail || 'Admin User'}</div>
          
          <button onClick={handleLogout} className="btn btn-secondary btn-block" style={{ marginTop: '0.5rem', padding: '0.5rem' }}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Log Out
          </button>
        </div>
      </aside>

      {/* Admin Content Area */}
      <main className="admin-main">
        {activeTab === 'assets' && <AssetManager />}
        
        {activeTab === 'settings' && (
          <div style={{ maxWidth: '600px' }} className="animate-fadeIn">
            <h2>Database Connection Status</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Configure and manage the connection credentials between this browser application and Supabase.</p>
            
            <div className="setup-steps" style={{ padding: '2rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--accent)', fontWeight: '600', marginBottom: '1rem' }}>
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2.5" fill="none">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <span>Linked to Supabase Project</span>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                Your web app is connected. Albums, assets, and Event Pages are loaded live from your Supabase remote tables.
              </p>
            </div>

            <button onClick={handleDisconnectDb} className="btn btn-danger">
              Disconnect Supabase Instance
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
