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

const HERO_IMAGE = 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=900&q=80';

export default function ConvertedLoginScreen() {
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
      const data = await login(phone, password);
      if (data.user.role === 'resident') navigation.navigate('ResidentNavigator', { screen: 'ResidentDashboard' });
      else if (data.user.role === 'driver') navigation.navigate('DriverNavigator', { screen: 'DriverDashboard' });
      else if (data.user.role === 'admin') navigation.navigate('AdminNavigator', { screen: 'AdminDashboard' });
    } catch (err) {
      setError(err?.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const goToRegister = () => {
    navigation.navigate('Register');
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
                    <MaterialCommunityIcons name="recycle" size={36} color="#ffffff" />
                  </View>
                  <Text style={styles.heroTitle}>Welcome Back</Text>
                  <Text style={styles.heroSubtitle}>
                    Sign in to continue your journey towards a cleaner, sustainable community.
                  </Text>

                  <View style={styles.demoCardLarge}>
                    <Text style={styles.demoTitle}>Demo Accounts:</Text>
                    <Text style={styles.demoText}><Text style={styles.demoLabel}>Resident:</Text> 7000000000 / user123</Text>
                    <Text style={styles.demoText}><Text style={styles.demoLabel}>Driver:</Text> 8000000001 / driver123</Text>
                    <Text style={styles.demoText}><Text style={styles.demoLabel}>Admin:</Text> 9999999999 / admin123</Text>
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
              {!isLargeScreen && (
                <View style={styles.mobileBrandRow}>
                  <View style={styles.mobileBrandIcon}>
                    <MaterialCommunityIcons name="recycle" size={20} color="#ffffff" />
                  </View>
                  <Text style={styles.mobileBrandText}>EcoCircle</Text>
                </View>
              )}

              <Text style={styles.title}>Sign In</Text>
              <Text style={styles.subtitle}>Enter your credentials to access your account</Text>

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
                    placeholder="Enter phone number"
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
                    <Text style={styles.primaryButtonText}>Sign In</Text>
                  </View>
                )}
              </TouchableOpacity>

              <View style={styles.registerRow}>
                <Text style={styles.registerText}>Don&apos;t have an account?</Text>
                <TouchableOpacity onPress={goToRegister} accessibilityRole="button">
                  <Text style={styles.registerLink}>Register here</Text>
                </TouchableOpacity>
              </View>

              {!isLargeScreen && (
                <View style={styles.mobileDemoCard}>
                  <Text style={styles.demoTitleMobile}>Demo Accounts:</Text>
                  <Text style={styles.demoTextMobile}>Resident: 7000000000 / user123</Text>
                  <Text style={styles.demoTextMobile}>Driver: 8000000001 / driver123</Text>
                  <Text style={styles.demoTextMobile}>Admin: 9999999999 / admin123</Text>
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
    backgroundColor: 'rgba(27, 67, 50, 0.75)', // bg-[#1b4332]/75
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
    color: '#d6d3d1', // text-stone-300
    maxWidth: 384, // max-w-sm
    textAlign: 'center',
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
    marginBottom: 12, // mb-3
  },
  demoText: {
    color: '#d6d3d1', // text-stone-300
    marginBottom: 8, // space-y-2
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
  mobileBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12, // gap-3
    marginBottom: 32, // mb-8
  },
  mobileBrandIcon: {
    width: 36, // w-9
    height: 36, // h-9
    borderRadius: 8, // rounded-lg
    backgroundColor: '#2d6a4f', // bg-[#2d6a4f]
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileBrandText: {
    fontSize: 20, // text-xl
    fontWeight: '700', // font-bold
    color: '#1b4332', // text-[#1b4332]
  },
  title: {
    fontSize: 30, // text-3xl
    fontWeight: '700', // font-bold
    color: '#1c1917', // text-stone-900
    marginBottom: 8, // mb-2
  },
  subtitle: {
    fontSize: 16,
    color: '#78716c', // text-stone-500
    marginBottom: 32, // mb-8
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
    backgroundColor: '#2d6a4f', // bg-[#2d6a4f]
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
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 32, // mt-8
    gap: 4,
  },
  registerText: {
    color: '#78716c', // text-stone-500
    fontSize: 14,
  },
  registerLink: {
    color: '#2d6a4f', // text-[#2d6a4f]
    fontWeight: '600', // font-semibold
    marginLeft: 4, // ml-1
  },
  mobileDemoCard: {
    marginTop: 32, // mt-8
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

const HERO_IMAGE = 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=900&q=80';

export default function ConvertedLoginScreen() {
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
      const data = await login(phone, password);
      if (data.user.role === 'resident') navigation.navigate('ResidentNavigator', { screen: 'ResidentDashboard' });
      else if (data.user.role === 'driver') navigation.navigate('DriverNavigator', { screen: 'DriverDashboard' });
      else if (data.user.role === 'admin') navigation.navigate('AdminNavigator', { screen: 'AdminDashboard' });
    } catch (err) {
      setError(err?.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const goToRegister = () => {
    navigation.navigate('Register');
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
                    <MaterialCommunityIcons name="recycle" size={36} color="#ffffff" />
                  </View>
                  <Text style={styles.heroTitle}>Welcome Back</Text>
                  <Text style={styles.heroSubtitle}>
                    Sign in to continue your journey towards a cleaner, sustainable community.
                  </Text>

                  <View style={styles.demoCardLarge}>
                    <Text style={styles.demoTitle}>Demo Accounts:</Text>
                    <Text style={styles.demoText}><Text style={styles.demoLabel}>Resident:</Text> 7000000000 / user123</Text>
                    <Text style={styles.demoText}><Text style={styles.demoLabel}>Driver:</Text> 8000000001 / driver123</Text>
                    <Text style={styles.demoText}><Text style={styles.demoLabel}>Admin:</Text> 9999999999 / admin123</Text>
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
              {!isLargeScreen && (
                <View style={styles.mobileBrandRow}>
                  <View style={styles.mobileBrandIcon}>
                    <MaterialCommunityIcons name="recycle" size={20} color="#ffffff" />
                  </View>
                  <Text style={styles.mobileBrandText}>EcoCircle</Text>
                </View>
              )}

              <Text style={styles.title}>Sign In</Text>
              <Text style={styles.subtitle}>Enter your credentials to access your account</Text>

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
                    placeholder="Enter phone number"
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
                    <Text style={styles.primaryButtonText}>Sign In</Text>
                  </View>
                )}
              </TouchableOpacity>

              <View style={styles.registerRow}>
                <Text style={styles.registerText}>Don&apos;t have an account?</Text>
                <TouchableOpacity onPress={goToRegister} accessibilityRole="button">
                  <Text style={styles.registerLink}>Register here</Text>
                </TouchableOpacity>
              </View>

              {!isLargeScreen && (
                <View style={styles.mobileDemoCard}>
                  <Text style={styles.demoTitleMobile}>Demo Accounts:</Text>
                  <Text style={styles.demoTextMobile}>Resident: 7000000000 / user123</Text>
                  <Text style={styles.demoTextMobile}>Driver: 8000000001 / driver123</Text>
                  <Text style={styles.demoTextMobile}>Admin: 9999999999 / admin123</Text>
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
    backgroundColor: 'rgba(27, 67, 50, 0.75)', // bg-[#1b4332]/75
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
    color: '#d6d3d1', // text-stone-300
    maxWidth: 384, // max-w-sm
    textAlign: 'center',
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
    marginBottom: 12, // mb-3
  },
  demoText: {
    color: '#d6d3d1', // text-stone-300
    marginBottom: 8, // space-y-2
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
  mobileBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12, // gap-3
    marginBottom: 32, // mb-8
  },
  mobileBrandIcon: {
    width: 36, // w-9
    height: 36, // h-9
    borderRadius: 8, // rounded-lg
    backgroundColor: '#2d6a4f', // bg-[#2d6a4f]
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileBrandText: {
    fontSize: 20, // text-xl
    fontWeight: '700', // font-bold
    color: '#1b4332', // text-[#1b4332]
  },
  title: {
    fontSize: 30, // text-3xl
    fontWeight: '700', // font-bold
    color: '#1c1917', // text-stone-900
    marginBottom: 8, // mb-2
  },
  subtitle: {
    fontSize: 16,
    color: '#78716c', // text-stone-500
    marginBottom: 32, // mb-8
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
    backgroundColor: '#2d6a4f', // bg-[#2d6a4f]
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
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 32, // mt-8
    gap: 4,
  },
  registerText: {
    color: '#78716c', // text-stone-500
    fontSize: 14,
  },
  registerLink: {
    color: '#2d6a4f', // text-[#2d6a4f]
    fontWeight: '600', // font-semibold
    marginLeft: 4, // ml-1
  },
  mobileDemoCard: {
    marginTop: 32, // mt-8
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
