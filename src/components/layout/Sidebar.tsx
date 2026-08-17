import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import {
  LayoutDashboard,
  Receipt,
  FileSpreadsheet,
  Cpu,
  UserCheck,
  PieChart,
  Building2,
  FileText,
  BarChart3,
  Shield,
  Plus,
  Upload,
} from 'lucide-react-native';
import { useFinance } from '../../context/FinanceContext';
import { NavigationModule } from '../../types/finance';
import { colors } from '../../theme/colors';

export const Sidebar: React.FC = () => {
  const {
    activeModule,
    setActiveModule,
    currentRole,
    isSidebarCollapsed,
    expenses,
    transactions,
    claims,
    invoices,
  } = useFinance();

  const pendingExpensesCount = expenses.filter(e => e.status === 'Pending Approval').length;
  const unmatchedTxsCount = transactions.filter(t => t.reconciliationStatus === 'Unmatched').length;
  const pendingClaimsCount = claims.filter(c => c.status === 'Submitted').length;
  const overdueInvoicesCount = invoices.filter(i => i.status === 'Overdue').length;

  interface NavSection {
    title: string;
    items: Array<{
      id: NavigationModule;
      label: string;
      icon: (color: string) => React.ReactNode;
      badge?: number | string;
      badgeType?: 'credit' | 'debit' | 'pending';
    }>;
  }

  const sections: NavSection[] = [
    {
      title: 'Operations Ledger',
      items: [
        {
          id: 'overview',
          label: 'Executive Overview',
          icon: (c) => <LayoutDashboard size={14} color={c} />,
        },
        {
          id: 'expenses',
          label: 'Expense Management',
          icon: (c) => <Receipt size={14} color={c} />,
          badge: pendingExpensesCount > 0 ? pendingExpensesCount : undefined,
          badgeType: 'pending',
        },
        {
          id: 'statements',
          label: 'HDFC / ICICI Reconcile',
          icon: (c) => <FileSpreadsheet size={14} color={c} />,
          badge: unmatchedTxsCount > 0 ? `${unmatchedTxsCount} open` : undefined,
          badgeType: 'debit',
        },
        {
          id: 'categorization',
          label: 'Auto-Categorization',
          icon: (c) => <Cpu size={14} color={c} />,
        },
      ],
    },
    {
      title: 'Workforce & Capacity',
      items: [
        {
          id: 'employees',
          label: 'Employee Claims (INR)',
          icon: (c) => <UserCheck size={14} color={c} />,
          badge: pendingClaimsCount > 0 ? pendingClaimsCount : undefined,
          badgeType: 'pending',
        },
        {
          id: 'budgets',
          label: 'Department Budgets',
          icon: (c) => <PieChart size={14} color={c} />,
        },
      ],
    },
    {
      title: 'Commercial & Tax',
      items: [
        {
          id: 'vendors',
          label: 'Vendor AP & TDS',
          icon: (c) => <Building2 size={14} color={c} />,
        },
        {
          id: 'invoices',
          label: 'GST Tax Invoices',
          icon: (c) => <FileText size={14} color={c} />,
          badge: overdueInvoicesCount > 0 ? `${overdueInvoicesCount} overdue` : undefined,
          badgeType: 'debit',
        },
      ],
    },
    {
      title: 'Financial Intelligence',
      items: [
        {
          id: 'reports',
          label: 'P&L Reports (₹)',
          icon: (c) => <FileText size={14} color={c} />,
        },
        {
          id: 'analytics',
          label: 'Financial Analytics',
          icon: (c) => <BarChart3 size={14} color={c} />,
        },
        {
          id: 'security',
          label: 'Security & Audit Log',
          icon: (c) => <Shield size={14} color={c} />,
        },
      ],
    },
  ];

  const sidebarWidth = isSidebarCollapsed ? 54 : 220;

  return (
    <View style={[styles.sidebar, { width: sidebarWidth }]}>
      <ScrollView style={{ flex: 1, padding: isSidebarCollapsed ? 4 : 8 }}>
        {currentRole === 'CTO' && !isSidebarCollapsed && (
          <View style={styles.ctoBanner}>
            <Text style={styles.ctoBannerText}>
              <Text style={{ fontWeight: '700' }}>CTO Filter:</Text> Tech & Cloud expenses only.
            </Text>
          </View>
        )}

        {sections.map((sec, sIdx) => (
          <View key={sIdx} style={{ marginBottom: 12 }}>
            {!isSidebarCollapsed && (
              <Text style={styles.sectionHeader}>{sec.title}</Text>
            )}

            <View style={{ gap: 2 }}>
              {sec.items.map(item => {
                const isActive = activeModule === item.id;
                const iconColor = isActive ? colors.primaryBlue : colors.textMuted;

                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => setActiveModule(item.id)}
                    style={[
                      styles.navItem,
                      isActive && styles.navItemActive,
                      isSidebarCollapsed && { justifyContent: 'center', paddingHorizontal: 0 },
                    ]}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      {item.icon(iconColor)}
                      {!isSidebarCollapsed && (
                        <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                          {item.label}
                        </Text>
                      )}
                    </View>

                    {!isSidebarCollapsed && item.badge && (
                      <View
                        style={[
                          styles.badge,
                          item.badgeType === 'debit' && { backgroundColor: colors.debitBg, borderColor: colors.debitBorder },
                          item.badgeType === 'pending' && { backgroundColor: colors.pendingBg, borderColor: colors.pendingBorder },
                        ]}
                      >
                        <Text
                          style={[
                            styles.badgeText,
                            item.badgeType === 'debit' && { color: colors.debitText },
                            item.badgeType === 'pending' && { color: colors.pendingText },
                          ]}
                        >
                          {item.badge}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Quick Action Footer */}
      {!isSidebarCollapsed && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.primaryActionBtn}
            onPress={() => setActiveModule('expenses')}
          >
            <Plus size={12} color="#fff" />
            <Text style={styles.primaryActionText}>+ Record Expense</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryActionBtn}
            onPress={() => setActiveModule('statements')}
          >
            <Upload size={12} color={colors.textPrimary} />
            <Text style={styles.secondaryActionText}>Import Statement</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    backgroundColor: colors.bgSurfaceAlt,
    borderRightWidth: 1,
    borderRightColor: colors.borderDefault,
    height: '100%',
    justifyContent: 'space-between',
  },
  ctoBanner: {
    padding: 6,
    marginBottom: 8,
    backgroundColor: colors.infoBg,
    borderWidth: 1,
    borderColor: colors.infoBorder,
    borderRadius: 2,
  },
  ctoBannerText: {
    fontSize: 10,
    color: colors.infoText,
    lineHeight: 13,
  },
  sectionHeader: {
    fontSize: 9.5,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: colors.textMuted,
    paddingHorizontal: 6,
    marginBottom: 3,
    letterSpacing: 0.5,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  navItemActive: {
    backgroundColor: colors.bgSurface,
    borderColor: colors.borderDefault,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  navLabel: {
    fontSize: 11.5,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  navLabelActive: {
    fontWeight: '700',
    color: colors.primaryNavy,
  },
  badge: {
    paddingHorizontal: 4,
    paddingVertical: 0.5,
    borderRadius: 2,
    borderWidth: 1,
    backgroundColor: colors.bgSurfaceSubtle,
    borderColor: colors.borderSubtle,
  },
  badgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    fontFamily: 'Roboto Mono, monospace',
    color: colors.textSecondary,
  },
  footer: {
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    backgroundColor: colors.bgSurface,
    gap: 5,
  },
  primaryActionBtn: {
    backgroundColor: colors.primaryNavy,
    paddingVertical: 5,
    borderRadius: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  primaryActionText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  secondaryActionBtn: {
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    paddingVertical: 5,
    borderRadius: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  secondaryActionText: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: '600',
  },
});
