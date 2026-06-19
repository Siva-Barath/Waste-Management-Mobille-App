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
  Modal,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useAuth } from '../../context/AuthContext';

/**
 * RegisterScreen - React Native Expo version of the web Register page
 * 
 * Features:
 * - Multi-step registration flow (Step 1: Personal Info, Step 2: Address Details)
 * - Custom bottom sheet select picker for Language and Ward selections
 * - Automated geolocation capture using expo-location with fallback coordinates
 * - Responsive split panel layout for tablets and clean scroll forms for Android/iOS phones
 * - StyleSheets aligning with the green eco design language
 */

const HERO_IMAGE = 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=900&q=80';

const LANGUAGE_OPTIONS = [
  { label: 'English', value: 'en' },
  { label: 'Tamil', value: 'ta' },
  { label: 'Hindi', value: 'hi' },
];

const WARD_OPTIONS = [
  { label: 'Ward 1', value: 'Ward 1' },
  { label: 'Ward 2', value: 'Ward 2' },
  { label: 'Ward 3', value: 'Ward 3' },
];

export default function RegisterScreen() {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 900;

  const [form, setForm] = useState({
    name: '',
    phone: '',
    password: '',
    address: '',
    numResidents: 1,
    ward: 'Ward 1',
    language: 'en',
  });

  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  // Custom Picker States
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerMode, setPickerMode] = useState(''); // 'language' or 'ward'

  const updateField = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!form.name || !form.phone || !form.password) {
        setError('Please fill in all personal details.');
        return;
      }
      setError('');
      setStep(2);
    }
  };

  const handleRegister = async () => {
    if (!form.address || !form.numResidents || !form.ward) {
      setError('Please fill in all address and ward details.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      let latitude = 13.0827;
      let longitude = 80.2707;

      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const pos = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          latitude = pos.coords.latitude;
          longitude = pos.coords.longitude;
        }
      } catch (locationError) {
        console.log('Geolocation capture failed, using defaults.', locationError);
      }

      await register({
        ...form,
        latitude,
        longitude,
        role: 'resident',
      });
      // Auth state update in AuthProvider will automatically switch RootNavigator stack to AppStack.
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => {
    navigation.navigate('ResidentLogin');
  };

  const openPicker = (mode) => {
    setPickerMode(mode);
    setPickerVisible(true);
  };

  const selectOption = (val) => {
    updateField(pickerMode, val);
    setPickerVisible(false);
  };

  const currentPickerOptions = pickerMode === 'language' ? LANGUAGE_OPTIONS : WARD_OPTIONS;
  const currentPickerSelectedLabel = pickerMode === 'language' 
    ? LANGUAGE_OPTIONS.find(o => o.value === form.language)?.label 
    : WARD_OPTIONS.find(o => o.value === form.ward)?.label;

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
                  <Text style={styles.heroTitle}>Join EcoCircle</Text>
                  <Text style={styles.heroSubtitle}>
                    Register your household and be part of the smart waste revolution. Every report counts.
                  </Text>

                  {/* Flow Guide Card */}
                  <View style={styles.flowCard}>
                    {[
                      'Report garbage availability daily',
                      'AI optimizes collection routes',
                      'Earn rewards for proper segregation',
                    ].map((text, idx) => (
                      <View key={idx} style={styles.flowRow}>
                        <View style={styles.flowNumberBox}>
                          <Text style={styles.flowNumberText}>{idx + 1}</Text>
                        </View>
                        <Text style={styles.flowDescription}>{text}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </ImageBackground>
            </View>
          )}

          {/* Right Panel — Form section */}
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

              <Text style={styles.titleText}>Create Account</Text>
              <Text style={styles.subtitleText}>Register your household in the smart waste system</Text>

              {/* Step indicators */}
              <View style={styles.stepIndicatorRow}>
                {[1, 2].map((s) => (
                  <View key={s} style={styles.stepContainer}>
                    <View style={styles.stepWrapper}>
                      <View
                        style={[
                          styles.stepNumberBadge,
                          step >= s ? styles.stepActiveBadge : styles.stepInactiveBadge,
                        ]}
                      >
                        <Text
                          style={[
                            styles.stepNumberText,
                            step >= s ? styles.stepActiveText : styles.stepInactiveText,
                          ]}
                        >
                          {s}
                        </Text>
                      </View>
                      <Text style={styles.stepLabel}>
                        {s === 1 ? 'Personal Info' : 'Address Details'}
                      </Text>
                    </View>
                    {s < 2 && (
                      <View style={styles.stepLineBackground}>
                        <View
                          style={[
                            styles.stepLineActive,
                            { width: step > 1 ? '100%' : '0%' },
                          ]}
                        />
                      </View>
                    )}
                  </View>
                ))}
              </View>

              {/* Error Box */}
              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* Step 1 Fields */}
              {step === 1 && (
                <View style={styles.fieldStack}>
                  {/* Full Name */}
                  <View style={styles.inputFieldGroup}>
                    <Text style={styles.inputLabel}>Full Name</Text>
                    <View style={styles.inputWithIconWrap}>
                      <MaterialCommunityIcons name="account-outline" size={20} color="#a8a29e" style={styles.leftIcon} />
                      <TextInput
                        value={form.name}
                        onChangeText={(text) => updateField('name', text)}
                        placeholder="Enter your name"
                        placeholderTextColor="#a8a29e"
                        style={styles.textInput}
                      />
                    </View>
                  </View>

                  {/* Phone Number */}
                  <View style={styles.inputFieldGroup}>
                    <Text style={styles.inputLabel}>Phone Number</Text>
                    <View style={styles.inputWithIconWrap}>
                      <MaterialCommunityIcons name="phone-outline" size={20} color="#a8a29e" style={styles.leftIcon} />
                      <TextInput
                        value={form.phone}
                        onChangeText={(text) => updateField('phone', text)}
                        keyboardType="phone-pad"
                        placeholder="Enter phone number"
                        placeholderTextColor="#a8a29e"
                        style={styles.textInput}
                      />
                    </View>
                  </View>

                  {/* Password */}
                  <View style={styles.inputFieldGroup}>
                    <Text style={styles.inputLabel}>Password</Text>
                    <View style={styles.inputWithIconWrap}>
                      <MaterialCommunityIcons name="lock-outline" size={20} color="#a8a29e" style={styles.leftIcon} />
                      <TextInput
                        value={form.password}
                        onChangeText={(text) => updateField('password', text)}
                        secureTextEntry
                        placeholder="Create password"
                        placeholderTextColor="#a8a29e"
                        style={styles.textInput}
                      />
                    </View>
                  </View>

                  {/* Language selector trigger */}
                  <View style={styles.inputFieldGroup}>
                    <Text style={styles.inputLabel}>Language</Text>
                    <TouchableOpacity
                      onPress={() => openPicker('language')}
                      style={styles.selectorTriggerButton}
                      accessibilityRole="button"
                    >
                      <MaterialCommunityIcons name="earth" size={20} color="#a8a29e" style={styles.leftIcon} />
                      <Text style={styles.selectorTriggerText}>
                        {LANGUAGE_OPTIONS.find(o => o.value === form.language)?.label || 'Select Language'}
                      </Text>
                      <MaterialCommunityIcons name="chevron-down" size={20} color="#a8a29e" style={styles.rightSelectorIcon} />
                    </TouchableOpacity>
                  </View>

                  {/* Step 1 Next Button */}
                  <TouchableOpacity
                    onPress={handleNextStep}
                    style={styles.actionButton}
                    accessibilityRole="button"
                  >
                    <Text style={styles.actionButtonText}>Next</Text>
                    <MaterialCommunityIcons name="arrow-right" size={20} color="#ffffff" style={styles.buttonRightIcon} />
                  </TouchableOpacity>
                </View>
              )}

              {/* Step 2 Fields */}
              {step === 2 && (
                <View style={styles.fieldStack}>
                  {/* Address */}
                  <View style={styles.inputFieldGroup}>
                    <Text style={styles.inputLabel}>Address</Text>
                    <View style={styles.inputWithIconWrap}>
                      <MaterialCommunityIcons name="map-marker-outline" size={20} color="#a8a29e" style={[styles.leftIcon, styles.leftIconTextarea]} />
                      <TextInput
                        value={form.address}
                        onChangeText={(text) => updateField('address', text)}
                        multiline
                        numberOfLines={2}
                        placeholder="Enter your address"
                        placeholderTextColor="#a8a29e"
                        style={[styles.textInput, styles.textareaInput]}
                      />
                    </View>
                  </View>

                  {/* Number of Residents */}
                  <View style={styles.inputFieldGroup}>
                    <Text style={styles.inputLabel}>Number of Residents</Text>
                    <View style={styles.inputWithIconWrap}>
                      <MaterialCommunityIcons name="account-group-outline" size={20} color="#a8a29e" style={styles.leftIcon} />
                      <TextInput
                        value={form.numResidents.toString()}
                        onChangeText={(text) => {
                          const val = parseInt(text) || 1;
                          updateField('numResidents', Math.max(1, Math.min(20, val)));
                        }}
                        keyboardType="numeric"
                        style={styles.textInput}
                      />
                    </View>
                  </View>

                  {/* Ward selector trigger */}
                  <View style={styles.inputFieldGroup}>
                    <Text style={styles.inputLabel}>Ward</Text>
                    <TouchableOpacity
                      onPress={() => openPicker('ward')}
                      style={styles.selectorTriggerButton}
                      accessibilityRole="button"
                    >
                      <MaterialCommunityIcons name="home-outline" size={20} color="#a8a29e" style={styles.leftIcon} />
                      <Text style={styles.selectorTriggerText}>{form.ward}</Text>
                      <MaterialCommunityIcons name="chevron-down" size={20} color="#a8a29e" style={styles.rightSelectorIcon} />
                    </TouchableOpacity>
                  </View>

                  {/* Info Box */}
                  <View style={styles.infoBox}>
                    <MaterialCommunityIcons name="map-marker" size={20} color="#1d4ed8" style={styles.infoIcon} />
                    <Text style={styles.infoText}>
                      Your GPS location will be captured automatically to optimize waste collection routes in your area.
                    </Text>
                  </View>

                  {/* Navigation Actions */}
                  <View style={styles.buttonStackRow}>
                    <TouchableOpacity
                      onPress={() => setStep(1)}
                      style={styles.backButton}
                      accessibilityRole="button"
                    >
                      <Text style={styles.backButtonText}>Back</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      onPress={handleRegister}
                      disabled={loading}
                      style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                      accessibilityRole="button"
                    >
                      {loading ? (
                        <ActivityIndicator color="#ffffff" />
                      ) : (
                        <Text style={styles.submitButtonText}>Register</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Login redirection */}
              <View style={styles.loginRedirectionRow}>
                <Text style={styles.loginRedirectionText}>Already have an account?</Text>
                <TouchableOpacity onPress={goToLogin} accessibilityRole="button">
                  <Text style={styles.loginRedirectionLink}>Sign In</Text>
                </TouchableOpacity>
              </View>

            </View>
          </KeyboardAvoidingView>

        </View>
      </ScrollView>

      {/* Reusable Bottom Sheet Modal Selector */}
      <Modal
        visible={pickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setPickerVisible(false)}
        >
          <View style={styles.modalSheetContainer}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalHeaderTitle}>
                Select {pickerMode === 'language' ? 'Language' : 'Ward'}
              </Text>
              <TouchableOpacity
                onPress={() => setPickerVisible(false)}
                accessibilityRole="button"
                accessibilityLabel="Close picker"
              >
                <MaterialCommunityIcons name="close" size={24} color="#78716c" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={currentPickerOptions}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => {
                const isSelected = pickerMode === 'language' ? form.language === item.value : form.ward === item.value;
                return (
                  <TouchableOpacity
                    onPress={() => selectOption(item.value)}
                    style={[
                      styles.modalOptionButton,
                      isSelected && styles.modalOptionSelectedButton,
                    ]}
                  >
                    <Text
                      style={[
                        styles.modalOptionLabelText,
                        isSelected && styles.modalOptionSelectedLabelText,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {isSelected && (
                      <MaterialCommunityIcons name="check" size={20} color="#2d6a4f" />
                    )}
                  </TouchableOpacity>
                );
              }}
              style={styles.modalOptionsList}
            />
          </View>
        </TouchableOpacity>
      </Modal>

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
    marginBottom: 32,
  },
  flowCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 20,
  },
  flowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  flowNumberBox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  flowNumberText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12,
  },
  flowDescription: {
    color: '#e7e5e4',
    fontSize: 14,
    flex: 1,
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
    maxWidth: 480,
  },
  mobileBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
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
    marginBottom: 24,
  },
  stepIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stepWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepNumberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepActiveBadge: {
    backgroundColor: '#2d6a4f',
  },
  stepInactiveBadge: {
    backgroundColor: '#e7e5e4',
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '700',
  },
  stepActiveText: {
    color: '#ffffff',
  },
  stepInactiveText: {
    color: '#78716c',
  },
  stepLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#44403c',
    display: Platform.OS === 'web' ? 'flex' : 'none', // hidden on small mobile screen sizing
  },
  stepLineBackground: {
    height: 2,
    backgroundColor: '#e7e5e4',
    flex: 1,
    marginHorizontal: 12,
    minWidth: 24,
  },
  stepLineActive: {
    height: '100%',
    backgroundColor: '#2d6a4f',
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
  fieldStack: {
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
  leftIconTextarea: {
    top: 14,
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
  textareaInput: {
    height: 80,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  selectorTriggerButton: {
    width: '100%',
    height: 52,
    paddingLeft: 48,
    paddingRight: 48,
    borderWidth: 1,
    borderColor: '#d6d3d1',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  selectorTriggerText: {
    fontSize: 16,
    color: '#1c1917',
  },
  rightSelectorIcon: {
    position: 'absolute',
    right: 16,
  },
  actionButton: {
    width: '100%',
    height: 52,
    backgroundColor: '#2d6a4f',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  actionButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  buttonRightIcon: {
    marginLeft: 8,
  },
  infoBox: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 24,
    gap: 12,
  },
  infoIcon: {
    marginTop: 2,
  },
  infoText: {
    color: '#1d4ed8',
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  buttonStackRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
  },
  backButton: {
    flex: 1,
    height: 52,
    borderColor: '#d6d3d1',
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  backButtonText: {
    color: '#44403c',
    fontWeight: '600',
    fontSize: 16,
  },
  submitButton: {
    flex: 1,
    height: 52,
    backgroundColor: '#2d6a4f',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  loginRedirectionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  loginRedirectionText: {
    color: '#78716c',
    fontSize: 14,
  },
  loginRedirectionLink: {
    color: '#2d6a4f',
    fontWeight: '600',
    marginLeft: 4,
  },
  // Modal Selector Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalSheetContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 24,
    paddingBottom: 40,
    maxHeight: '50%',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1c1917',
  },
  modalOptionsList: {
    marginBottom: 8,
  },
  modalOptionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e7e5e4',
  },
  modalOptionSelectedButton: {
    borderBottomColor: '#d8f3dc',
  },
  modalOptionLabelText: {
    fontSize: 16,
    color: '#44403c',
  },
  modalOptionSelectedLabelText: {
    color: '#2d6a4f',
    fontWeight: '600',
  },
});
