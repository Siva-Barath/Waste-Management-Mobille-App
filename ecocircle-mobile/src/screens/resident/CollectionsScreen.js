import React from 'react';
import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { shadows } from '../../styles/mobileTheme';

const STAGES = [
  { key: 'reported',   label: 'Report Submitted',      icon: 'check-circle-outline',  color: '#2d6a4f' },
  { key: 'scheduled',  label: 'Collection Scheduled',  icon: 'calendar-check-outline', color: '#0284c7' },
  { key: 'assigned',   label: 'Driver Assigned',        icon: 'account-tie-outline',   color: '#7c3aed' },
  { key: 'en_route',   label: 'Truck Near Your House',  icon: 'truck-fast-outline',    color: '#d97706' },
  { key: 'collected',  label: 'Waste Collected',        icon: 'recycle',               color: '#16a34a' },
];

function getStageIndex(status) {
  if (!status || status === 'not_reported') return -1;
  if (status === 'reported')   return 0;
  if (status === 'scheduled')  return 1;
  if (status === 'assigned')   return 2;
  if (status === 'en_route')   return 3;
  if (status === 'collected')  return 4;
  return 0;
}

export default function ResidentCollectionsScreen() {
  const { user } = useAuth();
  const { residentState, fetchResidentData } = useApp();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useFocusEffect(
    React.useCallback(() => {
      fetchResidentData();
      Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }).start();
    }, [fetchResidentData])
  );

  const status = residentState.status;
  const stageIdx = getStageIndex(status);
  const isCollected = status === 'collected';
  const isEnRoute = status === 'en_route';

  const statusLabel = status === 'collected' ? 'Collected'
    : status === 'en_route' ? 'En Route'
    : status === 'assigned' ? 'Assigned'
    : status === 'scheduled' ? 'Scheduled'
    : 'Reported';
  const statusColor = status === 'collected' ? '#16a34a'
    : status === 'en_route' ? '#d97706'
    : status === 'assigned' ? '#7c3aed'
    : status === 'scheduled' ? '#0284c7'
    : '#2d6a4f';

  // Dynamic updates timeline
  const updatesTimeline = [
    { icon: 'checkbox-marked-circle-outline', color: '#2d6a4f', text: 'Report received', time: 'Today', done: stageIdx >= 0 },
    { icon: 'calendar-check-outline',         color: '#0284c7', text: 'Collection scheduled', time: 'Today', done: stageIdx >= 1 },
    { icon: 'account-tie-outline',            color: '#7c3aed', text: `Driver assigned (${residentState.collection?.driver_id || 'T1'})`, time: 'Today', done: stageIdx >= 2 },
    { icon: 'truck-fast-outline',             color: '#d97706', text: `Truck en route (Next: ${residentState.collection?.next_stop || '—'})`, time: 'Today', done: stageIdx >= 3, active: stageIdx === 3 },
  ];

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
          <Text style={styles.headerSub}>Auto-refreshes every 3 seconds</Text>
        </View>
        <View style={[styles.headerChip, {
          backgroundColor: isCollected ? '#4ade80' : stageIdx >= 0 ? '#fbbf24' : '#94a3b8',
        }]}>
          <Text style={styles.headerChipText}>
            {isCollected ? 'Done ✓' : stageIdx >= 0 ? 'Active' : 'Pending'}
          </Text>
        </View>
      </LinearGradient>

      {stageIdx < 0 ? (
        <View style={styles.emptyBox}>
          <MaterialCommunityIcons name="trash-can-outline" size={56} color="#d1d5db" />
          <Text style={styles.emptyTitle}>Nothing Reported Yet</Text>
          <Text style={styles.emptyDesc}>
            Use the Report tab to schedule a pickup for today's collection.
          </Text>
        </View>
      ) : (
        <Animated.View style={{ opacity: fadeAnim }}>

          {/* Driver / ETA Card — shown when truck is assigned or en route */}
          {stageIdx >= 2 && (
            <View style={styles.driverCard}>
              <Text style={styles.driverCardTitle}>Today's Collection Details</Text>
              <View style={styles.driverGrid}>
                <View style={styles.driverItem}>
                  <MaterialCommunityIcons name="account-tie-outline" size={20} color="#2d6a4f" />
                  <Text style={styles.driverItemLabel}>Driver</Text>
                  <Text style={styles.driverItemValue}>{residentState.collection?.driver_name || 'Assigned'}</Text>
                </View>
                <View style={styles.driverDivider} />
                <View style={styles.driverItem}>
                  <MaterialCommunityIcons name="truck-outline" size={20} color="#2d6a4f" />
                  <Text style={styles.driverItemLabel}>Truck Number</Text>
                  <Text style={styles.driverItemValue}>{residentState.collection?.driver_id || 'T1'}</Text>
                </View>
                <View style={styles.driverDivider} />
                <View style={styles.driverItem}>
                  <MaterialCommunityIcons name="clock-outline" size={20} color="#2d6a4f" />
                  <Text style={styles.driverItemLabel}>Expected ETA</Text>
                  <Text style={styles.driverItemValue}>{residentState.eta || '—'}</Text>
                </View>
              </View>

              {/* Additional tracking info: Current stop, next stop, position, and status */}
              <View style={{ marginTop: 14, borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 14, gap: 8 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 12, color: '#78716c', fontWeight: '500' }}>Current Stop:</Text>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#1c1917' }}>{residentState.collection?.current_stop || '—'}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 12, color: '#78716c', fontWeight: '500' }}>Next Stop:</Text>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#1c1917' }}>{residentState.collection?.next_stop || '—'}</Text>
                </View>
                {residentState.truckPos && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 12, color: '#78716c', fontWeight: '500' }}>Truck Position:</Text>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#7c3aed' }}>
                      {residentState.truckPos.lat.toFixed(4)}, {residentState.truckPos.lng.toFixed(4)}
                    </Text>
                  </View>
                )}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 12, color: '#78716c', fontWeight: '500' }}>Collection Status:</Text>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: statusColor }}>
                    {statusLabel}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Timeline */}
          <View style={styles.timelineCard}>
            <Text style={styles.timelineTitle}>Collection Progress</Text>
            {STAGES.map((stage, i) => {
              const isDone = i < stageIdx;
              const isCurrent = i === stageIdx;
              const isWaiting = i > stageIdx;
              return (
                <View key={stage.key} style={styles.stageRow}>
                  <View style={styles.stageLeft}>
                    <View style={[
                      styles.stageDot,
                      isDone && { backgroundColor: stage.color, borderColor: stage.color },
                      isCurrent && { backgroundColor: stage.color, borderColor: stage.color },
                      isWaiting && styles.stageDotWaiting,
                    ]}>
                      {isDone && <MaterialCommunityIcons name="check" size={12} color="#fff" />}
                      {isCurrent && <MaterialCommunityIcons name={stage.icon} size={13} color="#fff" />}
                    </View>
                    {i < STAGES.length - 1 && (
                      <View style={[styles.stageLine, i < stageIdx && { backgroundColor: '#2d6a4f' }]} />
                    )}
                  </View>

                  <View style={[styles.stageContent, isCurrent && styles.stageContentActive]}>
                    <View style={styles.stageTopRow}>
                      <Text style={[
                        styles.stageLabel,
                        (isDone || isCurrent) && { color: '#1c1917', fontWeight: '700' },
                        isWaiting && { color: '#9ca3af' },
                      ]}>
                        {stage.label}
                      </Text>
                      {isDone && (
                        <View style={[styles.doneBadge, { backgroundColor: `${stage.color}18` }]}>
                          <MaterialCommunityIcons name="check" size={11} color={stage.color} />
                          <Text style={[styles.doneBadgeText, { color: stage.color }]}>✔ Completed</Text>
                        </View>
                      )}
                      {isCurrent && (
                        <View style={styles.activeBadge}>
                          <View style={styles.activePulse} />
                          <Text style={styles.activeBadgeText}>🟢 Current</Text>
                        </View>
                      )}
                      {isWaiting && (
                        <Text style={styles.waitingText}>⚪ Waiting</Text>
                      )}
                    </View>
                    {isCurrent && residentState.eta && (
                      <Text style={styles.etaText}>Expected: {residentState.eta}</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>

          {/* Notification Timeline */}
          {stageIdx >= 1 && (
            <View style={styles.notifCard}>
              <View style={styles.notifHeader}>
                <MaterialCommunityIcons name="cellphone-message" size={16} color="#1d4ed8" />
                <Text style={styles.notifTitle}>📱 Updates</Text>
              </View>
              {updatesTimeline.map((n, i) => (
                <View key={i} style={styles.notifRow}>
                  <View style={[styles.notifDot, {
                    backgroundColor: n.active ? '#fef3c7' : n.done ? `${n.color}18` : '#f5f5f4',
                  }]}>
                    <MaterialCommunityIcons name={n.icon} size={14} color={n.active ? '#d97706' : n.done ? n.color : '#d1d5db'} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.notifText, n.active && styles.notifTextActive]}>{n.text}</Text>
                  </View>
                  {n.time && <Text style={styles.notifTime}>{n.time}</Text>}
                </View>
              ))}
              {isCollected && (
                <View style={styles.notifRow}>
                  <View style={[styles.notifDot, { backgroundColor: '#f0fdf4' }]}>
                    <MaterialCommunityIcons name="star-circle" size={14} color="#16a34a" />
                  </View>
                  <Text style={styles.notifText}>⭐ +5 Green Points added</Text>
                </View>
              )}
            </View>
          )}

          {/* Collected celebration */}
          {isCollected && (
            <View style={styles.collectedBanner}>
              <MaterialCommunityIcons name="check-decagram" size={32} color="#16a34a" />
              <View>
                <Text style={styles.collectedTitle}>Waste Collected!</Text>
                <Text style={styles.collectedSub}>Thank you for keeping your area clean 🌿</Text>
              </View>
            </View>
          )}

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

      <View style={styles.infoStrip}>
        <MaterialCommunityIcons name="clock-time-four-outline" size={16} color="#0284c7" />
        <Text style={styles.infoStripText}>
          Report between 6:30 PM – 7:30 AM. Collection happens early morning.
        </Text>
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
  headerChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  headerChipText: { fontSize: 12, fontWeight: '800', color: '#1c1917' },

  emptyBox: {
    alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24,
    backgroundColor: '#fff', borderRadius: 20, borderWidth: 1, borderColor: '#e7e5e4',
    marginBottom: 16, gap: 10,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#374151' },
  emptyDesc: { fontSize: 13, color: '#6b7280', textAlign: 'center', lineHeight: 20 },

  driverCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 18,
    borderWidth: 1, borderColor: '#d8f3dc', marginBottom: 14, ...shadows.sm,
  },
  driverCardTitle: { fontSize: 15, fontWeight: '700', color: '#1c1917', marginBottom: 14 },
  driverGrid: { flexDirection: 'row', alignItems: 'center' },
  driverItem: { flex: 1, alignItems: 'center', gap: 4 },
  driverDivider: { width: 1, height: 40, backgroundColor: '#e7e5e4' },
  driverItemLabel: { fontSize: 11, color: '#78716c', fontWeight: '500' },
  driverItemValue: { fontSize: 14, fontWeight: '800', color: '#14532d' },
  truckNearBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14,
    backgroundColor: '#fefce8', borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: '#fde68a',
  },
  truckNearTitle: { fontSize: 13, fontWeight: '700', color: '#92400e' },
  truckNearSub: { fontSize: 12, color: '#b45309', marginTop: 1 },

  timelineCard: {
    backgroundColor: '#fff', borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: '#e7e5e4', marginBottom: 14, ...shadows.sm,
  },
  timelineTitle: { fontSize: 15, fontWeight: '700', color: '#1c1917', marginBottom: 20 },

  stageRow: { flexDirection: 'row', gap: 12, marginBottom: 4 },
  stageLeft: { alignItems: 'center', width: 28 },
  stageDot: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#e7e5e4', borderWidth: 2, borderColor: '#d1d5db',
    alignItems: 'center', justifyContent: 'center',
  },
  stageDotWaiting: { backgroundColor: '#f3f4f6', borderColor: '#e5e7eb' },
  stageLine: { width: 2, flex: 1, backgroundColor: '#e7e5e4', minHeight: 14, marginVertical: 3 },
  stageContent: {
    flex: 1, paddingVertical: 8, paddingHorizontal: 12,
    borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: 'transparent',
  },
  stageContentActive: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
  stageTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stageLabel: { fontSize: 14, color: '#9ca3af', fontWeight: '500', flex: 1 },
  doneBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  doneBadgeText: { fontSize: 11, fontWeight: '700' },
  activeBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#fef9c3', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  activePulse: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#ca8a04' },
  activeBadgeText: { fontSize: 11, fontWeight: '700', color: '#92400e' },
  waitingText: { fontSize: 11, color: '#d1d5db', fontWeight: '500' },
  etaText: { fontSize: 12, color: '#2d6a4f', fontWeight: '700', marginTop: 4 },

  notifCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#dbeafe', marginBottom: 14, ...shadows.sm,
  },
  notifHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  notifTitle: { fontSize: 14, fontWeight: '700', color: '#1e40af' },
  notifRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 7 },
  notifDot: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  notifText: { fontSize: 13, color: '#374151', fontWeight: '500', flex: 1 },
  notifTextActive: { color: '#92400e', fontWeight: '700' },
  notifTime: { fontSize: 11, color: '#78716c', fontWeight: '500' },

  houseCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#d8f3dc', marginBottom: 14, ...shadows.sm,
  },
  houseId: { fontSize: 15, fontWeight: '700', color: '#14532d' },
  houseAddr: { fontSize: 12, color: '#166534', marginTop: 2 },
  wardChip: { backgroundColor: '#2d6a4f', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  wardChipText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  collectedBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#f0fdf4', borderRadius: 16, padding: 18,
    borderWidth: 1, borderColor: '#bbf7d0', marginBottom: 14,
  },
  collectedTitle: { fontSize: 16, fontWeight: '800', color: '#14532d' },
  collectedSub: { fontSize: 13, color: '#166534', marginTop: 2 },

  infoStrip: {
    flexDirection: 'row', gap: 8, alignItems: 'flex-start',
    backgroundColor: '#eff6ff', borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: '#bfdbfe',
  },
  infoStripText: { flex: 1, fontSize: 12, color: '#0284c7', lineHeight: 18 },
});
