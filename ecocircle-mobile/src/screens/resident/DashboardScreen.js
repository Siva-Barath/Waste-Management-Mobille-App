import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Animated,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { colors } from '../../utils/colors';
import { shadows } from '../../styles/mobileTheme';

const ECO_TIPS = [
  { icon: 'leaf', color: '#16a34a', tip: 'Composting kitchen waste reduces landfill waste by up to 30%.' },
  { icon: 'water-outline', color: '#0284c7', tip: 'Rinsing recyclables before reporting helps the sorting process.' },
  { icon: 'tree-outline', color: '#15803d', tip: 'Segregating waste properly earns your ward more green points.' },
  { icon: 'recycle', color: '#0d9488', tip: 'Plastic bottles can be recycled into clothing fibres.' },
  { icon: 'battery-charging', color: '#d97706', tip: 'Never dispose batteries with mixed waste — they are hazardous.' },
];

export default function ResidentDashboardScreen() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [windowOpen, setWindowOpen] = useState(false);
  const [tipIndex] = useState(() => Math.floor(Math.random() * ECO_TIPS.length));
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    React.useCallback(() => {
      if (user?.house_id) {
        api.get(`/resident/profile/${user.house_id}`)
          .then(res => setProfileData(res.data))
          .catch(() => {});
      }
      api.get('/resident/window_status')
        .then(res => setWindowOpen(res.data?.window_open === true))
        .catch(() => setWindowOpen(false));
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, [user])
  );

  useEffect(() => {
    const t = setInterval(() => {
      api.get('/resident/window_status')
        .then(res => setWindowOpen(res.data?.window_open === true))
        .catch(() => {});
    }, 15000);
    return () => clearInterval(t);
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const tip = ECO_TIPS[tipIndex];
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
  const reportStatus = profileData?.status || 'not_reported';
  const hasGarbage = profileData?.has_garbage === true;

  const statusLabel = reportStatus === 'collected' ? 'Collected ✓'
    : reportStatus === 'reported' ? 'Reported — Awaiting Collection'
    : 'Not Reported';
  const statusColor = reportStatus === 'collected' ? '#16a34a'
    : reportStatus === 'reported' ? '#1d4ed8'
    : '#78716c';
  const statusBg = reportStatus === 'collected' ? '#f0fdf4'
    : reportStatus === 'reported' ? '#eff6ff'
    : '#f5f5f4';

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Animated.View style={{ opacity: fadeAnim }}>

        {/* Hero Banner */}
        <LinearGradient
          colors={['#1b4332', '#2d6a4f', '#40916c']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.heroBanner}
        >
          <View style={styles.heroTop}>
            <View style={styles.heroLeft}>
              <Text style={styles.heroGreeting}>{greeting()}</Text>
              <Text style={styles.heroName}>{user?.username} 👋</Text>
              <Text style={styles.heroDate}>{today}</Text>
            </View>
            <View style={styles.houseChip}>
              <MaterialCommunityIcons name="home" size={14} color="#d8f3dc" />
              <Text style={styles.houseChipText}>{user?.house_id}</Text>
            </View>
          </View>

          <View style={styles.heroDivider} />

          {/* Reporting Window */}
          <View style={styles.windowRow}>
            <View style={styles.windowLeft}>
              <View style={[styles.windowDot, { backgroundColor: windowOpen ? '#4ade80' : '#fca5a5' }]} />
              <View>
                <Text style={styles.windowLabel}>Reporting Window</Text>
                <Text style={styles.windowTime}>Admin Controlled</Text>
              </View>
            </View>
            <View style={[styles.windowBadge, { backgroundColor: windowOpen ? 'rgba(74,222,128,0.2)' : 'rgba(252,165,165,0.2)' }]}>
              <Text style={[styles.windowBadgeText, { color: windowOpen ? '#4ade80' : '#fca5a5' }]}>
                {windowOpen ? 'Open — Report Now' : 'Closed'}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Status Cards Row */}
        <View style={styles.statusRow}>
          <View style={[styles.statusCard, { backgroundColor: statusBg }]}>
            <MaterialCommunityIcons
              name={reportStatus === 'collected' ? 'check-circle' : reportStatus === 'reported' ? 'clock-outline' : 'circle-outline'}
              size={22} color={statusColor}
            />
            <Text style={[styles.statusCardValue, { color: statusColor }]} numberOfLines={1}>{statusLabel}</Text>
            <Text style={styles.statusCardLabel}>Today's Status</Text>
          </View>

          <View style={[styles.statusCard, { backgroundColor: '#fef9f0' }]}>
            <MaterialCommunityIcons name="star-circle" size={22} color="#d97706" />
            <Text style={[styles.statusCardValue, { color: '#d97706' }]}>82%</Text>
            <Text style={styles.statusCardLabel}>Eco Score (Beta)</Text>
          </View>

          <View style={[styles.statusCard, { backgroundColor: '#f0f9ff' }]}>
            <MaterialCommunityIcons name="map-marker-check" size={22} color="#0284c7" />
            <Text style={[styles.statusCardValue, { color: '#0284c7' }]}>{user?.ward || '—'}</Text>
            <Text style={styles.statusCardLabel}>Your Zone</Text>
          </View>
        </View>

        {/* Today's Eco Tip */}
        <View style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <MaterialCommunityIcons name="lightbulb-outline" size={16} color="#d97706" />
            <Text style={styles.tipHeaderText}>Today's Eco Tip</Text>
          </View>
          <View style={styles.tipBody}>
            <View style={[styles.tipIconBox, { backgroundColor: '#f0fdf4' }]}>
              <MaterialCommunityIcons name={tip.icon} size={28} color={tip.color} />
            </View>
            <Text style={styles.tipText}>{tip.tip}</Text>
          </View>
        </View>

        {/* Community Impact */}
        <View style={styles.communityCard}>
          <View style={styles.communityHeader}>
            <MaterialCommunityIcons name="account-group" size={18} color="#2d6a4f" />
            <Text style={styles.communityTitle}>Zone Leaderboard</Text>
          </View>
          {[
            { zone: 'Zone A', pts: 3820, rank: 1 },
            { zone: 'Zone B', pts: 3640, rank: 2 },
            { zone: 'Zone C', pts: 3210, rank: 3 },
          ].map((z) => (
            <View key={z.zone} style={[styles.zoneRow, user?.ward === z.zone && styles.zoneRowHighlight]}>
              <View style={[styles.rankBadge, { backgroundColor: z.rank === 1 ? '#fef3c7' : z.rank === 2 ? '#f1f5f9' : '#fff7ed' }]}>
                <Text style={[styles.rankText, { color: z.rank === 1 ? '#b45309' : z.rank === 2 ? '#475569' : '#c2410c' }]}>
                  #{z.rank}
                </Text>
              </View>
              <Text style={styles.zoneName}>{z.zone}{user?.ward === z.zone ? ' (You)' : ''}</Text>
              <View style={styles.ptsRow}>
                <MaterialCommunityIcons name="star-four-points" size={12} color="#2d6a4f" />
                <Text style={styles.ptsText}>{z.pts.toLocaleString()} pts</Text>
              </View>
            </View>
          ))}
          <Text style={styles.communityNote}>
            Top zones are eligible for Municipal Green Rewards at month end.
          </Text>
        </View>

        {/* Waste Segregation Guide */}
        <View style={styles.guideCard}>
          <View style={styles.guideHeader}>
            <MaterialCommunityIcons name="information-outline" size={16} color="#2d6a4f" />
            <Text style={styles.guideTitle}>Waste Segregation Guide</Text>
          </View>
          {[
            { icon: 'leaf', color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0', label: 'Organic', items: ['Food scraps & peels', 'Garden leaves', 'Tea/Coffee grounds'] },
            { icon: 'recycle', color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe', label: 'Recyclable', items: ['Plastic bottles', 'Paper & cardboard', 'Glass & metals'] },
            { icon: 'alert-circle-outline', color: '#dc2626', bg: '#fef2f2', border: '#fecaca', label: 'Hazardous', items: ['Batteries & e-waste', 'Paints & chemicals', 'Medical waste'] },
            { icon: 'trash-can-outline', color: '#b45309', bg: '#fefce8', border: '#fde68a', label: 'Mixed', items: ['Diapers & pads', 'Broken ceramics', 'Composite packs'] },
          ].map((g) => (
            <View key={g.label} style={[styles.guideRow, { backgroundColor: g.bg, borderColor: g.border }]}>
              <View style={styles.guideRowLeft}>
                <MaterialCommunityIcons name={g.icon} size={20} color={g.color} />
                <Text style={[styles.guideRowLabel, { color: g.color }]}>{g.label}</Text>
              </View>
              <View style={styles.guideItems}>
                {g.items.map(it => (
                  <View key={it} style={styles.guideItem}>
                    <MaterialCommunityIcons name="check-circle" size={12} color={g.color} />
                    <Text style={[styles.guideItemText, { color: g.color }]}>{it}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#f8faf8' },
  container: { padding: 16, paddingBottom: 48 },

  heroBanner: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    ...shadows.md,
  },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  heroLeft: { flex: 1 },
  heroGreeting: { fontSize: 13, color: 'rgba(255,255,255,0.75)', fontWeight: '500' },
  heroName: { fontSize: 24, fontWeight: '800', color: '#fff', marginTop: 2 },
  heroDate: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  houseChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
  },
  houseChipText: { color: '#d8f3dc', fontSize: 13, fontWeight: '700' },
  heroDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginVertical: 16 },
  windowRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  windowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  windowDot: { width: 8, height: 8, borderRadius: 4 },
  windowLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
  windowTime: { fontSize: 14, color: '#fff', fontWeight: '700', marginTop: 1 },
  windowBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  windowBadgeText: { fontSize: 12, fontWeight: '700' },

  statusRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statusCard: {
    flex: 1, borderRadius: 14, padding: 12, alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)',
    ...shadows.sm,
  },
  statusCardValue: { fontSize: 11, fontWeight: '700', textAlign: 'center', marginTop: 2 },
  statusCardLabel: { fontSize: 10, color: '#78716c', textAlign: 'center', marginTop: 1 },

  tipCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: '#fde68a', ...shadows.sm,
  },
  tipHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  tipHeaderText: { fontSize: 12, fontWeight: '700', color: '#d97706', textTransform: 'uppercase', letterSpacing: 0.5 },
  tipBody: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  tipIconBox: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  tipText: { flex: 1, fontSize: 14, color: '#44403c', lineHeight: 20 },

  communityCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: '#d8f3dc', ...shadows.sm,
  },
  communityHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  communityTitle: { fontSize: 15, fontWeight: '700', color: '#1c1917' },
  zoneRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 10, paddingHorizontal: 12,
    borderRadius: 10, marginBottom: 6,
    backgroundColor: '#fafaf8',
  },
  zoneRowHighlight: { backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0' },
  rankBadge: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  rankText: { fontSize: 12, fontWeight: '800' },
  zoneName: { flex: 1, fontSize: 14, fontWeight: '600', color: '#1c1917' },
  ptsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ptsText: { fontSize: 13, fontWeight: '700', color: '#2d6a4f' },
  communityNote: { fontSize: 11, color: '#78716c', marginTop: 8, lineHeight: 16, textAlign: 'center' },

  guideCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 8,
    borderWidth: 1, borderColor: '#e7e5e4', ...shadows.sm,
  },
  guideHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 },
  guideTitle: { fontSize: 15, fontWeight: '700', color: '#1c1917' },
  guideRow: {
    borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 8,
    flexDirection: 'row', gap: 12, alignItems: 'flex-start',
  },
  guideRowLeft: { alignItems: 'center', gap: 4, width: 60 },
  guideRowLabel: { fontSize: 11, fontWeight: '700', textAlign: 'center' },
  guideItems: { flex: 1, gap: 4 },
  guideItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  guideItemText: { fontSize: 12, fontWeight: '500' },
});
