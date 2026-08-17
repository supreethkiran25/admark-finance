import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal as RNModal } from 'react-native';
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
  X,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { NavigationModule } from '../../types/finance';
import { useIsMobile } from '../../utils/useIsMobile';
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
    setIsSidebarCollapsed,
    pendingReviewTransactions,
    suppliers,
  } = useFinance();

  const isMobile = useIsMobile(768);
  const pendingPaymentsCount = suppliers.filter(s => s.pendingPaymentAmount > 0).length;

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (c) => <LayoutDashboard size={15} color={c} />,
    },
    {
      id: 'upload-statement',
      label: 'Upload Statement',
      icon: (c) => <Upload size={15} color={c} />,
      badge: pendingReviewTransactions.length > 0 ? `${pendingReviewTransactions.length} review` : undefined,
      badgeColor: colors.pendingText,
    },
    {
      id: 'expenses',
      label: 'Expenses',
      icon: (c) => <Receipt size={15} color={c} />,
    },
    {
      id: 'transactions',
      label: 'Transactions',
      icon: (c) => <FileSpreadsheet size={15} color={c} />,
    },
    {
      id: 'employees',
      label: 'Employees',
      icon: (c) => <Users size={15} color={c} />,
    },
    {
      id: 'payroll',
      label: 'Payroll',
      icon: (c) => <CreditCard size={15} color={c} />,
    },
    {
      id: 'budgets',
      label: 'Budgets',
      icon: (c) => <PieChart size={15} color={c} />,
    },
    {
      id: 'suppliers',
      label: 'Suppliers',
      icon: (c) => <Building2 size={15} color={c} />,
      badge: pendingPaymentsCount > 0 ? `${pendingPaymentsCount} due` : undefined,
      badgeColor: colors.debitText,
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: (c) => <FileText size={15} color={c} />,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: (c) => <Settings size={15} color={c} />,
    },
  ];

  // Mobile Slide-over Drawer
  if (isMobile) {
    return (
      <>
        {/* Mobile Slide-in Drawer Modal */}
        <RNModal
          visible={!isSidebarCollapsed}
          transparent
          animationType="fade"
          onRequestClose={() => setIsSidebarCollapsed(true)}
        >
          <View style={styles.mobileDrawerOverlay}>
            <TouchableOpacity
              style={styles.backdropPress}
              activeOpacity={1}
              onPress={() => setIsSidebarCollapsed(true)}
            />

            <View style={styles.mobileDrawerContent}>
              <View style={styles.drawerHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.drawerBrand}>ADMARK CFO</Text>
                  <View style={styles.drawerBadge}>
                    <Text style={styles.drawerBadgeText}>PORTAL</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.closeDrawerBtn}
                  onPress={() => setIsSidebarCollapsed(true)}
                >
                  <X size={16} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 8, gap: 4 }}>
                <TouchableOpacity
                  style={styles.mobileUploadBtn}
                  onPress={() => {
                    setActiveModule('upload-statement');
                    setIsSidebarCollapsed(true);
                  }}
                >
                  <Upload size={14} color="#fff" />
                  <Text style={styles.mobileUploadBtnText}>Upload Bank Statement</Text>
                </TouchableOpacity>

                {navItems.map(item => {
                  const isActive = activeModule === item.id;
                  const activeColor = isActive ? '#fff' : colors.textPrimary;

                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.mobileNavItem, isActive && styles.mobileNavItemActive]}
                      onPress={() => {
                        setActiveModule(item.id);
                        setIsSidebarCollapsed(true);
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        {item.icon(activeColor)}
                        <Text style={[styles.mobileNavLabel, isActive && styles.mobileNavLabelActive]}>
                          {item.label}
                        </Text>
                      </View>
                      {item.badge && (
                        <View style={[styles.badge, { backgroundColor: item.badgeColor ? `${item.badgeColor}20` : colors.bgSurfaceAlt }]}>
                          <Text style={[styles.badgeText, { color: item.badgeColor || colors.textSecondary }]}>
                            {item.badge}
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <View style={styles.drawerFooter}>
                <Text style={styles.footerText}>CFO Financial Workspace</Text>
                <Text style={styles.footerSub}>Currency: ₹ INR</Text>
              </View>
            </View>
          </View>
        </RNModal>

        {/* Mobile Bottom Quick Navigation Bar */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.bottomBarItem, activeModule === 'dashboard' && styles.bottomBarItemActive]}
            onPress={() => setActiveModule('dashboard')}
          >
            <LayoutDashboard size={17} color={activeModule === 'dashboard' ? colors.primaryNavy : colors.textMuted} />
            <Text style={[styles.bottomBarLabel, activeModule === 'dashboard' && styles.bottomBarLabelActive]}>
              Overview
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.bottomBarItem, activeModule === 'upload-statement' && styles.bottomBarItemActive]}
            onPress={() => setActiveModule('upload-statement')}
          >
            <Upload size={17} color={activeModule === 'upload-statement' ? colors.primaryNavy : colors.textMuted} />
            <Text style={[styles.bottomBarLabel, activeModule === 'upload-statement' && styles.bottomBarLabelActive]}>
              Statement
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.bottomBarItem, activeModule === 'expenses' && styles.bottomBarItemActive]}
            onPress={() => setActiveModule('expenses')}
          >
            <Receipt size={17} color={activeModule === 'expenses' ? colors.primaryNavy : colors.textMuted} />
            <Text style={[styles.bottomBarLabel, activeModule === 'expenses' && styles.bottomBarLabelActive]}>
              Expenses
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.bottomBarItem, activeModule === 'payroll' && styles.bottomBarItemActive]}
            onPress={() => setActiveModule('payroll')}
          >
            <CreditCard size={17} color={activeModule === 'payroll' ? colors.primaryNavy : colors.textMuted} />
            <Text style={[styles.bottomBarLabel, activeModule === 'payroll' && styles.bottomBarLabelActive]}>
              Payroll
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bottomBarItem}
            onPress={() => setIsSidebarCollapsed(false)}
          >
            <Settings size={17} color={colors.textMuted} />
            <Text style={styles.bottomBarLabel}>More...</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  // Desktop / Tablet Sidebar
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
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: 8,
  },
  sidebarCollapsed: {
    width: 50,
    paddingHorizontal: 4,
  },
  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primaryNavy,
    paddingVertical: 7,
    borderRadius: 3,
    marginBottom: 8,
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
    paddingVertical: 6,
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
    color: colors.textSecondary,
    flex: 1,
  },
  navLabelActive: {
    color: '#fff',
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  footer: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  footerText: {
    fontSize: 9.5,
    fontWeight: '600',
    color: colors.textMuted,
  },
  footerSub: {
    fontSize: 8.5,
    color: colors.textSecondary,
  },
  // Mobile Specific Drawer & Bottom Navigation Styles
  mobileDrawerOverlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
  },
  backdropPress: {
    flex: 1,
  },
  mobileDrawerContent: {
    width: 270,
    maxWidth: '82%',
    backgroundColor: colors.bgSurface,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '4px 0 20px rgba(0,0,0,0.25)',
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  drawerBrand: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  drawerBadge: {
    backgroundColor: colors.primaryNavy,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
  },
  drawerBadgeText: {
    fontSize: 8,
    color: '#fff',
    fontWeight: '800',
  },
  closeDrawerBtn: {
    padding: 4,
  },
  mobileUploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primaryNavy,
    paddingVertical: 10,
    borderRadius: 4,
    marginBottom: 8,
  },
  mobileUploadBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  mobileNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  mobileNavItemActive: {
    backgroundColor: colors.primaryNavy,
  },
  mobileNavLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  mobileNavLabelActive: {
    color: '#fff',
    fontWeight: '700',
  },
  drawerFooter: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderDefault,
    backgroundColor: colors.bgSurfaceAlt,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 52,
    backgroundColor: colors.bgSurface,
    borderTopWidth: 1,
    borderTopColor: colors.borderDefault,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    zIndex: 100,
    paddingBottom: 'env(safe-area-inset-bottom, 0px)' as any,
  },
  bottomBarItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: 2,
  },
  bottomBarItemActive: {
    borderTopWidth: 2,
    borderTopColor: colors.primaryNavy,
  },
  bottomBarLabel: {
    fontSize: 9.5,
    fontWeight: '600',
    color: colors.textMuted,
  },
  bottomBarLabelActive: {
    color: colors.primaryNavy,
    fontWeight: '700',
  },
});
