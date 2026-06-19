import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  Pressable,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { colors } from '../../utils/colors';
import { borderRadius, spacing } from '../../utils/spacing';

const TYPE_CONFIG = {
  reminder: { icon: 'bell', color: '#2563eb' },
  alert: { icon: 'alert-circle', color: '#dc2626' },
  info: { icon: 'information', color: '#0d9488' },
  announcement: { icon: 'bullhorn', color: '#d97706' },
};

export default function NotificationBell() {
  const { width } = useWindowDimensions();
  const { user } = useAuth();
  const {
    notifications,
    notificationCount,
    fetchNotifications,
    markAsRead,
    clearNotifications,
  } = useApp();
  const [open, setOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  if (!user) return null;

  const handleOpen = async () => {
    setOpen(true);
    setRefreshing(true);
    try {
      await fetchNotifications();
    } finally {
      setRefreshing(false);
    }
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return '';
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
        onPress={handleOpen}
        style={styles.bellButton}
        accessibilityRole="button"
        accessibilityLabel={`Notifications${notificationCount ? `, ${notificationCount} unread` : ''}`}
      >
        <MaterialCommunityIcons name="bell-outline" size={20} color="#64748b" />
        {notificationCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {notificationCount > 9 ? '9+' : notificationCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <Pressable
            style={[styles.sheet, { width: width - 24 }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.header}>
              <View style={styles.headerTitleRow}>
                <MaterialCommunityIcons name="bell" size={18} color="#2d6a4f" />
                <Text style={styles.headerTitle}>Notifications</Text>
                {notificationCount > 0 && (
                  <View style={styles.headerBadge}>
                    <Text style={styles.headerBadgeText}>{notificationCount} new</Text>
                  </View>
                )}
              </View>
              <View style={styles.headerActions}>
                {notificationCount > 0 && (
                  <TouchableOpacity onPress={clearNotifications} style={styles.markAllBtn}>
                    <MaterialCommunityIcons name="check-all" size={16} color="#2d6a4f" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => setOpen(false)} style={styles.closeBtn}>
                  <MaterialCommunityIcons name="close" size={20} color="#9ca3af" />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView style={styles.list} nestedScrollEnabled>
              {refreshing && notifications.length === 0 ? (
                <View style={styles.empty}>
                  <ActivityIndicator color="#2d6a4f" />
                  <Text style={styles.emptyText}>Loading notifications…</Text>
                </View>
              ) : notifications.length === 0 ? (
                <View style={styles.empty}>
                  <MaterialCommunityIcons name="bell-off-outline" size={32} color="#d6d3d1" />
                  <Text style={styles.emptyText}>No notifications yet</Text>
                  <Text style={styles.emptyHint}>
                    Alerts about pickups, routes, and collections will appear here.
                  </Text>
                </View>
              ) : (
                notifications.slice(0, 20).map((n) => {
                  const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.reminder;
                  return (
                    <View
                      key={n.id}
                      style={[styles.item, !n.read && styles.itemUnread]}
                    >
                      <View style={[styles.typeIcon, { backgroundColor: `${cfg.color}18` }]}>
                        <MaterialCommunityIcons name={cfg.icon} size={16} color={cfg.color} />
                      </View>
                      <View style={styles.itemContent}>
                        <Text style={[styles.itemMessage, !n.read && styles.itemMessageUnread]}>
                          {n.message}
                        </Text>
                        <Text style={styles.itemTime}>{formatTime(n.created_at)}</Text>
                      </View>
                      {!n.read && (
                        <TouchableOpacity onPress={() => markAsRead(n.id)} style={styles.markReadBtn}>
                          <MaterialCommunityIcons name="check" size={16} color="#2d6a4f" />
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })
              )}
            </ScrollView>

            {notifications.length > 0 && (
              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                  {notificationCount > 0 ? ` · ${notificationCount} unread` : ''}
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
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
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
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: spacing.xl,
  },
  sheet: {
    maxHeight: '70%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
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
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  headerBadge: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  headerBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#dc2626',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  markAllBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#d8f3dc',
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
  emptyHint: {
    marginTop: 6,
    fontSize: 12,
    color: '#d1d5db',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f9fafb',
    gap: 8,
  },
  itemUnread: {
    backgroundColor: 'rgba(216, 243, 220, 0.35)',
  },
  typeIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    display: 'none',
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
