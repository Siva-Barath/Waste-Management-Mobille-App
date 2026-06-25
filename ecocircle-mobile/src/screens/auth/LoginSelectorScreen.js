import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../utils/colors';
import { borderRadius, spacing } from '../../utils/spacing';
import { mobileTypography, shadows } from '../../styles/mobileTheme';

const PORTALS = [
  {
    role: 'resident',
    icon: 'home-outline',
    color: colors.primary,
    bg: '#d8f3dc',
    title: 'Resident',
    desc: 'Report waste, track pickups, earn rewards',
    gradient: ['#d8f3dc', '#ffffff'],
  },
];

export default function LoginSelectorScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const goToPortal = () => {
    navigation.navigate('ResidentLogin');
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#e8f5e9', colors.background]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Landing')}
          style={styles.backBtn}
          accessibilityRole="button"
        >
          <MaterialCommunityIcons name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sign In</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: spacing['4xl'] + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.introCard}>
          <View style={styles.introIconWrap}>
            <MaterialCommunityIcons name="account-group" size={28} color={colors.primary} />
          </View>
          <Text style={styles.introTitle}>Sign in to continue</Text>
          <Text style={styles.introDesc}>
            Sign in with your resident account to access your portal.
          </Text>
        </View>

        <View style={styles.list}>
          {PORTALS.map((portal) => (
            <TouchableOpacity
              key={portal.role}
              onPress={goToPortal}
              style={styles.cardOuter}
              accessibilityRole="button"
              activeOpacity={0.75}
            >
              <LinearGradient
                colors={portal.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
              >
                <View style={[styles.iconBadge, { backgroundColor: portal.bg }]}>
                  <MaterialCommunityIcons name={portal.icon} size={30} color={portal.color} />
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{portal.title}</Text>
                  <Text style={styles.cardDesc}>{portal.desc}</Text>
                </View>
                <View style={[styles.arrowCircle, { backgroundColor: portal.bg }]}>
                  <MaterialCommunityIcons name="arrow-right" size={20} color={portal.color} />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.registerLink}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.registerText}>New resident? </Text>
          <Text style={styles.registerLinkText}>Create an account</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    minHeight: 52,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.outline,
    ...shadows.sm,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  headerSpacer: { width: 44 },
  scroll: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['2xl'],
  },
  introCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing['2xl'],
    alignItems: 'center',
    marginBottom: spacing['2xl'],
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.outline,
    ...shadows.sm,
  },
  introIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#d8f3dc',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  introTitle: {
    ...mobileTypography.screenTitle,
    fontSize: 22,
    textAlign: 'center',
  },
  introDesc: {
    ...mobileTypography.screenSubtitle,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  list: { gap: spacing.lg },
  cardOuter: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.sm,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.outline,
    borderRadius: borderRadius.xl,
    gap: spacing.lg,
    minHeight: 96,
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: { flex: 1 },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  arrowCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing['3xl'],
    paddingVertical: spacing.lg,
  },
  registerText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  registerLinkText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
});
