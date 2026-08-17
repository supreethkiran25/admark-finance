import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import {
  Search,
  Upload,
  User,
  LogOut,
  Clock,
  Menu,
  Plus,
  RotateCcw,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';

export const Header: React.FC = () => {
  const {
    activeModule,
    setActiveModule,
    globalSearchQuery,
    setGlobalSearchQuery,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
    clearAllData,
  } = useFinance();

  const { user, logout, timeUntilLogout, extendSession } = useAuth();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleGlobalSearch = (text: string) => {
    setGlobalSearchQuery(text);
    if (text.trim() && activeModule === 'dashboard') {
      setActiveModule('expenses');
    }
  };

  return (
    <View style={styles.header}>
      {/* Left Area: Logo & Collapse Button */}
      <View style={styles.leftGroup}>
        <TouchableOpacity
          style={styles.menuBtn}
          onPress={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        >
          <Menu size={14} color={colors.textSecondary} />
        </TouchableOpacity>

        <View style={styles.brandingBox}>
          <Text style={styles.brandTitle}>ADMARK</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>CFO PORTAL</Text>
          </View>
        </View>
      </View>

      {/* Center Area: Global Search Everything */}
      <View style={styles.centerGroup}>
        <View style={styles.searchContainer}>
          <Search size={13} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search expenses, transactions, suppliers, or reports..."
            placeholderTextColor={colors.textMuted}
            value={globalSearchQuery}
            onChangeText={handleGlobalSearch}
          />
          {globalSearchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setGlobalSearchQuery('')}>
              <Text style={{ fontSize: 10, color: colors.textMuted, fontWeight: '700' }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Right Area: Session Timer, Quick Actions, Profile & Logout */}
      <View style={styles.rightGroup}>
        <TouchableOpacity
          style={styles.quickUploadBtn}
          onPress={() => setActiveModule('upload-statement')}
        >
          <Upload size={12} color="#fff" />
          <Text style={styles.quickUploadBtnText}>Upload Statement</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickAddBtn}
          onPress={() => setActiveModule('expenses')}
        >
          <Plus size={12} color={colors.textPrimary} />
          <Text style={styles.quickAddBtnText}>+ Expense</Text>
        </TouchableOpacity>

        {/* Inactivity Session Timer */}
        <TouchableOpacity
          style={styles.timerBadge}
          onPress={extendSession}
        >
          <Clock size={11} color={timeUntilLogout < 120 ? colors.debitText : colors.textMuted} />
          <Text
            style={[
              styles.timerText,
              timeUntilLogout < 120 && { color: colors.debitText, fontWeight: '700' },
            ]}
          >
            {formatTime(timeUntilLogout)}
          </Text>
        </TouchableOpacity>

        {/* Profile Info */}
        <View style={styles.profileBox}>
          <View style={styles.avatar}>
            <User size={12} color="#fff" />
          </View>
          <View>
            <Text style={styles.profileName}>CFO</Text>
            <Text style={styles.profileEmail}>{user?.email || 'cfo@agency.internal'}</Text>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => {
            if (confirm('Sign out of CFO workspace?')) {
              logout();
            }
          }}
        >
          <LogOut size={12} color={colors.debitText} />
          <Text style={styles.logoutBtnText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create<any>({
  header: {
    height: 48,
    backgroundColor: colors.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    zIndex: 100,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuBtn: {
    padding: 5,
    borderRadius: 3,
    backgroundColor: colors.bgSurfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  brandingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primaryNavy,
    letterSpacing: 0.5,
  },
  badge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    backgroundColor: colors.bgSurfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 2,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  centerGroup: {
    flex: 1,
    maxWidth: 420,
    marginHorizontal: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSurfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: 3,
    paddingHorizontal: 8,
    height: 28,
    gap: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 11,
    color: colors.textPrimary,
    outlineStyle: 'none' as any,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  quickUploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryNavy,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 2,
  },
  quickUploadBtnText: {
    color: '#fff',
    fontSize: 10.5,
    fontWeight: '700',
  },
  quickAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.bgSurfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 2,
  },
  quickAddBtnText: {
    color: colors.textPrimary,
    fontSize: 10.5,
    fontWeight: '600',
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    backgroundColor: colors.bgSurfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: 2,
  },
  timerText: {
    fontSize: 10,
    fontFamily: 'Roboto Mono, monospace',
    color: colors.textSecondary,
    fontWeight: '600',
  },
  profileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingLeft: 4,
    borderLeftWidth: 1,
    borderLeftColor: colors.borderSubtle,
  },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primaryNavy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 11,
  },
  profileEmail: {
    fontSize: 8.5,
    color: colors.textMuted,
    lineHeight: 9,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    backgroundColor: colors.debitBg,
    borderWidth: 1,
    borderColor: colors.debitBorder,
    borderRadius: 2,
  },
  logoutBtnText: {
    fontSize: 10,
    color: colors.debitText,
    fontWeight: '700',
  },
});
