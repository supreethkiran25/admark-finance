import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import {
  LayoutDashboard,
  Upload,
  Receipt,
  FileSpreadsheet,
  PieChart,
  Building2,
  FileText,
  Settings,
  Users,
  CreditCard,
  Plus,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { NavigationModule } from '../../types/finance';
import { colors } from '../../theme/colors';

interface NavItem {
  id: NavigationModule;
  label: string;
  icon: (color: string) => React.ReactNode;
  badge?: number | string;
  badgeColor?: string;
}

export const Sidebar: React.FC = () => {
  const {
    activeModule,
    setActiveModule,
    isSidebarCollapsed,
    pendingReviewTransactions,
    suppliers,
  } = useFinance();

  const pendingPaymentsCount = suppliers.filter(s => s.pendingPaymentAmount > 0).length;

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (c) => <LayoutDashboard size={14} color={c} />,
    },
    {
      id: 'upload-statement',
      label: 'Upload Statement',
      icon: (c) => <Upload size={14} color={c} />,
      badge: pendingReviewTransactions.length > 0 ? `${pendingReviewTransactions.length} review` : undefined,
      badgeColor: colors.pendingText,
    },
    {
      id: 'expenses',
      label: 'Expenses',
      icon: (c) => <Receipt size={14} color={c} />,
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: (c) => <FileSpreadsheet size={14} color={c} />,
    },
    {
      id: 'employees',
      label: 'Employees',
      icon: (c) => <Users size={14} color={c} />,
    },
    {
      id: 'payroll',
      label: 'Payroll',
      icon: (c) => <CreditCard size={14} color={c} />,
    },
    {
      id: 'budgets',
      label: 'Budgets',
      icon: (c) => <PieChart size={14} color={c} />,
    },
    {
      id: 'suppliers',
      label: 'Suppliers',
      icon: (c) => <Building2 size={14} color={c} />,
      badge: pendingPaymentsCount > 0 ? `${pendingPaymentsCount} due` : undefined,
      badgeColor: colors.debitText,
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: (c) => <FileText size={14} color={c} />,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: (c) => <Settings size={14} color={c} />,
    },
  ];

  return (
    <View style={[styles.sidebar, isSidebarCollapsed && styles.sidebarCollapsed]}>
      {/* Quick Action Button */}
      {!isSidebarCollapsed && (
        <TouchableOpacity
          style={styles.primaryActionBtn}
          onPress={() => setActiveModule('upload-statement')}
        >
          <Upload size={13} color="#fff" />
          <Text style={styles.primaryActionBtnText}>Analyze Statement</Text>
        </TouchableOpacity>
      )}

      {/* Nav Items */}
      <ScrollView style={styles.navContainer} contentContainerStyle={{ gap: 3, paddingVertical: 8 }}>
        {navItems.map(item => {
          const isActive = activeModule === item.id;
          const activeColor = isActive ? '#fff' : colors.textSecondary;

          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.navItem,
                isActive && styles.navItemActive,
                isSidebarCollapsed && styles.navItemCollapsed,
              ]}
              onPress={() => setActiveModule(item.id)}
            >
              {item.icon(activeColor)}
              {!isSidebarCollapsed && (
                <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                  {item.label}
                </Text>
              )}
              {!isSidebarCollapsed && item.badge && (
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: item.badgeColor ? `${item.badgeColor}20` : colors.bgSurfaceAlt },
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      { color: item.badgeColor || colors.textSecondary },
                    ]}
                  >
                    {item.badge}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Footer Info */}
      {!isSidebarCollapsed && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>CFO Financial Workspace</Text>
          <Text style={styles.footerSub}>Currency: ₹ INR</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create<any>({
  sidebar: {
    width: 200,
    backgroundColor: colors.bgSurface,
    borderRightWidth: 1,
    borderRightColor: colors.borderDefault,
    paddingHorizontal: 8,
    paddingTop: 10,
    justifyContent: 'space-between',
  },
  sidebarCollapsed: {
    width: 50,
    paddingHorizontal: 6,
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primaryNavy,
    paddingVertical: 7,
    borderRadius: 3,
    marginBottom: 6,
  },
  primaryActionBtnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  navContainer: {
    flex: 1,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRadius: 3,
  },
  navItemActive: {
    backgroundColor: colors.primaryNavy,
  },
  navItemCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  navLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  navLabelActive: {
    color: '#fff',
  },
  badge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 2,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    fontFamily: 'Roboto Mono, monospace',
  },
  footer: {
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  footerText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  footerSub: {
    fontSize: 9.5,
    color: colors.textMuted,
  },
});
