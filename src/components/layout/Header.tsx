import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Search, Sliders, ShieldCheck, User, Activity, Menu } from 'lucide-react-native';
import { useFinance } from '../../context/FinanceContext';
import { UserRole } from '../../types/finance';
import { colors } from '../../theme/colors';

export const Header: React.FC = () => {
  const {
    currentRole,
    setCurrentRole,
    setCommandPaletteOpen,
    isCompactMode,
    setIsCompactMode,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
  } = useFinance();

  const roles: UserRole[] = ['COO', 'CEO', 'CFO', 'CTO'];

  return (
    <View style={styles.header}>
      {/* Left: Brand & Toggle */}
      <View style={styles.leftSection}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => setIsSidebarCollapsed(prev => !prev)}
        >
          <Menu size={16} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.brandContainer}>
          <View style={styles.liveIndicator} />
          <View>
            <Text style={styles.brandTitle}>FINANCIAL OPERATIONS WORKSPACE</Text>
            <Text style={styles.brandSubtitle}>Indian Software Agency Operating Ledger (₹ INR) • FY26 Q2</Text>
          </View>
        </View>
      </View>

      {/* Center: Command Palette Trigger */}
      <TouchableOpacity
        style={styles.searchBar}
        onPress={() => setCommandPaletteOpen(true)}
      >
        <Search size={13} color={colors.textMuted} />
        <Text style={styles.searchPlaceholder}>Search ledger, GSTIN, vendors, invoices... (Ctrl+K)</Text>
        <View style={styles.kbd}>
          <Text style={styles.kbdText}>Ctrl+K</Text>
        </View>
      </TouchableOpacity>

      {/* Right: Role Switcher & System Controls */}
      <View style={styles.rightSection}>
        {/* Table Density Toggle */}
        <TouchableOpacity
          style={styles.densityBtn}
          onPress={() => setIsCompactMode(prev => !prev)}
        >
          <Sliders size={12} color={colors.textPrimary} />
          <Text style={styles.densityText}>{isCompactMode ? 'Compact' : 'Standard'}</Text>
        </TouchableOpacity>

        {/* Bank Connection Indicator */}
        <View style={styles.bankStatus}>
          <Activity size={12} color={colors.creditText} />
          <Text style={styles.bankStatusText}>HDFC & ICICI Live</Text>
        </View>

        {/* Role Selector Button Group */}
        <View style={styles.roleGroup}>
          <User size={12} color={colors.textMuted} />
          {roles.map(r => {
            const isActive = currentRole === r;
            return (
              <TouchableOpacity
                key={r}
                onPress={() => setCurrentRole(r)}
                style={[
                  styles.roleChip,
                  isActive && styles.roleChipActive,
                  r === 'CTO' && isActive && styles.roleChipCTO,
                ]}
              >
                <Text
                  style={[
                    styles.roleChipText,
                    isActive && styles.roleChipTextActive,
                    r === 'CTO' && isActive && { color: '#fff' },
                  ]}
                >
                  {r}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* SOC-2 Badge */}
        <View style={styles.securityBadge}>
          <ShieldCheck size={13} color={colors.creditText} />
          <Text style={styles.securityBadgeText}>ISO 27001</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 50,
    backgroundColor: colors.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    zIndex: 50,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    padding: 4,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveIndicator: {
    width: 7,
    height: 7,
    backgroundColor: colors.creditText,
    borderRadius: 1,
  },
  brandTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primaryNavy,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  brandSubtitle: {
    fontSize: 9.5,
    color: colors.textMuted,
  },
  searchBar: {
    flex: 1,
    maxWidth: 380,
    marginHorizontal: 16,
    height: 28,
    backgroundColor: colors.bgSurfaceSubtle,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 3,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchPlaceholder: {
    fontSize: 11,
    color: colors.textMuted,
    marginLeft: 6,
    flex: 1,
  },
  kbd: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: 2,
  },
  kbdText: {
    fontSize: 9.5,
    fontFamily: 'Roboto Mono, monospace',
    color: colors.textSecondary,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  densityBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 26,
    paddingHorizontal: 7,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: 3,
    backgroundColor: colors.bgSurface,
  },
  densityText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  bankStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    borderRightWidth: 1,
    borderRightColor: colors.borderSubtle,
  },
  bankStatusText: {
    fontSize: 10.5,
    color: colors.textMuted,
    fontWeight: '500',
  },
  roleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: colors.bgSurfaceSubtle,
    padding: 2,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  roleChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
  },
  roleChipActive: {
    backgroundColor: colors.primaryNavy,
  },
  roleChipCTO: {
    backgroundColor: colors.primaryBlue,
  },
  roleChipText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  roleChipTextActive: {
    color: colors.textInverse,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 5,
    paddingVertical: 3,
    backgroundColor: colors.bgSurfaceSubtle,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 2,
  },
  securityBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});
