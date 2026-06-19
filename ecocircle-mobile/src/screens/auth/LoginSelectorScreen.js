import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

/**
 * LoginSelectorScreen - Screen to choose which role's login portal to enter
 * 
 * Replicates the "Choose Your Portal" section from the web client
 * Roles:
 * - Resident: /login/resident
 * - Driver: /login/driver
 * - Admin: /login/admin
 */

export default function LoginSelectorScreen() {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const goToPortal = (role) => {
    if (role === 'resident') navigation.navigate('ResidentLogin');
    if (role === 'driver') navigation.navigate('DriverLogin');
    if (role === 'admin') navigation.navigate('AdminLogin');
  };

  const handleBack = () => {
    navigation.navigate('Landing');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn} accessibilityRole="button">
          <MaterialCommunityIcons name="arrow-left" size={20} color="#57534e" />
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>EcoCircle</Text>
        <View style={{ width: 60 }} /> {/* empty spacer */}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <View style={styles.headerSection}>
            <Text style={styles.titleText}>Choose Your Portal</Text>
            <Text style={styles.subtitleText}>
              Select your role to access the correct dashboard and collection metrics.
            </Text>
          </View>

          <View style={[styles.portalGrid, isTablet && styles.rowLayout]}>
            
            {/* Resident Card */}
            <TouchableOpacity
              onPress={() => goToPortal('resident')}
              style={[styles.portalCard, isTablet && styles.flexCard]}
              accessibilityRole="button"
            >
              <View style={[styles.iconBadge, styles.badgeGreen]}>
                <MaterialCommunityIcons name="home-outline" size={32} color="#2d6a4f" />
              </View>
              <Text style={styles.portalTitle}>Resident Portal</Text>
              <Text style={styles.portalDescription}>
                Report daily waste availability, view collection routes in real-time, and earn green reward points.
              </Text>
              <View style={styles.actionRow}>
                <Text style={[styles.actionText, { color: '#2d6a4f' }]}>Resident Sign In</Text>
                <MaterialCommunityIcons name="arrow-right" size={18} color="#2d6a4f" />
              </View>
            </TouchableOpacity>

            {/* Driver Card */}
            <TouchableOpacity
              onPress={() => goToPortal('driver')}
              style={[styles.portalCard, isTablet && styles.flexCard]}
              accessibilityRole="button"
            >
              <View style={[styles.iconBadge, styles.badgeTeal]}>
                <MaterialCommunityIcons name="truck-outline" size={32} color="#52796f" />
              </View>
              <Text style={styles.portalTitle}>Driver Portal</Text>
              <Text style={styles.portalDescription}>
                Access dynamic collection routing, log pickups, skip missed stops, and update task status.
              </Text>
              <View style={styles.actionRow}>
                <Text style={[styles.actionText, { color: '#52796f' }]}>Driver Sign In</Text>
                <MaterialCommunityIcons name="arrow-right" size={18} color="#52796f" />
              </View>
            </TouchableOpacity>

            {/* Admin Card */}
            <TouchableOpacity
              onPress={() => goToPortal('admin')}
              style={[styles.portalCard, isTablet && styles.flexCard]}
              accessibilityRole="button"
            >
              <View style={[styles.iconBadge, styles.badgeDark]}>
                <MaterialCommunityIcons name="shield-outline" size={32} color="#1b4332" />
              </View>
              <Text style={styles.portalTitle}>Admin Portal</Text>
              <Text style={styles.portalDescription}>
                Manage household assignments, track active drivers, optimize route schedules, and analyze waste metrics.
              </Text>
              <View style={styles.actionRow}>
                <Text style={[styles.actionText, { color: '#1b4332' }]}>Admin Sign In</Text>
                <MaterialCommunityIcons name="arrow-right" size={18} color="#1b4332" />
              </View>
            </TouchableOpacity>

          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fafaf8',
  },
  header: {
    height: 56,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e7e5e4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    width: 60,
  },
  backBtnText: {
    fontSize: 14,
    color: '#57534e',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1b4332',
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingVertical: 36,
    paddingHorizontal: 24,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 36,
  },
  titleText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1c1917',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 14,
    color: '#78716c',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 400,
  },
  portalGrid: {
    flexDirection: 'column',
    gap: 20,
  },
  rowLayout: {
    flexDirection: 'row',
  },
  flexCard: {
    flex: 1,
  },
  portalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e7e5e4',
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  badgeGreen: {
    backgroundColor: '#d8f3dc',
  },
  badgeTeal: {
    backgroundColor: 'rgba(82, 121, 111, 0.15)',
  },
  badgeDark: {
    backgroundColor: 'rgba(27, 67, 50, 0.1)',
  },
  portalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1c1917',
    marginBottom: 8,
  },
  portalDescription: {
    fontSize: 13,
    lineHeight: 18,
    color: '#78716c',
    textAlign: 'center',
    marginBottom: 20,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
