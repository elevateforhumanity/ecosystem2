import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export function ThemeToggle({ showLabel = false, variant = 'icon' }) {
  const { theme, toggleTheme, setLightTheme, setDarkTheme, setSystemTheme } = useTheme();
  const [showMenu, setShowMenu] = useState(false);

  if (variant === 'icon') {
    return (
      <button
        onClick={toggleTheme}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: 24,
          padding: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? '🌙' : '☀️'}
        {showLabel && (
          <span style={{ fontSize: 14 }}>
            {theme === 'light' ? 'Dark' : 'Light'}
          </span>
        )}
      </button>
    );
  }

  if (variant === 'dropdown') {
    return (
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          style={{
            background: 'none',
            border: '1px solid var(--color-border)',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 14,
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: 'var(--color-bg-secondary)',
            color: 'var(--color-text-primary)',
          }}
        >
          {theme === 'light' ? '☀️' : '🌙'} Theme
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
                backgroundColor: 'var(--color-card-bg)',
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                boxShadow: '0 4px 12px var(--color-shadow)',
                zIndex: 999,
                minWidth: 150,
                overflow: 'hidden',
              }}
            >
              <button
                onClick={() => {
                  setLightTheme();
                  setShowMenu(false);
                }}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  border: 'none',
                  background: theme === 'light' ? 'var(--color-bg-tertiary)' : 'transparent',
                  color: 'var(--color-text-primary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: 14,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    theme === 'light' ? 'var(--color-bg-tertiary)' : 'transparent';
                }}
              >
                ☀️ Light
                {theme === 'light' && <span style={{ marginLeft: 'auto' }}>✓</span>}
              </button>

              <button
                onClick={() => {
                  setDarkTheme();
                  setShowMenu(false);
                }}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  border: 'none',
                  background: theme === 'dark' ? 'var(--color-bg-tertiary)' : 'transparent',
                  color: 'var(--color-text-primary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: 14,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor =
                    theme === 'dark' ? 'var(--color-bg-tertiary)' : 'transparent';
                }}
              >
                🌙 Dark
                {theme === 'dark' && <span style={{ marginLeft: 'auto' }}>✓</span>}
              </button>

              <button
                onClick={() => {
                  setSystemTheme();
                  setShowMenu(false);
                }}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--color-text-primary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: 14,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-bg-tertiary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                💻 System
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  // Switch variant
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      {showLabel && (
        <span style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>
          Dark Mode
        </span>
      )}
      <div
        style={{
          position: 'relative',
          width: 48,
          height: 24,
          backgroundColor: theme === 'dark' ? 'var(--color-primary)' : 'var(--color-border)',
          borderRadius: 12,
          transition: 'background-color 0.3s',
        }}
      >
        <input
          type="checkbox"
          checked={theme === 'dark'}
          onChange={toggleTheme}
          style={{
            position: 'absolute',
            opacity: 0,
            width: 0,
            height: 0,
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 2,
            left: theme === 'dark' ? 26 : 2,
            width: 20,
            height: 20,
            backgroundColor: 'white',
            borderRadius: '50%',
            transition: 'left 0.3s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
          }}
        >
          {theme === 'dark' ? '🌙' : '☀️'}
        </div>
      </div>
    </label>
  );
}
