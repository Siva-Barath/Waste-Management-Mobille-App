import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const AppContext = createContext(null);

/**
 * AppProvider - App-level state management
 * 
 * Manages app-wide state:
 * - Notifications and notification count
 * - General app alerts/toasts
 * - App-level loading states
 * 
 * Equivalent to app-level Redux store in web version
 */

export function AppProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch notifications from API
   * Polls every 30 seconds when user is authenticated
   */
  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    try {
      const res = await api.get('/notifications');
      const notifs = res.data.notifications || [];
      setNotifications(notifs);

      // Count unread notifications
      const unreadCount = notifs.filter(n => !n.read).length;
      setNotificationCount(unreadCount);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  }, [user]);

  /**
   * Start polling notifications on mount/when user changes
   */
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setNotificationCount(0);
      return;
    }

    // Fetch immediately
    fetchNotifications();

    // Then poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user, fetchNotifications]);

  /**
   * Mark notification as read
   */
  const markAsRead = async (notificationId) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setNotificationCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  /**
   * Clear all notifications
   */
  const clearNotifications = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications([]);
      setNotificationCount(0);
    } catch (err) {
      console.error('Error clearing notifications:', err);
    }
  };

  /**
   * Show error toast/alert
   */
  const showError = (message) => {
    setError(message);
    // Auto-clear after 5 seconds
    setTimeout(() => setError(null), 5000);
  };

  /**
   * Clear error
   */
  const clearError = () => {
    setError(null);
  };

  const value = {
    notifications,
    notificationCount,
    loading,
    error,
    setLoading,
    showError,
    clearError,
    fetchNotifications,
    markAsRead,
    clearNotifications,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

/**
 * useApp Hook - Access app context
 */
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
