import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { colors } from '../../utils/colors';
import { shadows } from '../../styles/mobileTheme';

// Workflow stages driven by backend status
const STAGES = [
  { key: 'reported',    label: 'Report Submitted',       icon: 'check-circle-outline',    activeColor: '#2d6a4f' },
  { key: 'optimizing', label: 'Route Optimization',      icon: 'map-marker-path',          activeColor: '#0284c7' },
  { key: 'assigned',   label: 'Driver Assigned',         icon: 'truck-delivery-outline',   activeColor: '#7c3aed' },
  { key: 'en_route',   label: 'Truck En Route',          icon: 'truck-fast-outline',       activeColor: '#d97706' },
  { key: 'collected',  label: 'Garbage Collected',       icon: 'recycle',                  activeColor: '#16a34a' },
];

function getStageIndex(status) {
  if (!status || status === 'not_reported') return -1;
  if (status === 'reported')   return 0;
  if (status === 'optimizing') return 1;
  if (status === 'assigned')   return 2;
  if (status === 'en_route')   return 3;
  if (status === 'collected')  return 4;
  return 0;
}

function getWindowPhaseLabel(stageIdx) {
  if (stageIdx < 0)  return 'Report garbage during the collection window\n(6:30 PM – 7:30 AM)';
  if (stageIdx === 0) return 'Reporting window closed. Route optimization in progress.';
  if (stageIdx === 1) return 'Calculating optimal routes for your zone.';
  if (stageIdx === 2) return 'A driver has been assigned to your zone.';
  if (stageIdx === 3) return 'Your truck is on its way.';
  return 'Your garbage has been collected. Thank you!';
}

export default function ResidentCollectionsScreen() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const fetchStatus = async () => {
    if (!user?.house_id) return;
    try {
      const res = await api.get(`/resident/profile/${user.house_id}`);
      setData(res.data);
    } catch { /* show empty */ }
    finally {
      setLoading(false);
      Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchStatus();
      const t = setInterval(fetchStatus, 30000);
      return () => clearInterval(t);
    }, [user])
  );

  const status = data?.status || 'not_reported';
  const stageIdx = getStageIndex(status);
  const phaseNote = getWindowPhaseLabel(stageIdx);
  const isCollected = status === 'collected';

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={['#1b4332', '#2d6a4f']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={styles.headerBanner}
      >
        <View>
          <Text style={styles.headerEyebrow}>LIVE TRACKING</Text>
          <Text style={styles.headerTitle}>Today's Collection</Text>
          <Text style={styles.headerSub}>Auto-refreshes every 30 seconds</Text>
        </View>
        <View style={[styles.headerStatusChip, { backgroundColor: isCollected ? '#4ade80' : stageIdx >= 0 ? '#fbbf24' : '#94a3b8' }]}>
          <Text style={styles.headerStatusText}>
            {isCollected ? 'Done' : stageIdx >= 0 ? 'Active' : 'Pending'}
          </Text>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingBox}>
          <MaterialCommunityIcons name="loading" size={32} color="#2d6a4f" />
          <Text style={styles.loadingText}>Fetching status...</Text>
        </View>
      ) : stageIdx < 0 ? (
        /* Not reported yet */
        <View style={styles.emptyBox}>
          <MaterialCommunityIcons name="trash-can-outline" size={56} color="#d1d5db" />
          <Text style={styles.emptyTitle}>Nothing Reported Yet</Text>
          <Text style={styles.emptyDesc}>
            Use the Report tab during the collection window{'\n'}(6:30 PM – 7:30 AM) to schedule a pickup.
          </Text>
        </View>
      ) : (
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Phase note */}
          <View style={styles.phaseNote}>
            <MaterialCommunityIcons name="information-outline" size={16} color="#0284c7" />
            <Text style={styles.phaseNoteText}>{phaseNote}</Text>
          </View>

          {/* Timeline */}
          <View style={styles.timelineCard}>
            <Text style={styles.timelineTitle}>Collection Workflow</Text>
            {STAGES.map((stage, i) => {
              const isDone = i <= stageIdx;
              const isCurrent = i === stageIdx;
              return (
                <View key={stage.key} style={styles.stageRow}>
                  {/* Left connector */}
                  <View style={styles.stageConnector}>
                    <View style={[
                      styles.stageDot,
                      isDone && { backgroundColor: stage.activeColor, borderColor: stage.activeColor },
                      isCurrent && styles.stageDotCurrent,
                    ]}>
                      {isDone && (
                        <MaterialCommunityIcons
                          name={isCurrent ? stage.icon : 'check'}
                          size={isCurrent ? 14 : 12}
                          color="#fff"
                        />
                      )}
                    </View>
                    {i < STAGES.length - 1 && (
                      <View style={[styles.stageLine, isDone && i < stageIdx && { backgroundColor: '#2d6a4f' }]} />
                    )}
                  </View>

                  {/* Content */}
                  <View style={[styles.stageContent, isCurrent && { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }]}>
                    <View style={styles.stageTop}>
                      <Text style={[styles.stageLabel, isDone && { color: '#1c1917', fontWeight: '700' }]}>
                        {stage.label}
                      </Text>
                      {isDone && !isCurrent && (
                        <View style={[styles.doneBadge, { backgroundColor: `${stage.activeColor}18` }]}>
                          <MaterialCommunityIcons name="check" size={11} color={stage.activeColor} />
                          <Text style={[styles.doneBadgeText, { color: stage.activeColor }]}>Done</Text>
                        </View>
                      )}
                      {isCurrent && (
                        <View style={styles.activeBadge}>
                          <View style={styles.activePulse} />
                          <Text style={styles.activeBadgeText}>Active</Text>
                        </View>
                      )}
                    </View>
                    {isCurrent && data?.truck_id && (
                      <Text style={styles.stageMeta}>Truck: {data.truck_id}</Text>
                    )}
                    {isCurrent && data?.eta && (
                      <Text style={styles.stageETA}>ETA: {data.eta}</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>

          {/* House info */}
          <View style={styles.houseCard}>
            <MaterialCommunityIcons name="home-city-outline" size={20} color="#2d6a4f" />
            <View style={{ flex: 1 }}>
              <Text style={styles.houseId}>{user?.house_id}</Text>
              <Text style={styles.houseAddr}>{user?.address}</Text>
            </View>
            <View style={styles.wardChip}>
              <Text style={styles.wardChipText}>{user?.ward}</Text>
            </View>
          </View>
        </Animated.View>
      )}

      {/* Info box */}
      <View style={styles.infoBox}>
        <MaterialCommunityIcons name="clock-time-four-outline" size={18} color="#0284c7" />
        <View style={{ flex: 1 }}>
          <Text style={styles.infoTitle}>Collection Window</Text>
          <Text style={styles.infoDesc}>
            Report garbage between 6:30 PM and 7:30 AM. Routes are optimised after the window closes and drivers are deployed at dawn.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#f8faf8' },
  container: { padding: 16, paddingBottom: 48 },

  headerBanner: {
    borderRadius: 20, padding: 20, marginBottom: 16,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    ...shadows.md,
  },
  headerEyebrow: { fontSize: 10, color: 'rgba(255,255,255,0.6)', letterSpacing: 1.5, fontWeight: '700', marginBottom: 4 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  headerStatusChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  headerStatusText: { fontSize: 12, fontWeight: '800', color: '#1c1917' },

  loadingBox: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  loadingText: { fontSize: 14, color: '#78716c' },

  emptyBox: {
    alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24,
    backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: '#e7e5e4',
    marginBottom: 16, gap: 10,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#374151' },
  emptyDesc: { fontSize: 13, color: '#6b7280', textAlign: 'center', lineHeight: 20 },

  phaseNote: {
    flexDirection: 'row', gap: 8, alignItems: 'flex-start',
    backgroundColor: '#eff6ff', borderRadius: 12, padding: 12,
    marginBottom: 14, borderWidth: 1, borderColor: '#bfdbfe',
  },
  phaseNoteText: { flex: 1, fontSize: 13, color: '#1d4ed8', lineHeight: 18 },

  timelineCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: '#e7e5e4', marginBottom: 14, ...shadows.sm,
  },
  timelineTitle: { fontSize: 15, fontWeight: '700', color: '#1c1917', marginBottom: 18 },

  stageRow: { flexDirection: 'row', gap: 14, marginBottom: 4 },
  stageConnector: { alignItems: 'center', width: 28 },
  stageDot: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#e7e5e4', borderWidth: 2, borderColor: '#d1d5db',
    alignItems: 'center', justifyContent: 'center',
  },
  stageDotCurrent: {
    shadowColor: '#2d6a4f', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4, shadowRadius: 6, elevation: 4,
  },
  stageLine: { width: 2, flex: 1, backgroundColor: '#e7e5e4', minHeight: 16, marginVertical: 3 },

  stageContent: {
    flex: 1, paddingVertical: 8, paddingHorizontal: 12,
    borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: 'transparent',
  },
  stageTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stageLabel: { fontSize: 14, color: '#9ca3af', fontWeight: '500', flex: 1 },
  doneBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20,
  },
  doneBadgeText: { fontSize: 11, fontWeight: '700' },
  activeBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#fef9c3', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  activePulse: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#ca8a04' },
  activeBadgeText: { fontSize: 11, fontWeight: '700', color: '#92400e' },
  stageMeta: { fontSize: 12, color: '#2d6a4f', fontWeight: '600', marginTop: 4 },
  stageETA: { fontSize: 13, color: '#1b4332', fontWeight: '800', marginTop: 2 },

  houseCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#d8f3dc', marginBottom: 14, ...shadows.sm,
  },
  houseId: { fontSize: 15, fontWeight: '700', color: '#14532d' },
  houseAddr: { fontSize: 12, color: '#166534', marginTop: 2 },
  wardChip: { backgroundColor: '#2d6a4f', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  wardChipText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  infoBox: {
    flexDirection: 'row', gap: 10, padding: 14,
    backgroundColor: '#f0f9ff', borderRadius: 14, borderWidth: 1, borderColor: '#bae6fd',
  },
  infoTitle: { fontSize: 13, fontWeight: '700', color: '#0369a1' },
  infoDesc: { fontSize: 12, color: '#0284c7', lineHeight: 18, marginTop: 3 },
});
