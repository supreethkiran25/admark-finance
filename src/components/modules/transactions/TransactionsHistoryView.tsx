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
  FileSpreadsheet,
  Search,
  Receipt,
  Download,
  Calendar,
  Filter,
  Trash2,
} from 'lucide-react';
import { useFinance } from '../../../context/FinanceContext';
import { SelectPicker } from '../../common/SelectPicker';
import { formatCurrency } from '../../../utils/currency';
import { formatDate } from '../../../utils/date';
import { ExpenseCategory } from '../../../types/finance';
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

export const TransactionsHistoryView: React.FC = () => {
  const {
    expenses,
    deleteExpense,
    exportExpensesExcel,
    exportExpensesCSV,
    setActiveModule,
  } = useFinance();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const filtered = expenses.filter(item => {
    if (selectedCategory !== 'All' && item.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.referenceNumber.toLowerCase().includes(q) ||
        (item.notes && item.notes.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const totalAmount = filtered.reduce((sum, e) => sum + e.amount, 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, gap: 14 }}>
      {/* Title Ribbon */}
      <View style={styles.titleRibbon}>
        <View>
          <Text style={styles.pageTitle}>Transaction History</Text>
          <Text style={styles.pageSubtitle}>
            Complete record of all imported bank transactions and recorded operational payments.
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
            onPress={() => setActiveModule('upload-statement')}
          >
            <Text style={styles.primaryBtnText}>+ Import New Statement</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Row */}
      <View style={styles.filterRow}>
        <View style={styles.searchBox}>
          <Search size={13} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search transactions by payee, merchant, or notes..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <SelectPicker
          label="Filter Category"
          value={selectedCategory}
          options={['All', ...CATEGORIES]}
          onChange={setSelectedCategory}
          style={{ minWidth: 160 }}
        />

        <View style={styles.totalBadge}>
          <Text style={styles.totalBadgeLabel}>Total Filtered:</Text>
          <Text style={[styles.totalBadgeVal, styles.monoText]}>
            {formatCurrency(totalAmount)}
          </Text>
          <Text style={{ fontSize: 10, color: colors.textMuted }}>({filtered.length} items)</Text>
        </View>
      </View>

      {/* Transactions Table */}
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.cell, { flex: 1.1, fontWeight: '700' }]}>Ref #</Text>
          <Text style={[styles.cell, { flex: 1.1, fontWeight: '700' }]}>Date</Text>
          <Text style={[styles.cell, { flex: 3.2, fontWeight: '700' }]}>Payee / Transaction Description</Text>
          <Text style={[styles.cell, { flex: 1.8, fontWeight: '700' }]}>Category</Text>
          <Text style={[styles.cell, { flex: 1.5, textAlign: 'right', fontWeight: '700' }]}>Amount (₹)</Text>
          <Text style={[styles.cell, { flex: 1.0, textAlign: 'center', fontWeight: '700' }]}>Status</Text>
          <Text style={[styles.cell, { flex: 0.8, textAlign: 'center', fontWeight: '700' }]}>Delete</Text>
        </View>

        {filtered.length === 0 ? (
          <View style={styles.emptyTable}>
            <Receipt size={28} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No Transactions Found</Text>
            <Text style={styles.emptySub}>
              Upload a bank statement under "Upload Statement" to extract and review transactions.
            </Text>
          </View>
        ) : (
          filtered.map(item => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={[styles.cell, styles.monoText, { flex: 1.1, color: colors.textMuted }]}>
                {item.referenceNumber}
              </Text>
              <Text style={[styles.cell, styles.monoText, { flex: 1.1 }]}>{formatDate(item.date)}</Text>
              <View style={{ flex: 3.2 }}>
                <Text style={[styles.cell, { fontWeight: '600' }]} numberOfLines={1}>
                  {item.description}
                </Text>
                {item.notes && (
                  <Text style={{ fontSize: 9.5, color: colors.textMuted }} numberOfLines={1}>
                    {item.notes}
                  </Text>
                )}
              </View>
              <Text style={[styles.cell, { flex: 1.8, color: colors.textSecondary }]}>{item.category}</Text>
              <Text style={[styles.cell, styles.monoText, { flex: 1.5, textAlign: 'right', fontWeight: '700', color: colors.debitText }]}>
                {formatCurrency(item.amount)}
              </Text>
              <View style={{ flex: 1.0, alignItems: 'center' }}>
                <View style={styles.statusChip}>
                  <Text style={styles.statusChipText}>{item.status}</Text>
                </View>
              </View>
              <View style={{ flex: 0.8, alignItems: 'center' }}>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => {
                    if (confirm(`Remove transaction ${item.referenceNumber}?`)) {
                      deleteExpense(item.id);
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
  filterRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    flexWrap: 'wrap',
  },
  searchBox: {
    flex: 1,
    minWidth: 240,
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
  statusChip: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    backgroundColor: colors.creditBg,
    borderWidth: 1,
    borderColor: colors.creditBorder,
    borderRadius: 2,
  },
  statusChipText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: colors.creditText,
  },
  deleteBtn: {
    padding: 4,
    borderRadius: 2,
    backgroundColor: colors.debitBg,
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
});
