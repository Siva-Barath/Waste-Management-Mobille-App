import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Layout from '../../components/common/Layout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AreaChartComponent from '../../components/charts/AreaChartComponent';
import PieChartComponent from '../../components/charts/PieChartComponent';
import api from '../../services/api';

const COLORS = ['#2d6a4f', '#52796f', '#d4a373', '#b56576', '#6366f1', '#457b9d'];

export default function AdminDashboardScreen() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [windowOpen, setWindowOpen] = useState(false);
  const [windowToggling, setWindowToggling] = useState(false);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  useEffect(() => {
    api.get('/admin/stats').then((res) => setStats(res.data)).finally(() => setLoading(false));
    api.get('/admin/window-status').then((res) => setWindowOpen(res.data?.is_open === true)).catch(() => {});
  }, []);

  const toggleWindow = async () => {
    setWindowToggling(true);
    try {
      const res = await api.post('/admin/window-status', { is_open: !windowOpen });
      setWindowOpen(res.data.is_open);
    } catch { /* ignore */ }
    finally { setWindowToggling(false); }
  };

  if (loading) {
    return (
      <Layout title="Overview" subtitle={today}>
        <LoadingSpinner message="Loading dashboard..." />
      </Layout>
    );
  }

  const o = stats?.overview || {};
  const wasteData = (stats?.wasteTypes || []).map((w) => ({
    name: w.waste_type,
    value: w.count,
  }));
  const weeklyData = (stats?.weeklyTrend || []).map((d) => ({
    date: d.date.split('-').slice(1).join('/'),
    Reported: d.reported,
    Collected: d.collected,
  }));
  const trendLabels = weeklyData.map((d) => d.date);

  return (
    <Layout title="Overview" subtitle={today}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Admin Dashboard</Text>
          <Text style={styles.subtitle}>{today}</Text>
        </View>

        {/* Reporting Window Toggle */}
        <TouchableOpacity
          style={[styles.windowToggle, { backgroundColor: windowOpen ? '#dcfce7' : '#fee2e2', borderColor: windowOpen ? '#16a34a' : '#dc2626' }]}
          onPress={toggleWindow}
          disabled={windowToggling}
          activeOpacity={0.8}
        >
          <View style={[styles.windowDot, { backgroundColor: windowOpen ? '#16a34a' : '#dc2626' }]} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.windowToggleTitle, { color: windowOpen ? '#15803d' : '#b91c1c' }]}>
              Reporting Window: {windowOpen ? 'OPEN' : 'CLOSED'}
            </Text>
            <Text style={[styles.windowToggleSub, { color: windowOpen ? '#166534' : '#991b1b' }]}>
              {windowOpen ? 'Residents can submit reports now. Tap to close.' : 'Tap to open — residents will be notified.'}
            </Text>
          </View>
          <MaterialCommunityIcons
            name={windowToggling ? 'loading' : windowOpen ? 'toggle-switch' : 'toggle-switch-off'}
            size={32}
            color={windowOpen ? '#16a34a' : '#dc2626'}
          />
        </TouchableOpacity>

        <View style={styles.statsGrid}>
          {[
            { label: 'Total Households', value: o.totalHouseholds, icon: 'home', bg: '#d8f3dc', color: '#2d6a4f' },
            { label: 'Reporting Today', value: o.reportingToday, icon: 'clipboard-list', bg: '#ccfbf1', color: '#0d9488' },
            { label: 'Collected Today', value: o.collectedToday, icon: 'check-circle', bg: '#d1fae5', color: '#059669' },
            { label: 'Pending', value: o.pendingToday, icon: 'clock-outline', bg: '#fef3c7', color: '#d97706' },
          ].map((item) => (
            <View key={item.label} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: item.bg }]}>
                <MaterialCommunityIcons name={item.icon} size={20} color={item.color} />
              </View>
              <Text style={styles.statValue}>{item.value || 0}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.efficiencyRow}>
              <MaterialCommunityIcons name="trending-up" size={20} color="#2d6a4f" />
              <View style={styles.efficiencyBadge}>
                <Text style={styles.efficiencyBadgeText}>Good</Text>
              </View>
            </View>
            <Text style={styles.statValueLarge}>{o.efficiency || 0}%</Text>
            <Text style={styles.statLabel}>Collection Efficiency</Text>
          </View>
          {[
            { label: 'Active Drivers', value: o.totalDrivers, icon: 'truck', bg: '#dbeafe', color: '#2563eb' },
            { label: 'Active Routes', value: o.activeRoutes, icon: 'map-marker', bg: '#ede9fe', color: '#7c3aed' },
            { label: 'Skipped Today', value: o.skippedToday, icon: 'close-circle', bg: '#fee2e2', color: '#dc2626' },
          ].map((item) => (
            <View key={item.label} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: item.bg }]}>
                <MaterialCommunityIcons name={item.icon} size={20} color={item.color} />
              </View>
              <Text style={styles.statValue}>{item.value || 0}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <MaterialCommunityIcons name="trending-up" size={20} color="#2d6a4f" />
            <Text style={styles.chartTitle}>Weekly Collection Trend</Text>
          </View>
          <AreaChartComponent data={weeklyData} labels={trendLabels} height={220} />
        </View>

        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <MaterialCommunityIcons name="recycle" size={20} color="#52796f" />
            <Text style={styles.chartTitle}>Waste Type Distribution</Text>
          </View>
          <PieChartComponent data={wasteData} colors={COLORS} height={220} />
          <View style={styles.legendRow}>
            {wasteData.map((w, i) => (
              <View key={i} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: COLORS[i % COLORS.length] }]} />
                <Text style={styles.legendText}>{w.name}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.wardCard}>
          <View style={styles.chartHeader}>
            <MaterialCommunityIcons name="map-marker" size={20} color="#2d6a4f" />
            <Text style={styles.chartTitle}>Ward-wise Reports</Text>
          </View>
          <View style={styles.wardGrid}>
            {(stats?.wardStats || []).map((ward, i) => {
              const pct = ward.total_houses > 0 ? (ward.reporting / ward.total_houses) * 100 : 0;
              return (
                <View key={i} style={styles.wardItem}>
                  <View style={styles.wardHeader}>
                    <Text style={styles.wardName}>{ward.ward}</Text>
                    <View style={styles.wardBadge}>
                      <Text style={styles.wardBadgeText}>{ward.total_houses} houses</Text>
                    </View>
                  </View>
                  <View style={styles.wardStatRow}>
                    <Text style={styles.wardStatValue}>{ward.reporting}</Text>
                    <Text style={styles.wardStatLabel}>reporting today</Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${pct}%` }]} />
                  </View>
                </View>
              );
            })}
          </View>
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
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  statCard: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e7e5e4',
    padding: 16,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: { fontSize: 22, fontWeight: '700', color: '#1c1917' },
  statValueLarge: { fontSize: 28, fontWeight: '700', color: '#1c1917' },
  statLabel: { fontSize: 11, color: '#78716c', marginTop: 4 },
  efficiencyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  efficiencyBadge: { backgroundColor: '#d8f3dc', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  efficiencyBadgeText: { fontSize: 10, fontWeight: '700', color: '#2d6a4f' },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e7e5e4',
    padding: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  chartHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  chartTitle: { fontSize: 16, fontWeight: '700', color: '#1c1917' },
  legendRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginTop: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 11, color: '#57534e', textTransform: 'capitalize' },
  wardCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e7e5e4',
    padding: 16,
    marginBottom: 24,
  },
  wardGrid: { gap: 12 },
  wardItem: {
    backgroundColor: '#fafaf8',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e7e5e4',
    padding: 16,
  },
  wardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  wardName: { fontSize: 15, fontWeight: '700', color: '#1c1917' },
  wardBadge: { backgroundColor: '#d8f3dc', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  wardBadgeText: { fontSize: 10, fontWeight: '600', color: '#2d6a4f' },
  wardStatRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, marginBottom: 12 },
  wardStatValue: { fontSize: 28, fontWeight: '700', color: '#2d6a4f' },
  wardStatLabel: { fontSize: 13, color: '#78716c', marginBottom: 4 },
  progressTrack: { height: 8, backgroundColor: '#e7e5e4', borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#2d6a4f', borderRadius: 999 },

  windowToggle: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: 14, borderWidth: 1.5, padding: 16, marginBottom: 20,
  },
  windowDot: { width: 10, height: 10, borderRadius: 5 },
  windowToggleTitle: { fontSize: 14, fontWeight: '800' },
  windowToggleSub: { fontSize: 12, marginTop: 2, fontWeight: '500' },
});
