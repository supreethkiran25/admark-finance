import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Modal as RNModal } from 'react-native';
import {
  Search,
  ArrowRight,
  Upload,
  Receipt,
  FileSpreadsheet,
  PieChart,
  Building2,
  FileText,
  Settings,
  X,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { NavigationModule } from '../../types/finance';
import { formatCurrency } from '../../utils/currency';
import { colors } from '../../theme/colors';

export const CommandPalette: React.FC<{ isOpen?: boolean; onClose?: () => void }> = ({ isOpen = false, onClose }) => {
  const {
    setActiveModule,
    expenses,
    suppliers,
  } = useFinance();

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(isOpen);

  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
      } else if (e.key === 'Escape' && open) {
        setOpen(false);
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  interface PaletteItem {
    id: string;
    title: string;
    subtitle?: string;
    category: 'Navigation' | 'Expenses' | 'Suppliers';
    action: () => void;
  }

  const items: PaletteItem[] = [
    {
      id: 'nav-dash',
      title: 'Go to Dashboard',
      subtitle: 'View spending overview and key metrics',
      category: 'Navigation',
      action: () => setActiveModule('dashboard'),
    },
    {
      id: 'nav-upload',
      title: 'Upload Bank Statement',
      subtitle: 'Analyze PDF, CSV, or Excel statement',
      category: 'Navigation',
      action: () => setActiveModule('upload-statement'),
    },
    {
      id: 'nav-exp',
      title: 'Manage Expenses',
      subtitle: 'Record and edit operational expenses',
      category: 'Navigation',
      action: () => setActiveModule('expenses'),
    },
    {
      id: 'nav-txs',
      title: 'Transaction History',
      subtitle: 'Browse all recorded and imported transactions',
      category: 'Navigation',
      action: () => setActiveModule('transactions'),
    },
    {
      id: 'nav-emp',
      title: 'Employees Directory',
      subtitle: 'Manage staff, positions, and contact records',
      category: 'Navigation',
      action: () => setActiveModule('employees'),
    },
    {
      id: 'nav-payroll',
      title: 'Payroll & Salary Management',
      subtitle: 'Monthly salary disbursements, tracker, and payroll records',
      category: 'Navigation',
      action: () => setActiveModule('payroll'),
    },
    {
      id: 'nav-budgets',
      title: 'Department Budgets',
      subtitle: 'View and edit monthly spending limits',
      category: 'Navigation',
      action: () => setActiveModule('budgets'),
    },
    {
      id: 'nav-sup',
      title: 'Suppliers & Pending Payments',
      subtitle: 'Manage vendors and settle due invoices',
      category: 'Navigation',
      action: () => setActiveModule('suppliers'),
    },
    {
      id: 'nav-reports',
      title: 'Spending Reports',
      subtitle: 'Category breakdowns and export to Excel/CSV',
      category: 'Navigation',
      action: () => setActiveModule('reports'),
    },
    {
      id: 'nav-settings',
      title: 'Settings',
      subtitle: 'Account security, password, and preferences',
      category: 'Navigation',
      action: () => setActiveModule('settings'),
    },
    ...expenses.slice(0, 10).map(exp => ({
      id: `exp-${exp.id}`,
      title: `${exp.referenceNumber}: ${exp.description}`,
      subtitle: `${exp.category} • ${formatCurrency(exp.amount)} • ${exp.date}`,
      category: 'Expenses' as const,
      action: () => setActiveModule('expenses'),
    })),
    ...suppliers.slice(0, 8).map(sup => ({
      id: `sup-${sup.id}`,
      title: `Supplier: ${sup.name}`,
      subtitle: `${sup.category} • Pending: ${formatCurrency(sup.pendingPaymentAmount)}`,
      category: 'Suppliers' as const,
      action: () => setActiveModule('suppliers'),
    })),
  ];

  const filteredItems = items.filter(item => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return item.title.toLowerCase().includes(q) || (item.subtitle && item.subtitle.toLowerCase().includes(q));
  });

  return (
    <RNModal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={() => {
        setOpen(false);
        onClose?.();
      }}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.paletteBox}>
          <View style={styles.inputRow}>
            <Search size={16} color={colors.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="Type a command, expense, supplier, or module..."
              placeholderTextColor={colors.textMuted}
              value={query}
              onChangeText={setQuery}
              autoFocus
            />
            <TouchableOpacity
              onPress={() => {
                setOpen(false);
                onClose?.();
              }}
              style={styles.closeBtn}
            >
              <X size={14} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.resultsList} contentContainerStyle={{ padding: 6, gap: 4 }}>
            {filteredItems.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>No matching commands or records found.</Text>
              </View>
            ) : (
              filteredItems.map(item => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.resultItem}
                  onPress={() => {
                    item.action();
                    setOpen(false);
                    onClose?.();
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    {item.subtitle && <Text style={styles.itemSub}>{item.subtitle}</Text>}
                  </View>
                  <View style={styles.catBadge}>
                    <Text style={styles.catBadgeText}>{item.category}</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>

          <View style={styles.footer}>
            <Text style={styles.footerKbd}>Esc to close</Text>
            <Text style={styles.footerKbd}>Ctrl+K to toggle</Text>
          </View>
        </View>
      </View>
    </RNModal>
  );
};

const styles = StyleSheet.create<any>({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 80,
  },
  paletteBox: {
    width: 520,
    maxHeight: 400,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: 6,
    overflow: 'hidden',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
    height: 42,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: colors.textPrimary,
    outlineStyle: 'none' as any,
  },
  closeBtn: {
    padding: 4,
  },
  resultsList: {
    maxHeight: 300,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 3,
    backgroundColor: colors.bgSurface,
  },
  itemTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  itemSub: {
    fontSize: 10.5,
    color: colors.textMuted,
  },
  catBadge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    backgroundColor: colors.bgSurfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 2,
  },
  catBadgeText: {
    fontSize: 9.5,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  empty: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 11.5,
    color: colors.textMuted,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    backgroundColor: colors.bgSurfaceAlt,
  },
  footerKbd: {
    fontSize: 10,
    color: colors.textMuted,
    fontFamily: 'Roboto Mono, monospace',
  },
});
