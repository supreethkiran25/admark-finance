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
  Building2,
  Plus,
  Trash2,
  Edit3,
  CreditCard,
  Search,
} from 'lucide-react';
import { useFinance } from '../../../context/FinanceContext';
import { SelectPicker } from '../../common/SelectPicker';
import { Modal } from '../../common/Modal';
import { formatCurrency } from '../../../utils/currency';
import { Supplier, ExpenseCategory } from '../../../types/finance';
import { colors } from '../../../theme/colors';

const CATEGORIES: ExpenseCategory[] = [
  'Cloud Services',
  'Software',
  'Design Tools',
  'Employee Salaries',
  'Office Expenses',
  'Food',
  'Travel',
  'Marketing',
  'Equipment',
  'Utilities',
  'Taxes',
  'Miscellaneous',
];

const PAYMENT_TERMS = [
  'Net 15 Days',
  'Net 30 Days',
  'Net 60 Days',
  'Monthly Auto-Debit',
  'Due on Receipt',
];

export const SuppliersView: React.FC = () => {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier, paySupplier } = useFinance();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // Pay Modal
  const [payingSupplier, setPayingSupplier] = useState<Supplier | null>(null);
  const [payAmountInput, setPayAmountInput] = useState<string>('');

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    category: ExpenseCategory;
    contactEmail: string;
    paymentTerms: string;
    pendingPaymentAmount: string;
    notes: string;
  }>({
    name: '',
    category: 'Cloud Services',
    contactEmail: '',
    paymentTerms: 'Net 30 Days',
    pendingPaymentAmount: '0.00',
    notes: '',
  });

  const filteredSuppliers = suppliers.filter(s => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      s.contactEmail.toLowerCase().includes(q)
    );
  });

  const totalPending = suppliers.reduce((sum, s) => sum + (s.pendingPaymentAmount || 0), 0);
  const totalPaid = suppliers.reduce((sum, s) => sum + (s.totalPaidYTD || 0), 0);

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('Please enter supplier company name.');
      return;
    }

    const pendingNum = parseFloat(formData.pendingPaymentAmount) || 0;

    if (editingSupplier) {
      updateSupplier(editingSupplier.id, {
        name: formData.name,
        category: formData.category,
        contactEmail: formData.contactEmail || 'billing@supplier.com',
        paymentTerms: formData.paymentTerms,
        pendingPaymentAmount: pendingNum,
        notes: formData.notes,
      });
      setEditingSupplier(null);
    } else {
      addSupplier({
        name: formData.name,
        category: formData.category,
        contactEmail: formData.contactEmail || 'billing@supplier.com',
        paymentTerms: formData.paymentTerms,
        pendingPaymentAmount: pendingNum,
        notes: formData.notes,
      });
      setIsAddModalOpen(false);
    }

    setFormData({
      name: '',
      category: 'Cloud Services',
      contactEmail: '',
      paymentTerms: 'Net 30 Days',
      pendingPaymentAmount: '0.00',
      notes: '',
    });
  };

  const handleExecutePayment = () => {
    if (!payingSupplier) return;
    const num = parseFloat(payAmountInput);
    if (isNaN(num) || num <= 0) {
      alert('Please enter a valid payment amount in INR (₹).');
      return;
    }

    paySupplier(payingSupplier.id, num);
    setPayingSupplier(null);
    setPayAmountInput('');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, gap: 14 }}>
      {/* Title Ribbon */}
      <View style={styles.titleRibbon}>
        <View>
          <Text style={styles.pageTitle}>Suppliers & Pending Payments</Text>
          <Text style={styles.pageSubtitle}>
            Track vendors, manage pending invoices, and record supplier disbursements.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => {
            setEditingSupplier(null);
            setFormData({
              name: '',
              category: 'Cloud Services',
              contactEmail: '',
              paymentTerms: 'Net 30 Days',
              pendingPaymentAmount: '0.00',
              notes: '',
            });
            setIsAddModalOpen(true);
          }}
        >
          <Plus size={13} color="#fff" />
          <Text style={styles.primaryBtnText}>+ Add Supplier</Text>
        </TouchableOpacity>
      </View>

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View>
            <Text style={styles.statLabel}>Total Suppliers</Text>
            <Text style={[styles.statVal, styles.monoText]}>{suppliers.length}</Text>
          </View>
          <View>
            <Text style={styles.statLabel}>Total Pending Payments</Text>
            <Text style={[styles.statVal, styles.monoText, { color: totalPending > 0 ? colors.debitText : colors.textPrimary }]}>
              {formatCurrency(totalPending)}
            </Text>
          </View>
          <View>
            <Text style={styles.statLabel}>Total Paid This Year</Text>
            <Text style={[styles.statVal, styles.monoText, { color: colors.primaryNavy }]}>
              {formatCurrency(totalPaid)}
            </Text>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBox}>
        <Search size={13} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search supplier name, category, or billing email..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Suppliers Table */}
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.cell, { flex: 2.8, fontWeight: '700' }]}>Supplier Company</Text>
          <Text style={[styles.cell, { flex: 1.8, fontWeight: '700' }]}>Category</Text>
          <Text style={[styles.cell, { flex: 1.5, fontWeight: '700' }]}>Payment Terms</Text>
          <Text style={[styles.cell, { flex: 1.6, textAlign: 'right', fontWeight: '700' }]}>Pending Payment (₹)</Text>
          <Text style={[styles.cell, { flex: 1.6, textAlign: 'right', fontWeight: '700' }]}>Paid YTD (₹)</Text>
          <Text style={[styles.cell, { flex: 1.6, textAlign: 'center', fontWeight: '700' }]}>Actions</Text>
        </View>

        {filteredSuppliers.length === 0 ? (
          <View style={styles.emptyTable}>
            <Building2 size={28} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No Suppliers Registered</Text>
            <Text style={styles.emptySub}>
              Click "+ Add Supplier" to record your service providers, software vendors, and contractors.
            </Text>
          </View>
        ) : (
          filteredSuppliers.map(s => (
            <View key={s.id} style={styles.tableRow}>
              <View style={{ flex: 2.8 }}>
                <Text style={[styles.cell, { fontWeight: '700' }]}>{s.name}</Text>
                <Text style={{ fontSize: 9.5, color: colors.textMuted }}>{s.contactEmail}</Text>
              </View>

              <Text style={[styles.cell, { flex: 1.8 }]}>{s.category}</Text>
              <Text style={[styles.cell, { flex: 1.5, color: colors.textSecondary }]}>{s.paymentTerms}</Text>

              <Text
                style={[
                  styles.cell,
                  styles.monoText,
                  { flex: 1.6, textAlign: 'right', color: s.pendingPaymentAmount > 0 ? colors.debitText : colors.textMuted, fontWeight: s.pendingPaymentAmount > 0 ? '700' : 'normal' },
                ]}
              >
                {formatCurrency(s.pendingPaymentAmount)}
              </Text>

              <Text style={[styles.cell, styles.monoText, { flex: 1.6, textAlign: 'right', color: colors.primaryNavy, fontWeight: '600' }]}>
                {formatCurrency(s.totalPaidYTD)}
              </Text>

              <View style={{ flex: 1.6, flexDirection: 'row', justifyContent: 'center', gap: 4 }}>
                {s.pendingPaymentAmount > 0 && (
                  <TouchableOpacity
                    style={styles.payBtn}
                    onPress={() => {
                      setPayingSupplier(s);
                      setPayAmountInput(s.pendingPaymentAmount.toString());
                    }}
                  >
                    <CreditCard size={10} color="#fff" />
                    <Text style={styles.payBtnText}>Pay</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={() => {
                    setEditingSupplier(s);
                    setFormData({
                      name: s.name,
                      category: s.category,
                      contactEmail: s.contactEmail,
                      paymentTerms: s.paymentTerms,
                      pendingPaymentAmount: s.pendingPaymentAmount.toString(),
                      notes: s.notes || '',
                    });
                  }}
                >
                  <Edit3 size={11} color={colors.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.iconBtn, { backgroundColor: colors.debitBg }]}
                  onPress={() => {
                    if (confirm(`Remove supplier ${s.name}?`)) {
                      deleteSupplier(s.id);
                    }
                  }}
                >
                  <Trash2 size={11} color={colors.debitText} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Modal: Add/Edit Supplier */}
      <Modal
        isOpen={isAddModalOpen || !!editingSupplier}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingSupplier(null);
        }}
        title={editingSupplier ? `Edit Supplier: ${editingSupplier.name}` : 'Add New Supplier'}
        subtitle="Record vendor details and pending payment terms"
        size="sm"
        footer={
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 6, width: '100%' }}>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => {
                setIsAddModalOpen(false);
                setEditingSupplier(null);
              }}
            >
              <Text style={styles.secondaryBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleSave}
            >
              <Text style={styles.primaryBtnText}>Save Supplier</Text>
            </TouchableOpacity>
          </View>
        }
      >
        <View style={{ gap: 10 }}>
          <View style={styles.formCol}>
            <Text style={styles.formLabel}>Supplier Name *</Text>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={v => setFormData(p => ({ ...p, name: v }))}
              placeholder="e.g. Amazon Web Services or WeWork"
            />
          </View>

          <SelectPicker
            label="Category"
            value={formData.category}
            options={CATEGORIES}
            onChange={(v: any) => setFormData(p => ({ ...p, category: v }))}
            required
          />

          <SelectPicker
            label="Payment Terms"
            value={formData.paymentTerms}
            options={PAYMENT_TERMS}
            onChange={(v: any) => setFormData(p => ({ ...p, paymentTerms: v }))}
            required
          />

          <View style={styles.formCol}>
            <Text style={styles.formLabel}>Billing Contact Email</Text>
            <TextInput
              style={styles.input}
              value={formData.contactEmail}
              onChangeText={v => setFormData(p => ({ ...p, contactEmail: v }))}
              placeholder="billing@supplier.com"
            />
          </View>

          <View style={styles.formCol}>
            <Text style={styles.formLabel}>Initial Pending Payment (₹ INR)</Text>
            <TextInput
              style={[styles.input, styles.monoText]}
              value={formData.pendingPaymentAmount}
              onChangeText={v => setFormData(p => ({ ...p, pendingPaymentAmount: v }))}
              placeholder="0.00"
              keyboardType="numeric"
            />
          </View>
        </View>
      </Modal>

      {/* Modal: Pay Supplier */}
      <Modal
        isOpen={!!payingSupplier}
        onClose={() => setPayingSupplier(null)}
        title={payingSupplier ? `Pay Supplier: ${payingSupplier.name}` : 'Pay Supplier'}
        subtitle="Records an expense and clears pending balance"
        size="sm"
        footer={
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 6, width: '100%' }}>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => setPayingSupplier(null)}
            >
              <Text style={styles.secondaryBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleExecutePayment}
            >
              <Text style={styles.primaryBtnText}>Confirm Payment</Text>
            </TouchableOpacity>
          </View>
        }
      >
        {payingSupplier && (
          <View style={{ gap: 10 }}>
            <Text style={{ fontSize: 11.5, color: colors.textSecondary }}>
              Pending Balance: <Text style={[styles.monoText, { fontWeight: '700', color: colors.debitText }]}>{formatCurrency(payingSupplier.pendingPaymentAmount)}</Text>
            </Text>
            <View style={styles.formCol}>
              <Text style={styles.formLabel}>Payment Amount (₹ INR) *</Text>
              <TextInput
                style={[styles.input, styles.monoText, { fontWeight: '700' }]}
                value={payAmountInput}
                onChangeText={setPayAmountInput}
                placeholder="Enter amount..."
                keyboardType="numeric"
              />
            </View>
          </View>
        )}
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create<any>({
  container: {
    flex: 1,
    backgroundColor: colors.bgApp,
  },
  titleRibbon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
    flexWrap: 'wrap',
    gap: 8,
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
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryNavy,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 3,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 11.5,
    fontWeight: '700',
  },
  secondaryBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: 3,
  },
  secondaryBtnText: {
    color: colors.textPrimary,
    fontSize: 11.5,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: 4,
    padding: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statLabel: {
    fontSize: 10.5,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  statVal: {
    fontSize: 13.5,
    fontWeight: '800',
    marginTop: 2,
  },
  monoText: {
    fontFamily: 'Roboto Mono, monospace',
    fontVariant: ['tabular-nums'],
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: 3,
    paddingHorizontal: 8,
    height: 30,
  },
  searchInput: {
    flex: 1,
    fontSize: 11,
    color: colors.textPrimary,
    marginLeft: 6,
    outlineStyle: 'none' as any,
  },
  table: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 3,
    backgroundColor: colors.bgSurface,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  tableHeader: {
    backgroundColor: colors.bgSurfaceAlt,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  cell: {
    fontSize: 11,
    color: colors.textPrimary,
  },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: colors.creditText,
    borderRadius: 2,
  },
  payBtnText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  iconBtn: {
    padding: 4,
    borderRadius: 2,
    backgroundColor: colors.bgSurfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  emptyTable: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  emptySub: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
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
});
