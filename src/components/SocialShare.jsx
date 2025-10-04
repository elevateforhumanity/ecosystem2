import React, { useState } from 'react';

export function SocialShare({ url, title, description, hashtags = [] }) {
  const [copied, setCopied] = useState(false);

  const shareUrl = url || window.location.href;
  const shareTitle = title || document.title;
  const shareText = description || '';

  const platforms = {
    facebook: {
      name: 'Facebook',
      icon: '📘',
      color: '#1877f2',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
    twitter: {
      name: 'Twitter',
      icon: '🐦',
      color: '#1da1f2',
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}${hashtags.length > 0 ? `&hashtags=${hashtags.join(',')}` : ''}`,
    },
    linkedin: {
      name: 'LinkedIn',
      icon: '💼',
      color: '#0077b5',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    },
    whatsapp: {
      name: 'WhatsApp',
      icon: '💬',
      color: '#25d366',
      url: `https://wa.me/?text=${encodeURIComponent(`${shareTitle} ${shareUrl}`)}`,
    },
    telegram: {
      name: 'Telegram',
      icon: '✈️',
      color: '#0088cc',
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
    },
    reddit: {
      name: 'Reddit',
      icon: '🤖',
      color: '#ff4500',
      url: `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}`,
    },
    email: {
      name: 'Email',
      icon: '📧',
      color: '#6c757d',
      url: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`,
    },
  };

  const handleShare = async (platform) => {
    if (platform === 'native' && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else if (platforms[platform]) {
      window.open(platforms[platform].url, '_blank', 'width=600,height=400');
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {Object.entries(platforms).map(([key, platform]) => (
          <button
            key={key}
            onClick={() => handleShare(key)}
            style={{
              padding: '10px 16px',
              fontSize: 14,
              fontWeight: 600,
              border: 'none',
              borderRadius: 6,
              backgroundColor: platform.color,
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <span>{platform.icon}</span>
            <span>{platform.name}</span>
          </button>
        ))}
      </div>

      <div style={{ marginTop: 16 }}>
        <button
          onClick={handleCopyLink}
          style={{
            width: '100%',
            padding: '10px 16px',
            fontSize: 14,
            fontWeight: 600,
            border: '1px solid var(--color-border)',
            borderRadius: 6,
            backgroundColor: copied ? 'var(--color-success)' : 'var(--color-bg-secondary)',
            color: copied ? 'white' : 'var(--color-text-primary)',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {copied ? '✓ Link Copied!' : '🔗 Copy Link'}
        </button>
      </div>

      {navigator.share && (
        <div style={{ marginTop: 12 }}>
          <button
            onClick={() => handleShare('native')}
            style={{
              width: '100%',
              padding: '10px 16px',
              fontSize: 14,
              fontWeight: 600,
              border: '1px solid var(--color-border)',
              borderRadius: 6,
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            📤 Share...
          </button>
        </div>
      )}
    </div>
  );
}

export function ShareButton({ url, title, description, variant = 'button' }) {
  const [showMenu, setShowMenu] = useState(false);

  if (variant === 'icon') {
    return (
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          style={{
            padding: 8,
            fontSize: 20,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            color: 'var(--color-text-primary)',
          }}
          aria-label="Share"
        >
          🔗
        </button>

        {showMenu && (
          <>
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 998,
              }}
              onClick={() => setShowMenu(false)}
            />
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: 8,
                padding: 16,
                backgroundColor: 'var(--color-card-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                boxShadow: '0 4px 12px var(--color-shadow)',
                zIndex: 999,
                minWidth: 300,
              }}
            >
              <SocialShare url={url} title={title} description={description} />
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => setShowMenu(!showMenu)}
        style={{
          padding: '10px 20px',
          fontSize: 14,
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

      {showMenu && (
        <div
          style={{
            marginTop: 12,
            padding: 16,
            backgroundColor: 'var(--color-card-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: 8,
          }}
        >
          <SocialShare url={url} title={title} description={description} />
        </div>
      )}
    </div>
  );
}
