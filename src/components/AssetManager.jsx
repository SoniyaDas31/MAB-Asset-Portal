import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../db/supabase';

export default function AssetManager() {
  const [albums, setAlbums] = useState([]);
  const [activeAlbum, setActiveAlbum] = useState(null);
  const [media, setMedia] = useState([]);
  const [loadingAlbums, setLoadingAlbums] = useState(true);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [uploads, setUploads] = useState([]); // Array of { name, progress, status }
  const [dragActive, setDragActive] = useState(false);
  
  // New Album form states
  const [showAddAlbum, setShowAddAlbum] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  
  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const handleAlbumCoverUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file || !supabase || !activeAlbum) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file for the album cover.');
      return;
    }

    try {
      // Convert file to base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Update album in DB
      const { data, error: updateError } = await supabase
        .from('albums')
        .update({ cover_url: base64 })
        .eq('id', activeAlbum.id)
        .select();

      if (updateError) throw updateError;

      // Update local state
      setActiveAlbum(data[0]);
      setAlbums(prev => prev.map(a => a.id === activeAlbum.id ? data[0] : a));
      alert('Album cover uploaded successfully!');

    } catch (err) {
      console.error('Album cover upload failed:', err);
      alert(`Album cover upload failed: ${err.message}`);
    } finally {
      if (coverInputRef.current) coverInputRef.current.value = '';
    }
  };

  useEffect(() => {
    fetchAlbums();
  }, []);

  useEffect(() => {
    if (activeAlbum) {
      fetchMedia(activeAlbum.id);
    } else {
      setMedia([]);
    }
  }, [activeAlbum]);

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
      if (data && data.length > 0 && !activeAlbum) {
        setActiveAlbum(data[0]);
      }
    } catch (err) {
      console.error('Error fetching albums:', err);
    } finally {
      setLoadingAlbums(false);
    }
  };

  const fetchMedia = async (albumId) => {
    if (!supabase) return;
    setLoadingMedia(true);
    try {
      const { data, error } = await supabase
        .from('media')
        .select('*')
        .eq('album_id', albumId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMedia(data || []);
    } catch (err) {
      console.error('Error fetching media:', err);
    } finally {
      setLoadingMedia(false);
    }
  };

  const handleCreateAlbum = async (e) => {
    e.preventDefault();
    if (!supabase || !newTitle.trim()) return;

    const slug = newTitle
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    try {
      const { data, error } = await supabase
        .from('albums')
        .insert({
          title: newTitle.trim(),
          description: newDesc.trim(),
          slug: slug
        })
        .select()
        .single();

      if (error) throw error;
      
      setAlbums([data, ...albums]);
      setActiveAlbum(data);
      setNewTitle('');
      setNewDesc('');
      setShowAddAlbum(false);
    } catch (err) {
      console.error('Error creating album:', err);
      alert(`Failed to create album: ${err.message}`);
    }
  };

  const handleDeleteAlbum = async (albumId, e) => {
    e.stopPropagation();
    if (!supabase) return;
    if (!window.confirm('Are you sure you want to delete this folder/album? All media in it will also be deleted.')) return;

    try {
      // Delete album (media will cascade delete in DB)
      const { error } = await supabase
        .from('albums')
        .delete()
        .eq('id', albumId);

      if (error) throw error;
      
      const updatedAlbums = albums.filter(a => a.id !== albumId);
      setAlbums(updatedAlbums);
      
      if (activeAlbum && activeAlbum.id === albumId) {
        setActiveAlbum(updatedAlbums.length > 0 ? updatedAlbums[0] : null);
      }
    } catch (err) {
      console.error('Error deleting album:', err);
    }
  };

  // Uploader triggers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFilesUpload(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFilesUpload(e.target.files);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleFilesUpload = async (filesList) => {
    if (!activeAlbum || !supabase) return;
    
    const files = Array.from(filesList);
    const newUploads = files.map(file => ({
      name: file.name,
      progress: 0,
      status: 'pending'
    }));

    setUploads(prev => [...prev, ...newUploads]);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const type = file.type.startsWith('video/') ? 'video' : 'image';

      // Update upload status to uploading
      setUploads(prev => prev.map(u => u.name === file.name ? { ...u, status: 'uploading' } : u));

      try {
        // Convert file to base64
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        // 3. Insert record in 'media' table (store base64 in URL field)
        const { data: mediaData, error: dbError } = await supabase
          .from('media')
          .insert({
            album_id: activeAlbum.id,
            type: type,
            url: base64,
            name: file.name,
            size: file.size
          })
          .select()
          .single();

        if (dbError) throw dbError;

        // Success state
        setUploads(prev => prev.map(u => u.name === file.name ? { ...u, status: 'success', progress: 100 } : u));
        setMedia(prev => [mediaData, ...prev]);

      } catch (err) {
        console.error(`Error uploading ${file.name}:`, err);
        setUploads(prev => prev.map(u => u.name === file.name ? { ...u, status: 'error' } : u));
      }
    }

    // Clear completed uploads list after 3 seconds
    setTimeout(() => {
      setUploads(prev => prev.filter(u => u.status !== 'success'));
    }, 3000);
  };

  const handleDeleteMedia = async (item) => {
    if (!supabase) return;
    if (!window.confirm(`Are you sure you want to delete "${item.name}"?`)) return;

    try {
      // 1. Extract file path from URL to delete from storage
      // Storage public url looks like: .../storage/v1/object/public/assets/albums/album_id/filename.ext
      const urlParts = item.url.split('/storage/v1/object/public/assets/');
      if (urlParts.length === 2) {
        const filePath = urlParts[1];
        await supabase.storage.from('assets').remove([filePath]);
      }

      // 2. Delete from media table
      const { error } = await supabase
        .from('media')
        .delete()
        .eq('id', item.id);

      if (error) throw error;

      setMedia(prev => prev.filter(m => m.id !== item.id));
    } catch (err) {
      console.error('Error deleting media:', err);
    }
  };

  const handleSetCover = async (item) => {
    if (!supabase || !activeAlbum) return;
    try {
      const { data, error } = await supabase
        .from('albums')
        .update({ cover_url: item.url })
        .eq('id', activeAlbum.id)
        .select();

      if (error) throw error;

      setActiveAlbum(prev => ({ ...prev, cover_url: item.url }));
      setAlbums(prev => prev.map(a => a.id === activeAlbum.id ? { ...a, cover_url: item.url } : a));
      alert('Cover image set successfully!');
    } catch (err) {
      console.error('Error setting cover:', err);
      alert(`Error setting cover: ${err.message}`);
    }
  };

  const handleMoveMedia = async (item, targetAlbumId) => {
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from('media')
        .update({ album_id: targetAlbumId })
        .eq('id', item.id);

      if (error) throw error;

      // Remove from current grid
      setMedia(prev => prev.filter(m => m.id !== item.id));
    } catch (err) {
      console.error('Error moving media:', err);
    }
  };

  return (
    <div className="asset-manager-container">
      {/* Sidebar Folders */}
      <div className="folders-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3>Folders</h3>
          <button onClick={() => setShowAddAlbum(!showAddAlbum)} className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem' }} title="New Album">
            {showAddAlbum ? 'Cancel' : '+ New'}
          </button>
        </div>

        {showAddAlbum && (
          <form onSubmit={handleCreateAlbum} style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <div className="form-group" style={{ marginBottom: '0.8rem' }}>
              <input
                type="text"
                placeholder="Album Name"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
                style={{ padding: '0.5rem' }}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '0.8rem' }}>
              <textarea
                placeholder="Description (optional)"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                style={{ padding: '0.5rem', minHeight: '60px' }}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block" style={{ padding: '0.4rem' }}>
              Create Folder
            </button>
          </form>
        )}

        {loadingAlbums ? (
          <div className="spinner"></div>
        ) : albums.length === 0 ? (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-dark)' }}>No folders yet. Create one above.</p>
        ) : (
          <div className="folders-list">
            {albums.map(album => (
              <div
                key={album.id}
                className={`folder-item ${activeAlbum && activeAlbum.id === album.id ? 'active' : ''}`}
                onClick={() => setActiveAlbum(album)}
              >
                <div className="folder-item-info">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M20 5.41L15.59 1H4c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7.41c0-.55-.22-1.07-.62-1.47zM15 3.5L19.5 8H15V3.5zM4 21V3h9v6h6v12H4z"></path>
                  </svg>
                  <span>{album.title}</span>
                </div>
                <button
                  onClick={(e) => handleDeleteAlbum(album.id, e)}
                  className="folder-delete-btn"
                  title="Delete Folder"
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload & Grid section */}
      <div className="folder-contents">
        {activeAlbum ? (
          <>
            <div style={{ marginBottom: '1.5rem' }}>
              <h2>Folder: {activeAlbum.title}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>{activeAlbum.description || 'No description added yet.'}</p>
              
              {/* Album Cover Section */}
              <div style={{ 
                marginBottom: '1.5rem', 
                padding: '1rem', 
                border: '1px solid var(--border-color)', 
                borderRadius: 'var(--radius-md)' 
              }}>
                <h4 style={{ marginBottom: '0.8rem' }}>Album Cover</h4>
                
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAlbumCoverUpload}
                  style={{ display: 'none' }}
                />
                
                {activeAlbum.cover_url ? (
                  <div style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', display: 'inline-block' }}>
                    <img
                      src={activeAlbum.cover_url}
                      alt="Album Cover"
                      style={{ width: '300px', height: '200px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
                    />
                    <button
                      type="button"
                      onClick={() => coverInputRef.current && coverInputRef.current.click()}
                      className="btn btn-secondary"
                      style={{ position: 'absolute', bottom: '0.5rem', left: '0.5rem', padding: '0.3rem 0.6rem', fontSize: '0.8rem' }}
                    >
                      Change Cover
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => coverInputRef.current && coverInputRef.current.click()}
                    className="btn btn-secondary"
                    style={{ padding: '0.5rem 1rem' }}
                  >
                    Upload Cover Image
                  </button>
                )}
              </div>
            </div>

            {/* Uploader Dropzone */}
            <div
              className={`uploader-dropzone ${dragActive ? 'drag-active' : ''}`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={triggerFileInput}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileInputChange}
                style={{ display: 'none' }}
              />
              <div className="uploader-icon">
                <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
              </div>
              <h4>Drag and Drop Photos or Videos here</h4>
              <p>Or click to browse files from your device. Supported: JPG, PNG, GIF, MP4, WEBM</p>
            </div>

            {/* Upload progress list */}
            {uploads.length > 0 && (
              <div className="upload-progress-list">
                {uploads.map((upload, idx) => (
                  <div key={idx} className="upload-progress-item">
                    <div className="upload-progress-header">
                      <span>{upload.name}</span>
                      <span>{upload.status === 'error' ? 'Failed' : `${upload.progress}%`}</span>
                    </div>
                    <div className="upload-progress-bar">
                      <div
                        className="upload-progress-fill"
                        style={{
                          width: `${upload.progress}%`,
                          backgroundColor: upload.status === 'error' ? 'var(--danger)' : 'var(--primary)'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Gallery Grid */}
            {loadingMedia ? (
              <div className="empty-placeholder">
                <span className="spinner"></span> Loading assets...
              </div>
            ) : media.length === 0 ? (
              <div className="empty-placeholder">
                <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <p>This folder is currently empty. Upload files above to see them in this grid.</p>
              </div>
            ) : (
              <div className="assets-grid">
                {media.map(item => (
                  <div key={item.id} className="asset-item">
                    {item.type === 'video' ? (
                      <video src={item.url} preload="metadata" muted />
                    ) : (
                      <img src={item.url} alt={item.name} loading="lazy" />
                    )}
                    
                    <div className="asset-badge-type">
                      {item.type === 'video' ? (
                        <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor">
                          <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <rect x="3" y="3" width="18" height="18" rx="2"></rect>
                          <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        </svg>
                      )}
                    </div>

                    <div className="asset-item-overlay">
                      <div className="asset-actions">
                        {item.type === 'image' && (
                          <button
                            onClick={() => handleSetCover(item)}
                            className="asset-action-btn"
                            title="Set as Album Cover"
                            style={{
                              backgroundColor: activeAlbum.cover_url === item.url ? 'var(--accent)' : ''
                            }}
                          >
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                            </svg>
                          </button>
                        )}
                        
                        {/* Move folder select */}
                        {albums.length > 1 && (
                          <div className="asset-action-btn" title="Move Folder" style={{ position: 'relative' }}>
                            <select
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleMoveMedia(item, e.target.value);
                                }
                              }}
                              value=""
                              style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                opacity: 0,
                                cursor: 'pointer'
                              }}
                            >
                              <option value="">Move to...</option>
                              {albums
                                .filter(a => a.id !== activeAlbum.id)
                                .map(a => (
                                  <option key={a.id} value={a.id}>{a.title}</option>
                                ))}
                            </select>
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                          </div>
                        )}

                        <button
                          onClick={() => handleDeleteMedia(item)}
                          className="asset-action-btn btn-delete"
                          title="Delete File"
                        >
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>

                      <div className="asset-meta" title={item.name}>
                        {item.name}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="empty-placeholder">
            <h3>No folder selected</h3>
            <p>Please select or create a folder in the sidebar to manage assets.</p>
          </div>
        )}
      </div>
    </div>
  );
}
