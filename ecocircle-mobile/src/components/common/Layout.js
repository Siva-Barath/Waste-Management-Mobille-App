import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from './NotificationBell';

/**
 * Layout.js - Shared app shell for mobile screens
 *
 * Expo/React Native equivalent of the web Layout component.
 * Preserves the same shared responsibilities:
 * - Top navigation bar
 * - EcoCircle branding
 * - User identity chip
 * - Notification bell
 * - Logout action
 * - Role-based navigation shortcuts
 * - Mobile-friendly responsive behavior
 *
 * Props:
 * - children: screen content
 * - navItems: [{ to, label, icon, end }]
 * - title: optional header title
 * - showNav: whether to render shortcut nav buttons
 */
export default function Layout({ children, navItems = [], title = 'EcoCircle', showNav = true }) {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = useMemo(() => {
    const first = user?.name?.charAt(0)?.toUpperCase() || 'U';
    return first;
  }, [user]);

  const handleLogout = async () => {
    await logout();
  };

  const handleNavigate = (item) => {
    setMenuOpen(false);
    if (item?.to) {
      navigation.navigate(item.to);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.topNav}>
          <View style={styles.navInner}>
            <View style={styles.brandRow}>
              <View style={styles.brandIcon}>
                <MaterialCommunityIcons name="recycle" size={18} color="#ffffff" />
              </View>
              <Text style={styles.brandText}>{title}</Text>
            </View>

            <View style={styles.actionsRow}>
              <View style={styles.userRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>
                <Text style={styles.userName} numberOfLines={1}>
                  {user?.name || 'Guest'}
                </Text>
              </View>

              <NotificationBell />

              <TouchableOpacity
                onPress={handleLogout}
                style={styles.iconButton}
                accessibilityRole="button"
                accessibilityLabel="Logout"
              >
                <MaterialCommunityIcons name="logout" size={20} color="#64748b" />
              </TouchableOpacity>

              {navItems.length > 0 ? (
                <TouchableOpacity
                  onPress={() => setMenuOpen((prev) => !prev)}
                  style={[styles.iconButton, styles.menuButton]}
                  accessibilityRole="button"
                  accessibilityLabel={menuOpen ? 'Close menu' : 'Open menu'}
                >
                  <MaterialCommunityIcons
                    name={menuOpen ? 'close' : 'menu'}
                    size={22}
                    color="#334155"
                  />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          {showNav && navItems.length > 0 && menuOpen ? (
            <View style={styles.mobileNav}>
              {navItems.map((item) => (
                <TouchableOpacity
                  key={item.to}
                  onPress={() => handleNavigate(item)}
                  style={styles.mobileNavItem}
                >
                  <View style={styles.mobileNavIcon}>{item.icon}</View>
                  <Text style={styles.mobileNavLabel}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fafaf8',
  },
  container: {
    flex: 1,
    backgroundColor: '#fafaf8',
  },
  topNav: {
    backgroundColor: '#ffffff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e7e5e4',
    zIndex: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  navInner: {
    minHeight: 60,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexShrink: 1,
  },
  brandIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#2d6a4f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1b4332',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 4,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: '#d8f3dc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#2d6a4f',
    fontSize: 12,
    fontWeight: '700',
  },
  userName: {
    maxWidth: 110,
    color: '#374151',
    fontSize: 13,
    fontWeight: '600',
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#ffffff',
  },
  menuButton: {
    borderWidth: 1,
    borderColor: '#e7e5e4',
  },
  mobileNav: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e7e5e4',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  mobileNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
  },
  mobileNavIcon: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileNavLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
});
