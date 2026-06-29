import React, { useState, useEffect } from 'react';
import { supabase } from '../db/supabase';
import Lightbox from './Lightbox';

export default function EventPage({ pageSlug, onBack }) {
  const [page, setPage] = useState(null);
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [passInput, setPassInput] = useState('');
  const [passError, setPassError] = useState('');
  const [activeTab, setActiveTab] = useState('photos'); // 'photos', 'videos'
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  // Fetch Event page
  useEffect(() => {
    async function fetchEventPage() {
      if (!supabase) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('pages')
          .select('*')
          .eq('slug', pageSlug)
          .single();

        if (error) throw error;
        setPage(data);

        // If not password locked, set unlocked
        if (data && !data.password) {
          setUnlocked(true);
        }

        // Fetch associated media elements
        if (data && data.media_ids && data.media_ids.length > 0) {
          const { data: mediaData, error: mediaError } = await supabase
            .from('media')
            .select('*')
            .in('id', data.media_ids);

          if (mediaError) throw mediaError;
          setMedia(mediaData || []);
        }
      } catch (err) {
        console.error('Error fetching event page:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchEventPage();
  }, [pageSlug]);

  // SEO Restrict tag inject
  useEffect(() => {
    if (page && page.no_index) {
      let meta = document.querySelector('meta[name="robots"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'robots';
        document.head.appendChild(meta);
      }
      meta.content = 'noindex, nofollow';
    }

    return () => {
      const meta = document.querySelector('meta[name="robots"]');
      if (meta) {
        meta.remove();
      }
    };
  }, [page]);

  const handleVerifyPassword = (e) => {
    e.preventDefault();
    setPassError('');
    if (page && passInput.trim() === page.password) {
      setUnlocked(true);
    } else {
      setPassError('Incorrect passcode. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="empty-placeholder">
        <span className="spinner spinner-large"></span>
        <p style={{ marginTop: '1rem' }}>Loading Event Page...</p>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="empty-placeholder">
        <h3>Event Page Not Found</h3>
        <p>This event page does not exist or has been removed.</p>
        <button onClick={onBack} className="btn btn-secondary" style={{ marginTop: '1.5rem' }}>
          Go to Home Page
        </button>
      </div>
    );
  }

  // If page is password locked and not yet unlocked
  if (!unlocked) {
    return (
      <div className="password-lock-screen">
        <div className="password-lock-card">
          <div className="password-lock-icon">
            <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <h2>Private Event Page</h2>
          <p>This event page is password protected. Enter the passcode key to view its media gallery.</p>
          
          {passError && <div className="setup-error" style={{ marginBottom: '1rem' }}>{passError}</div>}
          
          <form onSubmit={handleVerifyPassword} className="setup-form">
            <div className="form-group">
              <input
                type="password"
                required
                placeholder="Enter passcode key"
                value={passInput}
                onChange={(e) => setPassInput(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block btn-glowing">
              Unlock Page
            </button>
            <button type="button" onClick={onBack} className="btn btn-secondary btn-block" style={{ marginTop: '0.8rem' }}>
              Go Back
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Group media by photos vs videos
  const photos = media.filter(m => m.type === 'image');
  const videos = media.filter(m => m.type === 'video');

  const activeMediaList = activeTab === 'photos' ? photos : videos;

  return (
    <div className="event-page-container animate-fadeIn">
      {/* Back button */}
      <button onClick={onBack} className="btn btn-secondary" style={{ marginBottom: '1.5rem' }}>
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
        Back to Home
      </button>

      {/* Page cover banner */}
      <div className="album-detail-banner">
        <img 
          src={page.cover_url || "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=1200&auto=format&fit=crop"} 
          alt={page.title} 
        />
        <div className="album-detail-banner-overlay">
          <div className="album-detail-title-block">
            <span className="slide-tag" style={{ background: 'var(--secondary-glow)', borderColor: 'var(--secondary)' }}>Custom Event Page</span>
            <h1>{page.title}</h1>
            <p>{page.description}</p>
            {page.event_date && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Event Date: {new Date(page.event_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs Menu - Division between Photos & Videos */}
      <div className="event-tabs-bar">
        <button
          onClick={() => setActiveTab('photos')}
          className={`event-tab-btn ${activeTab === 'photos' ? 'active' : ''}`}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
          Photos ({photos.length})
        </button>

        <button
          onClick={() => setActiveTab('videos')}
          className={`event-tab-btn ${activeTab === 'videos' ? 'active' : ''}`}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
          Videos ({videos.length})
        </button>
      </div>

      {/* Tab Contents Grid */}
      {activeMediaList.length === 0 ? (
        <div className="empty-placeholder">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <p>No {activeTab} embedded in this event page.</p>
        </div>
      ) : (
        <div className="media-grid">
          {activeMediaList.map((item, index) => (
            <div
              key={item.id}
              className="media-card"
              onClick={() => setLightboxIndex(index)}
            >
              {item.type === 'video' ? (
                <>
                  <video src={item.url} preload="metadata" muted />
                  <div className="media-card-type-icon">
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                  </div>
                </>
              ) : (
                <img src={item.url} alt={item.name} loading="lazy" />
              )}
              
              <div className="media-card-overlay">
                <div className="media-icon-wrapper">
                  {item.type === 'video' ? (
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      <line x1="11" y1="8" x2="11" y2="14"></line>
                      <line x1="8" y1="11" x2="14" y2="11"></line>
                    </svg>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Trigger */}
      {lightboxIndex >= 0 && (
        <Lightbox
          mediaList={activeMediaList}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(-1)}
        />
      )}
    </div>
  );
}
