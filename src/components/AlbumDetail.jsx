import React, { useState, useEffect } from 'react';
import { supabase } from '../db/supabase';
import Lightbox from './Lightbox';

export default function AlbumDetail({ albumSlug, onBack }) {
  const [album, setAlbum] = useState(null);
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'photo', 'video'
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  useEffect(() => {
    async function fetchAlbumData() {
      if (!supabase) return;
      setLoading(true);
      try {
        // 1. Fetch Album metadata
        const { data: albumData, error: albumError } = await supabase
          .from('albums')
          .select('*')
          .eq('slug', albumSlug)
          .single();

        if (albumError) throw albumError;
        setAlbum(albumData);
      

        if (albumData) {
          // 2. Fetch Media elements
          const { data: mediaData, error: mediaError } = await supabase
            .from('media')
            .select('*')
            .eq('album_id', albumData.id)
            .order('created_at', { ascending: false });

          if (mediaError) throw mediaError;
          setMedia(mediaData || []);
        }
      } catch (err) {
        console.error('Error fetching album detail:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAlbumData();
  }, [albumSlug]);

  const filteredMedia = media.filter(m => {
    if (filter === 'photo') return m.type === 'image';
    if (filter === 'video') return m.type === 'video';
    return true;
  });

  if (loading) {
    return (
      <div className="empty-placeholder">
        <span className="spinner spinner-large"></span>
        <p style={{ marginTop: '1rem' }}>Loading album details...</p>
      </div>
    );
  }

  if (!album) {
    return (
      <div className="empty-placeholder">
        <h3>Album not found</h3>
        <p>The album you are looking for does not exist or has been deleted.</p>
        <button onClick={onBack} className="btn btn-secondary" style={{ marginTop: '1.5rem' }}>
          Back to Albums
        </button>
      </div>
    );
  }

  return (
    <div className="album-detail-container">
      {/* Back button */}
      <button onClick={onBack} className="btn btn-secondary" style={{ marginBottom: '1.5rem' }}>
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Back to Albums
      </button>
      {/* Album Banner */}
      <div className="album-detail-banner">
        <img src={album.cover_url || "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1200&auto=format&fit=crop"} alt={album.title} />
        <div className="album-detail-banner-overlay">
          <div className="album-detail-title-block">
            <h1>{album.title}</h1>
            <p>{album.description}</p>
          </div>
        </div>
      </div>

      {/* Filter Options */}
      <div className="album-filter-bar">
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Assets ({media.length})
          </button>
          <button 
            className={`filter-tab ${filter === 'photo' ? 'active' : ''}`}
            onClick={() => setFilter('photo')}
          >
            Photos ({media.filter(m => m.type === 'image').length})
          </button>
          <button 
            className={`filter-tab ${filter === 'video' ? 'active' : ''}`}
            onClick={() => setFilter('video')}
          >
            Videos ({media.filter(m => m.type === 'video').length})
          </button>
        </div>
      </div>

      {/* Media Grid */}
      {filteredMedia.length === 0 ? (
        <div className="empty-placeholder">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
          <p>No media files found matching the filter.</p>
        </div>
      ) : (
        <div className="media-grid">
          {filteredMedia.map((item, index) => (
            <MediaCard
              key={item.id}
              item={item}
              onClick={() => setLightboxIndex(index)}
            />
          ))}
        </div>
      )}

      {/* Lightbox triggers */}
      {lightboxIndex >= 0 && (
        <Lightbox
          mediaList={filteredMedia}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(-1)}
        />
      )}
    </div>
  );
}

// Memoized Media Card component to prevent unnecessary re-renders
const MediaCard = React.memo(({ item, onClick }) => {
  return (
    <div 
      className="media-card"
      onClick={onClick}
    >
      {item.type === 'video' ? (
        <>
          <video 
            src={item.url} 
            preload="none" 
            muted 
          />
          <div className="media-card-type-icon">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </div>
        </>
      ) : (
        <img 
          src={item.url} 
          alt={item.name} 
          loading="lazy"
        />
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
  );
});
