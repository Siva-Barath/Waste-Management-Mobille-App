import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ImageBackground,
  useWindowDimensions,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

/**
 * ResidentLoginScreen - Mobile login screen for residents
 * 
 * Ported from client/src/pages/login/ResidentLogin.jsx:
 * - Green theme resident graphics and demo box on tablets
 * - Login form with phone number, password, eye-toggle visibility, error alert
 * - Redirects dynamically to other portals (Driver, Admin)
 * - Safe scroll container with keyboard avoiding layouts for Android/iOS
 */

const HERO_IMAGE = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=900&q=80';

export default function ResidentLoginScreen() {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 900;

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async () => {
    if (!phone || !password) {
      setError('Phone number and password are required.');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await login(phone, password);
      // AuthProvider triggers stack re-evaluation and mounts AppNavigator.
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigation.navigate('LoginSelector');
  };

  const goToRegister = () => {
    navigation.navigate('Register');
  };

  const goToPortal = (role) => {
    if (role === 'driver') navigation.navigate('DriverLogin');
    if (role === 'admin') navigation.navigate('AdminLogin');
  };

  return (
    <View style={styles.rootContainer}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.mainLayout, isLargeScreen ? styles.rowLayout : styles.columnLayout]}>

          {/* Left Panel — Hero section (rendered on tablets/large screens) */}
          {isLargeScreen && (
            <View style={styles.heroPanel}>
              <ImageBackground
                source={{ uri: HERO_IMAGE }}
                style={styles.heroBg}
                imageStyle={styles.heroImageStyle}
              >
                <View style={styles.heroOverlay} />
                <View style={styles.heroContentContainer}>
                  <View style={styles.heroLogoContainer}>
                    <MaterialCommunityIcons name="home" size={36} color="#ffffff" />
                  </View>
                  <Text style={styles.heroTitle}>Resident Portal</Text>
                  <Text style={styles.heroSubtitle}>
                    Report garbage, track collections, earn rewards for proper waste segregation, and help build a cleaner community.
                  </Text>

                  {/* Benefit Points */}
                  <View style={styles.benefitsList}>
                    {[
                      { step: '1', text: 'Report daily garbage for pickup' },
                      { step: '2', text: 'Track collection status in real-time' },
                      { step: '3', text: 'Earn green points & climb reward tiers' },
                    ].map((item, idx) => (
                      <View key={idx} style={styles.benefitRow}>
                        <View style={styles.benefitNumberBox}>
                          <Text style={styles.benefitNumberText}>{item.step}</Text>
                        </View>
                        <Text style={styles.benefitDescription}>{item.text}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Demo Credentials */}
                  <View style={styles.demoBox}>
                    <Text style={styles.demoTitle}>Demo Account:</Text>
                    <View style={styles.demoRow}>
                      <Text style={styles.demoLabel}>Phone: </Text>
                      <Text style={styles.demoValue}>7000000000</Text>
                    </View>
                    <View style={styles.demoRow}>
                      <Text style={styles.demoLabel}>Password: </Text>
                      <Text style={styles.demoValue}>user123</Text>
                    </View>
                  </View>
                </View>
              </ImageBackground>
            </View>
          )}

          {/* Right Panel — Login Form */}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.formPanel}
          >
            <View style={styles.formContainer}>
              
              {/* Back Button */}
              <TouchableOpacity onPress={handleBack} style={styles.backButtonRow} accessibilityRole="button">
                <MaterialCommunityIcons name="arrow-left" size={16} color="#78716c" />
                <Text style={styles.backButtonText}>Back to Selector</Text>
              </TouchableOpacity>

              {/* Mobile Title Row */}
              <View style={styles.titleRow}>
                <View style={styles.brandIconBg}>
                  <MaterialCommunityIcons name="home" size={20} color="#2d6a4f" />
                </View>
                <Text style={styles.titleText}>Resident Sign In</Text>
              </View>
              <Text style={styles.subtitleText}>Access your household waste management portal</Text>

              {/* Error Box */}
              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* Input Fields */}
              <View style={styles.inputStack}>
                
                {/* Phone field */}
                <View style={styles.inputFieldGroup}>
                  <Text style={styles.inputLabel}>Phone Number</Text>
                  <View style={styles.inputWithIconWrap}>
                    <MaterialCommunityIcons name="phone-outline" size={20} color="#a8a29e" style={styles.leftIcon} />
                    <TextInput
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                      autoCapitalize="none"
                      placeholder="Enter phone number"
                      placeholderTextColor="#a8a29e"
                      style={styles.textInput}
                    />
                  </View>
                </View>

                {/* Password field */}
                <View style={styles.inputFieldGroup}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <View style={styles.inputWithIconWrap}>
                    <MaterialCommunityIcons name="lock-outline" size={20} color="#a8a29e" style={styles.leftIcon} />
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPass}
                      autoCapitalize="none"
                      placeholder="Enter password"
                      placeholderTextColor="#a8a29e"
                      style={[styles.textInput, styles.passwordInputPadding]}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPass((prev) => !prev)}
                      style={styles.rightIconToggle}
                      accessibilityRole="button"
                      accessibilityLabel={showPass ? 'Hide password' : 'Show password'}
                    >
                      <MaterialCommunityIcons
                        name={showPass ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color="#a8a29e"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Submit button */}
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={loading}
                  style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                  accessibilityRole="button"
                >
                  {loading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <View style={styles.submitButtonRow}>
                      <MaterialCommunityIcons name="login" size={20} color="#ffffff" />
                      <Text style={styles.submitButtonText}>Sign In as Resident</Text>
                    </View>
                  )}
                </TouchableOpacity>

              </View>

              {/* Navigation to Register */}
              <View style={styles.registerNavigateRow}>
                <Text style={styles.registerNavigateText}>Don't have an account?</Text>
                <TouchableOpacity onPress={goToRegister} accessibilityRole="button">
                  <Text style={styles.registerNavigateLink}>Register here</Text>
                </TouchableOpacity>
              </View>

              {/* Other Portals Switcher */}
              <View style={styles.portalsSwitcherSection}>
                <Text style={styles.portalsSwitcherLabel}>Other portals</Text>
                <View style={styles.portalsRow}>
                  <TouchableOpacity
                    onPress={() => goToPortal('driver')}
                    style={styles.portalButton}
                    accessibilityRole="button"
                  >
                    <Text style={styles.portalButtonText}>Driver Login</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => goToPortal('admin')}
                    style={styles.portalButton}
                    accessibilityRole="button"
                  >
                    <Text style={styles.portalButtonText}>Admin Login</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Mobile Demo Credentials card */}
              {!isLargeScreen && (
                <View style={styles.mobileDemoBox}>
                  <Text style={styles.mobileDemoTitle}>Demo Account:</Text>
                  <Text style={styles.mobileDemoText}><Text style={styles.mobileDemoLabel}>Phone: </Text>7000000000 / user123</Text>
                </View>
              )}

            </View>
          </KeyboardAvoidingView>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#fafaf8',
  },
  scrollContent: {
    flexGrow: 1,
  },
  mainLayout: {
    flex: 1,
    minHeight: '100%',
  },
  rowLayout: {
    flexDirection: 'row',
  },
  columnLayout: {
    flexDirection: 'column',
  },
  heroPanel: {
    flex: 1,
    minHeight: 520,
  },
  heroBg: {
    flex: 1,
    justifyContent: 'center',
  },
  heroImageStyle: {
    resizeMode: 'cover',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(45, 106, 79, 0.8)',
  },
  heroContentContainer: {
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroLogoContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: '#d6d3d1',
    textAlign: 'center',
    maxWidth: 360,
    marginBottom: 32,
  },
  benefitsList: {
    width: '100%',
    maxWidth: 320,
    gap: 12,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitNumberBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  benefitNumberText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  benefitDescription: {
    color: '#e7e5e4',
    fontSize: 14,
    flex: 1,
  },
  demoBox: {
    marginTop: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 320,
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e7e5e4',
    marginBottom: 10,
  },
  demoRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  demoLabel: {
    fontWeight: '600',
    color: '#ffffff',
  },
  demoValue: {
    color: '#d6d3d1',
  },
  formPanel: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
    backgroundColor: '#fafaf8',
  },
  formContainer: {
    width: '100%',
    maxWidth: 448,
  },
  backButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 32,
  },
  backButtonText: {
    fontSize: 14,
    color: '#78716c',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  brandIconBg: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#d8f3dc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  titleText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1c1917',
  },
  subtitleText: {
    fontSize: 15,
    color: '#78716c',
    marginBottom: 32,
    marginLeft: 52,
  },
  errorBox: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: 8,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 14,
  },
  inputStack: {
    width: '100%',
  },
  inputFieldGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#44403c',
    marginBottom: 8,
  },
  inputWithIconWrap: {
    position: 'relative',
    justifyContent: 'center',
  },
  leftIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  rightIconToggle: {
    position: 'absolute',
    right: 16,
    zIndex: 1,
    padding: 4,
  },
  textInput: {
    width: '100%',
    height: 52,
    paddingLeft: 48,
    paddingRight: 16,
    borderWidth: 1,
    borderColor: '#d6d3d1',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    color: '#1c1917',
    fontSize: 16,
  },
  passwordInputPadding: {
    paddingRight: 52,
  },
  submitButton: {
    width: '100%',
    height: 52,
    backgroundColor: '#2d6a4f',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  registerNavigateRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  registerNavigateText: {
    color: '#78716c',
    fontSize: 14,
  },
  registerNavigateLink: {
    color: '#2d6a4f',
    fontWeight: '600',
    marginLeft: 4,
  },
  portalsSwitcherSection: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#e7e5e4',
  },
  portalsSwitcherLabel: {
    fontSize: 12,
    color: '#a8a29e',
    textAlign: 'center',
    marginBottom: 16,
  },
  portalsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  portalButton: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e7e5e4',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  portalButtonText: {
    color: '#57534e',
    fontSize: 13,
    fontWeight: '500',
  },
  mobileDemoBox: {
    marginTop: 24,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e7e5e4',
    borderRadius: 8,
    padding: 16,
  },
  mobileDemoTitle: {
    fontWeight: '600',
    color: '#44403c',
    marginBottom: 8,
    fontSize: 14,
  },
  mobileDemoText: {
    fontSize: 14,
    color: '#57534e',
  },
  mobileDemoLabel: {
    fontWeight: '500',
    color: '#1c1917',
  },
});
