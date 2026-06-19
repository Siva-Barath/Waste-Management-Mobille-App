import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import api from './api';

/**
 * notificationService.js - Notification management
 * 
 * Handles:
 * - Local notifications (in-app alerts, toasts)
 * - Push notifications (via Expo)
 * - Notification polling from backend
 */

/**
 * Initialize notifications handler
 * Call once when app starts
 */
export async function initializeNotifications() {
  if (!Device.isDevice) {
    console.log('Notifications not available on simulator/emulator');
    return;
  }

  try {
    // Set notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    // Request permissions
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.log('Notification permissions not granted');
      return;
    }

    console.log('Notifications initialized successfully');
  } catch (error) {
    console.error('Error initializing notifications:', error);
  }
}

/**
 * Show local notification
 * Used for in-app alerts and toasts
 */
export async function showLocalNotification(title, body, data = {}) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default',
      },
      trigger: null, // Show immediately
    });
  } catch (error) {
    console.error('Error showing notification:', error);
  }
}

/**
 * Show notification after delay
 */
export async function scheduleNotification(title, body, delayMs = 5000, data = {}) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default',
      },
      trigger: {
        seconds: delayMs / 1000,
      },
    });
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
}

/**
 * Get push token for device
 * Use to register device with backend for push notifications
 */
export async function getPushToken() {
  try {
    if (!Device.isDevice) {
      console.log('Push tokens are not available on simulator');
      return null;
    }

    const token = (
      await Notifications.getExpoPushTokenAsync()
    ).data;

    return token;
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }
}

/**
 * Register device push token with backend
 */
export async function registerPushToken(token) {
  try {
    if (!token) return;

    await api.post('/notifications/register-device', {
      pushToken: token,
      platform: 'mobile',
    });

    console.log('Push token registered successfully');
  } catch (error) {
    console.error('Error registering push token:', error);
  }
}

/**
 * Fetch notifications from backend
 * Used for polling notifications
 */
export async function fetchNotifications() {
  try {
    const res = await api.get('/notifications');
    return res.data || [];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId) {
  try {
    await api.put(`/notifications/${notificationId}/read`);
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
}

/**
 * Clear all notifications
 */
export async function clearAllNotifications() {
  try {
    await Notifications.dismissAllNotificationsAsync();
    await api.put('/notifications/read-all');
  } catch (error) {
    console.error('Error clearing notifications:', error);
  }
}

/**
 * Set up notification listeners
 * Call in a useEffect in root component
 */
export function setupNotificationListeners() {
  // Listen for notifications while app is foreground
  const foregroundSubscription = Notifications.addNotificationReceivedListener(
    (notification) => {
      console.log('Notification received:', notification);
      // Handle notification - update state, show alert, etc.
    }
  );

  // Listen for user tapping on notification
  const responseSubscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      const { notification } = response;
      console.log('Notification tapped:', notification);
      // Navigate to relevant screen based on notification data
      // e.g., notification.request.content.data.screen
    }
  );

  // Cleanup function
  return () => {
    foregroundSubscription.remove();
    responseSubscription.remove();
  };
}
