import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Layout from '../../components/common/Layout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AreaChartComponent from '../../components/charts/AreaChartComponent';
import PieChartComponent from '../../components/charts/PieChartComponent';
import api from '../../services/api';

const COLORS = ['#2d6a4f', '#52796f', '#d4a373', '#b56576'];

const WASTE_LABELS = {
  biodegradable: 'Biodegradable',
  recyclable: 'Recyclable',
  hazardous: 'Hazardous',
  mixed: 'Mixed',
};

export default function StatsScreen() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/garbage/my-stats')
      .then((res) => setStats(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Layout title="Statistics" subtitle="Your analytics">
        <LoadingSpinner message="Loading statistics..." />
      </Layout>
    );
  }

  const o = stats?.overview || {};
  const wasteData = (stats?.wasteTypes || []).map((w) => ({
    name: w.waste_type,
    value: w.count,
  }));
  const trendData = (stats?.weeklyTrend || []).map((d) => ({
    date: d.date.split('-').slice(1).join('/'),
    Reported: d.reported,
    Collected: d.collected,
  }));
  const trendLabels = trendData.map((d) => d.date);

  return (
    <Layout title="Statistics" subtitle="Your analytics">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>My Statistics</Text>
          <Text style={styles.subtitle}>Your personal waste management analytics</Text>
        </View>

        <View style={styles.statsGrid}>
          {[
            { label: 'Total Reports', value: o.totalReports || 0, icon: 'chart-bar', bg: '#d8f3dc', color: '#2d6a4f' },
            { label: 'Times Collected', value: o.totalCollected || 0, icon: 'check-circle', bg: '#d1fae5', color: '#059669' },
            { label: 'Skipped/Closed', value: o.totalSkipped || 0, icon: 'close-circle', bg: '#fef3c7', color: '#d97706' },
            { label: 'Green Points', value: o.totalPoints || 0, icon: 'star-four-points', bg: '#dbeafe', color: '#2563eb' },
          ].map((item) => (
            <View key={item.label} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: item.bg }]}>
                <MaterialCommunityIcons name={item.icon} size={20} color={item.color} />
              </View>
              <Text style={[styles.statValue, { color: item.color }]}>{item.value}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.scoreRow}>
          <View style={styles.scoreCard}>
            <View style={styles.scoreHeader}>
              <View style={[styles.statIcon, { backgroundColor: '#d8f3dc' }]}>
                <MaterialCommunityIcons name="target" size={20} color="#2d6a4f" />
              </View>
              <View>
                <Text style={styles.scoreLabel}>Collection Success Rate</Text>
                <Text style={styles.scoreValue}>{o.collectionRate || 0}%</Text>
              </View>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${o.collectionRate || 0}%`, backgroundColor: '#2d6a4f' }]} />
            </View>
            <Text style={styles.scoreHint}>
              {o.totalCollected} collected out of {o.totalGarbageDays} garbage days
            </Text>
          </View>

          <View style={styles.scoreCard}>
            <View style={styles.scoreHeader}>
              <View style={[styles.statIcon, { backgroundColor: '#ccfbf1' }]}>
                <MaterialCommunityIcons name="recycle" size={20} color="#0d9488" />
              </View>
              <View>
                <Text style={styles.scoreLabel}>Segregation Score</Text>
                <Text style={[styles.scoreValue, { color: '#0d9488' }]}>{o.segregationScore || 0}%</Text>
              </View>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${o.segregationScore || 0}%`, backgroundColor: '#14b8a6' }]} />
            </View>
            <Text style={styles.scoreHint}>Properly segregated waste earns bonus points</Text>
          </View>
        </View>

        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <MaterialCommunityIcons name="trending-up" size={20} color="#2d6a4f" />
            <Text style={styles.chartTitle}>14-Day Reporting Trend</Text>
          </View>
          <AreaChartComponent data={trendData} labels={trendLabels} height={200} />
        </View>

        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <MaterialCommunityIcons name="recycle" size={20} color="#52796f" />
            <Text style={styles.chartTitle}>Waste Type Breakdown</Text>
          </View>
          <PieChartComponent data={wasteData} colors={COLORS} height={200} />
          <View style={styles.legendRow}>
            {wasteData.map((w, i) => (
              <View key={i} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: COLORS[i % COLORS.length] }]} />
                <Text style={styles.legendText}>
                  {WASTE_LABELS[w.name] || w.name}: {w.value}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.helpCard}>
          <View style={styles.chartHeader}>
            <MaterialCommunityIcons name="trending-up" size={20} color="#52796f" />
            <Text style={styles.chartTitle}>How Your Data Helps</Text>
          </View>
          <View style={styles.helpRow}>
            {[
              { icon: 'home', title: 'You Report', desc: 'Your daily garbage & waste type data is recorded', bg: '#d8f3dc', color: '#2d6a4f' },
              { icon: 'truck', title: 'Drivers Collect', desc: 'AI optimizes routes based on your reports', bg: 'rgba(82,121,111,0.1)', color: '#52796f' },
              { icon: 'chart-bar', title: 'Admin Monitors', desc: 'Ward-level insights improve city services', bg: 'rgba(27,67,50,0.1)', color: '#1b4332' },
            ].map((item) => (
              <View key={item.title} style={[styles.helpItem, { backgroundColor: item.bg }]}>
                <MaterialCommunityIcons name={item.icon} size={28} color={item.color} />
                <Text style={[styles.helpTitle, { color: item.color }]}>{item.title}</Text>
                <Text style={[styles.helpDesc, { color: item.color }]}>{item.desc}</Text>
              </View>
            ))}
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
  statLabel: { fontSize: 11, color: '#78716c', marginTop: 4 },
  scoreRow: { gap: 12, marginBottom: 16 },
  scoreCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e7e5e4',
    padding: 20,
    marginBottom: 4,
  },
  scoreHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  scoreLabel: { fontSize: 13, color: '#78716c' },
  scoreValue: { fontSize: 28, fontWeight: '700', color: '#2d6a4f' },
  progressTrack: {
    height: 12,
    backgroundColor: '#e7e5e4',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 999 },
  scoreHint: { fontSize: 11, color: '#78716c', marginTop: 8 },
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
  legendText: { fontSize: 11, color: '#57534e' },
  helpCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e7e5e4',
    padding: 16,
    marginBottom: 24,
  },
  helpRow: { gap: 10 },
  helpItem: { borderRadius: 12, padding: 16, alignItems: 'center' },
  helpTitle: { fontSize: 14, fontWeight: '700', marginTop: 8 },
  helpDesc: { fontSize: 11, marginTop: 4, textAlign: 'center' },
});
