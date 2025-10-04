import React, { useEffect, useState } from 'react';
import { useRealtime } from '../hooks/useRealtime';

export function RealtimeIndicator({ position = 'bottom-right' }) {
  const { isConnected } = useRealtime();
  const [showTooltip, setShowTooltip] = useState(false);

  const positions = {
    'top-left': { top: 20, left: 20 },
    'top-right': { top: 20, right: 20 },
    'bottom-left': { bottom: 20, left: 20 },
    'bottom-right': { bottom: 20, right: 20 },
  };

  return (
    <div
      style={{
        position: 'fixed',
        ...positions[position],
        zIndex: 9998,
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div
        style={{
          width: 12,
          height: 12,
          borderRadius: '50%',
          backgroundColor: isConnected ? '#28a745' : '#dc3545',
          boxShadow: `0 0 0 ${isConnected ? '4px rgba(40, 167, 69, 0.3)' : '4px rgba(220, 53, 69, 0.3)'}`,
          animation: isConnected ? 'pulse 2s infinite' : 'none',
        }}
      />
      {showTooltip && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            right: 0,
            marginBottom: 8,
            padding: '6px 12px',
            backgroundColor: 'var(--color-card-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: 6,
            fontSize: 12,
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px var(--color-shadow)',
          }}
        >
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
      )}
      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }
        `}
      </style>
    </div>
  );
}

export function TypingIndicator({ users }) {
  if (!users || users.length === 0) return null;

  const getText = () => {
    if (users.length === 1) {
      return `${users[0].name} is typing...`;
    } else if (users.length === 2) {
      return `${users[0].name} and ${users[1].name} are typing...`;
    } else {
      return `${users[0].name} and ${users.length - 1} others are typing...`;
    }
  };

  return (
    <div
      style={{
        padding: '8px 12px',
        fontSize: 13,
        color: 'var(--color-text-secondary)',
        fontStyle: 'italic',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <div style={{ display: 'flex', gap: 2 }}>
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: 'var(--color-text-tertiary)',
            animation: 'typing-dot 1.4s infinite',
            animationDelay: '0s',
          }}
        />
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: 'var(--color-text-tertiary)',
            animation: 'typing-dot 1.4s infinite',
            animationDelay: '0.2s',
          }}
        />
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: 'var(--color-text-tertiary)',
            animation: 'typing-dot 1.4s infinite',
            animationDelay: '0.4s',
          }}
        />
      </div>
      <span>{getText()}</span>
      <style>
        {`
          @keyframes typing-dot {
            0%, 60%, 100% {
              transform: translateY(0);
            }
            30% {
              transform: translateY(-8px);
            }
          }
        `}
      </style>
    </div>
  );
}

export function PresenceAvatars({ users, max = 5 }) {
  const displayUsers = users.slice(0, max);
  const remainingCount = users.length - max;

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div style={{ display: 'flex', marginRight: remainingCount > 0 ? 8 : 0 }}>
        {displayUsers.map((user, index) => (
          <div
            key={user.id}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: user.color || 'var(--color-primary)',
              border: '2px solid var(--color-card-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              fontWeight: 600,
              color: 'white',
              marginLeft: index > 0 ? -8 : 0,
              position: 'relative',
              zIndex: displayUsers.length - index,
            }}
            title={user.name}
          >
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
          </div>
        ))}
      </div>
      {remainingCount > 0 && (
        <div
          style={{
            fontSize: 13,
            color: 'var(--color-text-secondary)',
            fontWeight: 500,
          }}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}

export function LiveUpdateBadge({ show = true }) {
  if (!show) return null;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        backgroundColor: '#28a745',
        color: 'white',
        borderRadius: 12,
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      <div
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: 'white',
          animation: 'pulse 2s infinite',
        }}
      />
      LIVE
    </div>
  );
}
