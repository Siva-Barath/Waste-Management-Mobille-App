import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ImageBackground,
  TouchableOpacity,
  useWindowDimensions,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

/**
 * LandingScreen - Mobile landing page for unauthenticated users
 * 
 * Ported from client/src/pages/Landing.jsx:
 * - Green theme branding header
 * - Hero welcome image layout with CTA buttons
 * - Horizontal scrolling trust metrics bar
 * - Visual features section with images and icons
 * - Illustrated How-it-works process steps
 * - Dynamic environmental impact counters
 * - Role-specific dashboard selector panels
 * - Responsive sizing for phones and Android tablets
 */

const HERO_IMAGE = 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=900&q=80';
const IMPACT_IMAGE = 'https://images.unsplash.com/photo-1495556650867-99590cea3657?w=900&q=80';

const FEATURES = [
  {
    img: 'https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=400&q=80',
    icon: 'recycle',
    title: 'AI Waste Classification',
    desc: 'Automatically classify waste as biodegradable, recyclable, or hazardous using computer vision at the point of collection.',
  },
  {
    img: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&q=80',
    icon: 'truck',
    title: 'Route Optimization',
    desc: 'Smart algorithms calculate the most efficient collection routes, reducing fuel consumption and carbon emissions by up to 40%.',
  },
  {
    img: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&q=80',
    icon: 'chart-bar',
    title: 'Incentive Rewards',
    desc: 'Earn green points for proper waste segregation. A transparent reward system promotes responsible waste disposal.',
  },
];

const STEPS = [
  { step: '1', title: 'Register', desc: 'Create household account with GPS coordinates', img: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&q=80' },
  { step: '2', title: 'Report', desc: 'Confirm garbage availability each day', img: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=300&q=80' },
  { step: '3', title: 'Optimize', desc: 'AI calculates optimized routing maps', img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&q=80' },
  { step: '4', title: 'Collect', desc: 'Trucks gather bins cleanly and fast', img: 'https://images.unsplash.com/photo-1616432043562-3671ea2e5242?w=300&q=80' },
];

export default function LandingScreen() {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const goToLoginSelector = () => {
    navigation.navigate('LoginSelector');
  };

  const goToRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* Top Navigation Bar */}
      <View style={styles.navBar}>
        <View style={styles.logoRow}>
          <View style={styles.logoIconBg}>
            <MaterialCommunityIcons name="recycle" size={18} color="#ffffff" />
          </View>
          <Text style={styles.logoText}>EcoCircle</Text>
        </View>
        <TouchableOpacity
          onPress={goToLoginSelector}
          style={styles.navLoginBtn}
          accessibilityRole="button"
        >
          <Text style={styles.navLoginBtnText}>Sign In</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Hero Banner Section */}
        <ImageBackground source={{ uri: HERO_IMAGE }} style={styles.heroSection} imageStyle={styles.heroImageStyle}>
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>Smart Waste Collection</Text>
            </View>
            <Text style={styles.heroTitle}>Building Cleaner Communities, Together</Text>
            <Text style={styles.heroSubtitle}>
              AI-optimized collection routes, real-time tracking, and a transparent rewards system — making responsible waste management effortless.
            </Text>
            
            <View style={[styles.heroActions, isTablet && styles.rowActions]}>
              <TouchableOpacity onPress={goToRegister} style={styles.heroBtnPrimary} accessibilityRole="button">
                <Text style={styles.heroBtnPrimaryText}>Start Contributing</Text>
                <MaterialCommunityIcons name="arrow-right" size={18} color="#ffffff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={goToLoginSelector} style={styles.heroBtnSecondary} accessibilityRole="button">
                <Text style={styles.heroBtnSecondaryText}>Choose Portal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>

        {/* Horizontal Trust Metrics Row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.trustBar}
        >
          {[
            { label: 'Secure & Private', icon: 'shield-outline', color: '#2d6a4f' },
            { label: 'Real-time Tracking', icon: 'clock-outline', color: '#d4a373' },
            { label: 'Multi-lingual Support', icon: 'earth', color: '#52796f' },
            { label: 'AI-Optimized Route', icon: 'recycle', color: '#2d6a4f' },
          ].map((item, idx) => (
            <View key={idx} style={styles.trustItem}>
              <MaterialCommunityIcons name={item.icon} size={18} color={item.color} />
              <Text style={styles.trustItemText}>{item.label}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Features / How We Help Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeaderTitle}>How We Help</Text>
          <Text style={styles.sectionHeaderSubtitle}>
            Our platform combines AI, optimized logistics, and community incentives to build a truly circular waste economy.
          </Text>

          <View style={[styles.cardsGrid, isTablet && styles.rowLayout]}>
            {FEATURES.map((item, idx) => (
              <View key={idx} style={[styles.featureCard, isTablet && styles.flexCard]}>
                <Image source={{ uri: item.img }} style={styles.featureCardImg} />
                <View style={styles.featureCardContent}>
                  <View style={styles.featureIconBadge}>
                    <MaterialCommunityIcons name={item.icon} size={20} color="#2d6a4f" />
                  </View>
                  <Text style={styles.featureCardTitle}>{item.title}</Text>
                  <Text style={styles.featureCardDesc}>{item.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Process flow / How it works Section */}
        <View style={[styles.sectionContainer, styles.bgWhite]}>
          <Text style={styles.sectionHeaderTitle}>How It Works</Text>
          <Text style={styles.sectionHeaderSubtitle}>Four simple steps to a cleaner neighborhood</Text>

          <View style={[styles.cardsGrid, isTablet && styles.rowLayout]}>
            {STEPS.map((item, idx) => (
              <View key={idx} style={[styles.stepCard, isTablet && styles.flexCard]}>
                <Image source={{ uri: item.img }} style={styles.stepCardImg} />
                <View style={styles.stepNumberBadge}>
                  <Text style={styles.stepNumberBadgeText}>{item.step}</Text>
                </View>
                <Text style={styles.stepTitle}>{item.title}</Text>
                <Text style={styles.stepDesc}>{item.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Dynamic Impact Counters (Image bg overlay) */}
        <ImageBackground source={{ uri: IMPACT_IMAGE }} style={styles.impactSection} imageStyle={styles.heroImageStyle}>
          <View style={styles.impactOverlay} />
          <View style={styles.impactContentContainer}>
            <Text style={styles.impactTitle}>Environmental Impact</Text>
            <Text style={styles.impactSubtitle}>Together, we are building a sustainable future</Text>
            
            <View style={styles.impactGrid}>
              {[
                { val: '12,000+', label: 'Connected Homes' },
                { val: '40%', label: 'Emission Cut' },
                { val: '95%', label: 'Sorting Accuracy' },
                { val: '₹2.5L', label: 'Paid Rewards' },
              ].map((item, idx) => (
                <View key={idx} style={styles.impactGridItem}>
                  <Text style={styles.impactValueText}>{item.val}</Text>
                  <Text style={styles.impactLabelText}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </ImageBackground>

        {/* Choosing Portals Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeaderTitle}>Choose Your Portal</Text>
          <Text style={styles.sectionHeaderSubtitle}>Sign in based on your role to access the right dashboard</Text>

          <View style={[styles.cardsGrid, isTablet && styles.rowLayout]}>
            
            {/* Resident Card */}
            <TouchableOpacity onPress={goToLoginSelector} style={[styles.portalLinkCard, isTablet && styles.flexCard]} accessibilityRole="button">
              <View style={[styles.portalIconBadge, styles.badgeGreen]}>
                <MaterialCommunityIcons name="home-outline" size={26} color="#2d6a4f" />
              </View>
              <Text style={styles.portalTitle}>Resident Login</Text>
              <Text style={styles.portalDesc}>Report garbage, track collections, and earn points for proper waste sorting.</Text>
              <View style={styles.portalActionRow}>
                <Text style={[styles.portalActionLinkText, { color: '#2d6a4f' }]}>Sign In</Text>
                <MaterialCommunityIcons name="arrow-right" size={16} color="#2d6a4f" />
              </View>
            </TouchableOpacity>

            {/* Driver Card */}
            <TouchableOpacity onPress={goToLoginSelector} style={[styles.portalLinkCard, isTablet && styles.flexCard]} accessibilityRole="button">
              <View style={[styles.portalIconBadge, styles.badgeTeal]}>
                <MaterialCommunityIcons name="truck-outline" size={26} color="#52796f" />
              </View>
              <Text style={styles.portalTitle}>Driver Login</Text>
              <Text style={styles.portalDesc}>View active collection routes, navigate to stops, and verify collection status.</Text>
              <View style={styles.portalActionRow}>
                <Text style={[styles.portalActionLinkText, { color: '#52796f' }]}>Sign In</Text>
                <MaterialCommunityIcons name="arrow-right" size={16} color="#52796f" />
              </View>
            </TouchableOpacity>

            {/* Admin Card */}
            <TouchableOpacity onPress={goToLoginSelector} style={[styles.portalLinkCard, isTablet && styles.flexCard]} accessibilityRole="button">
              <View style={[styles.portalIconBadge, styles.badgeDark]}>
                <MaterialCommunityIcons name="shield-outline" size={26} color="#1b4332" />
              </View>
              <Text style={styles.portalTitle}>Admin Login</Text>
              <Text style={styles.portalDesc}>Municipality dashboard to monitor reports, schedule routes, and view analytics.</Text>
              <View style={styles.portalActionRow}>
                <Text style={[styles.portalActionLinkText, { color: '#1b4332' }]}>Sign In</Text>
                <MaterialCommunityIcons name="arrow-right" size={16} color="#1b4332" />
              </View>
            </TouchableOpacity>

          </View>
        </View>

        {/* Bottom Call-to-action */}
        <View style={styles.bottomCtaSection}>
          <MaterialCommunityIcons name="leaf" size={40} color="#2d6a4f" />
          <Text style={styles.bottomCtaTitle}>Ready to Make a Difference?</Text>
          <Text style={styles.bottomCtaText}>
            Join thousands of households already contributing to a cleaner, greener community through smart waste management.
          </Text>
          <TouchableOpacity onPress={goToRegister} style={styles.ctaButton} accessibilityRole="button">
            <Text style={styles.ctaButtonText}>Join EcoCircle Today</Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color="#ffffff" style={styles.ctaBtnIcon} />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footerSection}>
          <View style={styles.footerBranding}>
            <View style={styles.logoIconBg}>
              <MaterialCommunityIcons name="recycle" size={16} color="#ffffff" />
            </View>
            <Text style={styles.footerBrandText}>EcoCircle</Text>
          </View>
          <Text style={styles.footerInfoText}>
            Circular Waste Intelligence System © {new Date().getFullYear()}
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  navBar: {
    height: 60,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e7e5e4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIconBg: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#2d6a4f',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  logoText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1b4332',
  },
  navLoginBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  navLoginBtnText: {
    color: '#2d6a4f',
    fontWeight: '600',
    fontSize: 14,
  },
  scrollContent: {
    flexGrow: 1,
  },
  heroSection: {
    height: 480,
    justifyContent: 'center',
  },
  heroImageStyle: {
    resizeMode: 'cover',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  heroContent: {
    paddingHorizontal: 24,
    alignItems: 'flex-start',
  },
  heroBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginBottom: 16,
  },
  heroBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: '#d6d3d1',
    marginBottom: 28,
    maxWidth: 480,
  },
  heroActions: {
    flexDirection: 'column',
    width: '100%',
    gap: 12,
  },
  rowActions: {
    flexDirection: 'row',
    width: 'auto',
  },
  heroBtnPrimary: {
    height: 48,
    backgroundColor: '#2d6a4f',
    borderRadius: 8,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  heroBtnPrimaryText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 15,
  },
  heroBtnSecondary: {
    height: 48,
    borderColor: '#ffffff',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBtnSecondaryText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 15,
  },
  trustBar: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    gap: 8,
  },
  trustItemText: {
    fontSize: 13,
    color: '#57534e',
    fontWeight: '500',
  },
  sectionContainer: {
    paddingVertical: 48,
    paddingHorizontal: 20,
    backgroundColor: '#fafaf8',
  },
  bgWhite: {
    backgroundColor: '#ffffff',
  },
  sectionHeaderTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1c1917',
    textAlign: 'center',
    marginBottom: 8,
  },
  sectionHeaderSubtitle: {
    fontSize: 14,
    color: '#78716c',
    textAlign: 'center',
    marginBottom: 36,
    lineHeight: 20,
    maxWidth: 480,
    alignSelf: 'center',
  },
  cardsGrid: {
    flexDirection: 'column',
    gap: 24,
  },
  rowLayout: {
    flexDirection: 'row',
  },
  flexCard: {
    flex: 1,
  },
  featureCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e7e5e4',
  },
  featureCardImg: {
    height: 160,
    width: '100%',
    resizeMode: 'cover',
  },
  featureCardContent: {
    padding: 20,
  },
  featureIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#d8f3dc',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  featureCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1c1917',
    marginBottom: 8,
  },
  featureCardDesc: {
    fontSize: 13,
    lineHeight: 18,
    color: '#78716c',
  },
  stepCard: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e7e5e4',
    padding: 16,
  },
  stepCardImg: {
    height: 100,
    width: '100%',
    borderRadius: 8,
    marginBottom: 16,
    resizeMode: 'cover',
  },
  stepNumberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2d6a4f',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  stepNumberBadgeText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1c1917',
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 12,
    lineHeight: 16,
    color: '#78716c',
    textAlign: 'center',
  },
  impactSection: {
    paddingVertical: 56,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  impactOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(27, 67, 50, 0.85)',
  },
  impactContentContainer: {
    alignItems: 'center',
  },
  impactTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  impactSubtitle: {
    fontSize: 14,
    color: '#d6d3d1',
    marginBottom: 36,
  },
  impactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
    gap: 24,
  },
  impactGridItem: {
    width: '45%',
    alignItems: 'center',
    marginBottom: 8,
  },
  impactValueText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
  },
  impactLabelText: {
    fontSize: 12,
    color: '#d6d3d1',
    marginTop: 4,
    textAlign: 'center',
  },
  portalLinkCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e7e5e4',
    padding: 24,
    alignItems: 'center',
  },
  portalIconBadge: {
    width: 52,
    height: 52,
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
    fontSize: 16,
    fontWeight: '700',
    color: '#1c1917',
    marginBottom: 8,
  },
  portalDesc: {
    fontSize: 13,
    lineHeight: 18,
    color: '#78716c',
    textAlign: 'center',
    marginBottom: 16,
  },
  portalActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  portalActionLinkText: {
    fontSize: 13,
    fontWeight: '600',
  },
  bottomCtaSection: {
    paddingVertical: 56,
    paddingHorizontal: 24,
    alignItems: 'center',
    backgroundColor: '#fafaf8',
    borderTopWidth: 1,
    borderTopColor: '#e7e5e4',
  },
  bottomCtaTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1c1917',
    marginTop: 16,
    marginBottom: 8,
  },
  bottomCtaText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#78716c',
    textAlign: 'center',
    maxWidth: 480,
    marginBottom: 28,
  },
  ctaButton: {
    height: 52,
    backgroundColor: '#2d6a4f',
    borderRadius: 8,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  ctaBtnIcon: {
    marginLeft: 8,
  },
  footerSection: {
    backgroundColor: '#1b4332',
    paddingVertical: 32,
    alignItems: 'center',
    gap: 12,
  },
  footerBranding: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerBrandText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
  footerInfoText: {
    color: '#a8a29e',
    fontSize: 12,
  },
});
