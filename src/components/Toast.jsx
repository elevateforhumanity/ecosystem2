import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((message, duration) => addToast(message, 'success', duration), [addToast]);
  const error = useCallback((message, duration) => addToast(message, 'error', duration), [addToast]);
  const warning = useCallback((message, duration) => addToast(message, 'warning', duration), [addToast]);
  const info = useCallback((message, duration) => addToast(message, 'info', duration), [addToast]);

  return (
    <ToastContext.Provider value={{ success, error, warning, info, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onRemove }) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 20,
        right: 20,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        maxWidth: 400,
      }}
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={() => onRemove(toast.id)} />
      ))}
    </div>
  );
}

function Toast({ message, type, onClose }) {
  const colors = {
    success: { bg: '#d4edda', border: '#c3e6cb', text: '#155724', icon: '✓' },
    error: { bg: '#f8d7da', border: '#f5c6cb', text: '#721c24', icon: '✕' },
    warning: { bg: '#fff3cd', border: '#ffeaa7', text: '#856404', icon: '⚠' },
    info: { bg: '#d1ecf1', border: '#bee5eb', text: '#0c5460', icon: 'ℹ' },
  };

  const style = colors[type] || colors.info;

  return (
    <div
      style={{
        backgroundColor: style.bg,
        border: `1px solid ${style.border}`,
        color: style.text,
        padding: '12px 16px',
        borderRadius: 8,
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        animation: 'slideDown 0.3s ease-out',
      }}
    >
      <div style={{ fontSize: 18, fontWeight: 'bold' }}>{style.icon}</div>
      <div style={{ flex: 1, fontSize: 14 }}>{message}</div>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: style.text,
          cursor: 'pointer',
          fontSize: 18,
          padding: 0,
          width: 20,
          height: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        ×
      </button>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
