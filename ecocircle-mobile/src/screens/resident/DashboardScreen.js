import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Animated,
  TouchableOpacity, FlatList, Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { shadows } from '../../styles/mobileTheme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ECO_TIPS = [
  { icon: 'leaf', color: '#16a34a', bg: '#f0fdf4', tip: 'Composting kitchen waste reduces landfill waste by up to 30%.' },
  { icon: 'water-outline', color: '#0284c7', bg: '#eff6ff', tip: 'Rinsing recyclables before reporting helps the sorting process.' },
  { icon: 'tree-outline', color: '#15803d', bg: '#f0fdf4', tip: 'Segregating waste properly earns bonus green points.' },
  { icon: 'recycle', color: '#0d9488', bg: '#f0fdfa', tip: 'Plastic bottles can be recycled into clothing fibres.' },
  { icon: 'battery-charging', color: '#d97706', bg: '#fefce8', tip: 'Never dispose batteries with mixed waste — they are hazardous.' },
];

export default function ResidentDashboardScreen() {
  const { user } = useAuth();
  const { residentState, fetchResidentData } = useApp();
  const [tipIndex, setTipIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const tipScrollRef = useRef(null);

  useFocusEffect(
    React.useCallback(() => {
      fetchResidentData();
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, [fetchResidentData])
  );

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
  const reportStatus = residentState.status;

  const statusLabel = reportStatus === 'collected' ? 'Collected ✓'
    : reportStatus !== 'not_reported' ? 'Awaiting Pickup'
    : 'Not Reported';
  const statusColor = reportStatus === 'collected' ? '#16a34a'
    : reportStatus !== 'not_reported' ? '#1d4ed8'
    : '#78716c';
  const statusBg = reportStatus === 'collected' ? '#f0fdf4'
    : reportStatus !== 'not_reported' ? '#eff6ff'
    : '#f5f5f4';
  const statusIcon = reportStatus === 'collected' ? 'check-circle'
    : reportStatus !== 'not_reported' ? 'clock-outline'
    : 'circle-outline';

  const rankDisplay = residentState.stats.rank;
  const windowOpen = residentState.windowOpen;

  const handleTipScroll = (e) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / (SCREEN_WIDTH - 32));
    setTipIndex(idx);
  };

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

          {/* Collection Status — citizen-friendly */}
          <View style={styles.windowRow}>
            <View style={styles.windowLeft}>
              <View style={[styles.windowDot, { backgroundColor: windowOpen ? '#4ade80' : '#fca5a5' }]} />
              <View>
                <Text style={styles.windowLabel}>Today's Collection</Text>
                <Text style={styles.windowTime}>
                  {windowOpen ? 'Reporting Open' : 'Reporting Closed'}
                </Text>
              </View>
            </View>
            <View style={[styles.windowBadge, { backgroundColor: windowOpen ? 'rgba(74,222,128,0.2)' : 'rgba(252,165,165,0.2)' }]}>
              <Text style={[styles.windowBadgeText, { color: windowOpen ? '#4ade80' : '#fca5a5' }]}>
                {windowOpen ? 'Report Now' : 'Next: 6:30 PM'}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Status Cards Row */}
        <View style={styles.statusRow}>
          <View style={[styles.statusCard, { backgroundColor: statusBg }]}>
            <MaterialCommunityIcons name={statusIcon} size={22} color={statusColor} />
            <Text style={[styles.statusCardValue, { color: statusColor }]} numberOfLines={1}>{statusLabel}</Text>
            <Text style={styles.statusCardLabel}>Today's Status</Text>
          </View>

          <View style={[styles.statusCard, { backgroundColor: '#fef9f0' }]}>
            <MaterialCommunityIcons name="star-circle" size={22} color="#d97706" />
            <Text style={[styles.statusCardValue, { color: '#d97706' }]}>{residentState.stats.points} pts</Text>
            <Text style={styles.statusCardLabel}>Green Points</Text>
          </View>

          <View style={[styles.statusCard, { backgroundColor: '#f0fdf4' }]}>
            <MaterialCommunityIcons name="trophy-outline" size={22} color="#2d6a4f" />
            <Text style={[styles.statusCardValue, { color: '#2d6a4f' }]}>{rankDisplay}</Text>
            <Text style={styles.statusCardLabel}>Ward Rank</Text>
          </View>
        </View>

        {/* Swipeable Eco Tips */}
        <View style={styles.tipsSection}>
          <View style={styles.tipsSectionHeader}>
            <MaterialCommunityIcons name="lightbulb-outline" size={15} color="#d97706" />
            <Text style={styles.tipsSectionTitle}>Eco Tips</Text>
          </View>
          <FlatList
            ref={tipScrollRef}
            data={ECO_TIPS}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleTipScroll}
            scrollEventThrottle={16}
            keyExtractor={(_, i) => String(i)}
            renderItem={({ item }) => (
              <View style={[styles.tipCard, { width: SCREEN_WIDTH - 32 }]}>
                <View style={[styles.tipIconBox, { backgroundColor: item.bg }]}>
                  <MaterialCommunityIcons name={item.icon} size={28} color={item.color} />
                </View>
                <Text style={styles.tipText}>{item.tip}</Text>
              </View>
            )}
          />
          {/* Dots */}
          <View style={styles.tipDots}>
            {ECO_TIPS.map((_, i) => (
              <View key={i} style={[styles.tipDot, i === tipIndex && styles.tipDotActive]} />
            ))}
          </View>
        </View>

        {/* Ward Leaderboard */}
        <View style={styles.leaderCard}>
          <View style={styles.leaderHeader}>
            <MaterialCommunityIcons name="trophy" size={18} color="#b45309" />
            <View style={{ flex: 1 }}>
              <Text style={styles.leaderTitle}>{user?.ward || 'Ward'} Leaderboard</Text>
              <Text style={styles.leaderSub}>Ranked by green points</Text>
            </View>
          </View>

          {residentState.leaderboard.slice(0, 5).map((entry) => {
            const isMe = entry.householdId === user?.house_id;
            const rankColors = [
              { bg: '#fef3c7', text: '#b45309' },
              { bg: '#f1f5f9', text: '#475569' },
              { bg: '#fff7ed', text: '#c2410c' },
            ];
            const rc = rankColors[entry.rank - 1] || { bg: '#f5f5f4', text: '#57534e' };
            return (
              <View key={entry.householdId} style={[styles.leaderRow, isMe && styles.leaderRowMe]}>
                <View style={[styles.leaderRankBadge, { backgroundColor: rc.bg }]}>
                  {entry.rank <= 3
                    ? <MaterialCommunityIcons name={entry.rank === 1 ? 'trophy' : 'medal'} size={14} color={rc.text} />
                    : <Text style={[styles.leaderRankText, { color: rc.text }]}>#{entry.rank}</Text>
                  }
                </View>
                <Text style={[styles.leaderName, isMe && styles.leaderNameMe]}>
                  {entry.householdId}{isMe ? ' (You)' : ''}
                </Text>
                <View style={styles.leaderPts}>
                  <MaterialCommunityIcons name="star-four-points" size={11} color="#2d6a4f" />
                  <Text style={styles.leaderPtsText}>{entry.points} pts</Text>
                </View>
              </View>
            );
          })}

          <TouchableOpacity style={styles.viewAllBtn}>
            <Text style={styles.viewAllText}>View Full Ranking →</Text>
          </TouchableOpacity>
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

  heroBanner: { borderRadius: 20, padding: 20, marginBottom: 16, ...shadows.md },
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
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)', ...shadows.sm,
  },
  statusCardValue: { fontSize: 11, fontWeight: '700', textAlign: 'center', marginTop: 2 },
  statusCardLabel: { fontSize: 10, color: '#78716c', textAlign: 'center', marginTop: 1 },

  tipsSection: { marginBottom: 16 },
  tipsSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  tipsSectionTitle: { fontSize: 13, fontWeight: '700', color: '#d97706', textTransform: 'uppercase', letterSpacing: 0.5 },
  tipCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#fde68a', ...shadows.sm,
  },
  tipIconBox: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  tipText: { flex: 1, fontSize: 14, color: '#44403c', lineHeight: 20 },
  tipDots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 10 },
  tipDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#d1d5db' },
  tipDotActive: { backgroundColor: '#2d6a4f', width: 18 },

  leaderCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: '#d8f3dc', ...shadows.sm,
  },
  leaderHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  leaderTitle: { fontSize: 15, fontWeight: '700', color: '#1c1917' },
  leaderSub: { fontSize: 11, color: '#78716c', marginTop: 1 },
  leaderRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 10, paddingHorizontal: 10, borderRadius: 10, marginBottom: 4,
    backgroundColor: '#fafaf8',
  },
  leaderRowMe: { backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0' },
  leaderRankBadge: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  leaderRankText: { fontSize: 11, fontWeight: '800' },
  leaderName: { flex: 1, fontSize: 14, fontWeight: '600', color: '#1c1917' },
  leaderNameMe: { color: '#2d6a4f' },
  leaderPts: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  leaderPtsText: { fontSize: 13, fontWeight: '700', color: '#2d6a4f' },
  viewAllBtn: { marginTop: 8, alignItems: 'center', paddingVertical: 8 },
  viewAllText: { fontSize: 13, color: '#2d6a4f', fontWeight: '700' },

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
