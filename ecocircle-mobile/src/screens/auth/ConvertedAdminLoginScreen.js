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

const HERO_IMAGE = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&q=80';

export default function ConvertedAdminLoginScreen() {
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
    setError('');
    setLoading(true);

    try {
      const data = await login(phone, password); // API call remains the same
      // No direct navigation here as the RootNavigator handles it based on auth state
      // but if specific actions are needed, they would be here.
    } catch (err) {
      setError(err?.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const goToHome = () => {
    navigation.navigate('Login'); // Assuming '/' maps to the main LoginScreen in AuthNavigator
  };

  const goToResidentLogin = () => {
    navigation.navigate('ResidentLogin');
  };

  const goToDriverLogin = () => {
    navigation.navigate('DriverLogin');
  };

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.page, isLargeScreen ? styles.pageRow : styles.pageColumn]}>
          {/* Left Panel - photograph */}
          {isLargeScreen && (
            <View style={styles.heroPanel}>
              <ImageBackground source={{ uri: HERO_IMAGE }} style={styles.heroImage} imageStyle={styles.heroImageStyle}>
                <View style={styles.heroOverlay} />
                <View style={styles.heroContent}>
                  <View style={styles.heroLogoWrap}>
                    <MaterialCommunityIcons name="shield-outline" size={36} color="#ffffff" />
                  </View>
                  <Text style={styles.heroTitle}>Admin Portal</Text>
                  <Text style={styles.heroSubtitle}>
                    Municipality dashboard for monitoring garbage reports, managing routes, tracking drivers, and analysing waste statistics.
                  </Text>

                  <View style={styles.featuresList}>
                    <View style={styles.featureItem}>
                      <View style={styles.featureIconWrap}>
                        <MaterialCommunityIcons name="chart-bar" size={12} color="#ffffff" />
                      </View>
                      <Text style={styles.featureText}>Monitor collection reports &amp; statistics</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <View style={styles.featureIconWrap}>
                        <MaterialCommunityIcons name="map-marker-outline" size={12} color="#ffffff" />
                      </View>
                      <Text style={styles.featureText}>Visualize &amp; optimize collection routes</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <View style={styles.featureIconWrap}>
                        <MaterialCommunityIcons name="account-group-outline" size={12} color="#ffffff" />
                      </View>
                      <Text style={styles.featureText}>Manage drivers, households &amp; assignments</Text>
                    </View>
                  </View>

                  <View style={styles.demoCardLarge}>
                    <Text style={styles.demoTitle}>Demo Account:</Text>
                    <Text style={styles.demoText}><Text style={styles.demoLabel}>Phone:</Text> 9999999999</Text>
                    <Text style={styles.demoText}><Text style={styles.demoLabel}>Password:</Text> admin123</Text>
                  </View>
                </View>
              </ImageBackground>
            </View>
          )}

          {/* Right Panel - form */}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.formPanel}
          >
            <View style={styles.formCard}>
              <TouchableOpacity onPress={goToHome} style={styles.backButton}>
                <MaterialCommunityIcons name="arrow-left" size={16} color="#78716c" />
                <Text style={styles.backButtonText}>Back to Home</Text>
              </TouchableOpacity>

              <View style={styles.headerRow}>
                <View style={styles.headerIconWrap}>
                  <MaterialCommunityIcons name="shield-outline" size={20} color="#1b4332" />
                </View>
                <Text style={styles.title}>Admin Sign In</Text>
              </View>
              <Text style={styles.subtitle}>Municipality waste management control panel</Text>

              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <View style={styles.inputWrap}>
                  <MaterialCommunityIcons name="phone-outline" size={20} color="#a1a1aa" style={styles.leftIcon} />
                  <TextInput
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                    placeholder="Enter admin phone number"
                    placeholderTextColor="#9ca3af"
                    style={styles.input}
                  />
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputWrap}>
                  <MaterialCommunityIcons name="lock-outline" size={20} color="#a1a1aa" style={styles.leftIcon} />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPass}
                    placeholder="Enter password"
                    placeholderTextColor="#9ca3af"
                    style={[styles.input, styles.passwordInput]}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPass((prev) => !prev)}
                    style={styles.rightIconButton}
                    accessibilityRole="button"
                    accessibilityLabel={showPass ? 'Hide password' : 'Show password'}
                  >
                    <MaterialCommunityIcons
                      name={showPass ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="#a1a1aa"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading}
                style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
                accessibilityRole="button"
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <View style={styles.buttonRow}>
                    <MaterialCommunityIcons name="login" size={20} color="#ffffff" />
                    <Text style={styles.primaryButtonText}>Sign In as Admin</Text>
                  </View>
                )}
              </TouchableOpacity>

              <View style={styles.portalSwitcher}>
                <Text style={styles.portalLabel}>Other portals</Text>
                <View style={styles.portalRow}>
                  <TouchableOpacity onPress={goToResidentLogin} style={styles.portalButton}>
                    <Text style={styles.portalButtonText}>Resident Login</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={goToDriverLogin} style={styles.portalButton}>
                    <Text style={styles.portalButtonText}>Driver Login</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Mobile demo credentials */}
              {!isLargeScreen && (
                <View style={styles.mobileDemoCard}>
                  <Text style={styles.demoTitleMobile}>Demo Account:</Text>
                  <Text style={styles.demoTextMobile}>Phone: 9999999999 / Password: admin123</Text>
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
  root: {
    flex: 1,
    backgroundColor: '#fafaf8',
  },
  scrollContent: {
    flexGrow: 1,
  },
  page: {
    flex: 1,
    minHeight: '100%',
  },
  pageRow: {
    flexDirection: 'row',
  },
  pageColumn: {
    flexDirection: 'column',
  },
  heroPanel: {
    flex: 1,
    minHeight: 520,
  },
  heroImage: {
    flex: 1,
    justifyContent: 'center',
  },
  heroImageStyle: {
    resizeMode: 'cover',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(27, 67, 50, 0.85)', // bg-[#1b4332]/85
  },
  heroContent: {
    paddingHorizontal: 32,
    paddingVertical: 48, // p-12
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroLogoWrap: {
    width: 64, // w-16
    height: 64, // h-16
    borderRadius: 16, // rounded-2xl
    backgroundColor: 'rgba(255,255,255,0.2)', // bg-white/20
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24, // mb-6
  },
  heroTitle: {
    fontSize: 30, // text-3xl
    fontWeight: '700', // font-bold
    marginBottom: 12, // mb-3
    color: '#ffffff',
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#e7e5e4', // text-stone-200
    maxWidth: 384, // max-w-sm
    lineHeight: 24, // leading-relaxed
    textAlign: 'center',
  },
  featuresList: {
    marginTop: 40, // mt-10
    gap: 12, // space-y-3
    width: '100%',
    maxWidth: 320, // max-w-xs
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12, // gap-3
    color: '#e7e5e4', // text-stone-200
  },
  featureIconWrap: {
    width: 24, // w-6
    height: 24, // h-6
    borderRadius: 12, // rounded-full
    backgroundColor: 'rgba(255,255,255,0.2)', // bg-white/20
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0, // flex-shrink-0
    marginTop: 2, // mt-0.5
  },
  featureText: {
    fontSize: 14, // text-sm
    color: '#e7e5e4',
    flex: 1,
  },
  demoCardLarge: {
    marginTop: 40, // mt-10
    backgroundColor: 'rgba(255,255,255,0.1)', // bg-white/10
    borderRadius: 16, // rounded-xl
    padding: 20, // p-5
    width: '100%',
    maxWidth: 320, // max-w-xs
  },
  demoTitle: {
    fontWeight: '600', // font-semibold
    color: '#e7e5e4', // text-stone-200
    marginBottom: 8, // mb-2
  },
  demoText: {
    color: '#d6d3d1', // text-stone-300
  },
  demoLabel: {
    color: '#ffffff', // text-white
    fontWeight: '500', // font-medium
  },
  formPanel: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32, // p-8
    paddingVertical: 20,
    backgroundColor: '#fafaf8',
  },
  formCard: {
    width: '100%',
    maxWidth: 448, // max-w-md
    alignSelf: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // gap-2
    color: '#78716c', // text-stone-500
    marginBottom: 32, // mb-8
  },
  backButtonText: {
    fontSize: 14, // text-sm
    color: '#78716c',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12, // gap-3
    marginBottom: 8, // mb-2
  },
  headerIconWrap: {
    width: 40, // w-10
    height: 40, // h-10
    borderRadius: 8, // rounded-lg
    backgroundColor: 'rgba(27, 67, 50, 0.1)', // bg-[#1b4332]/10
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24, // text-2xl
    fontWeight: '700', // font-bold
    color: '#1c1917', // text-stone-900
  },
  subtitle: {
    fontSize: 16,
    color: '#78716c', // text-stone-500
    marginBottom: 32, // mb-8
    marginLeft: 52, // ml-[52px]
  },
  errorBox: {
    marginBottom: 24, // mb-6
    padding: 16, // p-4
    backgroundColor: '#fef2f2', // bg-red-50
    borderColor: '#fecaca', // border-red-200
    borderWidth: 1,
    borderRadius: 8, // rounded-lg
  },
  errorText: {
    color: '#b91c1c', // text-red-700
    fontSize: 14, // text-sm
  },
  fieldGroup: {
    marginBottom: 20, // space-y-5 - individual div
  },
  label: {
    fontSize: 14, // text-sm
    fontWeight: '500', // font-medium
    color: '#44403c', // text-stone-700
    marginBottom: 8, // mb-2
  },
  inputWrap: {
    position: 'relative',
    justifyContent: 'center',
  },
  leftIcon: {
    position: 'absolute',
    left: 16, // left-4
    zIndex: 1,
  },
  rightIconButton: {
    position: 'absolute',
    right: 16, // right-4
    zIndex: 1,
    padding: 4,
  },
  input: {
    width: '100%',
    height: 52, // py-3 implies some height, setting a fixed one
    paddingLeft: 48, // pl-12
    paddingRight: 48, // pr-12 (for password field icon)
    borderWidth: 1,
    borderColor: '#d6d3d1', // border-stone-300
    borderRadius: 8, // rounded-lg
    backgroundColor: '#ffffff', // bg-white
    color: '#1c1917', // default text color
    fontSize: 16,
  },
  passwordInput: {
    paddingRight: 52, // Adjust for eye icon
  },
  primaryButton: {
    width: '100%',
    paddingVertical: 12, // py-3
    backgroundColor: '#1b4332', // bg-[#1b4332]
    borderRadius: 8, // rounded-lg
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20, // space-y-5 applies here after last field group
  },
  primaryButtonDisabled: {
    opacity: 0.6, // disabled:opacity-60
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8, // gap-2
  },
  primaryButtonText: {
    color: '#ffffff', // text-white
    fontWeight: '600', // font-semibold
    fontSize: 16,
  },
  portalSwitcher: {
    marginTop: 32, // mt-8
    paddingTop: 24, // pt-6
    borderTopWidth: 1,
    borderTopColor: '#e7e5e4', // border-stone-200
  },
  portalLabel: {
    fontSize: 12, // text-xs
    color: '#a8a29e', // text-stone-400
    textAlign: 'center',
    marginBottom: 12, // mb-3
  },
  portalRow: {
    flexDirection: 'row',
    gap: 12, // gap-3
  },
  portalButton: {
    flex: 1,
    paddingVertical: 10, // py-2.5
    backgroundColor: '#ffffff', // bg-white
    borderWidth: 1,
    borderColor: '#e7e5e4', // border-stone-200
    borderRadius: 8, // rounded-lg
    alignItems: 'center',
    justifyContent: 'center',
  },
  portalButtonText: {
    fontSize: 14, // text-sm
    fontWeight: '500', // font-medium
    color: '#57534e', // text-stone-600
  },
  mobileDemoCard: {
    marginTop: 24, // mt-6
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e7e5e4', // border-stone-200
    borderRadius: 8, // rounded-lg
    padding: 16, // p-4
  },
  demoTitleMobile: {
    fontWeight: '600', // font-semibold
    color: '#44403c', // text-stone-700
    marginBottom: 8, // mb-2
  },
  demoTextMobile: {
    fontSize: 14, // text-sm
    color: '#57534e', // text-stone-600
  },
});
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

const HERO_IMAGE = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&q=80';

export default function ConvertedAdminLoginScreen() {
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
    setError('');
    setLoading(true);

    try {
      const data = await login(phone, password); // API call remains the same
      // No direct navigation here as the RootNavigator handles it based on auth state
      // but if specific actions are needed, they would be here.
    } catch (err) {
      setError(err?.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const goToHome = () => {
    navigation.navigate('Login'); // Assuming '/' maps to the main LoginScreen in AuthNavigator
  };

  const goToResidentLogin = () => {
    navigation.navigate('ResidentLogin');
  };

  const goToDriverLogin = () => {
    navigation.navigate('DriverLogin');
  };

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.page, isLargeScreen ? styles.pageRow : styles.pageColumn]}>
          {/* Left Panel - photograph */}
          {isLargeScreen && (
            <View style={styles.heroPanel}>
              <ImageBackground source={{ uri: HERO_IMAGE }} style={styles.heroImage} imageStyle={styles.heroImageStyle}>
                <View style={styles.heroOverlay} />
                <View style={styles.heroContent}>
                  <View style={styles.heroLogoWrap}>
                    <MaterialCommunityIcons name="shield-outline" size={36} color="#ffffff" />
                  </View>
                  <Text style={styles.heroTitle}>Admin Portal</Text>
                  <Text style={styles.heroSubtitle}>
                    Municipality dashboard for monitoring garbage reports, managing routes, tracking drivers, and analysing waste statistics.
                  </Text>

                  <View style={styles.featuresList}>
                    <View style={styles.featureItem}>
                      <View style={styles.featureIconWrap}>
                        <MaterialCommunityIcons name="chart-bar" size={12} color="#ffffff" />
                      </View>
                      <Text style={styles.featureText}>Monitor collection reports &amp; statistics</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <View style={styles.featureIconWrap}>
                        <MaterialCommunityIcons name="map-marker-outline" size={12} color="#ffffff" />
                      </View>
                      <Text style={styles.featureText}>Visualize &amp; optimize collection routes</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <View style={styles.featureIconWrap}>
                        <MaterialCommunityIcons name="account-group-outline" size={12} color="#ffffff" />
                      </View>
                      <Text style={styles.featureText}>Manage drivers, households &amp; assignments</Text>
                    </View>
                  </View>

                  <View style={styles.demoCardLarge}>
                    <Text style={styles.demoTitle}>Demo Account:</Text>
                    <Text style={styles.demoText}><Text style={styles.demoLabel}>Phone:</Text> 9999999999</Text>
                    <Text style={styles.demoText}><Text style={styles.demoLabel}>Password:</Text> admin123</Text>
                  </View>
                </View>
              </ImageBackground>
            </View>
          )}

          {/* Right Panel - form */}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.formPanel}
          >
            <View style={styles.formCard}>
              <TouchableOpacity onPress={goToHome} style={styles.backButton}>
                <MaterialCommunityIcons name="arrow-left" size={16} color="#78716c" />
                <Text style={styles.backButtonText}>Back to Home</Text>
              </TouchableOpacity>

              <View style={styles.headerRow}>
                <View style={styles.headerIconWrap}>
                  <MaterialCommunityIcons name="shield-outline" size={20} color="#1b4332" />
                </View>
                <Text style={styles.title}>Admin Sign In</Text>
              </View>
              <Text style={styles.subtitle}>Municipality waste management control panel</Text>

              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <View style={styles.inputWrap}>
                  <MaterialCommunityIcons name="phone-outline" size={20} color="#a1a1aa" style={styles.leftIcon} />
                  <TextInput
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                    placeholder="Enter admin phone number"
                    placeholderTextColor="#9ca3af"
                    style={styles.input}
                  />
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputWrap}>
                  <MaterialCommunityIcons name="lock-outline" size={20} color="#a1a1aa" style={styles.leftIcon} />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPass}
                    placeholder="Enter password"
                    placeholderTextColor="#9ca3af"
                    style={[styles.input, styles.passwordInput]}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPass((prev) => !prev)}
                    style={styles.rightIconButton}
                    accessibilityRole="button"
                    accessibilityLabel={showPass ? 'Hide password' : 'Show password'}
                  >
                    <MaterialCommunityIcons
                      name={showPass ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="#a1a1aa"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading}
                style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
                accessibilityRole="button"
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <View style={styles.buttonRow}>
                    <MaterialCommunityIcons name="login" size={20} color="#ffffff" />
                    <Text style={styles.primaryButtonText}>Sign In as Admin</Text>
                  </View>
                )}
              </TouchableOpacity>

              <View style={styles.portalSwitcher}>
                <Text style={styles.portalLabel}>Other portals</Text>
                <View style={styles.portalRow}>
                  <TouchableOpacity onPress={goToResidentLogin} style={styles.portalButton}>
                    <Text style={styles.portalButtonText}>Resident Login</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={goToDriverLogin} style={styles.portalButton}>
                    <Text style={styles.portalButtonText}>Driver Login</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Mobile demo credentials */}
              {!isLargeScreen && (
                <View style={styles.mobileDemoCard}>
                  <Text style={styles.demoTitleMobile}>Demo Account:</Text>
                  <Text style={styles.demoTextMobile}>Phone: 9999999999 / Password: admin123</Text>
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
  root: {
    flex: 1,
    backgroundColor: '#fafaf8',
  },
  scrollContent: {
    flexGrow: 1,
  },
  page: {
    flex: 1,
    minHeight: '100%',
  },
  pageRow: {
    flexDirection: 'row',
  },
  pageColumn: {
    flexDirection: 'column',
  },
  heroPanel: {
    flex: 1,
    minHeight: 520,
  },
  heroImage: {
    flex: 1,
    justifyContent: 'center',
  },
  heroImageStyle: {
    resizeMode: 'cover',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(27, 67, 50, 0.85)', // bg-[#1b4332]/85
  },
  heroContent: {
    paddingHorizontal: 32,
    paddingVertical: 48, // p-12
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroLogoWrap: {
    width: 64, // w-16
    height: 64, // h-16
    borderRadius: 16, // rounded-2xl
    backgroundColor: 'rgba(255,255,255,0.2)', // bg-white/20
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24, // mb-6
  },
  heroTitle: {
    fontSize: 30, // text-3xl
    fontWeight: '700', // font-bold
    marginBottom: 12, // mb-3
    color: '#ffffff',
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#e7e5e4', // text-stone-200
    maxWidth: 384, // max-w-sm
    lineHeight: 24, // leading-relaxed
    textAlign: 'center',
  },
  featuresList: {
    marginTop: 40, // mt-10
    gap: 12, // space-y-3
    width: '100%',
    maxWidth: 320, // max-w-xs
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12, // gap-3
    color: '#e7e5e4', // text-stone-200
  },
  featureIconWrap: {
    width: 24, // w-6
    height: 24, // h-6
    borderRadius: 12, // rounded-full
    backgroundColor: 'rgba(255,255,255,0.2)', // bg-white/20
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0, // flex-shrink-0
    marginTop: 2, // mt-0.5
  },
  featureText: {
    fontSize: 14, // text-sm
    color: '#e7e5e4',
    flex: 1,
  },
  demoCardLarge: {
    marginTop: 40, // mt-10
    backgroundColor: 'rgba(255,255,255,0.1)', // bg-white/10
    borderRadius: 16, // rounded-xl
    padding: 20, // p-5
    width: '100%',
    maxWidth: 320, // max-w-xs
  },
  demoTitle: {
    fontWeight: '600', // font-semibold
    color: '#e7e5e4', // text-stone-200
    marginBottom: 8, // mb-2
  },
  demoText: {
    color: '#d6d3d1', // text-stone-300
  },
  demoLabel: {
    color: '#ffffff', // text-white
    fontWeight: '500', // font-medium
  },
  formPanel: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32, // p-8
    paddingVertical: 20,
    backgroundColor: '#fafaf8',
  },
  formCard: {
    width: '100%',
    maxWidth: 448, // max-w-md
    alignSelf: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // gap-2
    color: '#78716c', // text-stone-500
    marginBottom: 32, // mb-8
  },
  backButtonText: {
    fontSize: 14, // text-sm
    color: '#78716c',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12, // gap-3
    marginBottom: 8, // mb-2
  },
  headerIconWrap: {
    width: 40, // w-10
    height: 40, // h-10
    borderRadius: 8, // rounded-lg
    backgroundColor: 'rgba(27, 67, 50, 0.1)', // bg-[#1b4332]/10
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24, // text-2xl
    fontWeight: '700', // font-bold
    color: '#1c1917', // text-stone-900
  },
  subtitle: {
    fontSize: 16,
    color: '#78716c', // text-stone-500
    marginBottom: 32, // mb-8
    marginLeft: 52, // ml-[52px]
  },
  errorBox: {
    marginBottom: 24, // mb-6
    padding: 16, // p-4
    backgroundColor: '#fef2f2', // bg-red-50
    borderColor: '#fecaca', // border-red-200
    borderWidth: 1,
    borderRadius: 8, // rounded-lg
  },
  errorText: {
    color: '#b91c1c', // text-red-700
    fontSize: 14, // text-sm
  },
  fieldGroup: {
    marginBottom: 20, // space-y-5 - individual div
  },
  label: {
    fontSize: 14, // text-sm
    fontWeight: '500', // font-medium
    color: '#44403c', // text-stone-700
    marginBottom: 8, // mb-2
  },
  inputWrap: {
    position: 'relative',
    justifyContent: 'center',
  },
  leftIcon: {
    position: 'absolute',
    left: 16, // left-4
    zIndex: 1,
  },
  rightIconButton: {
    position: 'absolute',
    right: 16, // right-4
    zIndex: 1,
    padding: 4,
  },
  input: {
    width: '100%',
    height: 52, // py-3 implies some height, setting a fixed one
    paddingLeft: 48, // pl-12
    paddingRight: 48, // pr-12 (for password field icon)
    borderWidth: 1,
    borderColor: '#d6d3d1', // border-stone-300
    borderRadius: 8, // rounded-lg
    backgroundColor: '#ffffff', // bg-white
    color: '#1c1917', // default text color
    fontSize: 16,
  },
  passwordInput: {
    paddingRight: 52, // Adjust for eye icon
  },
  primaryButton: {
    width: '100%',
    paddingVertical: 12, // py-3
    backgroundColor: '#1b4332', // bg-[#1b4332]
    borderRadius: 8, // rounded-lg
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20, // space-y-5 applies here after last field group
  },
  primaryButtonDisabled: {
    opacity: 0.6, // disabled:opacity-60
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8, // gap-2
  },
  primaryButtonText: {
    color: '#ffffff', // text-white
    fontWeight: '600', // font-semibold
    fontSize: 16,
  },
  portalSwitcher: {
    marginTop: 32, // mt-8
    paddingTop: 24, // pt-6
    borderTopWidth: 1,
    borderTopColor: '#e7e5e4', // border-stone-200
  },
  portalLabel: {
    fontSize: 12, // text-xs
    color: '#a8a29e', // text-stone-400
    textAlign: 'center',
    marginBottom: 12, // mb-3
  },
  portalRow: {
    flexDirection: 'row',
    gap: 12, // gap-3
  },
  portalButton: {
    flex: 1,
    paddingVertical: 10, // py-2.5
    backgroundColor: '#ffffff', // bg-white
    borderWidth: 1,
    borderColor: '#e7e5e4', // border-stone-200
    borderRadius: 8, // rounded-lg
    alignItems: 'center',
    justifyContent: 'center',
  },
  portalButtonText: {
    fontSize: 14, // text-sm
    fontWeight: '500', // font-medium
    color: '#57534e', // text-stone-600
  },
  mobileDemoCard: {
    marginTop: 24, // mt-6
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e7e5e4', // border-stone-200
    borderRadius: 8, // rounded-lg
    padding: 16, // p-4
  },
  demoTitleMobile: {
    fontWeight: '600', // font-semibold
    color: '#44403c', // text-stone-700
    marginBottom: 8, // mb-2
  },
  demoTextMobile: {
    fontSize: 14, // text-sm
    color: '#57534e', // text-stone-600
  },
});
