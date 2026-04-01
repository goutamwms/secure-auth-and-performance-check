import { useState, useEffect } from 'react';
import type { TicketFile } from '../types/Ticket';

interface TicketFilesProps {
  ticketId: number;
  onFilesUploaded: () => void;
}

const ALLOWED_FORMATS = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function TicketFiles({ ticketId, onFilesUploaded }: TicketFilesProps) {
  const [files, setFiles] = useState<TicketFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, [ticketId]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tickets/${ticketId}/files`);
      if (response.ok) {
        const data = await response.json();
        setFiles(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList) {
      await uploadFiles(Array.from(fileList));
    }
  };

  const uploadFiles = async (filesToUpload: File[]) => {
    if (files.length >= 5) {
      setError('Maximum 5 images per ticket are allowed');
      return;
    }

    const allowedCount = Math.max(0, 5 - files.length);
    if (filesToUpload.length > allowedCount) {
      setError(`Cannot upload more than ${allowedCount} additional image(s)`);
      filesToUpload = filesToUpload.slice(0, allowedCount);
    }

    // Validate files
    const validFiles = filesToUpload.filter((file) => {
      if (!ALLOWED_FORMATS.includes(file.type)) {
        setError(`${file.name} is not a valid image format`);
        return false;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      validFiles.forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch(`/api/tickets/${ticketId}/files`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload files');
      }

      await fetchFiles();
      onFilesUploaded();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileId: number) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const response = await fetch(`/api/tickets/${ticketId}/files/${fileId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete file');
      }

      setFiles(files.filter((f) => f.id !== fileId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete file');
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles) {
      uploadFiles(Array.from(droppedFiles));
    }
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <h3>Attachments</h3>

      {error && (
        <div
          style={{
            padding: '0.75rem',
            marginBottom: '1rem',
            backgroundColor: '#fff3cd',
            color: '#856404',
            borderRadius: '4px',
            border: '1px solid #ffc107',
          }}
        >
          {error}
        </div>
      )}

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        style={{
          border: '2px dashed ' + (dragActive ? '#646cff' : '#ddd'),
          borderRadius: '8px',
          padding: '2rem',
          textAlign: 'center',
          backgroundColor: dragActive ? '#f0f0ff' : '#fafafa',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          marginBottom: '1.5rem',
        }}
      >
        <label
          style={{
            display: 'block',
            cursor: 'pointer',
          }}
        >
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            style={{ display: 'none' }}
          />
          <div style={{ color: '#666' }}>
            <p style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', fontWeight: 'bold' }}>
              Drag and drop images here or click to browse
            </p>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
              Supported formats: JPEG, PNG, GIF, WebP, BMP (Max 5MB each)
            </p>
          </div>
        </label>
      </div>

      {loading ? (
        <p style={{ color: '#666' }}>Loading files...</p>
      ) : files.length === 0 ? (
        <p style={{ color: '#999', fontStyle: 'italic' }}>No attachments yet</p>
      ) : (
        <div className="ticket-file-grid">
          {files.map((file) => (
            <div key={file.id} className="ticket-file-card">
              <div className="ticket-file-image-wrapper">
                <img
                  src={`/api/tickets/${ticketId}/files/${file.id}/download`}
                  alt={file.fileName}
                  className="ticket-file-image"
                />
                <div className="ticket-file-overlay">
                  <a
                    href={`/api/tickets/${ticketId}/files/${file.id}/download`}
                    download={file.fileName}
                    className="ticket-file-action ticket-file-download"
                    title="Download"
                    aria-label="Download file"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 3V15M12 15L8 11M12 15L16 11M4 21H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </a>
                  <button
                    onClick={() => handleDelete(file.id)}
                    className="ticket-file-action ticket-file-delete"
                    title="Delete"
                    aria-label="Delete file"
                    type="button"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6M19 6V20C19 20.5523 18.5523 21 18 21H6C5.44772 21 5 20.5523 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M10 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M14 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="ticket-file-meta">
                <p className="ticket-file-name" title={file.fileName}>
                  {file.fileName}
                </p>
                <p className="ticket-file-detail">{(file.fileSize / 1024).toFixed(2)} KB</p>
                <p className="ticket-file-detail">{new Date(file.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {uploading && (
        <p style={{ color: '#646cff', fontWeight: 'bold', marginTop: '1rem' }}>
          Uploading files...
        </p>
      )}
    </div>
  );
}
