import React, { useState, useEffect } from 'react';
import { supabase } from '../db/supabase';

export default function AlbumCard({ album, onSelect }) {
  const [photoCount, setPhotoCount] = useState(0);
  const [videoCount, setVideoCount] = useState(0);

  useEffect(() => {
    async function fetchMediaCounts() {
      if (!supabase) return;
      try {
        const { data, error } = await supabase
          .from('media')
          .select('type')
          .eq('album_id', album.id);

        if (error) throw error;

        if (data) {
          const photos = data.filter(m => m.type === 'image').length;
          const videos = data.filter(m => m.type === 'video').length;
          setPhotoCount(photos);
          setVideoCount(videos);
        }
      } catch (err) {
        console.error('Error fetching media counts:', err);
      }
    }
    fetchMediaCounts();
  }, [album.id]);

  const totalCount = photoCount + videoCount;

  return (
    <div className="album-card" onClick={() => onSelect(album.slug)}>
      <div className="album-card-image">
        <img 
          src={album.cover_url || "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=600&auto=format&fit=crop"} 
          alt={album.title} 
          loading="lazy"
        />
        <div className="album-card-badge">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
          {totalCount} Assets
        </div>
      </div>
      
      <div className="album-card-content">
        <h3>{album.title}</h3>
        <p>{album.description || 'View gorgeous high-resolution imagery and video collections in this event album.'}</p>
        
        <div className="album-card-footer">
          <span>{photoCount} Photos • {videoCount} Videos</span>
          <span>{new Date(album.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}</span>
        </div>
      </div>
    </div>
  );
}
