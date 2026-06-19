import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import AuthScreenLayout from '../../components/common/AuthScreenLayout';
import { colors } from '../../utils/colors';
import { borderRadius, spacing } from '../../utils/spacing';
import { validateLogin, getAuthErrorMessage } from '../../utils/validators';

export default function ResidentLoginScreen() {
  const navigation = useNavigation();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async () => {
    const validationError = validateLogin({ phone, password });
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login(phone, password);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenLayout
      onBack={() => navigation.navigate('LoginSelector')}
      backLabel="Portals"
      icon="home"
      accentColor={colors.primary}
      title="Resident Sign In"
      subtitle="Access your household waste portal"
    >
      {error ? (
        <View style={styles.errorBox}>
          <MaterialCommunityIcons name="alert-circle-outline" size={18} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.field}>
        <Text style={styles.label}>Phone Number</Text>
        <View style={styles.inputWrap}>
          <MaterialCommunityIcons name="phone-outline" size={20} color={colors.textTertiary} style={styles.inputIcon} />
          <TextInput
            value={phone}
            onChangeText={(t) => setPhone(t.replace(/\D/g, '').slice(0, 10))}
            keyboardType="phone-pad"
            maxLength={10}
            autoCapitalize="none"
            placeholder="10-digit mobile number"
            placeholderTextColor={colors.placeholder}
            style={styles.input}
          />
        </View>
        <Text style={styles.hint}>Must be 10 digits, starting with 6–9</Text>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Password</Text>
        <View style={styles.inputWrap}>
          <MaterialCommunityIcons name="lock-outline" size={20} color={colors.textTertiary} style={styles.inputIcon} />
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPass}
            autoCapitalize="none"
            placeholder="Enter password"
            placeholderTextColor={colors.placeholder}
            style={[styles.input, styles.inputWithToggle]}
          />
          <TouchableOpacity
            onPress={() => setShowPass((p) => !p)}
            style={styles.toggle}
            accessibilityRole="button"
          >
            <MaterialCommunityIcons
              name={showPass ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.textTertiary}
            />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={loading}
        style={[styles.submitBtn, loading && styles.submitDisabled]}
        accessibilityRole="button"
      >
        {loading ? (
          <ActivityIndicator color={colors.textInverse} />
        ) : (
          <Text style={styles.submitText}>Sign In</Text>
        )}
      </TouchableOpacity>

      <View style={styles.footerRow}>
        <Text style={styles.footerText}>New here?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.footerLink}>Create account</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.portalRow}>
        <TouchableOpacity style={styles.portalChip} onPress={() => navigation.navigate('DriverLogin')}>
          <Text style={styles.portalChipText}>Driver Login</Text>
        </TouchableOpacity>
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  errorText: {
    flex: 1,
    color: colors.error,
    fontSize: 14,
  },
  field: { marginBottom: spacing.lg },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: spacing.md,
  },
  hint: {
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: spacing.sm,
  },
  inputWrap: { position: 'relative', justifyContent: 'center' },
  inputIcon: { position: 'absolute', left: spacing.lg, zIndex: 1 },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingLeft: 48,
    paddingRight: spacing.lg,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.background,
  },
  inputWithToggle: { paddingRight: 48 },
  toggle: { position: 'absolute', right: spacing.lg, padding: spacing.sm },
  submitBtn: {
    minHeight: 52,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  submitDisabled: { opacity: 0.6 },
  submitText: {
    color: colors.textInverse,
    fontSize: 16,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  footerText: { color: colors.textSecondary, fontSize: 14 },
  footerLink: { color: colors.primary, fontWeight: '600', fontSize: 14 },
  portalRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
    paddingTop: spacing.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
  },
  portalChip: {
    flex: 1,
    minHeight: 44,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.outline,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  portalChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
});
