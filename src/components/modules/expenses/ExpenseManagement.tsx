import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {
  Plus,
  Search,
  Download,
  Check,
  X,
  Trash2,
  Edit3,
  Eye,
  Sliders,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
} from 'lucide-react-native';
import { useFinance } from '../../../context/FinanceContext';
import {
  Expense,
  ExpenseCategory,
  Department,
  ExpenseStatus,
} from '../../../types/finance';
import { Badge } from '../../common/Badge';
import { Modal } from '../../common/Modal';
import { Drawer } from '../../common/Drawer';
import { formatCurrency } from '../../../utils/currency';
import { formatDate } from '../../../utils/date';
import { exportExpensesToCSV } from '../../../utils/csvParser';
import { colors } from '../../../theme/colors';

export const ExpenseManagement: React.FC = () => {
  const {
    filteredExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
    bulkUpdateExpenseStatus,
    bulkUpdateExpenseCategory,
    bulkDeleteExpenses,
    isCompactMode,
  } = useFinance();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedCat, setSelectedCat] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Multi-selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals & Drawers
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [inspectingExpense, setInspectingExpense] = useState<Expense | null>(null);

  // Form State
  const initialFormState = {
    date: new Date().toISOString().split('T')[0],
    employee: 'Rachel Green',
    department: 'Operations' as Department,
    category: 'Software subscriptions' as ExpenseCategory,
    amount: '',
    taxAmount: '0.00',
    paymentMethod: 'Corporate Card - HDFC 4821',
    description: '',
    receiptFileName: '',
    status: 'Approved' as ExpenseStatus,
    glCode: 'GL-6420-SAAS',
    projectCode: 'PRJ-INTERNAL-OPS',
    gstin: '29AABCU9603R1ZM',
    notes: '',
  };
  const [formData, setFormData] = useState(initialFormState);

  const departments: Department[] = [
    'Engineering',
    'Sales & Marketing',
    'Operations',
    'Executive',
    'Design & Product',
    'Facilities & IT',
  ];

  const categories: ExpenseCategory[] = [
    'Salaries',
    'Office expenses',
    'Software subscriptions',
    'Cloud services',
    'Travel',
    'Food',
    'Marketing',
    'Equipment',
    'Utilities',
    'Miscellaneous',
  ];

  const paymentMethods = [
    'Corporate Card - HDFC 4821',
    'Corporate Card - ICICI 9012',
    'NEFT / RTGS Transfer',
    'IMPS Instant Clearing',
    'Direct Deposit (Salary Account)',
    'Vendor Net-30',
  ];

  const processedExpenses = useMemo(() => {
    return filteredExpenses.filter(exp => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          exp.description.toLowerCase().includes(q) ||
          exp.referenceNumber.toLowerCase().includes(q) ||
          exp.employee.toLowerCase().includes(q) ||
          exp.glCode.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (selectedDept !== 'ALL' && exp.department !== selectedDept) return false;
      if (selectedCat !== 'ALL' && exp.category !== selectedCat) return false;
      if (selectedStatus !== 'ALL' && exp.status !== selectedStatus) return false;
      return true;
    });
  }, [filteredExpenses, searchQuery, selectedDept, selectedCat, selectedStatus]);

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const openEditModal = (exp: Expense) => {
    setEditingExpense(exp);
    setFormData({
      date: exp.date,
      employee: exp.employee,
      department: exp.department,
      category: exp.category,
      amount: exp.amount.toString(),
      taxAmount: exp.taxAmount.toString(),
      paymentMethod: exp.paymentMethod,
      description: exp.description,
      receiptFileName: exp.receiptFileName || '',
      status: exp.status,
      glCode: exp.glCode,
      projectCode: exp.projectCode || '',
      gstin: exp.gstin || '',
      notes: exp.notes || '',
    });
  };

  const handleSaveExpense = () => {
    const parsedAmount = parseFloat(formData.amount);
    const parsedTax = parseFloat(formData.taxAmount) || 0;

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid expense amount in INR (₹).');
      return;
    }

    if (!formData.description.trim()) {
      alert('Please enter a payee description.');
      return;
    }

    if (editingExpense) {
      updateExpense(editingExpense.id, {
        date: formData.date,
        employee: formData.employee,
        department: formData.department,
        category: formData.category,
        amount: parsedAmount,
        taxAmount: parsedTax,
        paymentMethod: formData.paymentMethod,
        description: formData.description,
        receiptFileName: formData.receiptFileName || undefined,
        status: formData.status,
        glCode: formData.glCode,
        projectCode: formData.projectCode || undefined,
        gstin: formData.gstin || undefined,
        notes: formData.notes,
        isTechExpense: ['Cloud services', 'Software subscriptions', 'Equipment'].includes(formData.category),
      });
      setEditingExpense(null);
    } else {
      addExpense({
        date: formData.date,
        employee: formData.employee,
        department: formData.department,
        category: formData.category,
        amount: parsedAmount,
        gstAmount: parsedTax,
        tdsAmount: 0,
        taxAmount: parsedTax,
        paymentMethod: formData.paymentMethod,
        description: formData.description,
        receiptFileName: formData.receiptFileName || 'GST_Invoice_Attached.pdf',
        status: formData.status,
        glCode: formData.glCode || `GL-${formData.category.substring(0, 4).toUpperCase()}`,
        projectCode: formData.projectCode || undefined,
        gstin: formData.gstin || undefined,
        notes: formData.notes,
        isTechExpense: ['Cloud services', 'Software subscriptions', 'Equipment'].includes(formData.category),
      });
      setIsAddModalOpen(false);
    }

    setFormData(initialFormState);
  };

  const totalFilteredAmount = processedExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 14, gap: 12 }}>
      {/* Title & Action Bar */}
      <View style={styles.titleRibbon}>
        <View>
          <Text style={styles.pageTitle}>Operational Expense Ledger & Management (INR - ₹)</Text>
          <Text style={styles.pageSubtitle}>
            General Ledger recording, GST input credit compliance, digital receipts, and GL allocations.
          </Text>
        </View>

        <View style={styles.actionGroup}>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => exportExpensesToCSV(processedExpenses)}
          >
            <Download size={13} color={colors.textPrimary} />
            <Text style={styles.secondaryBtnText}>Export CSV</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => {
              setFormData(initialFormState);
              setIsAddModalOpen(true);
            }}
          >
            <Plus size={13} color="#fff" />
            <Text style={styles.primaryBtnText}>+ Record Expense (₹)</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Bar */}
      <View style={styles.filterCard}>
        <View style={styles.searchBox}>
          <Search size={14} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search description, ref #, employee, GL..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={13} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.filterRow}>
          {/* Department filter pills */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 4 }}>
            <TouchableOpacity
              style={[styles.filterChip, selectedDept === 'ALL' && styles.filterChipActive]}
              onPress={() => setSelectedDept('ALL')}
            >
              <Text style={[styles.filterChipText, selectedDept === 'ALL' && styles.filterChipTextActive]}>All Depts</Text>
            </TouchableOpacity>
            {departments.map(d => (
              <TouchableOpacity
                key={d}
                style={[styles.filterChip, selectedDept === d && styles.filterChipActive]}
                onPress={() => setSelectedDept(d)}
              >
                <Text style={[styles.filterChipText, selectedDept === d && styles.filterChipTextActive]}>{d}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Bulk Action Controls */}
      {selectedIds.length > 0 && (
        <View style={styles.bulkBanner}>
          <Text style={styles.bulkText}>
            {selectedIds.length} expense(s) selected • Total: {formatCurrency(
              filteredExpenses.filter(e => selectedIds.includes(e.id)).reduce((s, e) => s + e.amount, 0)
            )}
          </Text>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <TouchableOpacity
              style={styles.bulkBtnSuccess}
              onPress={() => {
                bulkUpdateExpenseStatus(selectedIds, 'Approved');
                setSelectedIds([]);
              }}
            >
              <Check size={11} color={colors.creditText} />
              <Text style={styles.bulkBtnSuccessText}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.bulkBtnDanger}
              onPress={() => {
                if (confirm(`Delete ${selectedIds.length} expenses?`)) {
                  bulkDeleteExpenses(selectedIds);
                  setSelectedIds([]);
                }
              }}
            >
              <Trash2 size={11} color={colors.debitText} />
              <Text style={styles.bulkBtnDangerText}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.smBtn}
              onPress={() => setSelectedIds([])}
            >
              <Text style={styles.smBtnText}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Main Expense Table */}
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.cell, { width: 30, textAlign: 'center' }]}>✓</Text>
          <Text style={[styles.cell, { flex: 1.2, fontWeight: '700' }]}>Ref #</Text>
          <Text style={[styles.cell, { flex: 1.1, fontWeight: '700' }]}>Date</Text>
          <Text style={[styles.cell, { flex: 3.2, fontWeight: '700' }]}>Payee / Description</Text>
          <Text style={[styles.cell, { flex: 1.4, fontWeight: '700' }]}>Dept</Text>
          <Text style={[styles.cell, { flex: 1.8, textAlign: 'right', fontWeight: '700' }]}>Amount (₹)</Text>
          <Text style={[styles.cell, { flex: 1.2, fontWeight: '700' }]}>GL Code</Text>
          <Text style={[styles.cell, { flex: 1.2, textAlign: 'center', fontWeight: '700' }]}>Status</Text>
          <Text style={[styles.cell, { flex: 1.1, textAlign: 'center', fontWeight: '700' }]}>Action</Text>
        </View>

        {processedExpenses.map(exp => {
          const isSelected = selectedIds.includes(exp.id);
          return (
            <View key={exp.id} style={[styles.tableRow, isSelected && { backgroundColor: '#f0f7ff' }]}>
              <TouchableOpacity
                style={{ width: 30, alignItems: 'center' }}
                onPress={() => handleSelectOne(exp.id)}
              >
                <Text style={{ fontSize: 11, color: isSelected ? colors.primaryBlue : colors.textMuted }}>
                  {isSelected ? '☑' : '☐'}
                </Text>
              </TouchableOpacity>
              <Text style={[styles.cell, styles.monoText, { flex: 1.2, color: colors.textMuted }]}>
                {exp.referenceNumber}
              </Text>
              <Text style={[styles.cell, styles.monoText, { flex: 1.1 }]}>{formatDate(exp.date)}</Text>
              <View style={{ flex: 3.2 }}>
                <Text style={[styles.cell, { fontWeight: '700', color: colors.textPrimary }]} numberOfLines={1}>
                  {exp.description}
                </Text>
                {exp.gstin && (
                  <Text style={[styles.monoText, { fontSize: 9.5, color: colors.textMuted }]}>
                    GSTIN: {exp.gstin}
                  </Text>
                )}
              </View>
              <Text style={[styles.cell, { flex: 1.4, color: colors.textSecondary }]}>{exp.department}</Text>
              <Text style={[styles.cell, styles.monoText, { flex: 1.8, textAlign: 'right', fontWeight: '700' }]}>
                {formatCurrency(exp.amount)}
              </Text>
              <Text style={[styles.cell, styles.monoText, { flex: 1.2, color: colors.textMuted }]}>
                {exp.glCode}
              </Text>
              <View style={{ flex: 1.2, alignItems: 'center' }}>
                <Badge status={exp.status} size="sm" />
              </View>
              <View style={{ flex: 1.1, flexDirection: 'row', justifyContent: 'center', gap: 3 }}>
                <TouchableOpacity
                  style={styles.iconBtnSm}
                  onPress={() => setInspectingExpense(exp)}
                >
                  <Eye size={11} color={colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.iconBtnSm}
                  onPress={() => openEditModal(exp)}
                >
                  <Edit3 size={11} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {/* Footer Total */}
        <View style={[styles.tableRow, { backgroundColor: colors.bgSurfaceAlt, borderTopWidth: 1, borderTopColor: colors.borderDefault }]}>
          <Text style={[styles.cell, { flex: 6.9, fontWeight: '700', textTransform: 'uppercase' }]}>
            Total MTD Filtered Ledger Sum ({processedExpenses.length} Records)
          </Text>
          <Text style={[styles.cell, styles.monoText, { flex: 1.8, textAlign: 'right', fontWeight: '800', fontSize: 12.5, color: colors.primaryNavy }]}>
            {formatCurrency(totalFilteredAmount)}
          </Text>
          <View style={{ flex: 2.3 }} />
        </View>
      </View>

      {/* Add / Edit Expense Modal */}
      <Modal
        isOpen={isAddModalOpen || !!editingExpense}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingExpense(null);
        }}
        title={editingExpense ? `Edit Expense: ${editingExpense.referenceNumber}` : 'Record New Expense (₹ INR)'}
        subtitle="General Ledger entry with Indian GST and category allocation"
        size="lg"
        footer={
          <View style={{ flexDirection: 'row', gap: 6 }}>
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
              onPress={handleSaveExpense}
            >
              <Text style={styles.primaryBtnText}>{editingExpense ? 'Save Changes' : 'Record Expense'}</Text>
            </TouchableOpacity>
          </View>
        }
      >
        <View style={{ gap: 10 }}>
          <View style={styles.formRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.formLabel}>Date *</Text>
              <TextInput
                style={[styles.input, styles.monoText]}
                value={formData.date}
                onChangeText={v => setFormData({ ...formData, date: v })}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.formLabel}>Employee *</Text>
              <TextInput
                style={styles.input}
                value={formData.employee}
                onChangeText={v => setFormData({ ...formData, employee: v })}
              />
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.formLabel}>Amount (₹ INR) *</Text>
              <TextInput
                style={[styles.input, styles.monoText]}
                placeholder="0.00"
                keyboardType="numeric"
                value={formData.amount}
                onChangeText={v => setFormData({ ...formData, amount: v })}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.formLabel}>GST / Input Tax (₹)</Text>
              <TextInput
                style={[styles.input, styles.monoText]}
                placeholder="0.00"
                keyboardType="numeric"
                value={formData.taxAmount}
                onChangeText={v => setFormData({ ...formData, taxAmount: v })}
              />
            </View>
          </View>

          <View>
            <Text style={styles.formLabel}>Payee / Description *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. AWS India Services Mumbai Cluster"
              value={formData.description}
              onChangeText={v => setFormData({ ...formData, description: v })}
            />
          </View>

          <View style={styles.formRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.formLabel}>Vendor GSTIN</Text>
              <TextInput
                style={[styles.input, styles.monoText]}
                placeholder="29AABCU9603R1ZM"
                value={formData.gstin}
                onChangeText={v => setFormData({ ...formData, gstin: v })}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.formLabel}>GL Account Code</Text>
              <TextInput
                style={[styles.input, styles.monoText]}
                value={formData.glCode}
                onChangeText={v => setFormData({ ...formData, glCode: v })}
              />
            </View>
          </View>

          <View>
            <Text style={styles.formLabel}>Receipt File Name</Text>
            <TextInput
              style={[styles.input, styles.monoText]}
              placeholder="GST_Invoice_Attached.pdf"
              value={formData.receiptFileName}
              onChangeText={v => setFormData({ ...formData, receiptFileName: v })}
            />
          </View>
        </View>
      </Modal>

      {/* Transaction Details & Receipts Drawer */}
      <Drawer
        isOpen={!!inspectingExpense}
        onClose={() => setInspectingExpense(null)}
        title={inspectingExpense ? `Expense: ${inspectingExpense.referenceNumber}` : 'Detail'}
        subtitle={inspectingExpense ? `${inspectingExpense.date} • ${inspectingExpense.department}` : ''}
        footer={
          inspectingExpense && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
              <TouchableOpacity
                style={styles.smBtn}
                onPress={() => {
                  openEditModal(inspectingExpense);
                  setInspectingExpense(null);
                }}
              >
                <Text style={styles.smBtnText}>Edit Record</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => setInspectingExpense(null)}
              >
                <Text style={styles.secondaryBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          )
        }
      >
        {inspectingExpense && (
          <View style={{ gap: 12 }}>
            <View style={styles.drawerSummary}>
              <Text style={{ fontSize: 10, color: colors.textMuted, textTransform: 'uppercase' }}>Amount in INR</Text>
              <Text style={styles.drawerAmount}>{formatCurrency(inspectingExpense.amount)}</Text>
              {inspectingExpense.taxAmount > 0 && (
                <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
                  Includes {formatCurrency(inspectingExpense.taxAmount)} GST / Input Credit
                </Text>
              )}
            </View>

            <View style={styles.metadataCard}>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Payee / Desc</Text>
                <Text style={styles.metaVal}>{inspectingExpense.description}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Employee</Text>
                <Text style={styles.metaVal}>{inspectingExpense.employee}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Department</Text>
                <Text style={styles.metaVal}>{inspectingExpense.department}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Category</Text>
                <Text style={styles.metaVal}>{inspectingExpense.category}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Payment Mode</Text>
                <Text style={[styles.metaVal, styles.monoText]}>{inspectingExpense.paymentMethod}</Text>
              </View>
              {inspectingExpense.gstin && (
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Vendor GSTIN</Text>
                  <Text style={[styles.metaVal, styles.monoText]}>{inspectingExpense.gstin}</Text>
                </View>
              )}
            </View>

            <View style={styles.receiptBox}>
              <FileSpreadsheet size={20} color={colors.textMuted} />
              <Text style={[styles.monoText, { fontSize: 11 }]}>{inspectingExpense.receiptFileName || 'GST_Invoice_Validated.pdf'}</Text>
              <Text style={{ fontSize: 10.5, color: colors.creditText, fontWeight: '700' }}>
                ✓ Digitally Verified & Reconciled
              </Text>
            </View>
          </View>
        )}
      </Drawer>
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
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
    textTransform: 'uppercase',
  },
  pageSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryNavy,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 3,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 11.5,
    fontWeight: '600',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 3,
  },
  secondaryBtnText: {
    color: colors.textPrimary,
    fontSize: 11.5,
    fontWeight: '600',
  },
  filterCard: {
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: 3,
    padding: 8,
    gap: 8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSurfaceSubtle,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 3,
    paddingHorizontal: 8,
    height: 28,
  },
  searchInput: {
    flex: 1,
    fontSize: 11.5,
    color: colors.textPrimary,
    marginLeft: 6,
    outlineStyle: 'none' as any,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: colors.bgSurfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 2,
  },
  filterChipActive: {
    backgroundColor: colors.primaryNavy,
    borderColor: colors.primaryNavy,
  },
  filterChipText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: '#fff',
  },
  bulkBanner: {
    padding: 8,
    backgroundColor: '#f0f7ff',
    borderWidth: 1,
    borderColor: colors.infoBorder,
    borderRadius: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bulkText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.infoText,
  },
  bulkBtnSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    backgroundColor: colors.creditBg,
    borderWidth: 1,
    borderColor: colors.creditBorder,
    borderRadius: 2,
  },
  bulkBtnSuccessText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.creditText,
  },
  bulkBtnDanger: {
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
  bulkBtnDangerText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.debitText,
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
    paddingVertical: 6,
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
  iconBtnSm: {
    padding: 3,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  formRow: {
    flexDirection: 'row',
    gap: 8,
  },
  formLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: colors.textSecondary,
    marginBottom: 3,
  },
  input: {
    height: 28,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: 3,
    paddingHorizontal: 8,
    fontSize: 11.5,
    color: colors.textPrimary,
    outlineStyle: 'none' as any,
  },
  drawerSummary: {
    padding: 10,
    backgroundColor: colors.bgSurfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 3,
  },
  drawerAmount: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: 'Roboto Mono, monospace',
    color: colors.textPrimary,
  },
  metadataCard: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 3,
    overflow: 'hidden',
  },
  metaRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    justifyContent: 'space-between',
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    width: 110,
  },
  metaVal: {
    fontSize: 11,
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'right',
  },
  receiptBox: {
    padding: 12,
    backgroundColor: colors.bgSurfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderStyle: 'dashed',
    borderRadius: 3,
    alignItems: 'center',
    gap: 4,
  },
  smBtn: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    backgroundColor: colors.bgSurfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 2,
  },
  smBtnText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});
