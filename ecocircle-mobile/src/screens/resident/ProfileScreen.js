import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, Linking,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

const ACHIEVEMENTS = [
  { icon: 'sprout',           color: '#16a34a', bg: '#f0fdf4', label: 'First Report',   desc: 'Submitted first report',   unlocked: true  },
  { icon: 'fire',             color: '#dc2626', bg: '#fef2f2', label: '7-Day Streak',   desc: '7 days in a row',          unlocked: false },
  { icon: 'recycle',          color: '#0d9488', bg: '#f0fdfa', label: 'Eco Warrior',    desc: '20 collections',           unlocked: false },
  { icon: 'trophy',           color: '#d97706', bg: '#fefce8', label: 'Top 10 Ward',    desc: 'Reached top 10',           unlocked: false },
  { icon: 'star-circle',      color: '#7c3aed', bg: '#f5f3ff', label: '100 Points',     desc: 'Earned 100 green points',  unlocked: false },
  { icon: 'medal',            color: '#0284c7', bg: '#eff6ff', label: '1 Year Member',  desc: 'Active for 1 year',        unlocked: false },
];

const LANGUAGES = ['English', 'Tamil'];

function SettingsRow({ icon, label, color = '#374151', value, onPress, danger }) {
  return (
    <TouchableOpacity style={styles.settingsRow} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.settingsIcon, { backgroundColor: danger ? '#fef2f2' : '#f5f5f4' }]}>
        <MaterialCommunityIcons name={icon} size={18} color={danger ? '#dc2626' : color} />
      </View>
      <Text style={[styles.settingsLabel, danger && { color: '#dc2626' }]}>{label}</Text>
      {value ? <Text style={styles.settingsValue}>{value}</Text> : null}
      {!danger && <MaterialCommunityIcons name="chevron-right" size={18} color="#d1d5db" />}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { residentState } = useApp();
  const [language, setLanguage] = useState('English');

  const stats = residentState.stats;
  const leaderboard = residentState.leaderboard.slice(0, 5);
  const ecoScore = residentState.stats.ecoScore;

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const toggleLanguage = () => {
    Alert.alert('Language', 'Select language', [
      { text: 'English', onPress: () => setLanguage('English') },
      { text: 'Tamil', onPress: () => setLanguage('Tamil') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const ecoLevel = ecoScore >= 80 ? 'Green Citizen' : ecoScore >= 60 ? 'Eco Starter' : 'New Member';
  const ecoLevelColor = ecoScore >= 80 ? '#16a34a' : ecoScore >= 60 ? '#0284c7' : '#78716c';
  const ecoLevelBg = ecoScore >= 80 ? '#f0fdf4' : ecoScore >= 60 ? '#eff6ff' : '#f5f5f4';
  const ecoLevelIcon = ecoScore >= 80 ? 'leaf-circle' : ecoScore >= 60 ? 'sprout' : 'account-outline';

  const myRank = leaderboard.findIndex(e => e.isCurrentUser);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

      {/* Hero */}
      <LinearGradient colors={['#1b4332', '#2d6a4f', '#40916c']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroBanner}>
        <View style={styles.avatarRing}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(user?.username || 'U')[0].toUpperCase()}</Text>
          </View>
        </View>
        <Text style={styles.heroName}>{user?.username}</Text>
        <Text style={styles.heroSub}>{user?.house_id} · {user?.ward}</Text>
        <View style={[styles.ecoLevelBadge, { backgroundColor: ecoLevelBg }]}>
          <MaterialCommunityIcons name={ecoLevelIcon} size={14} color={ecoLevelColor} />
          <Text style={[styles.ecoLevelText, { color: ecoLevelColor }]}>{ecoLevel}</Text>
        </View>
      </LinearGradient>

      {/* Eco Score */}
      <View style={styles.scoreCard}>
        <View style={styles.scoreHeader}>
          <View style={styles.scoreTitleRow}>
            <MaterialCommunityIcons name="star-circle" size={20} color="#d97706" />
            <Text style={styles.scoreTitle}>Eco Score</Text>
          </View>
          <View style={[styles.tierChip, { backgroundColor: `${ecoLevelColor}18` }]}>
            <MaterialCommunityIcons name={ecoLevelIcon} size={14} color={ecoLevelColor} />
            <Text style={[styles.tierChipText, { color: ecoLevelColor }]}>{ecoLevel}</Text>
          </View>
        </View>
        <View style={styles.scoreValueRow}>
          <Text style={styles.scoreValue}>{ecoScore}</Text>
          <Text style={styles.scoreMax}>/100</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${ecoScore}%` }]} />
        </View>
        <Text style={styles.scoreHint}>Based on reporting consistency and waste segregation</Text>
      </View>

      {/* Statistics */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Statistics</Text>
        <View style={styles.statsGrid}>
          {[
            { val: stats.total,     label: 'Lifetime Reports', icon: 'clipboard-list-outline', color: '#1d4ed8' },
            { val: stats.collected, label: 'Collections',       icon: 'check-circle-outline',  color: '#16a34a' },
            { val: stats.points,    label: 'Green Points',      icon: 'star-circle',            color: '#d97706' },
            { val: stats.rank, label: 'Current Rank', icon: 'trophy-outline', color: '#7c3aed' },
          ].map(s => (
            <View key={s.label} style={styles.statItem}>
              <View style={[styles.statIcon, { backgroundColor: `${s.color}14` }]}>
                <MaterialCommunityIcons name={s.icon} size={20} color={s.color} />
              </View>
              <Text style={[styles.statValue, { color: s.color }]}>{s.val}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Monthly Progress */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Monthly Progress</Text>
        <View style={styles.progressRow}>
          <View style={styles.progressBar}>
            <View style={[styles.progressBarFill, {
              width: `${stats.total > 0 ? Math.min((stats.collected / Math.max(stats.total, 25)) * 100, 100) : 0}%`
            }]} />
          </View>
          <Text style={styles.progressLabel}>{stats.collected} / {Math.max(stats.total, 25)} reports</Text>
        </View>
        <View style={styles.monthlyStats}>
          <View style={styles.monthlyItem}>
            <Text style={styles.monthlyVal}>{stats.rank}</Text>
            <Text style={styles.monthlyLabel}>Rank</Text>
          </View>
          <View style={styles.monthlyDivider} />
          <View style={styles.monthlyItem}>
            <Text style={styles.monthlyVal}>{stats.points}</Text>
            <Text style={styles.monthlyLabel}>Points</Text>
          </View>
        </View>
      </View>

      {/* Achievements */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        <View style={styles.achieveGrid}>
          {ACHIEVEMENTS.map(a => (
            <View key={a.label} style={[styles.achieveItem, !a.unlocked && styles.achieveLocked]}>
              <View style={[styles.achieveIcon, { backgroundColor: a.unlocked ? a.bg : '#f5f5f4', borderColor: a.unlocked ? a.color + '44' : '#e7e5e4' }]}>
                <MaterialCommunityIcons name={a.icon} size={22} color={a.unlocked ? a.color : '#d1d5db'} />
              </View>
              <Text style={[styles.achieveLabel, !a.unlocked && styles.achieveLabelLocked]}>{a.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Ward Leaderboard */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>{user?.ward || 'Ward'} Leaderboard</Text>
        {leaderboard.map((entry) => {
          const isMe = entry.isCurrentUser;
          const rankColors = [
            { bg: '#fef3c7', text: '#b45309' },
            { bg: '#f1f5f9', text: '#475569' },
            { bg: '#fff7ed', text: '#c2410c' },
          ];
          const rc = rankColors[entry.rank - 1] || { bg: '#f5f5f4', text: '#57534e' };
          return (
            <View key={entry.householdId} style={[styles.leaderRow, isMe && styles.leaderRowHighlight]}>
              <View style={[styles.leaderRank, { backgroundColor: rc.bg }]}>
                {entry.rank <= 3
                  ? <MaterialCommunityIcons name={entry.rank === 1 ? 'trophy' : 'medal'} size={14} color={rc.text} />
                  : <Text style={[styles.leaderRankText, { color: rc.text }]}>#{entry.rank}</Text>
                }
              </View>
              <Text style={[styles.leaderLabel, isMe && { color: '#2d6a4f', fontWeight: '700' }]}>
                {entry.householdId}{isMe ? ' (You)' : ''}
              </Text>
              <View style={styles.leaderPts}>
                <MaterialCommunityIcons name="star-four-points" size={12} color="#2d6a4f" />
                <Text style={styles.leaderPtsText}>{entry.points} pts</Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Settings */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <SettingsRow icon="translate"           label="Language"                color="#7c3aed" value={language} onPress={toggleLanguage} />
        <SettingsRow icon="bell-outline"        label="Notification Preferences" color="#1d4ed8" onPress={() => {}} />
        <SettingsRow icon="shield-check-outline" label="Privacy Policy"          color="#2d6a4f" onPress={() => {}} />
        <View style={styles.divider} />
        <SettingsRow icon="phone-outline"       label="Contact Municipality"    color="#0284c7" onPress={() => Linking.openURL('tel:+911800')} />
        <SettingsRow icon="information-outline" label="About EcoCircle"         color="#6366f1" onPress={() => {}} />
        <View style={styles.divider} />
        <SettingsRow icon="logout"              label="Sign Out"                danger onPress={handleLogout} />
      </View>

      <Text style={styles.versionText}>EcoCircle v1.0 · Smart Waste Management</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#f8faf8' },
  container: { paddingBottom: 48 },

  heroBanner: { padding: 28, alignItems: 'center', paddingTop: 32, paddingBottom: 24 },
  avatarRing: { width: 76, height: 76, borderRadius: 38, borderWidth: 3, borderColor: 'rgba(255,255,255,0.35)', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 28, fontWeight: '800', color: '#fff' },
  heroName: { fontSize: 22, fontWeight: '800', color: '#fff' },
  heroSub: { fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 4 },
  ecoLevelBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  ecoLevelText: { fontSize: 13, fontWeight: '700' },

  scoreCard: {
    backgroundColor: '#fff', margin: 16, marginBottom: 12, borderRadius: 18, padding: 18,
    borderWidth: 1, borderColor: '#fde68a',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  scoreHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  scoreTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  scoreTitle: { fontSize: 15, fontWeight: '700', color: '#1c1917' },
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

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statItem: { width: '47%', backgroundColor: '#fafaf8', borderRadius: 14, padding: 14, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: '#f0f0ee' },
  statIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 11, color: '#78716c', textAlign: 'center' },

  progressRow: { gap: 8, marginBottom: 14 },
  progressBar: { height: 12, backgroundColor: '#f0fdf4', borderRadius: 6, overflow: 'hidden', borderWidth: 1, borderColor: '#bbf7d0' },
  progressBarFill: { height: '100%', backgroundColor: '#2d6a4f', borderRadius: 6 },
  progressLabel: { fontSize: 12, color: '#166534', fontWeight: '600', textAlign: 'right' },
  monthlyStats: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24 },
  monthlyDivider: { width: 1, height: 32, backgroundColor: '#e7e5e4' },
  monthlyItem: { alignItems: 'center', gap: 2 },
  monthlyVal: { fontSize: 20, fontWeight: '800', color: '#1c1917' },
  monthlyLabel: { fontSize: 11, color: '#78716c' },

  achieveGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  achieveItem: { width: '30%', alignItems: 'center', gap: 6 },
  achieveLocked: { opacity: 0.45 },
  achieveIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  achieveLabel: { fontSize: 10, fontWeight: '600', color: '#374151', textAlign: 'center', lineHeight: 14 },
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

  settingsRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  settingsIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  settingsLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: '#374151' },
  settingsValue: { fontSize: 13, color: '#78716c', fontWeight: '500', marginRight: 4 },
  divider: { height: 1, backgroundColor: '#f5f5f4', marginVertical: 4 },

  versionText: { textAlign: 'center', fontSize: 11, color: '#d1d5db', marginTop: 8 },
});
