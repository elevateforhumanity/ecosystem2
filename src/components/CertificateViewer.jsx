import React, { useState, useEffect } from 'react';
import {
  generateCertificate,
  downloadCertificate,
  shareCertificate,
  verifyCertificate,
} from '../lib/certificateGenerator';

export function CertificateViewer({ certificateData }) {
  const [certificateImage, setCertificateImage] = useState(null);
  const [showShareMenu, setShowShareMenu] = useState(false);

  useEffect(() => {
    if (certificateData) {
      const image = generateCertificate(certificateData);
      setCertificateImage(image);
    }
  }, [certificateData]);

  const handleDownload = () => {
    if (certificateImage) {
      downloadCertificate(
        certificateImage,
        `certificate-${certificateData.certificateId}.png`
      );
    }
  };

  const handleShare = async () => {
    const shareUrls = shareCertificate({
      studentName: certificateData.studentName,
      courseName: certificateData.courseName,
      certificateUrl: window.location.href,
    });

    if (shareUrls.linkedin) {
      setShowShareMenu(true);
    } else {
      try {
        await navigator.share({
          title: `${certificateData.studentName} - ${certificateData.courseName} Certificate`,
          text: `I've completed ${certificateData.courseName} and earned my certificate!`,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    }
  };

  if (!certificateImage) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 16 }}>⏳</div>
        <div>Generating certificate...</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 20 }}>
      <div
        style={{
          backgroundColor: 'var(--color-card-bg)',
          border: '1px solid var(--color-border)',
          borderRadius: 8,
          padding: 20,
        }}
      >
        <img
          src={certificateImage}
          alt="Certificate"
          style={{
            width: '100%',
            height: 'auto',
            borderRadius: 8,
            boxShadow: '0 4px 12px var(--color-shadow)',
          }}
        />

        <div
          style={{
            display: 'flex',
            gap: 12,
            marginTop: 20,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={handleDownload}
            style={{
              padding: '12px 24px',
              fontSize: 16,
              fontWeight: 600,
              border: 'none',
              borderRadius: 6,
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            📥 Download
          </button>

          <button
            onClick={handleShare}
            style={{
              padding: '12px 24px',
              fontSize: 16,
              fontWeight: 600,
              border: '1px solid var(--color-border)',
              borderRadius: 6,
              backgroundColor: 'var(--color-bg-secondary)',
              color: 'var(--color-text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            🔗 Share
          </button>

          <button
            onClick={() => window.print()}
            style={{
              padding: '12px 24px',
              fontSize: 16,
              fontWeight: 600,
              border: '1px solid var(--color-border)',
              borderRadius: 6,
              backgroundColor: 'var(--color-bg-secondary)',
              color: 'var(--color-text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            🖨️ Print
          </button>
        </div>

        {showShareMenu && (
          <div
            style={{
              marginTop: 20,
              padding: 16,
              backgroundColor: 'var(--color-bg-secondary)',
              borderRadius: 8,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
              Share on social media:
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a
                href={shareCertificate(certificateData).linkedin}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '8px 16px',
                  fontSize: 14,
                  border: 'none',
                  borderRadius: 6,
                  backgroundColor: '#0077b5',
                  color: 'white',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                LinkedIn
              </a>
              <a
                href={shareCertificate(certificateData).twitter}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '8px 16px',
                  fontSize: 14,
                  border: 'none',
                  borderRadius: 6,
                  backgroundColor: '#1da1f2',
                  color: 'white',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                Twitter
              </a>
              <a
                href={shareCertificate(certificateData).facebook}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '8px 16px',
                  fontSize: 14,
                  border: 'none',
                  borderRadius: 6,
                  backgroundColor: '#1877f2',
                  color: 'white',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                Facebook
              </a>
            </div>
          </div>
        )}

        <div
          style={{
            marginTop: 20,
            padding: 16,
            backgroundColor: 'var(--color-bg-secondary)',
            borderRadius: 8,
            fontSize: 14,
            color: 'var(--color-text-secondary)',
          }}
        >
          <div style={{ marginBottom: 8 }}>
            <strong>Certificate ID:</strong> {certificateData.certificateId}
          </div>
          <div>
            <strong>Issued:</strong>{' '}
            {new Date(certificateData.completionDate).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CertificateVerification() {
  const [certificateId, setCertificateId] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);

  const handleVerify = async (e) => {
    e.preventDefault();
    
    if (!certificateId.trim()) return;

    setVerifying(true);
    setResult(null);

    try {
      const data = await verifyCertificate(certificateId);
      setResult(data);
    } catch (error) {
      setResult({ valid: false, error: error.message });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 20 }}>
      <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 20 }}>
        Verify Certificate
      </h2>

      <form onSubmit={handleVerify}>
        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              display: 'block',
              fontSize: 14,
              fontWeight: 600,
              marginBottom: 8,
            }}
          >
            Certificate ID
          </label>
          <input
            type="text"
            value={certificateId}
            onChange={(e) => setCertificateId(e.target.value)}
            placeholder="CERT-XXXXXXXXXX"
            style={{
              width: '100%',
              padding: '10px 12px',
              fontSize: 14,
              border: '1px solid var(--color-border)',
              borderRadius: 6,
              backgroundColor: 'var(--color-input-bg)',
              color: 'var(--color-text-primary)',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={verifying || !certificateId.trim()}
          style={{
            width: '100%',
            padding: '12px 24px',
            fontSize: 16,
            fontWeight: 600,
            border: 'none',
            borderRadius: 6,
            backgroundColor: verifying ? 'var(--color-border)' : 'var(--color-primary)',
            color: 'white',
            cursor: verifying || !certificateId.trim() ? 'not-allowed' : 'pointer',
          }}
        >
          {verifying ? 'Verifying...' : 'Verify Certificate'}
        </button>
      </form>

      {result && (
        <div
          style={{
            marginTop: 24,
            padding: 20,
            backgroundColor: result.valid ? '#d4edda' : '#f8d7da',
            border: `1px solid ${result.valid ? '#c3e6cb' : '#f5c6cb'}`,
            borderRadius: 8,
          }}
        >
          <div
            style={{
              fontSize: 18,
              fontWeight: 600,
              marginBottom: 12,
              color: result.valid ? '#155724' : '#721c24',
            }}
          >
            {result.valid ? '✓ Valid Certificate' : '✕ Invalid Certificate'}
          </div>

          {result.valid ? (
            <div style={{ fontSize: 14, color: '#155724' }}>
              <div style={{ marginBottom: 8 }}>
                <strong>Student:</strong> {result.studentName}
              </div>
              <div style={{ marginBottom: 8 }}>
                <strong>Course:</strong> {result.courseName}
              </div>
              <div>
                <strong>Issued:</strong>{' '}
                {new Date(result.completionDate).toLocaleDateString()}
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 14, color: '#721c24' }}>
              {result.error || 'This certificate could not be verified.'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
