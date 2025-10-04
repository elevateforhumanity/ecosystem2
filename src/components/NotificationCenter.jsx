import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    try {
      const data = await api.get('/notifications');
      setNotifications(data.notifications || []);
      setUnreadCount(data.notifications?.filter((n) => !n.read).length || 0);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      const notification = notifications.find((n) => n.id === id);
      if (notification && !notification.read) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'relative',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 8,
          fontSize: 24,
        }}
        aria-label="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: 4,
              right: 4,
              backgroundColor: '#dc3545',
              color: 'white',
              borderRadius: '50%',
              width: 18,
              height: 18,
              fontSize: 11,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
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
            onClick={() => setIsOpen(false)}
          />
          <div
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: 8,
              width: 400,
              maxHeight: 500,
              backgroundColor: 'white',
              border: '1px solid #ddd',
              borderRadius: 8,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              zIndex: 999,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid #ddd',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: '#f8f9fa',
              }}
            >
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
                Notifications
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#007bff',
                    cursor: 'pointer',
                    fontSize: 13,
                    padding: 0,
                  }}
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div style={{ overflowY: 'auto', flex: 1 }}>
              {notifications.length === 0 ? (
                <div
                  style={{
                    padding: 40,
                    textAlign: 'center',
                    color: '#6c757d',
                  }}
                >
                  No notifications
                </div>
              ) : (
                notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onDelete={deleteNotification}
                  />
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function NotificationItem({ notification, onMarkAsRead, onDelete }) {
  const getIcon = (type) => {
    const icons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌',
      message: '💬',
      course: '📚',
      certificate: '🎓',
    };
    return icons[type] || icons.info;
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div
      style={{
        padding: '12px 16px',
        borderBottom: '1px solid #eee',
        backgroundColor: notification.read ? 'white' : '#f0f8ff',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
      }}
      onClick={() => !notification.read && onMarkAsRead(notification.id)}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = notification.read
          ? '#f8f9fa'
          : '#e6f3ff';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = notification.read
          ? 'white'
          : '#f0f8ff';
      }}
    >
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ fontSize: 20 }}>{getIcon(notification.type)}</div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: notification.read ? 'normal' : 'bold',
              marginBottom: 4,
            }}
          >
            {notification.title}
          </div>
          <div style={{ fontSize: 13, color: '#6c757d', marginBottom: 4 }}>
            {notification.message}
          </div>
          <div style={{ fontSize: 12, color: '#999' }}>
            {formatTime(notification.timestamp)}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification.id);
          }}
          style={{
            background: 'none',
            border: 'none',
            color: '#999',
            cursor: 'pointer',
            fontSize: 18,
            padding: 0,
            width: 24,
            height: 24,
          }}
          aria-label="Delete notification"
        >
          ×
        </button>
      </div>
    </div>
  );
}
