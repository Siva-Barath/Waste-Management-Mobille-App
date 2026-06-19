import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Layout from '../../components/common/Layout';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import api from '../../services/api';

export default function AdminHouseholdsScreen() {
  const [households, setHouseholds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api
      .get('/admin/households')
      .then((res) => setHouseholds(res.data.households || []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = households.filter(
    (h) =>
      h.id.toLowerCase().includes(search.toLowerCase()) ||
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.ward.toLowerCase().includes(search.toLowerCase()) ||
      h.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout title="EcoCircle">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Households</Text>
          <Text style={styles.subtitle}>{households.length} registered households</Text>
        </View>

        <View style={styles.searchBox}>
          <MaterialCommunityIcons name="magnify" size={20} color="#a8a29e" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search households, wards, names..."
            placeholderTextColor="#a8a29e"
          />
        </View>

        {loading ? (
          <LoadingSpinner />
        ) : filtered.length === 0 ? (
          <View style={styles.empty}>
            <MaterialCommunityIcons name="home-outline" size={48} color="#d6d3d1" />
            <Text style={styles.emptyText}>No households found matching your search.</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {filtered.map((h, i) => (
              <View key={i} style={styles.householdCard}>
                <View style={styles.cardTop}>
                  <View style={styles.idBadge}>
                    <Text style={styles.idText}>{h.id}</Text>
                  </View>
                  <View style={styles.wardChip}>
                    <MaterialCommunityIcons name="map-marker" size={12} color="#78716c" />
                    <Text style={styles.wardChipText}>{h.ward}</Text>
                  </View>
                </View>
                <Text style={styles.householdName}>{h.name}</Text>
                <Text style={styles.address} numberOfLines={2}>{h.address}</Text>
                <View style={styles.footer}>
                  <View style={styles.footerItem}>
                    <MaterialCommunityIcons name="phone" size={12} color="#78716c" />
                    <Text style={styles.footerText}>{h.phone}</Text>
                  </View>
                  <View style={styles.footerItem}>
                    <MaterialCommunityIcons name="account-group" size={12} color="#78716c" />
                    <Text style={styles.footerText}>{h.num_residents} residents</Text>
                  </View>
                </View>
              </View>
            ))}
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
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e7e5e4',
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 14,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1c1917',
  },
  empty: { padding: 48, alignItems: 'center' },
  emptyText: { marginTop: 12, color: '#78716c', textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  householdCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e7e5e4',
    padding: 16,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  idBadge: { backgroundColor: '#d8f3dc', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 },
  idText: { fontSize: 12, fontWeight: '700', color: '#2d6a4f' },
  wardChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f5f5f4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  wardChipText: { fontSize: 11, color: '#78716c', fontWeight: '600' },
  householdName: { fontSize: 16, fontWeight: '700', color: '#1c1917', marginBottom: 4 },
  address: { fontSize: 13, color: '#78716c', marginBottom: 12 },
  footer: { flexDirection: 'row', justifyContent: 'space-between' },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerText: { fontSize: 12, color: '#78716c' },
});
