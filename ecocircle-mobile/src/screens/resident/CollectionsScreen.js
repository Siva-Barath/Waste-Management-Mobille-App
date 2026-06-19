import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Layout from '../../components/common/Layout';
import ScreenHeader from '../../components/common/ScreenHeader';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../services/api';
import { colors } from '../../utils/colors';
import { borderRadius, spacing } from '../../utils/spacing';
import { shadows } from '../../styles/mobileTheme';

/**
 * ResidentCollectionsScreen - Real-time collection status tracking screen
 * 
 * Ported from client/src/pages/resident/Collections.jsx:
 * - Real-time polling of today's garbage collection status every 30s
 * - Handles non-reported days or "no garbage" reported days
 * - Dynamic color-coded status hero indicators: Collected, Pending, Skipped, Closed
 * - Interactive driver contact widget (initiates native telephone app)
 * - Optimized route progress statistics (stops, distance, estimation)
 * - Real-time progress bar slider
 * - Recent collection logs feeds
 */

const STATUS_CONFIG = {
  collected: {
    label: 'Collected',
    icon: 'check-circle',
    bg: '#e8f5e9',
    text: '#2d6a4f',
    borderColor: '#c8e6c9',
    description: 'Your garbage has been collected successfully!',
  },
  pending: {
    label: 'Pending',
    icon: 'clock-outline',
    bg: '#eff6ff',
    text: '#1d4ed8',
    borderColor: '#bfdbfe',
    description: 'A truck is assigned and on the way.',
  },
  skipped: {
    label: 'Skipped',
    icon: 'skip-forward-outline',
    bg: '#fff7ed',
    text: '#c2410c',
    borderColor: '#fed7aa',
    description: 'Collection was skipped at your location.',
  },
  closed: {
    label: 'Closed',
    icon: 'close-circle-outline',
    bg: '#f5f5f4',
    text: '#57534e',
    borderColor: '#e7e5e4',
    description: 'The gate was closed or address was inaccessible.',
  },
};

export default function ResidentCollectionsScreen() {
  const navigation = useNavigation();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      const res = await api.get('/garbage/collection-status');
      setData(res.data);
    } catch (err) {
      console.log('Error fetching collection status:', err);
    } finally {
      setLoading(false);
    }
  };

  // Poll collection status every 30 seconds when in focus
  useFocusEffect(
    React.useCallback(() => {
      fetchStatus();
      const interval = setInterval(fetchStatus, 30000);
      return () => clearInterval(interval);
    }, [])
  );

  const handleCallDriver = (phoneNum) => {
    if (!phoneNum) return;
    Linking.openURL(`tel:${phoneNum}`);
  };

  const goToDashboard = () => {
    navigation.navigate('Dashboard');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    // Prevent timezone shift
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <Layout title="Collection Tracking" subtitle="Live pickup status">
        <LoadingSpinner message="Loading status..." />
      </Layout>
    );
  }

  const collection = data?.collection;
  const route = data?.routeProgress;
  const status = collection ? STATUS_CONFIG[collection.status] || STATUS_CONFIG.pending : null;

  return (
    <Layout title="Collection Tracking" subtitle="Live pickup status">
      <ScreenHeader
        title="Today's Pickup"
        subtitle="Updates every 30 seconds"
        eyebrow="LIVE TRACKING"
      />

      {!data?.reported ? (
        <EmptyState
          icon="package-variant-closed"
          title="No Report Today"
          message="You haven't reported garbage for today yet."
          actionLabel="Report on Home"
          onAction={goToDashboard}
        />
      ) : !data?.todayReport?.available ? (
        <EmptyState
          icon="check-circle-outline"
          iconColor={colors.primary}
          title="No Garbage Reported"
          message="You reported no garbage for today. No collection is expected."
        />
      ) : (
        <View style={styles.trackingPanel}>
          
          {/* Status Hero Card */}
          <View style={styles.heroStatusCard}>
            <View style={styles.heroRow}>
              <View style={[styles.statusIconBox, { backgroundColor: status ? status.bg : '#eff6ff' }]}>
                <MaterialCommunityIcons
                  name={status ? status.icon : 'clock-outline'}
                  size={36}
                  color={status ? status.text : '#1d4ed8'}
                />
              </View>
              <View style={styles.statusTextContainer}>
                <Text style={styles.statusTitle}>
                  {status ? status.label : 'Awaiting Assignment'}
                </Text>
                <Text style={styles.statusDescription}>
                  {collection?.status === 'collected'
                    ? 'Your garbage has been collected successfully!'
                    : collection?.status === 'skipped'
                    ? 'Collection was skipped at your location.'
                    : collection?.status === 'pending'
                    ? 'A truck is assigned and on the way.'
                    : 'Your garbage report is pending assignment to a driver.'}
                </Text>
                {data?.todayReport?.waste_type && (
                  <View style={styles.wasteTypeBadge}>
                    <Text style={styles.wasteTypeBadgeText}>Waste: {data.todayReport.waste_type}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Assigned Driver details */}
            {collection?.driver_name && (
              <View style={styles.driverInfoBox}>
                <View style={styles.driverMetaRow}>
                  <View style={styles.driverAvatarBg}>
                    <MaterialCommunityIcons name="truck-delivery" size={20} color="#52796f" />
                  </View>
                  <View>
                    <Text style={styles.driverLabel}>Assigned Driver</Text>
                    <Text style={styles.driverName}>{collection.driver_name}</Text>
                  </View>
                </View>
                {collection.driver_phone && (
                  <TouchableOpacity
                    onPress={() => handleCallDriver(collection.driver_phone)}
                    style={styles.callDriverBtn}
                    accessibilityRole="button"
                  >
                    <MaterialCommunityIcons name="phone" size={16} color="#52796f" />
                    <Text style={styles.callDriverBtnText}>{collection.driver_phone}</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Route Stats Grid */}
            {route && (
              <View style={styles.routeStatsBox}>
                <View style={styles.routeHeaderRow}>
                  <View style={styles.routeAvatarBg}>
                    <MaterialCommunityIcons name="navigation" size={20} color="#2d6a4f" />
                  </View>
                  <View>
                    <Text style={styles.routeLabel}>Route Info</Text>
                    <Text style={styles.routeTitle}>Stop #{route.householdPosition} of {route.totalStops}</Text>
                  </View>
                </View>
                <View style={styles.routeMetaGrid}>
                  <Text style={styles.routeMetaText}>Distance: {route.totalDistance} km</Text>
                  <Text style={styles.routeMetaText}>Est. Time: ~{route.estimatedTime} min</Text>
                </View>
              </View>
            )}

            {/* Route Progress Bar Slider */}
            {route && (
              <View style={styles.progressContainer}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Route Progress</Text>
                  <Text style={styles.progressPctText}>
                    {route.totalStops > 0 ? Math.round((route.completedStops / route.totalStops) * 100) : 0}%
                  </Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarActive,
                      { width: `${route.totalStops > 0 ? (route.completedStops / route.totalStops) * 100 : 0}%` },
                    ]}
                  />
                </View>
                <View style={styles.progressFooter}>
                  <Text style={styles.progressFooterText}>{route.completedStops} completed</Text>
                  <Text style={styles.progressFooterText}>{route.pendingStops} remaining</Text>
                </View>
              </View>
            )}

          </View>
          
        </View>
      )}

      {data?.recentCollections && data.recentCollections.length > 0 && (
        <View style={styles.recentLogsSection}>
          <View style={styles.recentLogsHeader}>
            <MaterialCommunityIcons name="history" size={20} color="#2d6a4f" />
            <Text style={styles.recentLogsTitle}>Recent Collections</Text>
          </View>
          
          <View style={styles.logsList}>
            {data.recentCollections.map((log, idx) => {
              const cfg = STATUS_CONFIG[log.status] || STATUS_CONFIG.pending;
              return (
                <View key={idx} style={styles.logRow}>
                  <View style={styles.logMeta}>
                    <View style={[styles.logIconBox, { backgroundColor: cfg.bg }]}>
                      <MaterialCommunityIcons name={cfg.icon} size={18} color={cfg.text} />
                    </View>
                    <View>
                      <Text style={styles.logDateText}>{formatDate(log.date)}</Text>
                      {log.driver_name && (
                        <Text style={styles.logDriverText}>Driver: {log.driver_name}</Text>
                      )}
                    </View>
                  </View>
                  <View style={[styles.logBadge, { backgroundColor: cfg.bg }]}>
                    <Text style={[styles.logBadgeText, { color: cfg.text }]}>{cfg.label}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}

      <View style={styles.infoBox}>
        <MaterialCommunityIcons name="information-outline" size={20} color={colors.info} />
        <View style={styles.infoTextContainer}>
          <Text style={styles.infoBoxTitle}>How tracking works</Text>
          <Text style={styles.infoBoxDesc}>
            After you report garbage, a driver is assigned and you can follow route progress here.
          </Text>
        </View>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  trackingPanel: {
    marginBottom: spacing.xl,
  },
  heroStatusCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: '#d8f3dc',
    padding: spacing.xl,
    ...shadows.sm,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  statusIconBox: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  statusDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  wasteTypeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#d8f3dc',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginTop: 8,
  },
  wasteTypeBadgeText: {
    color: '#2d6a4f',
    fontSize: 11,
    fontWeight: '600',
  },
  driverInfoBox: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fafaf8',
    borderWidth: 1,
    borderColor: '#e7e5e4',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 12,
  },
  driverMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  driverAvatarBg: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: 'rgba(82, 121, 111, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverLabel: {
    fontSize: 11,
    color: '#78716c',
  },
  driverName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#292524',
  },
  callDriverBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e7e5e4',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  callDriverBtnText: {
    color: '#52796f',
    fontSize: 13,
    fontWeight: '600',
  },
  routeStatsBox: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fafaf8',
    borderWidth: 1,
    borderColor: '#e7e5e4',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 12,
  },
  routeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  routeAvatarBg: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#d8f3dc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeLabel: {
    fontSize: 11,
    color: '#78716c',
  },
  routeTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1b4332',
  },
  routeMetaGrid: {
    alignItems: 'flex-end',
  },
  routeMetaText: {
    fontSize: 13,
    color: '#57534e',
    fontWeight: '500',
    marginBottom: 2,
  },
  progressContainer: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e7e5e4',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#44403c',
  },
  progressPctText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2d6a4f',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#e7e5e4',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarActive: {
    height: '100%',
    backgroundColor: '#2d6a4f',
    borderRadius: 4,
  },
  progressFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressFooterText: {
    fontSize: 11,
    color: '#78716c',
  },
  recentLogsSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e7e5e4',
    overflow: 'hidden',
    marginBottom: 24,
  },
  recentLogsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f4',
  },
  recentLogsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1c1917',
  },
  logsList: {
    flexDirection: 'column',
  },
  logRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f4',
  },
  logMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logDateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#292524',
  },
  logDriverText: {
    fontSize: 11,
    color: '#78716c',
    marginTop: 2,
  },
  logBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  logBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  infoBox: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
    borderWidth: 1,
    borderRadius: 12,
    gap: 12,
  },
  infoIcon: {
    marginTop: 2,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoBoxTitle: {
    color: '#1d4ed8',
    fontSize: 14,
    fontWeight: '600',
  },
  infoBoxDesc: {
    color: '#1d4ed8',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
});
