import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Layout from '../../components/common/Layout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../services/api';

export default function DriverDashboardScreen() {
  const navigation = useNavigation();
  const [route, setRoute] = useState(null);
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchRoute();
  }, []);

  const fetchRoute = async () => {
    try {
      const res = await api.get('/routes/today');
      setRoute(res.data.route);
      setStops(res.data.stops || []);
      if (res.data.message) setMessage(res.data.message);
    } catch {
      setMessage('Failed to load route.');
    }
    setLoading(false);
  };

  const updateStatus = async (collectionId, status) => {
    setUpdating(collectionId);
    try {
      await api.put(`/routes/collect/${collectionId}`, { status });
      fetchRoute();
    } catch {
      /* ignore */
    }
    setUpdating(null);
  };

  const completeRoute = async () => {
    if (!route) return;
    try {
      await api.put(`/routes/complete/${route.id}`);
      fetchRoute();
    } catch {
      /* ignore */
    }
  };

  const collected = stops.filter((s) => s.collection_status === 'collected').length;
  const pending = stops.filter((s) => s.collection_status === 'pending').length;
  const skipped = stops.filter(
    (s) => s.collection_status === 'skipped' || s.collection_status === 'closed'
  ).length;
  const progress = stops.length > 0 ? Math.round((collected / stops.length) * 100) : 0;

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Layout title="EcoCircle" showNav={false}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Driver Dashboard</Text>
            <Text style={styles.subtitle}>{today}</Text>
          </View>
          {route && route.status === 'active' && pending === 0 && (
            <TouchableOpacity style={styles.completeBtn} onPress={completeRoute}>
              <MaterialCommunityIcons name="flag-checkered" size={18} color="#fff" />
              <Text style={styles.completeBtnText}>Complete Route</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.statsRow}>
          {[
            { label: 'Total Stops', value: stops.length, icon: 'map-marker', bg: '#dbeafe', color: '#2563eb' },
            { label: 'Collected', value: collected, icon: 'check-circle', bg: '#d8f3dc', color: '#2d6a4f' },
            { label: 'Pending', value: pending, icon: 'clock-outline', bg: '#fef3c7', color: '#d97706' },
            { label: 'Skipped', value: skipped, icon: 'skip-forward', bg: '#f5f5f4', color: '#57534e' },
          ].map((s) => (
            <View key={s.label} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: s.bg }]}>
                <MaterialCommunityIcons name={s.icon} size={22} color={s.color} />
              </View>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {stops.length > 0 && (
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>Route Progress</Text>
              <Text style={styles.progressPct}>{progress}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
          </View>
        )}

        {route && (
          <View style={styles.routeInfo}>
            <View style={styles.routeInfoItem}>
              <MaterialCommunityIcons name="truck" size={16} color="#2d6a4f" />
              <Text style={styles.routeInfoLabel}>Distance:</Text>
              <Text style={styles.routeInfoValue}>{route.total_distance} km</Text>
            </View>
            <View style={styles.routeInfoItem}>
              <MaterialCommunityIcons name="clock-outline" size={16} color="#2563eb" />
              <Text style={styles.routeInfoLabel}>Est. Time:</Text>
              <Text style={styles.routeInfoValue}>{route.estimated_time} min</Text>
            </View>
            <View style={styles.routeInfoItem}>
              <MaterialCommunityIcons name="flag" size={16} color="#52796f" />
              <Text style={styles.routeInfoLabel}>Status:</Text>
              <Text style={[styles.routeInfoValue, route.status === 'active' && { color: '#2d6a4f' }]}>
                {route.status}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialCommunityIcons name="navigation" size={20} color="#2d6a4f" />
            <Text style={styles.cardTitle}>Collection Route</Text>
          </View>

          {loading ? (
            <LoadingSpinner />
          ) : message && stops.length === 0 ? (
            <View style={styles.empty}>
              <MaterialCommunityIcons name="truck-outline" size={48} color="#d6d3d1" />
              <Text style={styles.emptyText}>{message}</Text>
            </View>
          ) : (
            <>
              <View style={styles.depotStart}>
                <View style={styles.depotIcon}>
                  <MaterialCommunityIcons name="flag" size={20} color="#fff" />
                </View>
                <View>
                  <Text style={styles.depotTitle}>Depot - Start</Text>
                  <Text style={styles.depotSub}>Collection starting point</Text>
                </View>
              </View>

              {stops.map((stop, i) => (
                <View
                  key={i}
                  style={[
                    styles.stopItem,
                    stop.collection_status === 'collected' && styles.stopCollected,
                    stop.collection_status !== 'pending' &&
                      stop.collection_status !== 'collected' &&
                      styles.stopSkipped,
                  ]}
                >
                  <View
                    style={[
                      styles.stopNumber,
                      stop.collection_status === 'collected' && { backgroundColor: '#bbf7d0' },
                      stop.collection_status === 'pending' && { backgroundColor: '#dbeafe' },
                    ]}
                  >
                    {stop.collection_status === 'collected' ? (
                      <MaterialCommunityIcons name="check-circle" size={20} color="#15803d" />
                    ) : (
                      <Text style={styles.stopNumberText}>{i + 1}</Text>
                    )}
                  </View>

                  <View style={styles.stopContent}>
                    <View style={styles.stopTitleRow}>
                      <Text style={styles.stopId}>{stop.id}</Text>
                      <View style={styles.statusPill}>
                        <Text style={styles.statusPillText}>{stop.collection_status || 'pending'}</Text>
                      </View>
                    </View>
                    <View style={styles.stopAddressRow}>
                      <MaterialCommunityIcons name="home" size={14} color="#78716c" />
                      <Text style={styles.stopAddress} numberOfLines={1}>{stop.address}</Text>
                    </View>
                    <View style={styles.stopMeta}>
                      <Text style={styles.stopMetaText}>{stop.resident_name}</Text>
                      <TouchableOpacity onPress={() => Linking.openURL(`tel:${stop.resident_phone}`)}>
                        <View style={styles.phoneRow}>
                          <MaterialCommunityIcons name="phone" size={12} color="#78716c" />
                          <Text style={styles.stopMetaText}>{stop.resident_phone}</Text>
                        </View>
                      </TouchableOpacity>
                    </View>

                    {stop.collection_status === 'pending' && stop.collection_id && (
                      <View style={styles.actionRow}>
                        <TouchableOpacity
                          style={[styles.actionBtn, styles.collectBtn]}
                          onPress={() => updateStatus(stop.collection_id, 'collected')}
                          disabled={updating === stop.collection_id}
                        >
                          {updating === stop.collection_id ? (
                            <ActivityIndicator size="small" color="#fff" />
                          ) : (
                            <>
                              <MaterialCommunityIcons name="check-circle" size={14} color="#fff" />
                              <Text style={styles.collectBtnText}>Collected</Text>
                            </>
                          )}
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionBtn, styles.skipBtn]}
                          onPress={() => updateStatus(stop.collection_id, 'skipped')}
                          disabled={updating === stop.collection_id}
                        >
                          <MaterialCommunityIcons name="skip-forward" size={14} color="#b45309" />
                          <Text style={styles.skipBtnText}>Skip</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionBtn, styles.closedBtn]}
                          onPress={() => updateStatus(stop.collection_id, 'closed')}
                          disabled={updating === stop.collection_id}
                        >
                          <MaterialCommunityIcons name="door-closed" size={14} color="#57534e" />
                          <Text style={styles.closedBtnText}>Closed</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    <TouchableOpacity
                      style={styles.detailLink}
                      onPress={() => navigation.navigate('RouteDetail', { stop, index: i + 1 })}
                    >
                      <Text style={styles.detailLinkText}>View details</Text>
                      <MaterialCommunityIcons name="chevron-right" size={16} color="#2d6a4f" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              <View style={styles.depotEnd}>
                <View style={[styles.depotIcon, { backgroundColor: '#52796f' }]}>
                  <MaterialCommunityIcons name="flag" size={20} color="#fff" />
                </View>
                <View>
                  <Text style={[styles.depotTitle, { color: '#115e59' }]}>Waste Processing Center</Text>
                  <Text style={[styles.depotSub, { color: '#0d9488' }]}>Route end point</Text>
                </View>
              </View>
            </>
          )}
        </View>

        {stops.length > 0 && (
          <View style={styles.summaryCard}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="truck" size={20} color="#2d6a4f" />
              <Text style={styles.cardTitle}>Collection Summary</Text>
            </View>
            <View style={styles.summaryRow}>
              <View style={[styles.summaryBox, { backgroundColor: '#ecfdf5' }]}>
                <Text style={[styles.summaryVal, { color: '#15803d' }]}>{collected}</Text>
                <Text style={styles.summaryLbl}>Successfully Collected</Text>
              </View>
              <View style={[styles.summaryBox, { backgroundColor: '#fffbeb' }]}>
                <Text style={[styles.summaryVal, { color: '#b45309' }]}>{skipped}</Text>
                <Text style={styles.summaryLbl}>Skipped / Closed</Text>
              </View>
              <View style={[styles.summaryBox, { backgroundColor: '#eff6ff' }]}>
                <Text style={[styles.summaryVal, { color: '#2563eb' }]}>{progress}%</Text>
                <Text style={styles.summaryLbl}>Success Rate</Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 32 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    gap: 12,
    flexWrap: 'wrap',
  },
  title: { fontSize: 24, fontWeight: '700', color: '#1c1917' },
  subtitle: { fontSize: 14, color: '#78716c', marginTop: 4 },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2d6a4f',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  completeBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  statCard: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e7e5e4',
    padding: 16,
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: { fontSize: 22, fontWeight: '700' },
  statLabel: { fontSize: 11, color: '#78716c', marginTop: 4 },
  progressCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e7e5e4',
    padding: 16,
    marginBottom: 16,
  },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontSize: 13, fontWeight: '600', color: '#44403c' },
  progressPct: { fontSize: 13, fontWeight: '700', color: '#2d6a4f' },
  progressTrack: { height: 12, backgroundColor: '#e7e5e4', borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#2d6a4f', borderRadius: 999 },
  routeInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e7e5e4',
    padding: 16,
    marginBottom: 16,
  },
  routeInfoItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  routeInfoLabel: { fontSize: 13, color: '#78716c' },
  routeInfoValue: { fontSize: 13, fontWeight: '700', color: '#1c1917' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e7e5e4',
    overflow: 'hidden',
    marginBottom: 16,
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
  emptyText: { marginTop: 12, color: '#78716c', textAlign: 'center' },
  depotStart: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#d8f3dc',
    borderBottomWidth: 1,
    borderBottomColor: '#bbf7d0',
  },
  depotEnd: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#f0fdfa',
  },
  depotIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#2d6a4f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  depotTitle: { fontSize: 14, fontWeight: '700', color: '#1b4332' },
  depotSub: { fontSize: 11, color: '#2d6a4f', marginTop: 2 },
  stopItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f4',
    gap: 12,
  },
  stopCollected: { backgroundColor: 'rgba(236, 253, 245, 0.5)' },
  stopSkipped: { backgroundColor: 'rgba(250, 250, 249, 0.8)' },
  stopNumber: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#e7e5e4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopNumberText: { fontWeight: '700', color: '#44403c' },
  stopContent: { flex: 1 },
  stopTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  stopId: { fontSize: 14, fontWeight: '700', color: '#1c1917' },
  statusPill: { backgroundColor: '#f5f5f4', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  statusPillText: { fontSize: 10, fontWeight: '600', color: '#57534e', textTransform: 'capitalize' },
  stopAddressRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  stopAddress: { fontSize: 13, color: '#57534e', flex: 1 },
  stopMeta: { flexDirection: 'row', gap: 16, flexWrap: 'wrap' },
  stopMetaText: { fontSize: 12, color: '#78716c' },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  collectBtn: { backgroundColor: '#16a34a' },
  collectBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  skipBtn: { backgroundColor: '#fef3c7' },
  skipBtnText: { color: '#b45309', fontSize: 11, fontWeight: '700' },
  closedBtn: { backgroundColor: '#f5f5f4' },
  closedBtnText: { color: '#57534e', fontSize: 11, fontWeight: '700' },
  detailLink: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  detailLinkText: { fontSize: 12, color: '#2d6a4f', fontWeight: '600' },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e7e5e4',
    overflow: 'hidden',
    marginBottom: 24,
  },
  summaryRow: { flexDirection: 'row', padding: 16, gap: 10 },
  summaryBox: { flex: 1, borderRadius: 10, padding: 12, alignItems: 'center' },
  summaryVal: { fontSize: 22, fontWeight: '700' },
  summaryLbl: { fontSize: 10, color: '#78716c', marginTop: 4, textAlign: 'center' },
});
