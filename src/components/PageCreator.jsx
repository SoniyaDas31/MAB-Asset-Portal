import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../db/supabase';

export default function PageCreator() {
  const [pages, setPages] = useState([]);
  const [allMedia, setAllMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form states
  const [editId, setEditId] = useState(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverUploadProgress, setCoverUploadProgress] = useState(0);
  const coverInputRef = useRef(null);
  const [selectedMediaIds, setSelectedMediaIds] = useState([]);
  
  // Privacy states
  const [isPasswordLocked, setIsPasswordLocked] = useState(false);
  const [password, setPassword] = useState('');
  const [noIndex, setNoIndex] = useState(false);

  useEffect(() => {
    fetchPages();
    fetchAllMedia();
  }, []);

  // Compute slug from title
  useEffect(() => {
    if (!editId && title) {
      const generatedSlug = title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generatedSlug);
    }
  }, [title, editId]);

  const fetchPages = async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPages(data || []);
    } catch (err) {
      console.error('Error fetching pages:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllMedia = async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setAllMedia(data || []);
    } catch (err) {
      console.error('Error fetching all media:', err);
    }
  };

  const handleMediaToggle = (id) => {
    setSelectedMediaIds(prev => 
      prev.includes(id) 
        ? prev.filter(mediaId => mediaId !== id) 
        : [...prev, id]
    );
  };

  const handleSavePage = async (e) => {
    e.preventDefault();
    if (!supabase || !title.trim() || !slug.trim()) return;

    const pageData = {
      title: title.trim(),
      slug: slug.trim(),
      description: description.trim(),
      event_date: eventDate || null,
      cover_url: coverUrl.trim() || null,
      media_ids: selectedMediaIds,
      is_public: !isPasswordLocked,
      password: isPasswordLocked ? password.trim() : null,
      no_index: noIndex
    };

    try {
      if (editId) {
        // Update existing page
        const { error } = await supabase
          .from('pages')
          .update(pageData)
          .eq('id', editId);

        if (error) throw error;
        alert('Page updated successfully!');
      } else {
        // Insert new page
        const { error } = await supabase
          .from('pages')
          .insert(pageData);

        if (error) throw error;
        alert('Page created successfully!');
      }

      // Reset form & reload
      resetForm();
      fetchPages();
    } catch (err) {
      console.error('Error saving page:', err);
      alert(`Error saving page: ${err.message}`);
    }
  };

  const handleEditClick = (page) => {
    setEditId(page.id);
    setTitle(page.title);
    setSlug(page.slug);
    setDescription(page.description || '');
    setEventDate(page.event_date || '');
    setCoverUrl(page.cover_url || '');
    setSelectedMediaIds(page.media_ids || []);
    setIsPasswordLocked(!page.is_public);
    setPassword(page.password || '');
    setNoIndex(page.no_index || false);
    setIsEditing(true);
  };

  const handleDeletePage = async (pageId) => {
    if (!supabase) return;
    if (!window.confirm('Are you sure you want to delete this custom Event page?')) return;

    try {
      const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', pageId);

      if (error) throw error;
      setPages(prev => prev.filter(p => p.id !== pageId));
    } catch (err) {
      console.error('Error deleting page:', err);
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file || !supabase) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file for the cover.');
      return;
    }

    setCoverUploading(true);

    try {
      // Convert file to base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      setCoverUrl(base64);
    } catch (err) {
      console.error('Cover upload failed:', err);
      alert(`Cover upload failed: ${err.message}`);
    } finally {
      setCoverUploading(false);
      // reset file input so same file can be re-selected
      if (coverInputRef.current) coverInputRef.current.value = '';
    }
  };

  const resetForm = () => {
    setEditId(null);
    setTitle('');
    setSlug('');
    setDescription('');
    setEventDate('');
    setCoverUrl('');
    setCoverUploading(false);
    setCoverUploadProgress(0);
    setSelectedMediaIds([]);
    setIsPasswordLocked(false);
    setPassword('');
    setNoIndex(false);
    setIsEditing(false);
  };

  const copyPageLink = (pageSlug) => {
    const fullUrl = `${window.location.origin}${window.location.pathname}#/event/${pageSlug}`;
    navigator.clipboard.writeText(fullUrl)
      .then(() => alert('Event page link copied to clipboard!'))
      .catch(() => alert('Failed to copy link.'));
  };

  if (loading) {
    return (
      <div className="empty-placeholder">
        <span className="spinner"></span> Loading page creator...
      </div>
    );
  }

  return (
    <div className="page-creator-container">
      <div className="admin-header-row">
        <h2>{isEditing ? (editId ? 'Edit Event Page' : 'Create Event Page') : 'Event Page Creator'}</h2>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="btn btn-primary btn-glowing">
            + Create New Page
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSavePage} className="page-creator-layout animate-fadeIn">
          {/* Left panel Form settings */}
          <div className="creator-left-card">
            <h3 className="creator-section-title">Page Details</h3>

            <div className="form-group">
              <label htmlFor="pageTitle">Event Page Title</label>
              <input
                id="pageTitle"
                type="text"
                required
                placeholder="e.g. Soniya & John's Wedding Ceremony"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="pageSlug">URL Slug (Dynamic)</label>
              <input
                id="pageSlug"
                type="text"
                required
                placeholder="e.g. soniya-wedding"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="pageDesc">Event Description</label>
              <textarea
                id="pageDesc"
                placeholder="Write a welcoming message or details about the event."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="pageDate">Event Date</label>
              <input
                id="pageDate"
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Cover / Banner Image</label>

              {/* Hidden file input */}
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverUpload}
                style={{ display: 'none' }}
                id="coverFileInput"
              />

              {coverUrl ? (
                /* Preview + Remove */
                <div style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                  <img
                    src={coverUrl}
                    alt="Cover preview"
                    style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block' }}
                  />
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(7,8,13,0.55)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', gap: '0.8rem',
                    opacity: 0, transition: 'opacity 0.2s'
                  }}
                    className="cover-preview-overlay"
                    onMouseEnter={e => e.currentTarget.style.opacity = 1}
                    onMouseLeave={e => e.currentTarget.style.opacity = 0}
                  >
                    <button
                      type="button"
                      onClick={() => coverInputRef.current && coverInputRef.current.click()}
                      className="btn btn-secondary"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                    >
                      Change Image
                    </button>
                    <button
                      type="button"
                      onClick={() => setCoverUrl('')}
                      className="btn btn-danger"
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                /* Upload dropzone */
                <div
                  onClick={() => !coverUploading && coverInputRef.current && coverInputRef.current.click()}
                  style={{
                    border: '2px dashed var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '2rem',
                    textAlign: 'center',
                    cursor: coverUploading ? 'not-allowed' : 'pointer',
                    transition: 'border-color 0.2s, background 0.2s',
                    background: 'rgba(255,255,255,0.01)',
                  }}
                  onMouseEnter={e => { if (!coverUploading) { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = 'rgba(99,102,241,0.04)'; }}}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.background = 'rgba(255,255,255,0.01)'; }}
                >
                  {coverUploading ? (
                    <>
                      <span className="spinner" style={{ marginBottom: '0.6rem', display: 'inline-block' }}></span>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Uploading cover... {coverUploadProgress}%</p>
                      <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: '0.8rem' }}>
                        <div style={{ width: `${coverUploadProgress}%`, height: '100%', background: 'var(--primary)', borderRadius: '2px', transition: 'width 0.2s' }} />
                      </div>
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" width="36" height="36" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-dark)', marginBottom: '0.6rem' }}>
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                      <p style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.3rem' }}>Click to upload cover image</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-dark)' }}>JPG, PNG, WEBP supported. Used as the event banner.</p>
                    </>
                  )}
                </div>
              )}
            </div>

            <h3 className="creator-section-title" style={{ marginTop: '2rem' }}>Select Photos &amp; Videos to Embed</h3>
            {allMedia.length === 0 ? (
              <p style={{ color: 'var(--text-dark)', fontSize: '0.9rem' }}>
                No assets available in your library. Upload some photos and videos under the <strong>Asset Manager</strong> tab first.
              </p>
            ) : (
              <div className="page-creator-grid-selector">
                {allMedia.map(item => (
                  <div
                    key={item.id}
                    className={`media-select-item ${selectedMediaIds.includes(item.id) ? 'selected' : ''}`}
                    onClick={() => handleMediaToggle(item.id)}
                  >
                    {item.type === 'video' ? (
                      <video src={item.url} preload="metadata" muted />
                    ) : (
                      <img src={item.url} alt={item.name} />
                    )}
                    <div className="media-select-checkbox">
                      ✓
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right panel settings (Privacy, Publish) */}
          <div className="creator-right-card">
            <h3 className="creator-section-title">Privacy &amp; Publish</h3>

            <div className="creator-options">
              {/* Password protection */}
              <div className="checkbox-option" onClick={() => setIsPasswordLocked(!isPasswordLocked)}>
                <input
                  type="checkbox"
                  checked={isPasswordLocked}
                  onChange={() => {}} // handled by click wrapper
                />
                <div className="checkbox-label-text">
                  <h4>Password Lock</h4>
                  <p>Restricts access to viewers who enter the correct password key.</p>
                </div>
              </div>

              {isPasswordLocked && (
                <div className="form-group" style={{ marginLeft: '1.8rem', marginTop: '-0.5rem' }}>
                  <input
                    type="text"
                    required
                    placeholder="Enter Passcode"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              )}

              {/* SEO restriction */}
              <div className="checkbox-option" onClick={() => setNoIndex(!noIndex)}>
                <input
                  type="checkbox"
                  checked={noIndex}
                  onChange={() => {}} // handled by click wrapper
                />
                <div className="checkbox-label-text">
                  <h4>Search Engine Restricted</h4>
                  <p>Injects robots meta tag to request Google/Bing to exclude this page from search results.</p>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '3rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button type="submit" className="btn btn-primary btn-block btn-glowing">
                {editId ? 'Update Event Page' : 'Publish Event Page'}
              </button>
              <button type="button" onClick={resetForm} className="btn btn-secondary btn-block">
                Cancel
              </button>
            </div>
          </div>
        </form>
      ) : (
        /* Pages List Table view */
        <div className="creator-table-view animate-fadeIn">
          {pages.length === 0 ? (
            <div className="empty-placeholder">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              <p>No custom Event pages published yet. Create one using the button above.</p>
            </div>
          ) : (
            <table className="pages-list-table">
              <thead>
                <tr>
                  <th>Page Title</th>
                  <th>Slug URL</th>
                  <th>Cover Image</th>
                  <th>Media Items</th>
                  <th>Privacy Status</th>
                  <th>SEO Restrictions</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pages.map(page => (
                  <tr key={page.id}>
                    <td>
                      <strong style={{ color: '#fff' }}>{page.title}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dark)', marginTop: '0.2rem' }}>
                        {page.event_date ? new Date(page.event_date).toLocaleDateString() : 'No date set'}
                      </div>
                    </td>
                    <td>
                      <span style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>/event/{page.slug}</span>
                    </td>
                    <td>
                      <img src={page.cover_url || ''} width='300' />
                    </td>
                    <td>
                      {(page.media_ids || []).length} media items
                    </td>
                    <td>
                      {page.is_public ? (
                        <span className="page-status-badge public">Public</span>
                      ) : (
                        <span className="page-status-badge private" title={`Passcode: ${page.password}`}>Private</span>
                      )}
                    </td>
                    <td>
                      {page.no_index ? (
                        <span className="page-status-badge noindex">noindex</span>
                      ) : (
                        <span className="page-status-badge public">indexable</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => copyPageLink(page.slug)}
                          className="btn btn-secondary"
                          style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}
                          title="Copy Public Link"
                        >
                          Copy Link
                        </button>
                        <button
                          onClick={() => handleEditClick(page)}
                          className="btn btn-secondary"
                          style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}
                          title="Edit Page Settings"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeletePage(page.id)}
                          className="btn btn-secondary btn-danger"
                          style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}
                          title="Delete Page"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
