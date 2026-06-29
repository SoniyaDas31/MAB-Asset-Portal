import React, { useState, useEffect, useRef } from 'react';
import VideoPlayer from './VideoPlayer';

export default function Lightbox({ mediaList, initialIndex, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlayingSlideshow, setIsPlayingSlideshow] = useState(false);
  const slideshowTimerRef = useRef(null);
  const activeThumbRef = useRef(null);

  const activeMedia = mediaList[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % mediaList.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + mediaList.length) % mediaList.length);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, mediaList]);

  // Slideshow logic
  useEffect(() => {
    if (isPlayingSlideshow) {
      slideshowTimerRef.current = setInterval(() => {
        handleNext();
      }, 3500); // 3.5 seconds per slide
    } else {
      if (slideshowTimerRef.current) {
        clearInterval(slideshowTimerRef.current);
      }
    }
    return () => {
      if (slideshowTimerRef.current) {
        clearInterval(slideshowTimerRef.current);
      }
    };
  }, [isPlayingSlideshow, currentIndex, mediaList]);

  // Scroll active thumbnail into view
  useEffect(() => {
    if (activeThumbRef.current) {
      activeThumbRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [currentIndex]);

  const toggleSlideshow = () => {
    setIsPlayingSlideshow(!isPlayingSlideshow);
  };

  return (
    <div className="lightbox-modal">
      {/* Lightbox Top Header */}
      <div className="lightbox-header">
        <div className="lightbox-title">
          {activeMedia ? activeMedia.name : 'View Asset'} ({currentIndex + 1} / {mediaList.length})
        </div>
        
        <div className="lightbox-controls-group">
          {/* Slideshow button */}
          <button className="lightbox-play-btn" onClick={toggleSlideshow} title={isPlayingSlideshow ? 'Pause Slideshow' : 'Play Slideshow'}>
            {isPlayingSlideshow ? (
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16"></rect>
                <rect x="14" y="4" width="4" height="16"></rect>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3"></polygon>
              </svg>
            )}
          </button>

          {/* Close button */}
          <button className="lightbox-close-btn" onClick={onClose} title="Close (Esc)">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="lightbox-main">
        {/* Left Arrow */}
        <button className="lightbox-arrow prev" onClick={handlePrev} title="Previous">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        {/* Center Media Render */}
        <div className="lightbox-content-container">
          {activeMedia.type === 'video' ? (
            <div className="lightbox-video-wrapper">
              <VideoPlayer src={activeMedia.url} />
            </div>
          ) : (
            <img src={activeMedia.url} alt={activeMedia.name} className="lightbox-image" />
          )}
        </div>

        {/* Right Arrow */}
        <button className="lightbox-arrow next" onClick={handleNext} title="Next">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>

      {/* Lightbox Footer Thumbnail navigation */}
      <div className="lightbox-footer-thumbnails">
        <div className="thumbnail-strip">
          {mediaList.map((media, idx) => (
            <div
              key={media.id || idx}
              ref={idx === currentIndex ? activeThumbRef : null}
              className={`thumbnail-item ${idx === currentIndex ? 'active' : ''}`}
              onClick={() => {
                setCurrentIndex(idx);
                setIsPlayingSlideshow(false); // Pause slideshow on click
              }}
            >
              {media.type === 'video' ? (
                <>
                  <video src={media.url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div className="thumbnail-video-badge">
                    <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                  </div>
                </>
              ) : (
                <img src={media.url} alt={media.name} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
