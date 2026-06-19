import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../utils/colors';
import { borderRadius, spacing } from '../../utils/spacing';
import { mobileTypography, shadows } from '../../styles/mobileTheme';

const { width: SCREEN_W } = Dimensions.get('window');

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=900&q=80';

const FEATURES = [
  {
    icon: 'brain',
    title: 'Smart Sorting',
    desc: 'Classify waste at every pickup',
    accent: colors.primary,
    bg: '#d8f3dc',
  },
  {
    icon: 'map-marker-path',
    title: 'Optimized Routes',
    desc: 'Faster collections, less fuel',
    accent: '#2563eb',
    bg: '#dbeafe',
  },
  {
    icon: 'star-four-points',
    title: 'Green Rewards',
    desc: 'Points for proper segregation',
    accent: '#b45309',
    bg: '#fef3c7',
  },
  {
    icon: 'bell-ring-outline',
    title: 'Live Updates',
    desc: 'Alerts for pickups and routes',
    accent: '#7c3aed',
    bg: '#ede9fe',
  },
];

const STEPS = [
  { num: '1', title: 'Register', desc: 'Set up your household', icon: 'account-plus' },
  { num: '2', title: 'Report', desc: 'Confirm daily availability', icon: 'clipboard-check' },
  { num: '3', title: 'Track', desc: 'Follow pickup progress', icon: 'truck-delivery' },
  { num: '4', title: 'Earn', desc: 'Collect reward points', icon: 'gift' },
];

const PORTALS = [
  {
    role: 'resident',
    icon: 'home-outline',
    color: colors.primary,
    bg: '#d8f3dc',
    title: 'Resident',
    desc: 'Report waste & track pickups',
    route: 'LoginSelector',
  },
  {
    role: 'driver',
    icon: 'truck-outline',
    color: colors.secondary,
    bg: 'rgba(82,121,111,0.12)',
    title: 'Driver',
    desc: 'Manage collection routes',
    route: 'DriverLogin',
  },
];

export default function LandingScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const navHeight = 56 + insets.top;

  return (
    <View style={styles.root}>
      <View style={[styles.topNav, { paddingTop: insets.top, height: navHeight }]}>
        <View style={styles.brandRow}>
          <View style={styles.brandIcon}>
            <MaterialCommunityIcons name="recycle" size={18} color={colors.textInverse} />
          </View>
          <Text style={styles.brandText}>EcoCircle</Text>
        </View>
        <TouchableOpacity
          style={styles.signInBtn}
          onPress={() => navigation.navigate('LoginSelector')}
          accessibilityRole="button"
        >
          <Text style={styles.signInText}>Sign In</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing['4xl'] + insets.bottom }}
        bounces
      >
        {/* Hero */}
        <View style={[styles.heroWrap, { marginTop: navHeight }]}>
          <ImageBackground
            source={{ uri: HERO_IMAGE }}
            style={styles.heroImage}
            imageStyle={styles.heroImageStyle}
          >
            <LinearGradient
              colors={['rgba(27,67,50,0.2)', 'rgba(27,67,50,0.75)', 'rgba(27,67,50,0.95)']}
              locations={[0, 0.5, 1]}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.heroContent}>
              <Text style={styles.heroEyebrow}>Smart waste management</Text>
              <Text style={styles.heroTitle}>Cleaner communities,{'\n'}one ward at a time</Text>
              <Text style={styles.heroSubtitle}>
                Report waste, track pickups, and earn rewards — all from your phone.
              </Text>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => navigation.navigate('Register')}
                accessibilityRole="button"
                activeOpacity={0.85}
              >
                <Text style={styles.primaryBtnText}>Create Account</Text>
                <MaterialCommunityIcons name="arrow-right" size={20} color={colors.textInverse} />
              </TouchableOpacity>
            </View>
          </ImageBackground>
          <View style={styles.heroCurve} />
        </View>

        {/* Trust — single clean row */}
        <View style={styles.trustBar}>
          {['Secure', 'Real-time', 'GPS Verified'].map((label) => (
            <View key={label} style={styles.trustItem}>
              <MaterialCommunityIcons name="check" size={14} color={colors.primary} />
              <Text style={styles.trustText}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why EcoCircle</Text>
          <Text style={styles.sectionSubtitle}>Everything you need for smarter waste management</Text>
          <View style={styles.featureGrid}>
            {FEATURES.map((item) => (
              <View key={item.title} style={styles.featureCard}>
                <View style={[styles.featureIcon, { backgroundColor: item.bg }]}>
                  <MaterialCommunityIcons name={item.icon} size={22} color={item.accent} />
                </View>
                <Text style={styles.featureTitle}>{item.title}</Text>
                <Text style={styles.featureDesc} numberOfLines={2}>
                  {item.desc}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* How it works — compact grid */}
        <View style={[styles.section, styles.sectionMuted]}>
          <Text style={styles.sectionTitle}>How it works</Text>
          <Text style={styles.sectionSubtitle}>Four simple steps to get started</Text>
          <View style={styles.stepsGrid}>
            {STEPS.map((step) => (
              <View key={step.num} style={styles.stepCard}>
                <View style={styles.stepBadge}>
                  <MaterialCommunityIcons name={step.icon} size={18} color={colors.textInverse} />
                </View>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDesc}>{step.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Portals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sign in to your portal</Text>
          <Text style={styles.sectionSubtitle}>Choose your role to continue</Text>
          <View style={styles.portalRow}>
            {PORTALS.map((portal) => (
              <TouchableOpacity
                key={portal.role}
                style={styles.portalCard}
                onPress={() => navigation.navigate(portal.route)}
                accessibilityRole="button"
                activeOpacity={0.7}
              >
                <View style={[styles.portalIcon, { backgroundColor: portal.bg }]}>
                  <MaterialCommunityIcons name={portal.icon} size={24} color={portal.color} />
                </View>
                <Text style={styles.portalTitle}>{portal.title}</Text>
                <Text style={styles.portalDesc}>{portal.desc}</Text>
                <MaterialCommunityIcons
                  name="arrow-right"
                  size={18}
                  color={colors.primary}
                  style={styles.portalArrow}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerBrand}>
            <View style={styles.footerIcon}>
              <MaterialCommunityIcons name="recycle" size={14} color={colors.textInverse} />
            </View>
            <Text style={styles.footerBrandText}>EcoCircle</Text>
          </View>
          <Text style={styles.footerCopy}>
            © {new Date().getFullYear()} EcoCircle · Circular Waste Intelligence
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const CARD_W = (SCREEN_W - spacing.xl * 2 - spacing.md) / 2;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topNav: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.outline,
    ...shadows.sm,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  brandIcon: {
    width: 34,
    height: 34,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  signInBtn: {
    minHeight: 38,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
    backgroundColor: '#d8f3dc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signInText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  heroWrap: {
    position: 'relative',
  },
  heroImage: {
    width: SCREEN_W,
    minHeight: 380,
    justifyContent: 'flex-end',
  },
  heroImageStyle: {
    resizeMode: 'cover',
  },
  heroContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['3xl'],
    paddingBottom: spacing['3xl'] + 16,
  },
  heroEyebrow: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 0.3,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textInverse,
    lineHeight: 34,
    letterSpacing: -0.3,
    marginBottom: spacing.md,
  },
  heroSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: spacing['2xl'],
    maxWidth: 320,
  },
  primaryBtn: {
    alignSelf: 'flex-start',
    minHeight: 50,
    paddingHorizontal: spacing['2xl'],
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    ...shadows.md,
  },
  primaryBtnText: {
    color: colors.textInverse,
    fontSize: 16,
    fontWeight: '600',
  },
  heroCurve: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 20,
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  trustBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xl,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.xl,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.outline,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trustText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  section: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['3xl'],
    paddingBottom: spacing.lg,
  },
  sectionMuted: {
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.outline,
    marginTop: spacing.md,
  },
  sectionTitle: {
    ...mobileTypography.sectionTitle,
    fontSize: 20,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.md,
  },
  featureCard: {
    width: CARD_W,
    minHeight: 128,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.outline,
    ...shadows.sm,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  featureTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
  },
  stepsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.md,
  },
  stepCard: {
    width: CARD_W,
    minHeight: 128,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.outline,
  },
  stepBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
  },
  portalRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  portalCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.outline,
    ...shadows.sm,
  },
  portalIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  portalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  portalDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 17,
    marginBottom: spacing.md,
  },
  portalArrow: {
    alignSelf: 'flex-start',
  },
  footer: {
    paddingVertical: spacing['3xl'],
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  footerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  footerIcon: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerBrandText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  footerCopy: {
    fontSize: 11,
    color: colors.textTertiary,
    textAlign: 'center',
  },
});
