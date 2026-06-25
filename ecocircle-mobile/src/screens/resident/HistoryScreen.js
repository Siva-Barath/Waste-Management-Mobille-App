import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const WASTE_CONFIG = {
  biodegradable: { icon: 'leaf',            color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0', label: 'Organic' },
  organic:       { icon: 'leaf',            color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0', label: 'Organic' },
  recyclable:    { icon: 'recycle',         color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe', label: 'Recyclable' },
  hazardous:     { icon: 'alert-circle',    color: '#dc2626', bg: '#fef2f2', border: '#fecaca', label: 'Hazardous' },
  mixed:         { icon: 'trash-can-outline', color: '#b45309', bg: '#fefce8', border: '#fde68a', label: 'Mixed' },
};

const STATUS_CONFIG = {
  collected: { icon: 'check-circle', color: '#16a34a', bg: '#f0fdf4', label: 'Collected' },
  reported:  { icon: 'clock-outline', color: '#1d4ed8', bg: '#eff6ff', label: 'Reported' },
  pending:   { icon: 'clock-outline', color: '#1d4ed8', bg: '#eff6ff', label: 'Pending' },
  skipped:   { icon: 'close-circle', color: '#d97706', bg: '#fff7ed', label: 'Skipped' },
};

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

function HistoryCard({ report, index }) {
  const wt = WASTE_CONFIG[report.waste_type] || WASTE_CONFIG.mixed;
  const st = STATUS_CONFIG[report.collection_status] || STATUS_CONFIG.reported;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1, duration: 300, delay: index * 60, useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
      {/* Top row */}
      <View style={styles.cardTop}>
        <View style={[styles.wasteIconBox, { backgroundColor: wt.bg, borderColor: wt.border }]}>
          <MaterialCommunityIcons name={wt.icon} size={22} color={wt.color} />
        </View>
        <View style={styles.cardMeta}>
          <Text style={styles.cardDate}>{formatDate(report.date)}</Text>
          <Text style={[styles.wasteLabel, { color: wt.color }]}>{wt.label} Waste</Text>
        </View>
        <View style={[styles.statusChip, { backgroundColor: st.bg }]}>
          <MaterialCommunityIcons name={st.icon} size={13} color={st.color} />
          <Text style={[styles.statusChipText, { color: st.color }]}>{st.label}</Text>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Bottom row */}
      <View style={styles.cardBottom}>
        {report.truck_id ? (
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="truck-delivery-outline" size={13} color="#78716c" />
            <Text style={styles.detailText}>Truck {report.truck_id}</Text>
          </View>
        ) : null}
        {report.collection_time ? (
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="clock-outline" size={13} color="#78716c" />
            <Text style={styles.detailText}>{report.collection_time}</Text>
          </View>
        ) : null}
        <View style={[styles.pointsBadge, { backgroundColor: report.collection_status === 'collected' ? '#f0fdf4' : '#f5f5f4' }]}>
          <MaterialCommunityIcons name="star-four-points" size={12} color={report.collection_status === 'collected' ? '#16a34a' : '#9ca3af'} />
          <Text style={[styles.pointsText, { color: report.collection_status === 'collected' ? '#16a34a' : '#9ca3af' }]}>
            {report.collection_status === 'collected' ? '+5 pts' : '— pts'}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

export default function HistoryScreen() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.house_id) return;
    api.get(`/resident/my_reports/${user.house_id}`)
      .then(res => {
        const raw = res.data.reports || [];
        const mapped = raw.map(r => ({
          ...r,
          date: r.reported_at ? r.reported_at.split('T')[0] : (r.date || ''),
          waste_type: r.report_type || r.waste_type || 'mixed',
          collection_status: r.status || r.collection_status || 'reported',
        }));
        setReports(mapped);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const totalCollected = reports.filter(r => r.collection_status === 'collected').length;
  const totalPts = totalCollected * 5;

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Collection History</Text>
        <Text style={styles.pageSubtitle}>Your waste reporting records</Text>
      </View>

      {/* Summary */}
      <View style={styles.summaryRow}>
        {[
          { val: reports.length, label: 'Reports', color: '#1c1917' },
          { val: totalCollected, label: 'Collected', color: '#16a34a' },
          { val: `${totalPts}`, label: 'Green Pts', color: '#d97706' },
        ].map(s => (
          <View key={s.label} style={styles.summaryCard}>
            <Text style={[styles.summaryValue, { color: s.color }]}>{s.val}</Text>
            <Text style={styles.summaryLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <MaterialCommunityIcons name="history" size={40} color="#d1d5db" />
          <Text style={styles.loadingText}>Loading history...</Text>
        </View>
      ) : reports.length === 0 ? (
        <View style={styles.emptyBox}>
          <MaterialCommunityIcons name="calendar-blank-outline" size={56} color="#d1d5db" />
          <Text style={styles.emptyTitle}>No Reports Yet</Text>
          <Text style={styles.emptyDesc}>Your collection history will appear here after your first report.</Text>
        </View>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item, i) => `${item.date}-${i}`}
          renderItem={({ item, index }) => <HistoryCard report={item} index={index} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
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
  summaryLabel: { fontSize: 11, color: '#78716c', marginTop: 3 },

  list: { paddingHorizontal: 16, paddingBottom: 48 },

  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: '#e7e5e4',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  wasteIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  cardMeta: { flex: 1 },
  cardDate: { fontSize: 13, fontWeight: '700', color: '#1c1917' },
  wasteLabel: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  statusChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 9, paddingVertical: 5, borderRadius: 20,
  },
  statusChipText: { fontSize: 11, fontWeight: '700' },

  divider: { height: 1, backgroundColor: '#f5f5f4', marginVertical: 10 },

  cardBottom: { flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailText: { fontSize: 12, color: '#78716c' },
  pointsBadge: {
    marginLeft: 'auto', flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20,
  },
  pointsText: { fontSize: 12, fontWeight: '700' },

  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: '#9ca3af' },
  emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#374151' },
  emptyDesc: { fontSize: 13, color: '#6b7280', textAlign: 'center', lineHeight: 20 },
});
