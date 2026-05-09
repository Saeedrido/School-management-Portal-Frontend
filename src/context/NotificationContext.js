import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { informationAPI } from '../services/api';
import { startConnection, stopConnection, onReceiveNotification, getConnectionState } from '../services/notificationService';

const POLL_INTERVAL = 5000;

const NotificationContext = createContext(null);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const lastUserIdRef = useRef(null);
  const signalrStartedRef = useRef(false);

  const fetchHistory = useCallback(async (isRead) => {
    setLoadingHistory(true);
    try {
      const response = await informationAPI.getHistory(isRead);
      if (response.data?.success) {
        return response.data.data || [];
      }
    } catch (err) {
      console.error('Failed to fetch notification history:', err);
    } finally {
      setLoadingHistory(false);
    }
    return [];
  }, []);

  const loadAllNotifications = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    const [unreadNotifications, allNotifications] = await Promise.all([
      fetchHistory(false),
      fetchHistory(null),
    ]);

    setNotifications(allNotifications || []);
    setUnreadCount(unreadNotifications?.length || 0);
  }, [isAuthenticated, user, fetchHistory]);

  const markAsRead = useCallback(async (userNotificationId) => {
    try {
      const response = await informationAPI.markAsRead(userNotificationId);
      if (response.data?.success) {
        setNotifications(prev =>
          prev.map(n =>
            n.userNotificationId === userNotificationId
              ? { ...n, isRead: true, readAt: new Date().toISOString() }
              : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await informationAPI.markAllAsRead();
      if (response.data?.success) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
        );
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  }, []);

  const deleteNotification = useCallback(async (userNotificationId) => {
    try {
      const response = await informationAPI.deleteNotification(userNotificationId);
      if (response.data?.success) {
        setNotifications(prev => {
          const removed = prev.find(n => n.userNotificationId === userNotificationId);
          const filtered = prev.filter(n => n.userNotificationId !== userNotificationId);
          if (removed && !removed.isRead) {
            setUnreadCount(c => Math.max(0, c - 1));
          }
          return filtered;
        });
      }
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Poll for unread count as fallback when SignalR isn't available
  useEffect(() => {
    if (!isAuthenticated || !user?.id || loading) return;

    const interval = setInterval(async () => {
      try {
        const response = await informationAPI.getHistory(false);
        if (response.data?.success) {
          const unread = response.data.data || [];
          setUnreadCount(unread.length);
        }
      } catch (_) {}
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [isAuthenticated, user?.id, loading]);

  // Connect SignalR when user logs in, disconnect when logged out
  useEffect(() => {
    if (loading) return;

    if (isAuthenticated && user?.id) {
      const userId = user.id;

      // Only load + connect once per user session
      if (lastUserIdRef.current !== userId) {
        lastUserIdRef.current = userId;
        signalrStartedRef.current = false;

        loadAllNotifications();
      }

      if (!signalrStartedRef.current) {
        signalrStartedRef.current = true;

        startConnection().then(conn => {
          if (conn) {
            onReceiveNotification((title, message, messageType, amount, date) => {
              const newNotification = {
                id: crypto.randomUUID?.() || Date.now().toString(),
                userNotificationId: crypto.randomUUID?.() || Date.now().toString(),
                title,
                message,
                messageType: messageType || 'General',
                amount: amount || null,
                date: date || null,
                isRead: false,
                createdAt: new Date().toISOString(),
              };
              setNotifications(prev => [newNotification, ...prev]);
              setUnreadCount(prev => prev + 1);
            });
          } else {
            console.warn('SignalR connection failed - will use polling fallback');
          }
        });
      }
    } else if (!isAuthenticated) {
      clearAll();
      stopConnection();
      lastUserIdRef.current = null;
      signalrStartedRef.current = false;
    }
  }, [isAuthenticated, user?.id, loading]);

  const value = {
    notifications,
    unreadCount,
    loading: loadingHistory,
    fetchHistory: loadAllNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    connectionState: getConnectionState(),
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
