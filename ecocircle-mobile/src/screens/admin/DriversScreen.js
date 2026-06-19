import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Layout from '../../components/common/Layout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../services/api';

export default function AdminDriversScreen() {
  const [drivers, setDrivers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/admin/drivers'), api.get('/admin/routes')])
      .then(([driversRes, routesRes]) => {
        setDrivers(driversRes.data.drivers || []);
        setRoutes(routesRes.data.routes || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const getDriverRoute = (driverId) => routes.find((r) => r.driver_id === driverId);

  return (
    <Layout title="Drivers" subtitle="Fleet & routes">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Drivers & Routes</Text>
          <Text style={styles.subtitle}>{drivers.length} registered drivers</Text>
        </View>

        <View style={styles.statsRow}>
          {[
            { label: 'Total Drivers', value: drivers.length, icon: 'truck', bg: '#dbeafe', color: '#2563eb' },
            {
              label: 'Active Routes',
              value: routes.filter((r) => r.status === 'active').length,
              icon: 'map',
              bg: '#d8f3dc',
              color: '#2d6a4f',
            },
            {
              label: 'Completed Today',
              value: routes.filter((r) => r.status === 'completed').length,
              icon: 'check-circle',
              bg: '#ccfbf1',
              color: '#0d9488',
            },
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

        {loading ? (
          <LoadingSpinner />
        ) : drivers.length === 0 ? (
          <View style={styles.empty}>
            <MaterialCommunityIcons name="truck-outline" size={48} color="#d6d3d1" />
            <Text style={styles.emptyText}>No drivers registered yet</Text>
          </View>
        ) : (
          <View style={styles.driverGrid}>
            {drivers.map((driver, i) => {
              const route = getDriverRoute(driver.id);
              return (
                <View key={i} style={styles.driverCard}>
                  <View style={styles.driverHeader}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {driver.name?.charAt(0)?.toUpperCase() || 'D'}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.driverName}>{driver.name}</Text>
                      <View style={styles.phoneRow}>
                        <MaterialCommunityIcons name="phone" size={12} color="#78716c" />
                        <Text style={styles.phoneText}>{driver.phone}</Text>
                      </View>
                    </View>
                  </View>

                  {route ? (
                    <View style={styles.routeSection}>
                      <View style={styles.routeHeader}>
                        <Text style={styles.routeLabel}>Route Status</Text>
                        <View
                          style={[
                            styles.routeStatus,
                            route.status === 'active' && { backgroundColor: '#d8f3dc' },
                            route.status === 'completed' && { backgroundColor: '#ccfbf1' },
                          ]}
                        >
                          <Text
                            style={[
                              styles.routeStatusText,
                              route.status === 'active' && { color: '#2d6a4f' },
                              route.status === 'completed' && { color: '#0d9488' },
                            ]}
                          >
                            {route.status}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.routeMeta}>
                        <View style={styles.routeMetaItem}>
                          <MaterialCommunityIcons name="map-marker" size={14} color="#78716c" />
                          <Text style={styles.routeMetaText}>{route.total_stops || 0} stops</Text>
                        </View>
                        <View style={styles.routeMetaItem}>
                          <MaterialCommunityIcons name="truck" size={14} color="#78716c" />
                          <Text style={styles.routeMetaText}>{route.total_distance} km</Text>
                        </View>
                        <View style={styles.routeMetaItem}>
                          <MaterialCommunityIcons name="clock-outline" size={14} color="#78716c" />
                          <Text style={styles.routeMetaText}>{route.estimated_time} min</Text>
                        </View>
                      </View>
                      <View style={styles.progressTrack}>
                        <View
                          style={[
                            styles.progressFill,
                            { width: `${route.status === 'completed' ? 100 : 50}%` },
                          ]}
                        />
                      </View>
                    </View>
                  ) : (
                    <View style={styles.noRoute}>
                      <MaterialCommunityIcons name="clock-outline" size={16} color="#a8a29e" />
                      <Text style={styles.noRouteText}>No route assigned today</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 24 },
  header: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '700', color: '#1c1917' },
  subtitle: { fontSize: 14, color: '#78716c', marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e7e5e4',
    padding: 14,
    alignItems: 'center',
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: { fontSize: 20, fontWeight: '700' },
  statLabel: { fontSize: 10, color: '#78716c', marginTop: 4, textAlign: 'center' },
  empty: { padding: 48, alignItems: 'center' },
  emptyText: { marginTop: 12, color: '#78716c' },
  driverGrid: { gap: 12, marginBottom: 24 },
  driverCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e7e5e4',
    padding: 16,
  },
  driverHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2d6a4f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  driverName: { fontSize: 16, fontWeight: '700', color: '#1c1917' },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  phoneText: { fontSize: 13, color: '#78716c' },
  routeSection: { gap: 10 },
  routeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  routeLabel: { fontSize: 12, color: '#78716c' },
  routeStatus: { backgroundColor: '#f5f5f4', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  routeStatusText: { fontSize: 11, fontWeight: '700', color: '#57534e', textTransform: 'capitalize' },
  routeMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  routeMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  routeMetaText: { fontSize: 12, color: '#57534e' },
  progressTrack: { height: 8, backgroundColor: '#e7e5e4', borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#2d6a4f', borderRadius: 999 },
  noRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fafaf9',
    padding: 12,
    borderRadius: 8,
  },
  noRouteText: { fontSize: 13, color: '#a8a29e' },
});
