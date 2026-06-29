import React, { useState, useEffect, useRef } from 'react';

export default function Slider({ albums, onSelectAlbum }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const autoPlayRef = useRef(null);

  // Filter out albums that don't have a cover_url
  const slides = albums.filter(a => a.cover_url);

  useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay();
  }, [slides.length]);

  const startAutoPlay = () => {
    stopAutoPlay();
    if (slides.length > 1) {
      autoPlayRef.current = setInterval(() => {
        handleNext();
      }, 5000); // cycle every 5 seconds
    }
  };

  const stopAutoPlay = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
  };

  const handleDotClick = (index) => {
    setCurrentIndex(index);
    startAutoPlay();
  };

  if (slides.length === 0) return null;

  return (
    <div 
      className="slider-container"
      onMouseEnter={stopAutoPlay}
      onMouseLeave={startAutoPlay}
    >
      {slides.map((album, index) => (
        <div
          key={album.id || index}
          className={`slide ${index === currentIndex ? 'active' : ''}`}
        >
          <img src={album.cover_url} alt={album.title} className="slide-image" />
          <div className="slide-overlay">
            <div className="slide-content">
              <span className="slide-tag">Featured Event</span>
              <h2>{album.title}</h2>
              <p>{album.description || 'No description available for this event album.'}</p>
              <button 
                onClick={() => onSelectAlbum(album.slug)} 
                className="btn btn-primary btn-glowing"
              >
                View Event Album
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </div>
          </div>
        </div>
      ))}

      {slides.length > 1 && (
        <>
          <button className="slider-control prev" onClick={handlePrev} title="Previous Slide">
            <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          
          <button className="slider-control next" onClick={handleNext} title="Next Slide">
            <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>

          <div className="slider-indicators">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`slider-dot ${index === currentIndex ? 'active' : ''}`}
                onClick={() => handleDotClick(index)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
