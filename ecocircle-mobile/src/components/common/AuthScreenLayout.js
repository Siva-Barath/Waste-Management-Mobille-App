import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../utils/colors';
import { borderRadius, spacing } from '../../utils/spacing';
import { mobileTypography, shadows } from '../../styles/mobileTheme';

export default function AuthScreenLayout({
  children,
  onBack,
  backLabel = 'Back',
  icon,
  iconColor = colors.primary,
  iconBg = '#d8f3dc',
  title,
  subtitle,
  accentColor = colors.primary,
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#e8f5e9', colors.background, colors.background]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.topBar, { paddingTop: insets.top }]}>
        {onBack ? (
          <TouchableOpacity
            onPress={onBack}
            style={styles.backBtn}
            accessibilityRole="button"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialCommunityIcons name="arrow-left" size={22} color={colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.backPlaceholder} />
        )}
        <View style={styles.topBrand}>
          <View style={[styles.topBrandIcon, { backgroundColor: accentColor }]}>
            <MaterialCommunityIcons name="recycle" size={14} color={colors.textInverse} />
          </View>
          <Text style={styles.topBrandText}>EcoCircle</Text>
        </View>
        <View style={styles.backPlaceholder} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: spacing['4xl'] + insets.bottom },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
              <MaterialCommunityIcons name={icon} size={32} color={iconColor} />
            </View>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            <View style={[styles.accentLine, { backgroundColor: accentColor }]} />
          </View>

          <View style={styles.formCard}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    minHeight: 52,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.outline,
    ...shadows.sm,
    zIndex: 10,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
  },
  backPlaceholder: { width: 44 },
  topBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  topBrandIcon: {
    width: 26,
    height: 26,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBrandText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['2xl'],
  },
  hero: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  title: {
    ...mobileTypography.screenTitle,
    textAlign: 'center',
  },
  subtitle: {
    ...mobileTypography.screenSubtitle,
    marginTop: spacing.sm,
    textAlign: 'center',
    maxWidth: 300,
  },
  accentLine: {
    width: 48,
    height: 4,
    borderRadius: 2,
    marginTop: spacing.lg,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.outline,
    ...shadows.md,
  },
});
