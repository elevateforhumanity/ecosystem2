import React, { useState, useRef, useCallback } from 'react';
import { api } from '../lib/api';

export function FileUpload({
  onUpload,
  onError,
  accept = '*/*',
  maxSize = 10 * 1024 * 1024, // 10MB
  multiple = false,
  disabled = false,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files);
      handleFiles(files);
    },
    [disabled]
  );

  const handleFileSelect = useCallback(
    (e) => {
      const files = Array.from(e.target.files);
      handleFiles(files);
    },
    []
  );

  const handleFiles = async (files) => {
    if (files.length === 0) return;

    const filesToUpload = multiple ? files : [files[0]];

    for (const file of filesToUpload) {
      if (file.size > maxSize) {
        onError?.({
          file: file.name,
          error: `File size exceeds ${(maxSize / 1024 / 1024).toFixed(0)}MB limit`,
        });
        continue;
      }

      await uploadFile(file);
    }
  };

  const uploadFile = async (file) => {
    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setProgress(percentComplete);
        }
      });

      const response = await new Promise((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        };

        xhr.onerror = () => reject(new Error('Upload failed'));

        xhr.open('POST', '/api/upload');
        const token = localStorage.getItem('token');
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }
        xhr.send(formData);
      });

      onUpload?.({ file: file.name, url: response.url, ...response });
    } catch (error) {
      console.error('Upload error:', error);
      onError?.({ file: file.name, error: error.message });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div>
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${isDragging ? 'var(--color-primary)' : 'var(--color-border)'}`,
          borderRadius: 8,
          padding: 40,
          textAlign: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          backgroundColor: isDragging
            ? 'var(--color-bg-tertiary)'
            : 'var(--color-bg-secondary)',
          transition: 'all 0.2s',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          disabled={disabled}
          style={{ display: 'none' }}
        />

        {uploading ? (
          <div>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
            <div style={{ fontSize: 16, marginBottom: 12, color: 'var(--color-text-primary)' }}>
              Uploading... {progress.toFixed(0)}%
            </div>
            <div
              style={{
                width: '100%',
                maxWidth: 300,
                height: 8,
                backgroundColor: 'var(--color-bg-tertiary)',
                borderRadius: 4,
                margin: '0 auto',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: '100%',
                  backgroundColor: 'var(--color-primary)',
                  transition: 'width 0.3s',
                }}
              />
            </div>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📁</div>
            <div style={{ fontSize: 16, marginBottom: 8, color: 'var(--color-text-primary)' }}>
              {isDragging ? 'Drop files here' : 'Drag & drop files here'}
            </div>
            <div style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
              or click to browse
            </div>
            <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
              Max file size: {(maxSize / 1024 / 1024).toFixed(0)}MB
              {accept !== '*/*' && ` • Accepted: ${accept}`}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function FileList({ files, onRemove, onDownload }) {
  if (!files || files.length === 0) return null;

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    const icons = {
      pdf: '📄',
      doc: '📝',
      docx: '📝',
      xls: '📊',
      xlsx: '📊',
      ppt: '📊',
      pptx: '📊',
      jpg: '🖼️',
      jpeg: '🖼️',
      png: '🖼️',
      gif: '🖼️',
      mp4: '🎥',
      mp3: '🎵',
      zip: '📦',
      rar: '📦',
    };
    return icons[ext] || '📎';
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {files.map((file, index) => (
        <div
          key={index}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: 12,
            backgroundColor: 'var(--color-card-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: 8,
          }}
        >
          <div style={{ fontSize: 24 }}>{getFileIcon(file.name)}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)' }}>
              {file.name}
            </div>
            {file.size && (
              <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
                {formatFileSize(file.size)}
              </div>
            )}
          </div>
          {onDownload && (
            <button
              onClick={() => onDownload(file)}
              style={{
                padding: '6px 12px',
                fontSize: 13,
                border: '1px solid var(--color-border)',
                borderRadius: 6,
                backgroundColor: 'var(--color-bg-secondary)',
                color: 'var(--color-text-primary)',
                cursor: 'pointer',
              }}
            >
              Download
            </button>
          )}
          {onRemove && (
            <button
              onClick={() => onRemove(file, index)}
              style={{
                padding: '6px 12px',
                fontSize: 13,
                border: '1px solid var(--color-danger)',
                borderRadius: 6,
                backgroundColor: 'transparent',
                color: 'var(--color-danger)',
                cursor: 'pointer',
              }}
            >
              Remove
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export function ImageUpload({ onUpload, onError, maxSize = 5 * 1024 * 1024 }) {
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (result) => {
    setPreview(result.url);
    onUpload?.(result);
  };

  const handleError = (error) => {
    setPreview(null);
    onError?.(error);
  };

  return (
    <div>
      {preview ? (
        <div style={{ position: 'relative', maxWidth: 400 }}>
          <img
            src={preview}
            alt="Preview"
            style={{
              width: '100%',
              height: 'auto',
              borderRadius: 8,
              border: '1px solid var(--color-border)',
            }}
          />
          <button
            onClick={() => setPreview(null)}
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              padding: '6px 12px',
              fontSize: 13,
              border: 'none',
              borderRadius: 6,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            Remove
          </button>
        </div>
      ) : (
        <FileUpload
          accept="image/*"
          maxSize={maxSize}
          onUpload={handleUpload}
          onError={handleError}
          disabled={uploading}
        />
      )}
    </div>
  );
}
