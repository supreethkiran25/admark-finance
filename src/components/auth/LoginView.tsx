import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  ShieldCheck,
  Lock,
  Mail,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Eye,
  EyeOff,
  Building,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';

export const LoginView: React.FC = () => {
  const { login, resetPassword } = useAuth();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Password reset modal state
  const [isResetOpen, setIsResetOpen] = useState<boolean>(false);
  const [resetEmail, setResetEmail] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [resetStatus, setResetStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [isResetting, setIsResetting] = useState<boolean>(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both CFO email address and password.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await login(email.trim(), password);
      if (!res.success) {
        setErrorMessage(res.error || 'Authentication failed. Invalid CFO credentials.');
      }
    } catch {
      setErrorMessage('An unexpected error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!resetEmail.trim()) {
      setResetStatus({ success: false, message: 'Please provide the registered CFO email address.' });
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setResetStatus({ success: false, message: 'New password and confirmation do not match.' });
      return;
    }

    if (newPassword && newPassword.length < 8) {
      setResetStatus({ success: false, message: 'Password must be at least 8 characters long.' });
      return;
    }

    setIsResetting(true);
    setResetStatus(null);

    try {
      const res = await resetPassword(resetEmail.trim(), newPassword || undefined);
      setResetStatus(res);
      if (res.success && newPassword) {
        setTimeout(() => {
          setIsResetOpen(false);
          setPassword(newPassword);
        }, 1200);
      }
    } catch {
      setResetStatus({ success: false, message: 'Password reset service error.' });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        {/* Header Ribbon */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <ShieldCheck size={28} color="#fff" />
          </View>
          <Text style={styles.title}>CFO Financial Operations Workspace</Text>
          <Text style={styles.subtitle}>
            Admark Software Agency Operations • Statutory & Treasury Financial System
          </Text>
        </View>

        {/* Card Body */}
        <View style={styles.card}>
          <View style={styles.badgeRow}>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>RESTRICTED: CHIEF FINANCIAL OFFICER ACCESS ONLY</Text>
            </View>
          </View>

          {errorMessage && (
            <View style={styles.errorBox}>
              <AlertCircle size={14} color={colors.debitText} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {/* Email Field */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>CFO Email Address *</Text>
            <View style={styles.inputWrapper}>
              <Mail size={15} color={colors.textMuted} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={v => {
                  setEmail(v);
                  setErrorMessage(null);
                }}
                placeholder="e.g. cfo@agency.internal"
                placeholderTextColor={colors.textMuted}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
            </View>
          </View>

          {/* Password Field with Show/Hide Toggle */}
          <View style={styles.formGroup}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>CFO Master Password *</Text>
              <TouchableOpacity onPress={() => setIsResetOpen(true)}>
                <Text style={styles.forgotText}>Forgot / Reset Password?</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inputWrapper}>
              <Lock size={15} color={colors.textMuted} />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={v => {
                  setPassword(v);
                  setErrorMessage(null);
                }}
                placeholder="Enter password..."
                placeholderTextColor={colors.textMuted}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff size={15} color={colors.textSecondary} />
                ) : (
                  <Eye size={15} color={colors.textMuted} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign In Button */}
          <TouchableOpacity
            style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Text style={styles.submitBtnText}>Authenticate & Enter Workspace</Text>
                <ArrowRight size={14} color="#fff" />
              </>
            )}
          </TouchableOpacity>

          <View style={styles.credentialHint}>
            <Text style={styles.hintTitle}>Standard Access Credentials:</Text>
            <Text style={styles.hintCode}>Email: cfo@agency.internal</Text>
            <Text style={styles.hintCode}>Master Password: CFO@2026!Secure</Text>
          </View>
        </View>

        {/* Security Compliance Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            🔒 256-Bit TLS Client Encryption • Indian GAAP & Ind AS Accounting Rules • Immutable Audit Trail
          </Text>
        </View>
      </View>

      {/* Password Reset Modal */}
      {isResetOpen && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>CFO Master Password Recovery</Text>
              <TouchableOpacity onPress={() => setIsResetOpen(false)}>
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={{ gap: 12 }}>
              <Text style={{ fontSize: 11.5, color: colors.textSecondary, lineHeight: 16 }}>
                Enter the registered CFO email address and your new master password. Existing active sessions will be invalidated upon reset.
              </Text>

              {resetStatus && (
                <View
                  style={[
                    styles.errorBox,
                    resetStatus.success && {
                      backgroundColor: colors.creditBg,
                      borderColor: colors.creditBorder,
                    },
                  ]}
                >
                  {resetStatus.success ? (
                    <CheckCircle2 size={14} color={colors.creditText} />
                  ) : (
                    <AlertCircle size={14} color={colors.debitText} />
                  )}
                  <Text
                    style={[
                      styles.errorText,
                      resetStatus.success && { color: colors.creditText },
                    ]}
                  >
                    {resetStatus.message}
                  </Text>
                </View>
              )}

              <View style={styles.formGroup}>
                <Text style={styles.label}>Registered CFO Email</Text>
                <TextInput
                  style={styles.modalInput}
                  value={resetEmail}
                  onChangeText={setResetEmail}
                  placeholder="cfo@agency.internal"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>New Master Password</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Enter new password (min 8 chars)..."
                    placeholderTextColor={colors.textMuted}
                    secureTextEntry={!showNewPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowNewPassword(!showNewPassword)}
                    style={styles.eyeBtn}
                  >
                    {showNewPassword ? (
                      <EyeOff size={14} color={colors.textSecondary} />
                    ) : (
                      <Eye size={14} color={colors.textMuted} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Confirm New Password</Text>
                <TextInput
                  style={styles.modalInput}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm new password..."
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showNewPassword}
                  autoCapitalize="none"
                />
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setIsResetOpen(false)}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.resetBtn}
                  onPress={handlePasswordReset}
                  disabled={isResetting}
                >
                  {isResetting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.resetBtnText}>Update Master Password</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0b1329',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  container: {
    width: '100%',
    maxWidth: 460,
    gap: 14,
  },
  header: {
    alignItems: 'center',
    gap: 6,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.primaryNavy,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#f8fafc',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 11.5,
    color: '#94a3b8',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 6,
    padding: 22,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    gap: 14,
  },
  badgeRow: {
    alignItems: 'center',
    paddingBottom: 4,
  },
  roleBadge: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 3,
  },
  roleBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: colors.primaryNavy,
    letterSpacing: 0.5,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    backgroundColor: colors.debitBg,
    borderWidth: 1,
    borderColor: colors.debitBorder,
    borderRadius: 3,
  },
  errorText: {
    fontSize: 11,
    color: colors.debitText,
    fontWeight: '600',
    flex: 1,
  },
  formGroup: {
    gap: 4,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#334155',
    textTransform: 'uppercase',
  },
  forgotText: {
    fontSize: 10.5,
    color: colors.primaryBlue,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 3,
    paddingHorizontal: 8,
    height: 34,
    gap: 6,
  },
  input: {
    flex: 1,
    fontSize: 12,
    color: '#0f172a',
    height: '100%',
    outlineStyle: 'none' as any,
  },
  eyeBtn: {
    padding: 4,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primaryNavy,
    paddingVertical: 9,
    borderRadius: 3,
    marginTop: 4,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 12.5,
    fontWeight: '700',
  },
  credentialHint: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 3,
    padding: 8,
    gap: 2,
  },
  hintTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  hintCode: {
    fontSize: 10.5,
    color: '#334155',
    fontFamily: 'Roboto Mono, monospace',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 10,
    color: '#64748b',
    textAlign: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    zIndex: 999,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: 4,
    padding: 18,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    gap: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 8,
  },
  modalTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: colors.primaryNavy,
  },
  closeBtnText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '700',
  },
  modalInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 3,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 11.5,
    color: '#0f172a',
    outlineStyle: 'none' as any,
  },
  cancelBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 3,
  },
  cancelBtnText: {
    fontSize: 11.5,
    color: '#334155',
    fontWeight: '600',
  },
  resetBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: colors.primaryNavy,
    borderRadius: 3,
  },
  resetBtnText: {
    color: '#fff',
    fontSize: 11.5,
    fontWeight: '700',
  },
});
