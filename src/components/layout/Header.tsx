import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import {
  Search,
  Upload,
  User,
  LogOut,
  Clock,
  Menu,
  Plus,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { useIsMobile } from '../../utils/useIsMobile';
import { colors } from '../../theme/colors';

export const Header: React.FC = () => {
  const {
    activeModule,
    setActiveModule,
    globalSearchQuery,
    setGlobalSearchQuery,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
  } = useFinance();

  const { user, logout, timeUntilLogout, extendSession } = useAuth();
  const isMobile = useIsMobile(768);

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
    <View style={[styles.header, isMobile && styles.headerMobile]}>
      {/* Left Area: Logo & Collapse Button */}
      <View style={styles.leftGroup}>
        <TouchableOpacity
          style={styles.menuBtn}
          onPress={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          accessibilityLabel="Toggle Navigation Menu"
        >
          <Menu size={16} color={colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.brandingBox}
          onPress={() => setActiveModule('dashboard')}
        >
          <Text style={styles.brandTitle}>ADMARK</Text>
          {!isMobile && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>CFO</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Center Area: Global Search Everything */}
      {!isMobile && (
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
      )}

      {/* Right Area: Session Timer, Quick Actions, Profile & Logout */}
      <View style={styles.rightGroup}>
        {!isMobile && (
          <>
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
          </>
        )}

        {/* Inactivity Session Timer */}
        <TouchableOpacity
          style={styles.timerBadge}
          onPress={extendSession}
          accessibilityLabel="Session countdown timer"
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
        {!isMobile && (
          <View style={styles.profileBox}>
            <View style={styles.avatar}>
              <User size={12} color="#fff" />
            </View>
            <View>
              <Text style={styles.profileName}>CFO</Text>
              <Text style={styles.profileEmail}>{user?.email || 'cfo@agency.internal'}</Text>
            </View>
          </View>
        )}

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => {
            if (confirm('Sign out of CFO workspace?')) {
              logout();
            }
          }}
          accessibilityLabel="Sign out"
        >
          <LogOut size={13} color={colors.debitText} />
          {!isMobile && <Text style={styles.logoutBtnText}>Logout</Text>}
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
    zIndex: 50,
  },
  headerMobile: {
    height: 44,
    paddingHorizontal: 8,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuBtn: {
    padding: 6,
    borderRadius: 3,
    backgroundColor: colors.bgSurfaceAlt,
  },
  brandingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  brandTitle: {
    fontSize: 13.5,
    fontWeight: '900',
    letterSpacing: 0.5,
    color: colors.primaryNavy,
  },
  badge: {
    backgroundColor: colors.primaryNavy,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
  },
  badgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '800',
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
  },
  searchInput: {
    flex: 1,
    fontSize: 11,
    color: colors.textPrimary,
    marginLeft: 6,
    height: '100%',
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
    borderRadius: 3,
  },
  quickUploadBtnText: {
    color: '#fff',
    fontSize: 10.5,
    fontWeight: '700',
  },
  quickAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.bgSurfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 3,
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
    backgroundColor: colors.bgSurfaceAlt,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  timerText: {
    fontSize: 10.5,
    fontFamily: 'Roboto Mono, monospace',
    color: colors.textMuted,
  },
  profileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
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
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  profileEmail: {
    fontSize: 8.5,
    color: colors.textMuted,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 4,
    backgroundColor: colors.debitBg,
    borderRadius: 3,
  },
  logoutBtnText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.debitText,
  },
});
