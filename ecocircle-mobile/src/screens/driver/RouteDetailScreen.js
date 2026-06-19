import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';

const STATUS_COLORS = {
  collected: { bg: '#ecfdf5', text: '#15803d', icon: 'check-circle' },
  pending: { bg: '#eff6ff', text: '#2563eb', icon: 'clock-outline' },
  skipped: { bg: '#fffbeb', text: '#d97706', icon: 'skip-forward' },
  closed: { bg: '#f5f5f4', text: '#57534e', icon: 'door-closed' },
};

export default function RouteDetailScreen() {
  const route = useRoute();
  const { stop, index } = route.params || {};

  if (!stop) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="map-marker-off" size={48} color="#d6d3d1" />
        <Text style={styles.emptyText}>No stop details available</Text>
      </View>
    );
  }

  const status = STATUS_COLORS[stop.collection_status] || STATUS_COLORS.pending;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={[styles.stopBadge, { backgroundColor: status.bg }]}>
          <MaterialCommunityIcons name={status.icon} size={32} color={status.text} />
        </View>
        <Text style={styles.stopNumber}>Stop #{index}</Text>
        <Text style={styles.householdId}>{stop.id}</Text>
        <View style={[styles.statusChip, { backgroundColor: status.bg }]}>
          <Text style={[styles.statusChipText, { color: status.text }]}>
            {(stop.collection_status || 'pending').toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Household Details</Text>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="home" size={20} color="#2d6a4f" />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Address</Text>
            <Text style={styles.detailValue}>{stop.address}</Text>
          </View>
        </View>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="account" size={20} color="#2d6a4f" />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Resident</Text>
            <Text style={styles.detailValue}>{stop.resident_name}</Text>
          </View>
        </View>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="phone" size={20} color="#2d6a4f" />
          <View style={styles.detailContent}>
            <Text style={styles.detailLabel}>Phone</Text>
            <Text style={styles.detailValue}>{stop.resident_phone}</Text>
          </View>
        </View>
        {stop.waste_type && (
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="recycle" size={20} color="#2d6a4f" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Waste Type</Text>
              <Text style={[styles.detailValue, { textTransform: 'capitalize' }]}>{stop.waste_type}</Text>
            </View>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.callBtn}
        onPress={() => Linking.openURL(`tel:${stop.resident_phone}`)}
      >
        <MaterialCommunityIcons name="phone" size={20} color="#fff" />
        <Text style={styles.callBtnText}>Call Resident</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafaf8' },
  content: { padding: 16, paddingBottom: 32 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 48 },
  emptyText: { marginTop: 12, color: '#78716c', fontSize: 14 },
  hero: { alignItems: 'center', marginBottom: 24, paddingVertical: 24 },
  stopBadge: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  stopNumber: { fontSize: 14, color: '#78716c' },
  householdId: { fontSize: 24, fontWeight: '700', color: '#1c1917', marginTop: 4 },
  statusChip: {
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusChipText: { fontSize: 12, fontWeight: '700' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e7e5e4',
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1c1917', marginBottom: 16 },
  detailRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  detailContent: { flex: 1 },
  detailLabel: { fontSize: 12, color: '#78716c' },
  detailValue: { fontSize: 15, fontWeight: '600', color: '#1c1917', marginTop: 2 },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2d6a4f',
    paddingVertical: 16,
    borderRadius: 12,
  },
  callBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
