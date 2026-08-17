import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Modal as RNModal } from 'react-native';
import {
  Search,
  ArrowRight,
  PlusCircle,
  FileText,
  DollarSign,
  Building,
  Shield,
  Layers,
  PieChart,
  Users,
  Sliders,
  CheckCircle,
  X,
} from 'lucide-react-native';
import { useFinance } from '../../context/FinanceContext';
import { NavigationModule } from '../../types/finance';
import { formatCurrency } from '../../utils/currency';
import { colors } from '../../theme/colors';

export const CommandPalette: React.FC = () => {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    setActiveModule,
    expenses,
    vendors,
    setIsCompactMode,
    isCompactMode,
  } = useFinance();

  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      } else if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        setCommandPaletteOpen(true);
      } else if (e.key === 'Escape' && commandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  interface PaletteItem {
    id: string;
    title: string;
    subtitle?: string;
    group: 'Navigation' | 'Actions' | 'Expenses' | 'Vendors';
    icon: React.ReactNode;
    action: () => void;
  }

  const navItems: PaletteItem[] = [
    {
      id: 'nav-overview',
      title: 'Executive Overview',
      subtitle: 'Liquid cash reserves (₹), operational metrics & ledger',
      group: 'Navigation',
      icon: <PieChart size={14} color={colors.primaryNavy} />,
      action: () => { setActiveModule('overview'); setCommandPaletteOpen(false); },
    },
    {
      id: 'nav-expenses',
      title: 'Expense Management (General Ledger)',
      subtitle: 'Record expenses, receipt OCR, GST & TDS approvals',
      group: 'Navigation',
      icon: <DollarSign size={14} color={colors.primaryNavy} />,
      action: () => { setActiveModule('expenses'); setCommandPaletteOpen(false); },
    },
    {
      id: 'nav-statements',
      title: 'HDFC / ICICI Statements & Reconcile',
      subtitle: 'Parse Indian bank statements and auto-reconcile',
      group: 'Navigation',
      icon: <Layers size={14} color={colors.primaryNavy} />,
      action: () => { setActiveModule('statements'); setCommandPaletteOpen(false); },
    },
    {
      id: 'nav-categorization',
      title: 'Automatic Categorization Engine',
      subtitle: 'Indian software agency keyword & regex rule matching',
      group: 'Navigation',
      icon: <Sliders size={14} color={colors.primaryNavy} />,
      action: () => { setActiveModule('categorization'); setCommandPaletteOpen(false); },
    },
    {
      id: 'nav-employees',
      title: 'Employee Reimbursements & Claims',
      subtitle: 'IndiGo travel, WFH stipends, hardware claims queue',
      group: 'Navigation',
      icon: <Users size={14} color={colors.primaryNavy} />,
      action: () => { setActiveModule('employees'); setCommandPaletteOpen(false); },
    },
    {
      id: 'nav-budgets',
      title: 'Department Budgets (₹ Lakhs)',
      subtitle: 'Allocated vs spent variance & utilization alerts',
      group: 'Navigation',
      icon: <CheckCircle size={14} color={colors.primaryNavy} />,
      action: () => { setActiveModule('budgets'); setCommandPaletteOpen(false); },
    },
    {
      id: 'nav-vendors',
      title: 'Vendor Directory & Accounts Payable',
      subtitle: 'AWS India, WeWork, SAM Legal, GST & TDS records',
      group: 'Navigation',
      icon: <Building size={14} color={colors.primaryNavy} />,
      action: () => { setActiveModule('vendors'); setCommandPaletteOpen(false); },
    },
    {
      id: 'nav-invoices',
      title: 'Invoices (GST Tax Invoices & AP)',
      subtitle: 'Client billing retainers (AR) & formal tax invoices',
      group: 'Navigation',
      icon: <FileText size={14} color={colors.primaryNavy} />,
      action: () => { setActiveModule('invoices'); setCommandPaletteOpen(false); },
    },
    {
      id: 'nav-reports',
      title: 'Financial Reports & P&L (₹)',
      subtitle: 'GAAP P&L, Daily Cash, GST 1099 and PDF export',
      group: 'Navigation',
      icon: <FileText size={14} color={colors.primaryNavy} />,
      action: () => { setActiveModule('reports'); setCommandPaletteOpen(false); },
    },
    {
      id: 'nav-security',
      title: 'Security & Audit Log',
      subtitle: '11 SOC-2 / ISO gates and immutable event trail',
      group: 'Navigation',
      icon: <Shield size={14} color={colors.primaryNavy} />,
      action: () => { setActiveModule('security'); setCommandPaletteOpen(false); },
    },
  ];

  const actionItems: PaletteItem[] = [
    {
      id: 'act-density',
      title: `Toggle Row Density (${isCompactMode ? 'Compact 32px' : 'Standard 40px'})`,
      subtitle: 'Switch between dense accounting and standard row layout',
      group: 'Actions',
      icon: <Sliders size={14} color={colors.primaryNavy} />,
      action: () => { setIsCompactMode(prev => !prev); setCommandPaletteOpen(false); },
    },
    {
      id: 'act-new-exp',
      title: '+ Record New Expense (₹)',
      subtitle: 'Add transaction with GST/TDS allocation',
      group: 'Actions',
      icon: <PlusCircle size={14} color={colors.primaryNavy} />,
      action: () => { setActiveModule('expenses'); setCommandPaletteOpen(false); },
    },
  ];

  const filteredItems = [
    ...navItems.filter(
      i => i.title.toLowerCase().includes(query.toLowerCase()) || (i.subtitle && i.subtitle.toLowerCase().includes(query.toLowerCase()))
    ),
    ...actionItems.filter(
      i => i.title.toLowerCase().includes(query.toLowerCase()) || (i.subtitle && i.subtitle.toLowerCase().includes(query.toLowerCase()))
    ),
  ];

  return (
    <RNModal
      visible={commandPaletteOpen}
      transparent
      animationType="fade"
      onRequestClose={() => setCommandPaletteOpen(false)}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={() => setCommandPaletteOpen(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.box}
          onPress={e => e.stopPropagation()}
        >
          <View style={styles.searchBar}>
            <Search size={15} color={colors.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="Search Indian financial operations, modules, ledger... (ESC to close)"
              placeholderTextColor={colors.textMuted}
              value={query}
              onChangeText={setQuery}
              autoFocus
            />
            <TouchableOpacity onPress={() => setCommandPaletteOpen(false)}>
              <X size={14} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ maxHeight: 360 }}>
            {filteredItems.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.item}
                onPress={item.action}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                  {item.icon}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    {item.subtitle && <Text style={styles.itemSubtitle}>{item.subtitle}</Text>}
                  </View>
                </View>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.group}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: '8%',
  },
  box: {
    width: '92%',
    maxWidth: 580,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
    overflow: 'hidden',
  },
  searchBar: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: colors.textPrimary,
    fontFamily: 'Public Sans, sans-serif',
    outlineStyle: 'none' as any,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  itemTitle: {
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  itemSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  badge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 2,
    backgroundColor: colors.bgSurfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  badgeText: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
