import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, Linking,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';

const ACHIEVEMENTS = [
  { icon: 'leaf',           color: '#16a34a', bg: '#f0fdf4', label: 'First Report',     unlocked: true },
  { icon: 'calendar-check', color: '#1d4ed8', bg: '#eff6ff', label: '7-Day Streak',     unlocked: false },
  { icon: 'recycle',        color: '#0d9488', bg: '#f0fdfa', label: 'Eco Warrior',       unlocked: false },
  { icon: 'trophy',         color: '#d97706', bg: '#fefce8', label: 'Zone Champion',     unlocked: false },
];

const LEADERBOARD = [
  { rank: 1, label: 'Zone A', pts: 3820 },
  { rank: 2, label: 'Zone B', pts: 3640 },
  { rank: 3, label: 'Zone C', pts: 3210 },
];

function SettingsRow({ icon, label, color = '#374151', onPress, danger }) {
  return (
    <TouchableOpacity style={styles.settingsRow} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.settingsIcon, { backgroundColor: danger ? '#fef2f2' : '#f5f5f4' }]}>
        <MaterialCommunityIcons name={icon} size={18} color={danger ? '#dc2626' : color} />
      </View>
      <Text style={[styles.settingsLabel, danger && { color: '#dc2626' }]}>{label}</Text>
      {!danger && <MaterialCommunityIcons name="chevron-right" size={18} color="#d1d5db" />}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [ecoScore] = useState(82); // Beta — fake value

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const progressWidth = `${ecoScore}%`;
  const ecoTier = ecoScore >= 80 ? 'Gold' : ecoScore >= 60 ? 'Silver' : 'Bronze';
  const ecoTierColor = ecoScore >= 80 ? '#d97706' : ecoScore >= 60 ? '#64748b' : '#c2410c';

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

      {/* Profile Hero */}
      <LinearGradient colors={['#1b4332', '#2d6a4f', '#40916c']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroBanner}>
        <View style={styles.avatarRing}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(user?.username || 'U')[0].toUpperCase()}</Text>
          </View>
        </View>
        <Text style={styles.heroName}>{user?.username}</Text>
        <Text style={styles.heroSub}>{user?.address}</Text>
        <View style={styles.heroBadgeRow}>
          <View style={styles.heroBadge}>
            <MaterialCommunityIcons name="home" size={13} color="#d8f3dc" />
            <Text style={styles.heroBadgeText}>{user?.house_id}</Text>
          </View>
          <View style={styles.heroBadge}>
            <MaterialCommunityIcons name="map-marker" size={13} color="#d8f3dc" />
            <Text style={styles.heroBadgeText}>{user?.ward}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Eco Score */}
      <View style={styles.scoreCard}>
        <View style={styles.scoreHeader}>
          <View style={styles.scoreTitleRow}>
            <MaterialCommunityIcons name="star-circle" size={20} color="#d97706" />
            <Text style={styles.scoreTitle}>Eco Score</Text>
            <View style={styles.betaBadge}><Text style={styles.betaText}>BETA</Text></View>
          </View>
          <View style={[styles.tierChip, { backgroundColor: `${ecoTierColor}18` }]}>
            <MaterialCommunityIcons name="trophy" size={14} color={ecoTierColor} />
            <Text style={[styles.tierChipText, { color: ecoTierColor }]}>{ecoTier} Member</Text>
          </View>
        </View>
        <View style={styles.scoreValueRow}>
          <Text style={styles.scoreValue}>{ecoScore}</Text>
          <Text style={styles.scoreMax}>/100</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: progressWidth }]} />
        </View>
        <Text style={styles.scoreHint}>Based on reporting consistency and waste segregation</Text>
      </View>

      {/* Achievements */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        <View style={styles.achieveGrid}>
          {ACHIEVEMENTS.map(a => (
            <View key={a.label} style={[styles.achieveItem, !a.unlocked && styles.achieveLocked]}>
              <View style={[styles.achieveIcon, { backgroundColor: a.unlocked ? a.bg : '#f5f5f4' }]}>
                <MaterialCommunityIcons name={a.icon} size={22} color={a.unlocked ? a.color : '#d1d5db'} />
              </View>
              <Text style={[styles.achieveLabel, !a.unlocked && styles.achieveLabelLocked]}>{a.label}</Text>
              {!a.unlocked && <MaterialCommunityIcons name="lock" size={11} color="#d1d5db" />}
            </View>
          ))}
        </View>
      </View>

      {/* Ward Leaderboard */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Ward Leaderboard</Text>
        {LEADERBOARD.map((z) => (
          <View key={z.rank} style={[styles.leaderRow, user?.ward === z.label && styles.leaderRowHighlight]}>
            <View style={[styles.leaderRank, { backgroundColor: z.rank === 1 ? '#fef3c7' : z.rank === 2 ? '#f1f5f9' : '#fff7ed' }]}>
              <Text style={[styles.leaderRankText, { color: z.rank === 1 ? '#b45309' : z.rank === 2 ? '#475569' : '#c2410c' }]}>#{z.rank}</Text>
            </View>
            <Text style={styles.leaderLabel}>{z.label}{user?.ward === z.label ? ' (You)' : ''}</Text>
            <View style={styles.leaderPts}>
              <MaterialCommunityIcons name="star-four-points" size={12} color="#2d6a4f" />
              <Text style={styles.leaderPtsText}>{z.pts.toLocaleString()}</Text>
            </View>
          </View>
        ))}
        <Text style={styles.leaderNote}>
          Top zones qualify for Municipal Green Rewards.{'\n'}Subject to approval by local authorities.
        </Text>
      </View>

      {/* Settings */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <SettingsRow icon="bell-outline" label="Notification Preferences" color="#1d4ed8" onPress={() => {}} />
        <SettingsRow icon="shield-check-outline" label="Privacy Policy" color="#2d6a4f" onPress={() => {}} />
        <View style={styles.divider} />
        <SettingsRow icon="phone-outline" label="Contact Municipality" color="#0284c7" onPress={() => Linking.openURL('tel:+911800')} />
        <SettingsRow icon="information-outline" label="About Smart Waste" color="#6366f1" onPress={() => {}} />
        <View style={styles.divider} />
        <SettingsRow icon="logout" label="Sign Out" danger onPress={handleLogout} />
      </View>

      <Text style={styles.versionText}>Smart Waste Management v1.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#f8faf8' },
  container: { paddingBottom: 48 },

  heroBanner: { padding: 28, alignItems: 'center', paddingTop: 32, paddingBottom: 28 },
  avatarRing: { width: 76, height: 76, borderRadius: 38, borderWidth: 3, borderColor: 'rgba(255,255,255,0.4)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 28, fontWeight: '800', color: '#fff' },
  heroName: { fontSize: 22, fontWeight: '800', color: '#fff' },
  heroSub: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 4, textAlign: 'center' },
  heroBadgeRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  heroBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  heroBadgeText: { color: '#d8f3dc', fontSize: 12, fontWeight: '700' },

  scoreCard: {
    backgroundColor: '#fff', margin: 16, marginBottom: 12, borderRadius: 18, padding: 18,
    borderWidth: 1, borderColor: '#fde68a',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  scoreHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  scoreTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  scoreTitle: { fontSize: 15, fontWeight: '700', color: '#1c1917' },
  betaBadge: { backgroundColor: '#fef3c7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  betaText: { fontSize: 9, fontWeight: '800', color: '#b45309', letterSpacing: 0.5 },
  tierChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  tierChipText: { fontSize: 12, fontWeight: '700' },
  scoreValueRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 2, marginBottom: 10 },
  scoreValue: { fontSize: 42, fontWeight: '900', color: '#d97706', lineHeight: 44 },
  scoreMax: { fontSize: 16, color: '#9ca3af', fontWeight: '600', marginBottom: 6 },
  progressTrack: { height: 10, backgroundColor: '#f5f5f4', borderRadius: 5, overflow: 'hidden', marginBottom: 8 },
  progressFill: { height: '100%', backgroundColor: '#d97706', borderRadius: 5 },
  scoreHint: { fontSize: 11, color: '#78716c' },

  sectionCard: {
    backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 12, borderRadius: 18, padding: 18,
    borderWidth: 1, borderColor: '#e7e5e4',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1c1917', marginBottom: 14 },

  achieveGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
  achieveItem: { width: '22%', alignItems: 'center', gap: 6 },
  achieveLocked: { opacity: 0.5 },
  achieveIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  achieveLabel: { fontSize: 10, fontWeight: '600', color: '#374151', textAlign: 'center' },
  achieveLabelLocked: { color: '#9ca3af' },

  leaderRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 10, paddingHorizontal: 10, borderRadius: 10, marginBottom: 6,
    backgroundColor: '#fafaf8',
  },
  leaderRowHighlight: { backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0' },
  leaderRank: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  leaderRankText: { fontSize: 12, fontWeight: '800' },
  leaderLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: '#1c1917' },
  leaderPts: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  leaderPtsText: { fontSize: 13, fontWeight: '700', color: '#2d6a4f' },
  leaderNote: { fontSize: 11, color: '#78716c', marginTop: 10, lineHeight: 16, textAlign: 'center' },

  settingsRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  settingsIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  settingsLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: '#374151' },
  divider: { height: 1, backgroundColor: '#f5f5f4', marginVertical: 4 },

  versionText: { textAlign: 'center', fontSize: 11, color: '#d1d5db', marginTop: 8 },
});
