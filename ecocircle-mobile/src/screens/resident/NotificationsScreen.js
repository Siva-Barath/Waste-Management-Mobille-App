import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Layout from '../../components/common/Layout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../services/api';

const TYPE_CONFIG = {
  reminder: { icon: 'bell', bg: '#dbeafe', text: '#2563eb' },
  alert: { icon: 'alert-circle', bg: '#fee2e2', text: '#dc2626' },
  info: { icon: 'information', bg: '#ccfbf1', text: '#0d9488' },
  announcement: { icon: 'bullhorn', bg: '#fef3c7', text: '#d97706' },
};

function formatTime(ts) {
  const d = new Date(ts);
  const now = new Date();
  const diffMins = Math.floor((now - d) / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/resident/notifications');
      setNotifications(res.data.notifications || []);
    } catch {
      // endpoint may not exist yet — show empty state
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

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

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {
      /* ignore */
    }
  };

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <Layout title="Alerts" subtitle={unread > 0 ? `${unread} unread` : 'All caught up'}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View style={styles.header}>
            <Text style={styles.title}>Notifications</Text>
            <Text style={styles.subtitle}>
              {unread > 0
                ? `${unread} unread notification${unread > 1 ? 's' : ''}`
                : 'All caught up!'}
            </Text>
          </View>
          {unread > 0 && (
            <TouchableOpacity style={styles.markAllBtn} onPress={markAllRead}>
              <MaterialCommunityIcons name="check-all" size={16} color="#2d6a4f" />
              <Text style={styles.markAllText}>Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.card}>
          {loading ? (
            <LoadingSpinner />
          ) : notifications.length === 0 ? (
            <View style={styles.empty}>
              <MaterialCommunityIcons name="bell-off-outline" size={48} color="#d6d3d1" />
              <Text style={styles.emptyTitle}>No notifications yet</Text>
              <Text style={styles.emptyDesc}>
                You'll receive alerts about collections, rewards, and system updates here.
              </Text>
            </View>
          ) : (
            <FlatList
              data={notifications}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => {
                const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.reminder;
                return (
                  <TouchableOpacity
                    style={[styles.notifItem, !item.read && styles.notifUnread]}
                    onPress={() => !item.read && markRead(item.id)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.notifIcon, { backgroundColor: cfg.bg }]}>
                      <MaterialCommunityIcons name={cfg.icon} size={20} color={cfg.text} />
                    </View>
                    <View style={styles.notifContent}>
                      <Text style={[styles.notifMessage, !item.read && styles.notifMessageUnread]}>
                        {item.message}
                      </Text>
                      <Text style={styles.notifTime}>{formatTime(item.created_at)}</Text>
                    </View>
                    {!item.read && <View style={styles.unreadDot} />}
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 24 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    gap: 12,
    flexWrap: 'wrap',
  },
  header: { flex: 1 },
  title: { fontSize: 24, fontWeight: '700', color: '#1c1917' },
  subtitle: { fontSize: 14, color: '#78716c', marginTop: 4 },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#d8f3dc',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  markAllText: { color: '#2d6a4f', fontSize: 13, fontWeight: '600' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e7e5e4',
    overflow: 'hidden',
  },
  empty: { padding: 48, alignItems: 'center' },
  emptyTitle: { marginTop: 12, fontSize: 16, fontWeight: '600', color: '#57534e' },
  emptyDesc: {
    marginTop: 8,
    fontSize: 13,
    color: '#78716c',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  notifItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f4',
    gap: 12,
  },
  notifUnread: { backgroundColor: 'rgba(216, 243, 220, 0.25)' },
  notifIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifContent: { flex: 1 },
  notifMessage: { fontSize: 14, color: '#57534e' },
  notifMessageUnread: { fontWeight: '600', color: '#1c1917' },
  notifTime: { fontSize: 12, color: '#a8a29e', marginTop: 4 },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2d6a4f',
    marginTop: 6,
  },
});
