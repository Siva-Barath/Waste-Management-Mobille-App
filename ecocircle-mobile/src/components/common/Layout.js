import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from './NotificationBell';
import { colors } from '../../utils/colors';
import { borderRadius, spacing } from '../../utils/spacing';
import { shadows } from '../../styles/mobileTheme';

export default function Layout({
  children,
  title = 'EcoCircle',
  subtitle,
  scrollable = true,
  showHeader = true,
}) {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  const initials = useMemo(() => {
    return user?.name?.charAt(0)?.toUpperCase() || 'U';
  }, [user]);

  const content = scrollable ? (
    <ScrollView
      style={styles.content}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingBottom: spacing['4xl'] + insets.bottom },
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.nonScrollableContent, { paddingBottom: insets.bottom }]}>
      {children}
    </View>
  );

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {showHeader ? (
        <View style={styles.headerWrap}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <LinearGradient
                colors={[colors.primary, '#40916c']}
                style={styles.brandIcon}
              >
                <MaterialCommunityIcons name="recycle" size={18} color={colors.textInverse} />
              </LinearGradient>
              <View style={styles.headerTitles}>
                <Text style={styles.brandText} numberOfLines={1}>
                  {title}
                </Text>
                {subtitle ? (
                  <Text style={styles.subtitleText} numberOfLines={1}>
                    {subtitle}
                  </Text>
                ) : null}
              </View>
            </View>

            <View style={styles.headerActions}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <NotificationBell />
              <TouchableOpacity
                onPress={logout}
                style={styles.iconButton}
                accessibilityRole="button"
                accessibilityLabel="Logout"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <MaterialCommunityIcons name="logout" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
          <LinearGradient
            colors={[colors.primary, '#40916c', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.headerAccent}
          />
        </View>
      ) : null}

      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerWrap: {
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  header: {
    minHeight: 56,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerAccent: {
    height: 3,
    width: '100%',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
    marginRight: spacing.md,
  },
  brandIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitles: {
    flex: 1,
  },
  brandText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  subtitleText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: '#d8f3dc',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
    ...shadows.sm,
  },
  avatarText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  nonScrollableContent: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
});
