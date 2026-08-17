import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {
  Settings,
  Shield,
  RotateCcw,
  Key,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useFinance } from '../../../context/FinanceContext';
import { useAuth } from '../../../context/AuthContext';
import { colors } from '../../../theme/colors';

export const SettingsView: React.FC = () => {
  const { clearAllData, addToast } = useFinance();
  const { user, updatePassword } = useAuth();

  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);

  const handleUpdatePassword = () => {
    if (!newPassword.trim() || newPassword.length < 6) {
      setPasswordMsg('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg('Passwords do not match.');
      return;
    }

    const success = updatePassword(newPassword);
    if (success) {
      setPasswordMsg('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      addToast({
        type: 'success',
        title: 'Password Updated',
        message: 'Your CFO master password has been changed.',
      });
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, gap: 14 }}>
      {/* Title Ribbon */}
      <View style={styles.titleRibbon}>
        <View>
          <Text style={styles.pageTitle}>Settings</Text>
          <Text style={styles.pageSubtitle}>
            Manage your CFO account security, preferences, and data controls.
          </Text>
        </View>
      </View>

      {/* Account Info Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>CFO Profile</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Role:</Text>
          <Text style={styles.infoVal}>Chief Financial Officer (CFO)</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email:</Text>
          <Text style={styles.infoVal}>{user?.email || 'cfo@agency.internal'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Default Currency:</Text>
          <Text style={styles.infoVal}>Indian Rupee (₹ INR)</Text>
        </View>
      </View>

      {/* Password Change Card */}
      <View style={styles.card}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Key size={14} color={colors.primaryNavy} />
          <Text style={styles.cardTitle}>Change Master Password</Text>
        </View>

        <View style={{ gap: 8, maxWidth: 360 }}>
          <View style={styles.formCol}>
            <Text style={styles.formLabel}>New Password *</Text>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter new password..."
              secureTextEntry
            />
          </View>

          <View style={styles.formCol}>
            <Text style={styles.formLabel}>Confirm New Password *</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Re-enter new password..."
              secureTextEntry
            />
          </View>

          {passwordMsg && (
            <Text
              style={{
                fontSize: 11,
                fontWeight: '600',
                color: passwordMsg.includes('success') ? colors.creditText : colors.debitText,
              }}
            >
              {passwordMsg}
            </Text>
          )}

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handleUpdatePassword}
          >
            <Text style={styles.primaryBtnText}>Update Password</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Reset Ledger Data Card */}
      <View style={[styles.card, { borderColor: colors.debitBorder }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <AlertTriangle size={15} color={colors.debitText} />
          <Text style={[styles.cardTitle, { color: colors.debitText }]}>Danger Zone: Clean Slate Reset</Text>
        </View>
        <Text style={{ fontSize: 11, color: colors.textMuted }}>
          Permanently delete all transaction history, imported statements, expenses, suppliers, and budgets.
        </Text>

        <TouchableOpacity
          style={styles.wipeBtn}
          onPress={() => {
            if (confirm('Are you sure you want to delete all financial records and reset to a 100% clean state?')) {
              clearAllData();
            }
          }}
        >
          <RotateCcw size={12} color="#fff" />
          <Text style={styles.wipeBtnText}>Reset All Data to Clean State</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgApp,
  },
  titleRibbon: {
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  pageTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  pageSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  card: {
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: 4,
    padding: 14,
    gap: 10,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 11,
    color: colors.textMuted,
    width: 130,
  },
  infoVal: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  formCol: {
    gap: 3,
  },
  formLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: colors.bgSurfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: 3,
    paddingHorizontal: 8,
    paddingVertical: 5,
    fontSize: 11.5,
    color: colors.textPrimary,
    outlineStyle: 'none' as any,
  },
  primaryBtn: {
    backgroundColor: colors.primaryNavy,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 3,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 11.5,
    fontWeight: '700',
  },
  wipeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.debitText,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 3,
    alignSelf: 'flex-start',
  },
  wipeBtnText: {
    color: '#fff',
    fontSize: 11.5,
    fontWeight: '700',
  },
});
