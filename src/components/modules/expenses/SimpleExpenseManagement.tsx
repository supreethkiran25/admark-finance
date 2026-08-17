import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {
  Receipt,
  Plus,
  Trash2,
  Edit3,
  Search,
  FileSpreadsheet,
  Download,
  Upload,
  Paperclip,
  X,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { useFinance } from '../../../context/FinanceContext';
import { SelectPicker } from '../../common/SelectPicker';
import { Modal } from '../../common/Modal';
import { formatCurrency } from '../../../utils/currency';
import { formatDate } from '../../../utils/date';
import { Expense, ExpenseCategory } from '../../../types/finance';
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

export const SimpleExpenseManagement: React.FC = () => {
  const {
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    exportExpensesExcel,
    exportExpensesCSV,
  } = useFinance();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [previewReceipt, setPreviewReceipt] = useState<Expense | null>(null);

  // Simplified Form State (Only Date, Category, Description, Amount, Receipt)
  const [formData, setFormData] = useState<{
    date: string;
    category: ExpenseCategory;
    description: string;
    amount: string;
    receiptFileName?: string;
    receiptDataUrl?: string;
  }>({
    date: new Date().toISOString().split('T')[0],
    category: 'Cloud Services',
    description: '',
    amount: '',
    receiptFileName: '',
    receiptDataUrl: '',
  });

  // Handle Receipt Upload
  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData(prev => ({
        ...prev,
        receiptFileName: file.name,
        receiptDataUrl: event.target?.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const num = parseFloat(formData.amount);
    if (isNaN(num) || num <= 0) {
      alert('Please enter a valid expense amount in INR (₹).');
      return;
    }

    if (!formData.description.trim()) {
      alert('Please enter a short description or merchant name.');
      return;
    }

    if (editingExpense) {
      updateExpense(editingExpense.id, {
        date: formData.date,
        category: formData.category,
        description: formData.description,
        amount: num,
        receiptFileName: formData.receiptFileName,
        receiptDataUrl: formData.receiptDataUrl,
      });
      setEditingExpense(null);
    } else {
      addExpense({
        date: formData.date,
        category: formData.category,
        description: formData.description,
        amount: num,
        status: 'Approved',
        receiptFileName: formData.receiptFileName,
        receiptDataUrl: formData.receiptDataUrl,
      });
      setIsAddModalOpen(false);
    }

    setFormData({
      date: new Date().toISOString().split('T')[0],
      category: 'Cloud Services',
      description: '',
      amount: '',
      receiptFileName: '',
      receiptDataUrl: '',
    });
  };

  const openEditModal = (item: Expense) => {
    setEditingExpense(item);
    setFormData({
      date: item.date,
      category: item.category,
      description: item.description,
      amount: item.amount.toString(),
      receiptFileName: item.receiptFileName,
      receiptDataUrl: item.receiptDataUrl,
    });
  };

  const filteredExpenses = expenses.filter(item => {
    if (selectedCategoryFilter !== 'All' && item.category !== selectedCategoryFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.referenceNumber.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalFilteredAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, gap: 14 }}>
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleReceiptUpload}
        accept="image/*,.pdf,.xlsx,.csv"
        style={{ display: 'none' }}
      />

      {/* Title Ribbon */}
      <View style={styles.titleRibbon}>
        <View>
          <Text style={styles.pageTitle}>Expenses</Text>
          <Text style={styles.pageSubtitle}>
            Manage all company expenses, upload receipts, and export spending data.
          </Text>
        </View>

        <View style={styles.actionGroup}>
          <TouchableOpacity
            style={styles.exportBtn}
            onPress={exportExpensesExcel}
          >
            <FileSpreadsheet size={13} color={colors.creditText} />
            <Text style={styles.exportBtnText}>Export Excel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => {
              setEditingExpense(null);
              setFormData({
                date: new Date().toISOString().split('T')[0],
                category: 'Cloud Services',
                description: '',
                amount: '',
                receiptFileName: '',
                receiptDataUrl: '',
              });
              setIsAddModalOpen(true);
            }}
          >
            <Plus size={13} color="#fff" />
            <Text style={styles.primaryBtnText}>+ Add Expense</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter & Search Bar */}
      <View style={styles.filterRow}>
        <View style={styles.searchBox}>
          <Search size={13} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search description, merchant, or reference #..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <SelectPicker
          label="Category"
          value={selectedCategoryFilter}
          options={['All', ...CATEGORIES]}
          onChange={setSelectedCategoryFilter}
          style={{ minWidth: 160 }}
        />

        <View style={styles.totalBadge}>
          <Text style={styles.totalBadgeLabel}>Total:</Text>
          <Text style={[styles.totalBadgeVal, styles.monoText]}>
            {formatCurrency(totalFilteredAmount)}
          </Text>
        </View>
      </View>

      {/* Expenses Table */}
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.cell, { flex: 1.1, fontWeight: '700' }]}>Ref #</Text>
          <Text style={[styles.cell, { flex: 1.1, fontWeight: '700' }]}>Date</Text>
          <Text style={[styles.cell, { flex: 3.2, fontWeight: '700' }]}>Description</Text>
          <Text style={[styles.cell, { flex: 1.8, fontWeight: '700' }]}>Category</Text>
          <Text style={[styles.cell, { flex: 1.5, textAlign: 'right', fontWeight: '700' }]}>Amount (₹)</Text>
          <Text style={[styles.cell, { flex: 1.0, textAlign: 'center', fontWeight: '700' }]}>Receipt</Text>
          <Text style={[styles.cell, { flex: 1.2, textAlign: 'center', fontWeight: '700' }]}>Actions</Text>
        </View>

        {filteredExpenses.length === 0 ? (
          <View style={styles.emptyTable}>
            <Receipt size={28} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No Expenses Recorded</Text>
            <Text style={styles.emptySub}>
              Click "+ Add Expense" above or upload a bank statement to record your expenses.
            </Text>
          </View>
        ) : (
          filteredExpenses.map(exp => (
            <View key={exp.id} style={styles.tableRow}>
              <Text style={[styles.cell, styles.monoText, { flex: 1.1, color: colors.textMuted }]}>
                {exp.referenceNumber}
              </Text>
              <Text style={[styles.cell, styles.monoText, { flex: 1.1 }]}>{formatDate(exp.date)}</Text>
              <Text style={[styles.cell, { flex: 3.2, fontWeight: '600' }]} numberOfLines={1}>
                {exp.description}
              </Text>
              <Text style={[styles.cell, { flex: 1.8, color: colors.textSecondary }]}>{exp.category}</Text>
              <Text style={[styles.cell, styles.monoText, { flex: 1.5, textAlign: 'right', fontWeight: '700', color: colors.debitText }]}>
                {formatCurrency(exp.amount)}
              </Text>

              {/* Receipt View Button */}
              <View style={{ flex: 1.0, alignItems: 'center' }}>
                {exp.receiptDataUrl ? (
                  <TouchableOpacity
                    style={styles.receiptChip}
                    onPress={() => setPreviewReceipt(exp)}
                  >
                    <Paperclip size={10} color={colors.primaryNavy} />
                    <Text style={styles.receiptChipText}>View</Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={{ fontSize: 10, color: colors.textMuted }}>—</Text>
                )}
              </View>

              {/* Actions */}
              <View style={{ flex: 1.2, flexDirection: 'row', justifyContent: 'center', gap: 4 }}>
                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={() => openEditModal(exp)}
                >
                  <Edit3 size={11} color={colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.iconBtn, { backgroundColor: colors.debitBg }]}
                  onPress={() => {
                    if (confirm(`Delete expense ${exp.referenceNumber} (${exp.description})?`)) {
                      deleteExpense(exp.id);
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

      {/* SIMPLIFIED EXPENSE MODAL (Date, Category, Description, Amount, Receipt) */}
      <Modal
        isOpen={isAddModalOpen || !!editingExpense}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingExpense(null);
        }}
        title={editingExpense ? 'Edit Expense' : 'Add Expense'}
        subtitle="Record an operational expense with optional receipt attachment"
        size="sm"
        footer={
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 6, width: '100%' }}>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => {
                setIsAddModalOpen(false);
                setEditingExpense(null);
              }}
            >
              <Text style={styles.secondaryBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleSave}
            >
              <Text style={styles.primaryBtnText}>Save Expense</Text>
            </TouchableOpacity>
          </View>
        }
      >
        <View style={{ gap: 10 }}>
          {/* Date */}
          <View style={styles.formCol}>
            <Text style={styles.formLabel}>Date *</Text>
            <TextInput
              style={[styles.input, styles.monoText]}
              value={formData.date}
              onChangeText={v => setFormData(p => ({ ...p, date: v }))}
              placeholder="YYYY-MM-DD"
            />
          </View>

          {/* Category Dropdown */}
          <SelectPicker
            label="Category"
            value={formData.category}
            options={CATEGORIES}
            onChange={(v: any) => setFormData(p => ({ ...p, category: v }))}
            required
          />

          {/* Description */}
          <View style={styles.formCol}>
            <Text style={styles.formLabel}>Description / Merchant *</Text>
            <TextInput
              style={styles.input}
              value={formData.description}
              onChangeText={v => setFormData(p => ({ ...p, description: v }))}
              placeholder="e.g. AWS Cloud Hosting or Uber to Client Office"
            />
          </View>

          {/* Amount */}
          <View style={styles.formCol}>
            <Text style={styles.formLabel}>Amount (₹ INR) *</Text>
            <TextInput
              style={[styles.input, styles.monoText, { fontWeight: '700' }]}
              value={formData.amount}
              onChangeText={v => setFormData(p => ({ ...p, amount: v }))}
              placeholder="e.g. 15000.00"
              keyboardType="numeric"
            />
          </View>

          {/* Receipt Attachment */}
          <View style={styles.formCol}>
            <Text style={styles.formLabel}>Receipt / Bill (Optional)</Text>
            {formData.receiptFileName ? (
              <View style={styles.attachedReceipt}>
                <CheckCircle2 size={14} color={colors.creditText} />
                <Text style={{ fontSize: 11, fontWeight: '600', color: colors.textPrimary, flex: 1 }} numberOfLines={1}>
                  {formData.receiptFileName}
                </Text>
                <TouchableOpacity
                  onPress={() => setFormData(p => ({ ...p, receiptFileName: '', receiptDataUrl: '' }))}
                >
                  <X size={13} color={colors.debitText} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.uploadReceiptBtn}
                onPress={() => fileInputRef.current?.click()}
              >
                <Upload size={13} color={colors.primaryNavy} />
                <Text style={styles.uploadReceiptBtnText}>Upload Receipt File (Image / PDF)</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      {/* Receipt Preview Modal */}
      <Modal
        isOpen={!!previewReceipt}
        onClose={() => setPreviewReceipt(null)}
        title="Receipt Preview"
        subtitle={previewReceipt ? `${previewReceipt.referenceNumber} - ${previewReceipt.description}` : ''}
        size="md"
        footer={
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => setPreviewReceipt(null)}
          >
            <Text style={styles.secondaryBtnText}>Close</Text>
          </TouchableOpacity>
        }
      >
        {previewReceipt?.receiptDataUrl && (
          <View style={{ alignItems: 'center', padding: 8 }}>
            <img
              src={previewReceipt.receiptDataUrl}
              alt="Receipt attachment"
              style={{ maxWidth: '100%', maxHeight: 400, borderRadius: 4, objectFit: 'contain' }}
            />
          </View>
        )}
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
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
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
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
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 3,
  },
  exportBtnText: {
    color: colors.textPrimary,
    fontSize: 11.5,
    fontWeight: '600',
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
  filterRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    flexWrap: 'wrap',
  },
  searchBox: {
    flex: 1,
    minWidth: 220,
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
  totalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 3,
  },
  totalBadgeLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.textMuted,
  },
  totalBadgeVal: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primaryNavy,
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
  monoText: {
    fontFamily: 'Roboto Mono, monospace',
    fontVariant: ['tabular-nums'],
  },
  receiptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: colors.bgSurfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: 2,
  },
  receiptChipText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: colors.primaryNavy,
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
  uploadReceiptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 8,
    backgroundColor: colors.bgSurfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderStyle: 'dashed',
    borderRadius: 3,
  },
  uploadReceiptBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primaryNavy,
  },
  attachedReceipt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 6,
    backgroundColor: colors.creditBg,
    borderWidth: 1,
    borderColor: colors.creditBorder,
    borderRadius: 3,
  },
});
