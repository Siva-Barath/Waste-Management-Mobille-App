import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Layout from '../../components/common/Layout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../services/api';

const WASTE_ICONS = {
  biodegradable: { icon: 'leaf', bg: '#dcfce7', text: '#15803d' },
  recyclable: { icon: 'recycle', bg: '#dbeafe', text: '#1d4ed8' },
  hazardous: { icon: 'alert-circle', bg: '#fee2e2', text: '#dc2626' },
  mixed: { icon: 'trash-can-outline', bg: '#fef3c7', text: '#b45309' },
};

const STATUS_CONFIG = {
  collected: { icon: 'check-circle', bg: '#ecfdf5', text: '#16a34a', label: 'Collected' },
  skipped: { icon: 'close-circle', bg: '#fffbeb', text: '#d97706', label: 'Skipped' },
  pending: { icon: 'clock-outline', bg: '#eff6ff', text: '#2563eb', label: 'Pending' },
};

function formatDate(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function HistoryItem({ report, isLast }) {
  const wt = WASTE_ICONS[report.waste_type] || WASTE_ICONS.mixed;
  const status = STATUS_CONFIG[report.collection_status];

  return (
    <View style={styles.timelineItem}>
      <View style={styles.dateCol}>
        <Text style={styles.dateWeekday}>{formatDate(report.date).split(', ')[0]}</Text>
        <Text style={styles.dateRaw}>{report.date}</Text>
      </View>

      <View style={styles.timelineCol}>
        <View style={[styles.timelineDot, report.available ? styles.dotActive : styles.dotInactive]} />
        {!isLast && <View style={styles.timelineLine} />}
      </View>

      <View style={styles.contentCol}>
        <View style={styles.contentRow}>
          <View style={styles.contentMain}>
            <Text style={styles.reportTitle}>
              {report.available ? 'Garbage Reported' : 'No Garbage'}
            </Text>
            {report.available && (
              <View style={[styles.wasteBadge, { backgroundColor: wt.bg }]}>
                <MaterialCommunityIcons name={wt.icon} size={12} color={wt.text} />
                <Text style={[styles.wasteBadgeText, { color: wt.text }]}>{report.waste_type}</Text>
              </View>
            )}
          </View>
          {report.available && status && (
            <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
              <MaterialCommunityIcons name={status.icon} size={14} color={status.text} />
              <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

export default function HistoryScreen() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/garbage/history')
      .then((res) => setReports(res.data.reports || []))
      .finally(() => setLoading(false));
  }, []);

  const totalReported = reports.filter((r) => r.available).length;
  const totalCollected = reports.filter((r) => r.collection_status === 'collected').length;

  return (
    <Layout title="EcoCircle">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Collection History</Text>
          <Text style={styles.subtitle}>Your waste reporting and collection records</Text>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{reports.length}</Text>
            <Text style={styles.summaryLabel}>Total Reports</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryValue, { color: '#2d6a4f' }]}>{totalReported}</Text>
            <Text style={styles.summaryLabel}>Garbage Days</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryValue, { color: '#52796f' }]}>{totalCollected}</Text>
            <Text style={styles.summaryLabel}>Collected</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="calendar" size={20} color="#2d6a4f" />
            <Text style={styles.cardTitle}>Report Timeline</Text>
          </View>

          {loading ? (
            <LoadingSpinner />
          ) : reports.length === 0 ? (
            <View style={styles.empty}>
              <MaterialCommunityIcons name="trash-can-outline" size={48} color="#d6d3d1" />
              <Text style={styles.emptyText}>No reports yet. Start reporting today!</Text>
            </View>
          ) : (
            <FlatList
              data={reports}
              keyExtractor={(item, index) => `${item.date}-${index}`}
              scrollEnabled={false}
              renderItem={({ item, index }) => (
                <HistoryItem report={item} isLast={index === reports.length - 1} />
              )}
            />
          )}
        </View>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 24 },
  header: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '700', color: '#1c1917' },
  subtitle: { fontSize: 14, color: '#78716c', marginTop: 4 },
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e7e5e4',
    padding: 16,
    alignItems: 'center',
  },
  summaryValue: { fontSize: 24, fontWeight: '700', color: '#1c1917' },
  summaryLabel: { fontSize: 12, color: '#78716c', marginTop: 4, textAlign: 'center' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e7e5e4',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f4',
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1c1917' },
  empty: { padding: 48, alignItems: 'center' },
  emptyText: { marginTop: 12, color: '#78716c', fontSize: 14 },
  timelineItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f4',
    gap: 12,
  },
  dateCol: { width: 56, alignItems: 'center' },
  dateWeekday: { fontSize: 13, fontWeight: '700', color: '#1c1917' },
  dateRaw: { fontSize: 11, color: '#78716c', marginTop: 2 },
  timelineCol: { alignItems: 'center', width: 16 },
  timelineDot: { width: 12, height: 12, borderRadius: 6 },
  dotActive: { backgroundColor: '#2d6a4f' },
  dotInactive: { backgroundColor: '#d6d3d1' },
  timelineLine: {
    position: 'absolute',
    top: 14,
    width: 2,
    height: 32,
    backgroundColor: '#e7e5e4',
  },
  contentCol: { flex: 1 },
  contentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  contentMain: { flex: 1 },
  reportTitle: { fontSize: 14, fontWeight: '600', color: '#1c1917' },
  wasteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    marginTop: 6,
  },
  wasteBadgeText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusText: { fontSize: 11, fontWeight: '600' },
});
