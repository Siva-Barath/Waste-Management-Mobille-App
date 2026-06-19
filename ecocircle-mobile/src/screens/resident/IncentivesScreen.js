import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Layout from '../../components/common/Layout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../services/api';

const REWARD_TIERS = [
  { name: 'Seed', min: 0, max: 50 },
  { name: 'Sprout', min: 50, max: 150 },
  { name: 'Tree', min: 150, max: 300 },
  { name: 'Forest', min: 300, max: 500 },
  { name: 'Planet Saver', min: 500, max: Infinity },
];

export default function IncentivesScreen() {
  const [incentives, setIncentives] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/garbage/incentives')
      .then((res) => {
        setIncentives(res.data.incentives || []);
        setTotalPoints(res.data.totalPoints || 0);
      })
      .finally(() => setLoading(false));
  }, []);

  const currentTier =
    REWARD_TIERS.find((t) => totalPoints >= t.min && totalPoints < t.max) ||
    REWARD_TIERS[REWARD_TIERS.length - 1];
  const tierIndex = REWARD_TIERS.indexOf(currentTier);
  const nextTier = REWARD_TIERS[tierIndex + 1];
  const progress = nextTier
    ? ((totalPoints - currentTier.min) / (nextTier.min - currentTier.min)) * 100
    : 100;

  return (
    <Layout title="EcoCircle">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Rewards & Incentives</Text>
          <Text style={styles.subtitle}>Earn points for responsible waste management</Text>
        </View>

        <View style={styles.pointsCard}>
          <View style={styles.pointsTop}>
            <View>
              <Text style={styles.pointsLabel}>Total Green Points</Text>
              <View style={styles.pointsRow}>
                <MaterialCommunityIcons name="star-four-points" size={28} color="#d8f3dc" />
                <Text style={styles.pointsValue}>{totalPoints}</Text>
              </View>
            </View>
            <View style={styles.tierBox}>
              <MaterialCommunityIcons name="leaf" size={32} color="#fff" />
              <Text style={styles.tierName}>{currentTier.name}</Text>
              <Text style={styles.tierLabel}>Current Tier</Text>
            </View>
          </View>

          {nextTier && (
            <View style={styles.progressSection}>
              <View style={styles.progressLabels}>
                <Text style={styles.progressLabelText}>{currentTier.name}</Text>
                <Text style={styles.progressLabelText}>{nextTier.name}</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${Math.min(progress, 100)}%` }]} />
              </View>
              <Text style={styles.progressHint}>
                {nextTier.min - totalPoints} points to {nextTier.name}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.earnRow}>
          {[
            { icon: 'leaf', color: '#2d6a4f', bg: '#d8f3dc', title: '+5 Points', desc: 'Proper waste segregation' },
            { icon: 'trending-up', color: '#0d9488', bg: '#ccfbf1', title: '+2 Points', desc: 'Timely garbage collection' },
            { icon: 'gift', color: '#d97706', bg: '#fef3c7', title: 'Redeem', desc: 'Convert to rewards & discounts' },
          ].map((item) => (
            <View key={item.title} style={styles.earnCard}>
              <View style={[styles.earnIcon, { backgroundColor: item.bg }]}>
                <MaterialCommunityIcons name={item.icon} size={24} color={item.color} />
              </View>
              <Text style={styles.earnTitle}>{item.title}</Text>
              <Text style={styles.earnDesc}>{item.desc}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="star" size={20} color="#f59e0b" />
            <Text style={styles.cardTitle}>Points History</Text>
          </View>

          {loading ? (
            <LoadingSpinner />
          ) : incentives.length === 0 ? (
            <View style={styles.empty}>
              <MaterialCommunityIcons name="star-outline" size={48} color="#d6d3d1" />
              <Text style={styles.emptyText}>No points earned yet. Start reporting to earn!</Text>
            </View>
          ) : (
            <FlatList
              data={incentives}
              keyExtractor={(item, index) => `${item.date}-${index}`}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={styles.historyItem}>
                  <View style={styles.historyLeft}>
                    <View style={styles.historyIcon}>
                      <MaterialCommunityIcons name="star-four-points" size={20} color="#2d6a4f" />
                    </View>
                    <View>
                      <Text style={styles.historyReason}>{item.reason}</Text>
                      <Text style={styles.historyDate}>{item.date}</Text>
                    </View>
                  </View>
                  <Text style={styles.historyPoints}>+{item.points}</Text>
                </View>
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
  pointsCard: {
    backgroundColor: '#2d6a4f',
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
  },
  pointsTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
  },
  pointsLabel: { color: '#d8f3dc', fontSize: 13, marginBottom: 4 },
  pointsRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pointsValue: { fontSize: 44, fontWeight: '800', color: '#fff' },
  tierBox: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    minWidth: 120,
  },
  tierName: { color: '#fff', fontSize: 16, fontWeight: '700', marginTop: 8 },
  tierLabel: { color: '#d8f3dc', fontSize: 11, marginTop: 2 },
  progressSection: { marginTop: 24 },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabelText: { color: '#d8f3dc', fontSize: 12 },
  progressTrack: {
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#fff', borderRadius: 999 },
  progressHint: { color: '#d8f3dc', fontSize: 11, textAlign: 'center', marginTop: 8 },
  earnRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  earnCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e7e5e4',
    padding: 16,
    alignItems: 'center',
  },
  earnIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  earnTitle: { fontSize: 14, fontWeight: '700', color: '#1c1917' },
  earnDesc: { fontSize: 12, color: '#78716c', marginTop: 4, textAlign: 'center' },
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
  emptyText: { marginTop: 12, color: '#78716c', fontSize: 14, textAlign: 'center' },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f4',
  },
  historyLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#d8f3dc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyReason: { fontSize: 14, fontWeight: '600', color: '#1c1917' },
  historyDate: { fontSize: 12, color: '#78716c', marginTop: 2 },
  historyPoints: { fontSize: 18, fontWeight: '700', color: '#2d6a4f' },
});
