import { useEffect, useState, useCallback } from 'react';
import { wsClient } from '../lib/websocket';

export function useRealtime(events = []) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);

  useEffect(() => {
    wsClient.connect();

    const unsubscribeConnected = wsClient.on('connected', () => {
      setIsConnected(true);
    });

    const unsubscribeDisconnected = wsClient.on('disconnected', () => {
      setIsConnected(false);
    });

    const unsubscribeMessage = wsClient.on('message', (data) => {
      setLastMessage(data);
    });

    return () => {
      unsubscribeConnected();
      unsubscribeDisconnected();
      unsubscribeMessage();
    };
  }, []);

  const send = useCallback((type, payload) => {
    return wsClient.send(type, payload);
  }, []);

  const subscribe = useCallback((event, callback) => {
    return wsClient.on(event, callback);
  }, []);

  return {
    isConnected,
    lastMessage,
    send,
    subscribe,
  };
}

export function useRealtimeEvent(eventType, callback) {
  useEffect(() => {
    wsClient.connect();
    const unsubscribe = wsClient.on(eventType, callback);
    return unsubscribe;
  }, [eventType, callback]);
}

export function usePresence(roomId) {
  const [users, setUsers] = useState([]);
  const { isConnected, send, subscribe } = useRealtime();

  useEffect(() => {
    if (!isConnected || !roomId) return;

    send('join-room', { roomId });

    const unsubscribeUserJoined = subscribe('user-joined', (data) => {
      if (data.roomId === roomId) {
        setUsers((prev) => {
          if (prev.find((u) => u.id === data.user.id)) return prev;
          return [...prev, data.user];
        });
      }
    });

    const unsubscribeUserLeft = subscribe('user-left', (data) => {
      if (data.roomId === roomId) {
        setUsers((prev) => prev.filter((u) => u.id !== data.userId));
      }
    });

    const unsubscribePresenceUpdate = subscribe('presence-update', (data) => {
      if (data.roomId === roomId) {
        setUsers(data.users || []);
      }
    });

    return () => {
      send('leave-room', { roomId });
      unsubscribeUserJoined();
      unsubscribeUserLeft();
      unsubscribePresenceUpdate();
    };
  }, [isConnected, roomId, send, subscribe]);

  return { users, isConnected };
}

export function useTypingIndicator(roomId) {
  const [typingUsers, setTypingUsers] = useState([]);
  const { isConnected, send, subscribe } = useRealtime();

  useEffect(() => {
    if (!isConnected || !roomId) return;

    const unsubscribeTypingStart = subscribe('typing-start', (data) => {
      if (data.roomId === roomId) {
        setTypingUsers((prev) => {
          if (prev.find((u) => u.id === data.user.id)) return prev;
          return [...prev, data.user];
        });
      }
    });

    const unsubscribeTypingStop = subscribe('typing-stop', (data) => {
      if (data.roomId === roomId) {
        setTypingUsers((prev) => prev.filter((u) => u.id !== data.userId));
      }
    });

    return () => {
      unsubscribeTypingStart();
      unsubscribeTypingStop();
    };
  }, [isConnected, roomId, subscribe]);

  const startTyping = useCallback(() => {
    if (isConnected && roomId) {
      send('typing-start', { roomId });
    }
  }, [isConnected, roomId, send]);

  const stopTyping = useCallback(() => {
    if (isConnected && roomId) {
      send('typing-stop', { roomId });
    }
  }, [isConnected, roomId, send]);

  return { typingUsers, startTyping, stopTyping };
}

export function useLiveUpdates(resourceType, resourceId) {
  const [data, setData] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const { subscribe } = useRealtime();

  useEffect(() => {
    const eventType = `${resourceType}-updated`;
    
    const unsubscribe = subscribe(eventType, (update) => {
      if (update.id === resourceId) {
        setData(update.data);
        setLastUpdate(new Date());
      }
    });

    return unsubscribe;
  }, [resourceType, resourceId, subscribe]);

  return { data, lastUpdate };
}
