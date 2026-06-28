import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, Animated, ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import api from '../../services/api';

const WASTE_TYPES = [
  { key: 'mixed',        label: 'Mixed',        icon: 'trash-can-outline', color: '#b45309', bg: '#fefce8', border: '#fde68a' },
  { key: 'organic',      label: 'Organic',       icon: 'leaf',              color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' },
  { key: 'recyclable',   label: 'Recyclable',    icon: 'recycle',           color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' },
  { key: 'hazardous',    label: 'Hazardous',     icon: 'alert-circle',      color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
];

export default function ReportScreen() {
  const { user } = useAuth();
  const { residentState, fetchResidentData } = useApp();
  const [selected, setSelected] = useState('mixed');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const alreadyReported = residentState.reported;
  const windowOpen = residentState.windowOpen;
  const windowLoading = false;
  const scaleAnims = useRef(WASTE_TYPES.map(() => new Animated.Value(1))).current;
  const successAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!residentState.reported) {
      setSubmitted(false);
    }
  }, [residentState.reported]);

  // ── Report submission → Flask ─────────────────────────────────────────────
  const handleReport = async () => {
    setLoading(true);
    setError(null);
    try {
      // Flask resident report endpoint — authenticates via house_id in body
      const res = await api.post('/report_garbage', {
        id: user?.house_id,
        reported: true,
        waste_type: selected,
      }, {
        headers: {
          'X-Resident-Username': user?.house_id,
        },
      });
      if (res.data && res.data.success === true) {
        setSubmitted(true);
        Animated.spring(successAnim, { toValue: 1, useNativeDriver: true }).start();
        fetchResidentData();
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        'Failed to submit. Try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (key, idx) => {
    setSelected(key);
    setError(null);
    Animated.sequence([
      Animated.timing(scaleAnims[idx], { toValue: 0.93, duration: 80, useNativeDriver: true }),
      Animated.spring(scaleAnims[idx], { toValue: 1, useNativeDriver: true }),
    ]).start();
  };

  if (submitted || alreadyReported) {
    return (
      <View style={styles.successScreen}>
        <Animated.View style={[styles.successBox, { transform: [{ scale: submitted ? successAnim : new Animated.Value(1) }] }]}>
          <View style={styles.successIconRing}>
            <MaterialCommunityIcons name="check-circle" size={64} color="#16a34a" />
          </View>
          <Text style={styles.successTitle}>Report Submitted!</Text>
          <Text style={styles.successDesc}>
            {alreadyReported && !submitted
              ? 'You have already reported for today\'s collection window.'
              : 'Your garbage report has been received.\nA driver will be assigned for your area\u2019s collection.'}
          </Text>
          <View style={styles.successInfo}>
            <View style={styles.successInfoRow}>
              <MaterialCommunityIcons name="home" size={15} color="#2d6a4f" />
              <Text style={styles.successInfoText}>{user?.house_id} · {user?.ward}</Text>
            </View>
            {submitted && (
              <View style={styles.successInfoRow}>
                <MaterialCommunityIcons name="trash-can-outline" size={15} color="#2d6a4f" />
                <Text style={styles.successInfoText}>{WASTE_TYPES.find(w => w.key === selected)?.label} Waste</Text>
              </View>
            )}
          </View>
        </Animated.View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <LinearGradient colors={['#1b4332', '#2d6a4f']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Report Garbage</Text>
          <Text style={styles.headerSub}>Schedule your pickup for today</Text>
        </View>
        <View style={[styles.windowChip, { backgroundColor: windowOpen ? 'rgba(74,222,128,0.2)' : 'rgba(252,165,165,0.2)' }]}>
          <View style={[styles.windowDot, { backgroundColor: windowOpen ? '#4ade80' : '#fca5a5' }]} />
          <Text style={[styles.windowChipText, { color: windowOpen ? '#4ade80' : '#fca5a5' }]}>
            {windowLoading ? '...' : windowOpen ? 'Open' : 'Closed'}
          </Text>
        </View>
      </LinearGradient>

      {/* Window status bar */}
      <View style={[styles.windowBar, { backgroundColor: windowOpen ? '#f0fdf4' : '#fef2f2', borderColor: windowOpen ? '#bbf7d0' : '#fecaca' }]}>
        <MaterialCommunityIcons name="clock-outline" size={15} color={windowOpen ? '#16a34a' : '#dc2626'} />
        <Text style={[styles.windowBarText, { color: windowOpen ? '#15803d' : '#dc2626' }]}>
          {windowLoading ? 'Checking window status...'
            : windowOpen ? 'Reporting window is open — submit your report now'
            : 'Reporting window is currently closed'}
        </Text>
      </View>

      {/* House card */}
      <View style={styles.houseCard}>
        <MaterialCommunityIcons name="home-city-outline" size={22} color="#2d6a4f" />
        <View style={{ flex: 1 }}>
          <Text style={styles.houseId}>{user?.house_id}</Text>
          <Text style={styles.houseAddr}>{user?.address}</Text>
        </View>
        <View style={styles.wardBadge}><Text style={styles.wardBadgeText}>{user?.ward}</Text></View>
      </View>

      {/* Waste type grid */}
      <Text style={styles.sectionLabel}>Select Waste Category</Text>
      <View style={styles.wasteGrid}>
        {WASTE_TYPES.map((wt, idx) => (
          <Animated.View key={wt.key} style={{ transform: [{ scale: scaleAnims[idx] }], width: '47%' }}>
            <TouchableOpacity
              style={[
                styles.wasteCard,
                { backgroundColor: wt.bg, borderColor: selected === wt.key ? wt.color : wt.border },
                selected === wt.key && styles.wasteCardSelected,
              ]}
              onPress={() => handleSelect(wt.key, idx)}
              activeOpacity={0.9}
            >
              <MaterialCommunityIcons name={wt.icon} size={32} color={wt.color} />
              <Text style={[styles.wasteCardLabel, { color: wt.color }]}>{wt.label}</Text>
              {selected === wt.key && (
                <View style={[styles.checkMark, { backgroundColor: wt.color }]}>
                  <MaterialCommunityIcons name="check" size={11} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>

      {/* Error */}
      {error ? (
        <View style={styles.errorBox}>
          <MaterialCommunityIcons name="alert-circle-outline" size={18} color="#dc2626" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* Submit */}
      <TouchableOpacity
        style={[styles.submitBtn, (!windowOpen || loading || alreadyReported) && styles.submitDisabled]}
        onPress={handleReport}
        disabled={!windowOpen || loading || alreadyReported}
        activeOpacity={0.85}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <MaterialCommunityIcons name="send-check" size={20} color="#fff" />
            <Text style={styles.submitText}>
              {windowOpen ? 'Submit Report' : 'Window Closed'}
            </Text>
          </>
        )}
      </TouchableOpacity>

      {!windowOpen && !windowLoading && (
        <Text style={styles.closedNote}>
          Reporting is currently closed.{'\n'}Check back at 6:30 PM when the next collection window opens.
        </Text>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#f8faf8' },
  container: { paddingBottom: 48 },

  header: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 3 },
  windowChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  windowDot: { width: 7, height: 7, borderRadius: 4 },
  windowChipText: { fontSize: 12, fontWeight: '800' },

  windowBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 16, marginTop: 12, padding: 12, borderRadius: 12, borderWidth: 1,
  },
  windowBarText: { fontSize: 13, fontWeight: '600' },

  houseCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    margin: 16, marginBottom: 8,
    borderWidth: 1, borderColor: '#d8f3dc',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  houseId: { fontSize: 15, fontWeight: '700', color: '#14532d' },
  houseAddr: { fontSize: 12, color: '#166534', marginTop: 2 },
  wardBadge: { backgroundColor: '#2d6a4f', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  wardBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#44403c', marginHorizontal: 16, marginTop: 8, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },

  wasteGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 16, marginBottom: 20, justifyContent: 'space-between' },
  wasteCard: {
    borderWidth: 2, borderRadius: 16, padding: 18, alignItems: 'center', gap: 8,
    position: 'relative',
  },
  wasteCardSelected: {
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 4,
  },
  wasteCardLabel: { fontSize: 14, fontWeight: '700', textAlign: 'center' },
  checkMark: {
    position: 'absolute', top: 8, right: 8, width: 20, height: 20, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },

  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fef2f2', borderRadius: 12, padding: 12,
    marginHorizontal: 16, marginBottom: 12, borderWidth: 1, borderColor: '#fecaca',
  },
  errorText: { flex: 1, fontSize: 13, color: '#dc2626', fontWeight: '500' },

  submitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: '#2d6a4f', borderRadius: 16, minHeight: 56,
    marginHorizontal: 16,
  },
  submitDisabled: { backgroundColor: '#9ca3af' },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  closedNote: { fontSize: 12, color: '#78716c', textAlign: 'center', marginTop: 12, lineHeight: 18 },

  successScreen: { flex: 1, backgroundColor: '#f8faf8', alignItems: 'center', justifyContent: 'center', padding: 24 },
  successBox: { backgroundColor: '#fff', borderRadius: 24, padding: 32, alignItems: 'center', width: '100%', borderWidth: 1, borderColor: '#d8f3dc' },
  successIconRing: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  successTitle: { fontSize: 24, fontWeight: '800', color: '#14532d', marginBottom: 10 },
  successDesc: { fontSize: 14, color: '#374151', textAlign: 'center', lineHeight: 22, marginBottom: 20 },
  successInfo: { backgroundColor: '#f0fdf4', borderRadius: 12, padding: 14, width: '100%', gap: 8, marginBottom: 24 },
  successInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  successInfoText: { fontSize: 14, color: '#2d6a4f', fontWeight: '600' },
  doneBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#f0fdf4', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 24, borderWidth: 1, borderColor: '#bbf7d0' },
  doneBtnText: { color: '#2d6a4f', fontWeight: '700', fontSize: 15 },
});
