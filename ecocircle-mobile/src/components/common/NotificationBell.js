import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../../services/api';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.notifications || []);
    } catch {
      /* ignore */
    }
  };

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch {
      /* ignore */
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const formatTime = (ts) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = Math.floor((now - d) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        style={styles.bellButton}
        accessibilityRole="button"
        accessibilityLabel="Notifications"
      >
        <MaterialCommunityIcons name="bell-outline" size={20} color="#64748b" />
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable style={styles.dropdown} onPress={(e) => e.stopPropagation()}>
            <View style={styles.header}>
              <View style={styles.headerTitleRow}>
                <MaterialCommunityIcons name="bell" size={18} color="#2d6a4f" />
                <Text style={styles.headerTitle}>Notifications</Text>
              </View>
              <TouchableOpacity onPress={() => setOpen(false)} style={styles.closeBtn}>
                <MaterialCommunityIcons name="close" size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.list} nestedScrollEnabled>
              {notifications.length === 0 ? (
                <View style={styles.empty}>
                  <MaterialCommunityIcons name="bell-off-outline" size={32} color="#d6d3d1" />
                  <Text style={styles.emptyText}>No notifications yet</Text>
                </View>
              ) : (
                notifications.slice(0, 20).map((n) => (
                  <View
                    key={n.id}
                    style={[styles.item, !n.read && styles.itemUnread]}
                  >
                    <View style={[styles.dot, !n.read ? styles.dotUnread : styles.dotRead]} />
                    <View style={styles.itemContent}>
                      <Text style={[styles.itemMessage, !n.read && styles.itemMessageUnread]}>
                        {n.message}
                      </Text>
                      <Text style={styles.itemTime}>{formatTime(n.created_at)}</Text>
                    </View>
                    {!n.read && (
                      <TouchableOpacity onPress={() => markRead(n.id)} style={styles.markReadBtn}>
                        <MaterialCommunityIcons name="check" size={16} color="#2d6a4f" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))
              )}
            </ScrollView>

            {notifications.length > 0 && (
              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                </Text>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  bellButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: 12,
  },
  dropdown: {
    width: 320,
    maxHeight: 400,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e7e5e4',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  closeBtn: {
    padding: 4,
  },
  list: {
    maxHeight: 280,
  },
  empty: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: '#9ca3af',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f9fafb',
    gap: 12,
  },
  itemUnread: {
    backgroundColor: 'rgba(216, 243, 220, 0.35)',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  dotUnread: {
    backgroundColor: '#2d6a4f',
  },
  dotRead: {
    backgroundColor: '#d1d5db',
  },
  itemContent: {
    flex: 1,
  },
  itemMessage: {
    fontSize: 14,
    color: '#4b5563',
  },
  itemMessageUnread: {
    fontWeight: '600',
    color: '#111827',
  },
  itemTime: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  markReadBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#d8f3dc',
  },
  footer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9ca3af',
  },
});
