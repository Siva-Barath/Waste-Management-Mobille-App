import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Animated, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import api from '../../services/api';

const WASTE_CONFIG = {
  biodegradable: { icon: 'leaf',              color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0', label: 'Organic' },
  organic:       { icon: 'leaf',              color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0', label: 'Organic' },
  recyclable:    { icon: 'recycle',           color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe', label: 'Recyclable' },
  hazardous:     { icon: 'alert-circle',      color: '#dc2626', bg: '#fef2f2', border: '#fecaca', label: 'Hazardous' },
  mixed:         { icon: 'trash-can-outline', color: '#b45309', bg: '#fefce8', border: '#fde68a', label: 'Mixed' },
};

const STATUS_CONFIG = {
  collected: { icon: 'check-circle', color: '#16a34a', bg: '#f0fdf4', label: 'Collected' },
  reported:  { icon: 'clock-outline', color: '#1d4ed8', bg: '#eff6ff', label: 'Reported' },
  pending:   { icon: 'clock-outline', color: '#1d4ed8', bg: '#eff6ff', label: 'Pending' },
  assigned:  { icon: 'account-tie-outline', color: '#7c3aed', bg: '#f3e8ff', label: 'Assigned' },
  en_route:  { icon: 'truck-fast-outline', color: '#d97706', bg: '#fff7ed', label: 'En Route' },
  skipped:   { icon: 'close-circle', color: '#d97706', bg: '#fff7ed', label: 'Skipped' },
};

const FILTERS = ['All', 'Last Month', 'Last Week'];

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function HistoryCard({ report, index }) {
  const wt = WASTE_CONFIG[report.waste_type] || WASTE_CONFIG.mixed;
  const st = STATUS_CONFIG[report.collection_status] || STATUS_CONFIG.reported;
  const isCollected = report.collection_status === 'collected';
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1, duration: 300, delay: index * 55, useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
      <View style={styles.cardLeft}>
        <Text style={styles.cardDay}>{formatDate(report.date)}</Text>
        <View style={[styles.wasteIconBox, { backgroundColor: wt.bg, borderColor: wt.border }]}>
          <MaterialCommunityIcons name={wt.icon} size={20} color={wt.color} />
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={[styles.statusChip, { backgroundColor: st.bg }]}>
          <MaterialCommunityIcons name={st.icon} size={13} color={st.color} />
          <Text style={[styles.statusChipText, { color: st.color }]}>{st.label}</Text>
        </View>
        <View style={styles.cardMeta}>
          {report.truck_id ? (
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="truck-delivery-outline" size={12} color="#78716c" />
              <Text style={styles.metaText}>Truck {report.truck_id}</Text>
            </View>
          ) : null}
          {report.collection_time ? (
            <View style={styles.metaItem}>
              <MaterialCommunityIcons name="clock-outline" size={12} color="#78716c" />
              <Text style={styles.metaText}>{report.collection_time}</Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={[styles.pointsBadge, { backgroundColor: isCollected ? '#f0fdf4' : '#f5f5f4' }]}>
        <MaterialCommunityIcons name="star-four-points" size={13} color={isCollected ? '#16a34a' : '#d1d5db'} />
        <Text style={[styles.pointsText, { color: isCollected ? '#16a34a' : '#9ca3af' }]}>
          {isCollected ? '+5 pts' : '—'}
        </Text>
      </View>
    </Animated.View>
  );
}

export default function HistoryScreen() {
  const { user } = useAuth();
  const [filter, setFilter] = useState('All');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (!user?.house_id) return;
    try {
      const res = await api.get('/get_collection_history');
      const records = res.data?.records || [];
      const myRecords = records.filter(r => r.location_id === user.house_id);
      
      const formatted = myRecords.map(r => {
        const d = new Date(r.collected_at * 1000);
        return {
          id: r.collected_at.toString(),
          date: d.toISOString().split('T')[0],
          waste_type: 'mixed',
          collection_status: 'collected',
          truck_id: r.truck_id,
          collection_time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        };
      });
      // Sort newest first
      formatted.sort((a, b) => b.id - a.id);
      setReports(formatted);
    } catch (error) {
      console.warn('Failed to fetch history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.house_id]);

  useFocusEffect(
    useCallback(() => {
      fetchHistory();
    }, [fetchHistory])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const filtered = useMemo(() => {
    if (filter === 'All') return reports;
    const now = new Date();
    const cutoff = new Date();
    if (filter === 'Last Week') cutoff.setDate(now.getDate() - 7);
    else cutoff.setDate(now.getDate() - 30);
    return reports.filter(r => r.date && new Date(`${r.date}T00:00:00`) >= cutoff);
  }, [reports, filter]);

  const totalCollected = reports.filter(r => r.collection_status === 'collected').length;
  const successRate = reports.length > 0 ? Math.round((totalCollected / reports.length) * 100) : 0;
  const totalPts = totalCollected * 5;

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Activity</Text>
        <Text style={styles.pageSubtitle}>Your collection history</Text>
      </View>

      {/* Summary */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryValue, { color: '#1c1917' }]}>{reports.length}</Text>
          <Text style={styles.summaryLabel}>Total Reports</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryValue, { color: '#16a34a' }]}>{successRate}%</Text>
          <Text style={styles.summaryLabel}>Success Rate</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryValue, { color: '#d97706' }]}>{totalPts}</Text>
          <Text style={styles.summaryLabel}>Green Points</Text>
        </View>
      </View>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && styles.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterTabText, filter === f && styles.filterTabTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.emptyBox}>
          <MaterialCommunityIcons name="history" size={40} color="#d1d5db" />
          <Text style={styles.emptyTitle}>Loading history...</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.emptyBox}>
          <MaterialCommunityIcons name="calendar-blank-outline" size={56} color="#d1d5db" />
          <Text style={styles.emptyTitle}>No Reports Yet</Text>
          <Text style={styles.emptyDesc}>Your collection history will appear here after your first report.</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item, i) => `${item.date}-${i}`}
          renderItem={({ item, index }) => <HistoryCard report={item} index={index} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#2d6a4f']}
              tintColor="#2d6a4f"
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f8faf8' },

  pageHeader: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4 },
  pageTitle: { fontSize: 24, fontWeight: '800', color: '#1c1917' },
  pageSubtitle: { fontSize: 13, color: '#78716c', marginTop: 3 },

  summaryRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingVertical: 14 },
  summaryCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center',
    borderWidth: 1, borderColor: '#e7e5e4',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  summaryValue: { fontSize: 22, fontWeight: '800' },
  summaryLabel: { fontSize: 11, color: '#78716c', marginTop: 3, textAlign: 'center' },

  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 12 },
  filterTab: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#f5f5f4', borderWidth: 1, borderColor: '#e7e5e4' },
  filterTabActive: { backgroundColor: '#2d6a4f', borderColor: '#2d6a4f' },
  filterTabText: { fontSize: 12, fontWeight: '600', color: '#78716c' },
  filterTabTextActive: { color: '#fff' },

  list: { paddingHorizontal: 16, paddingBottom: 48 },

  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1, borderColor: '#e7e5e4',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  cardLeft: { alignItems: 'center', gap: 6, width: 42 },
  cardDay: { fontSize: 11, fontWeight: '700', color: '#374151', textAlign: 'center' },
  wasteIconBox: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },

  cardBody: { flex: 1, gap: 6 },
  statusChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start',
  },
  statusChipText: { fontSize: 12, fontWeight: '700' },
  cardMeta: { flexDirection: 'row', gap: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { fontSize: 11, color: '#78716c' },

  pointsBadge: {
    alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, gap: 3,
  },
  pointsText: { fontSize: 12, fontWeight: '700' },

  emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#374151' },
  emptyDesc: { fontSize: 13, color: '#6b7280', textAlign: 'center', lineHeight: 20 },
});
