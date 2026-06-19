import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Layout from '../../components/common/Layout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../services/api';

const STATUS_CONFIG = {
  collected: { icon: 'check-circle', bg: '#dcfce7', text: '#15803d' },
  pending: { icon: 'clock-outline', bg: '#dbeafe', text: '#2563eb' },
  skipped: { icon: 'skip-forward', bg: '#fef3c7', text: '#b45309' },
  closed: { icon: 'close-circle', bg: '#f5f5f4', text: '#57534e' },
};

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'collected', label: 'Collected' },
  { key: 'skipped', label: 'Skipped' },
];

export default function AdminCollectionsScreen() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api
      .get('/admin/collections')
      .then((res) => setCollections(res.data.collections || []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? collections : collections.filter((c) => c.status === filter);

  const counts = {
    all: collections.length,
    pending: collections.filter((c) => c.status === 'pending').length,
    collected: collections.filter((c) => c.status === 'collected').length,
    skipped: collections.filter((c) => c.status === 'skipped').length,
  };

  return (
    <Layout title="EcoCircle">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Collection Status</Text>
          <Text style={styles.subtitle}>Today's garbage collection tracking</Text>
        </View>

        <View style={styles.filterRow}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]}
              onPress={() => setFilter(f.key)}
            >
              <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
                {f.label} ({counts[f.key] || 0})
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.card}>
          {loading ? (
            <LoadingSpinner />
          ) : filtered.length === 0 ? (
            <View style={styles.empty}>
              <MaterialCommunityIcons name="clipboard-list-outline" size={48} color="#d6d3d1" />
              <Text style={styles.emptyText}>No collections found</Text>
            </View>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(item, index) => `${item.household_id}-${index}`}
              scrollEnabled={false}
              renderItem={({ item }) => {
                const s = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
                return (
                  <View style={styles.collectionItem}>
                    <View style={styles.collectionTop}>
                      <Text style={styles.householdId}>{item.household_id}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
                        <MaterialCommunityIcons name={s.icon} size={14} color={s.text} />
                        <Text style={[styles.statusText, { color: s.text }]}>{item.status}</Text>
                      </View>
                    </View>
                    <Text style={styles.residentName}>{item.resident_name}</Text>
                    <View style={styles.metaRow}>
                      <View style={styles.wardBadge}>
                        <MaterialCommunityIcons name="map-marker" size={12} color="#2d6a4f" />
                        <Text style={styles.wardText}>{item.ward}</Text>
                      </View>
                    </View>
                    <Text style={styles.address} numberOfLines={2}>{item.address}</Text>
                  </View>
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
  header: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '700', color: '#1c1917' },
  subtitle: { fontSize: 14, color: '#78716c', marginTop: 4 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  filterBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e7e5e4',
  },
  filterBtnActive: { backgroundColor: '#2d6a4f', borderColor: '#2d6a4f' },
  filterText: { fontSize: 13, fontWeight: '600', color: '#57534e' },
  filterTextActive: { color: '#fff' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e7e5e4',
    overflow: 'hidden',
    marginBottom: 24,
  },
  empty: { padding: 48, alignItems: 'center' },
  emptyText: { marginTop: 12, color: '#78716c' },
  collectionItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f4',
  },
  collectionTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  householdId: { fontSize: 14, fontWeight: '700', color: '#1c1917' },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  residentName: { fontSize: 14, color: '#44403c', marginBottom: 8 },
  metaRow: { flexDirection: 'row', marginBottom: 6 },
  wardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#d8f3dc',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  wardText: { fontSize: 11, fontWeight: '600', color: '#2d6a4f' },
  address: { fontSize: 13, color: '#78716c' },
});
