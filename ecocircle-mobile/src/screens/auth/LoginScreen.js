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
 * LoginScreen - React Native Expo version of the web Login page
 * 
 * Preserves:
 * - Green eco theme styling and visual language
 * - Responsiveness: split layout on tablets/web width, clean scroll container on phone
 * - Complete login state, handlers, and validation
 * - Demo account credential cards
 */

const HERO_IMAGE = 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=900&q=80';

export default function LoginScreen() {
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
      // Auth state update in AuthProvider will automatically switch RootNavigator stack.
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const goToRegister = () => {
    navigation.navigate('Register');
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
                    <MaterialCommunityIcons name="recycle" size={36} color="#ffffff" />
                  </View>
                  <Text style={styles.heroTitle}>Welcome Back</Text>
                  <Text style={styles.heroSubtitle}>
                    Sign in to continue your journey towards a cleaner, sustainable community.
                  </Text>

                  {/* Demo Credentials */}
                  <View style={styles.demoBox}>
                    <Text style={styles.demoTitle}>Demo Accounts:</Text>
                    <View style={styles.demoRow}>
                      <Text style={styles.demoLabel}>Resident: </Text>
                      <Text style={styles.demoValue}>7000000000 / user123</Text>
                    </View>
                    <View style={styles.demoRow}>
                      <Text style={styles.demoLabel}>Driver: </Text>
                      <Text style={styles.demoValue}>8000000001 / driver123</Text>
                    </View>
                    <View style={styles.demoRow}>
                      <Text style={styles.demoLabel}>Admin: </Text>
                      <Text style={styles.demoValue}>9999999999 / admin123</Text>
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
              
              {/* Mobile Brand Row (rendered on phone size) */}
              {!isLargeScreen && (
                <View style={styles.mobileBrandRow}>
                  <View style={styles.mobileBrandIcon}>
                    <MaterialCommunityIcons name="recycle" size={20} color="#ffffff" />
                  </View>
                  <Text style={styles.mobileBrandText}>EcoCircle</Text>
                </View>
              )}

              <Text style={styles.titleText}>Sign In</Text>
              <Text style={styles.subtitleText}>Enter your credentials to access your account</Text>

              {/* Error Box */}
              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* Form Input Groups */}
              <View style={styles.inputStack}>
                
                {/* Phone input */}
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

                {/* Password input */}
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
                      <Text style={styles.submitButtonText}>Sign In</Text>
                    </View>
                  )}
                </TouchableOpacity>

              </View>

              {/* Navigation to register */}
              <View style={styles.registerNavigateRow}>
                <Text style={styles.registerNavigateText}>Don't have an account?</Text>
                <TouchableOpacity onPress={goToRegister} accessibilityRole="button">
                  <Text style={styles.registerNavigateLink}>Register here</Text>
                </TouchableOpacity>
              </View>

              {/* Mobile Demo Credentials card */}
              {!isLargeScreen && (
                <View style={styles.mobileDemoBox}>
                  <Text style={styles.mobileDemoTitle}>Demo Accounts:</Text>
                  <Text style={styles.mobileDemoText}><Text style={styles.mobileDemoLabel}>Resident:</Text> 7000000000 / user123</Text>
                  <Text style={styles.mobileDemoText}><Text style={styles.mobileDemoLabel}>Driver:</Text> 8000000001 / driver123</Text>
                  <Text style={styles.mobileDemoText}><Text style={styles.mobileDemoLabel}>Admin:</Text> 9999999999 / admin123</Text>
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
    backgroundColor: 'rgba(27, 67, 50, 0.75)',
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
    marginBottom: 12,
  },
  demoRow: {
    flexDirection: 'row',
    marginBottom: 8,
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
  mobileBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  mobileBrandIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#2d6a4f',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  mobileBrandText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1b4332',
  },
  titleText: {
    fontSize: 30,
    fontWeight: '700',
    color: '#1c1917',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: '#78716c',
    marginBottom: 32,
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
    lineHeight: 20,
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
    marginTop: 32,
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
  mobileDemoBox: {
    marginTop: 32,
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
    marginBottom: 4,
  },
  mobileDemoLabel: {
    fontWeight: '500',
    color: '#1c1917',
  },
});
