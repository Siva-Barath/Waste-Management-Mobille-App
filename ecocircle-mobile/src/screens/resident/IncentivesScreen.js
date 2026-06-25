import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Layout from '../../components/common/Layout';
import { borderRadius, spacing } from '../../utils/spacing';

const REWARD_TIERS = [
  { name: 'Seed', min: 0, max: 50 },
  { name: 'Sprout', min: 50, max: 150 },
  { name: 'Tree', min: 150, max: 300 },
  { name: 'Forest', min: 300, max: 500 },
  { name: 'Planet Saver', min: 500, max: Infinity },
];

export default function IncentivesScreen() {
  const currentTier = REWARD_TIERS[0];

  return (
    <Layout title="Rewards" subtitle="Green points & tiers">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Rewards & Incentives</Text>
          <Text style={styles.subtitle}>Earn points for responsible waste management</Text>
        </View>

        <View style={styles.pointsCard}>
          <View style={styles.pointsTop}>
            <View>
              <Text style={styles.pointsLabel}>Current Tier</Text>
              <View style={styles.pointsRow}>
                <MaterialCommunityIcons name="leaf" size={28} color="#d8f3dc" />
                <Text style={styles.pointsValue}>{currentTier.name}</Text>
              </View>
            </View>
            <View style={styles.tierBox}>
              <MaterialCommunityIcons name="recycle" size={32} color="#fff" />
              <Text style={styles.tierName}>Report Daily</Text>
              <Text style={styles.tierLabel}>to earn points</Text>
            </View>
          </View>
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
  earnRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
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
});
