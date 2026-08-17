import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  PieChart,
} from 'lucide-react';
import { useFinance } from '../../../context/FinanceContext';
import { SelectPicker } from '../../common/SelectPicker';
import { formatCurrency } from '../../../utils/currency';
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

export const SimpleReportsView: React.FC = () => {
  const {
    expenses,
    thisMonthSpending,
    exportExpensesExcel,
    exportExpensesCSV,
  } = useFinance();

  const [timeframe, setTimeframe] = useState<string>('All Time');

  const totalSpend = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Group by category
  const categoryStats = CATEGORIES.map(cat => {
    const matching = expenses.filter(e => e.category === cat);
    const amount = matching.reduce((sum, e) => sum + e.amount, 0);
    const count = matching.length;
    const pct = totalSpend > 0 ? (amount / totalSpend) * 100 : 0;
    return {
      category: cat,
      amount,
      count,
      pct,
    };
  }).filter(c => c.amount > 0).sort((a, b) => b.amount - a.amount);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, gap: 14 }}>
      {/* Title Ribbon */}
      <View style={styles.titleRibbon}>
        <View>
          <Text style={styles.pageTitle}>Spending Reports</Text>
          <Text style={styles.pageSubtitle}>
            Category summaries, monthly breakdowns, and financial reports.
          </Text>
        </View>

        <View style={styles.actionGroup}>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => window.print()}
          >
            <Printer size={13} color={colors.textPrimary} />
            <Text style={styles.secondaryBtnText}>Print Summary</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.exportBtn}
            onPress={exportExpensesExcel}
          >
            <FileSpreadsheet size={13} color={colors.creditText} />
            <Text style={styles.exportBtnText}>Export Excel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.exportBtn}
            onPress={exportExpensesCSV}
          >
            <Download size={13} color={colors.primaryNavy} />
            <Text style={styles.exportBtnText}>Export CSV</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View>
            <Text style={styles.statLabel}>Total Spending Recorded</Text>
            <Text style={[styles.statVal, styles.monoText, { color: colors.primaryNavy }]}>
              {formatCurrency(totalSpend)}
            </Text>
          </View>
          <View>
            <Text style={styles.statLabel}>This Month's Spending</Text>
            <Text style={[styles.statVal, styles.monoText]}>
              {formatCurrency(thisMonthSpending)}
            </Text>
          </View>
          <View>
            <Text style={styles.statLabel}>Active Spending Categories</Text>
            <Text style={[styles.statVal, styles.monoText]}>
              {categoryStats.length} Categories
            </Text>
          </View>
          <View>
            <Text style={styles.statLabel}>Total Transactions</Text>
            <Text style={[styles.statVal, styles.monoText]}>{expenses.length}</Text>
          </View>
        </View>
      </View>

      {/* Category Breakdown Table */}
      <View style={styles.tableCard}>
        <Text style={styles.tableTitle}>Category Spending Breakdown</Text>

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.cell, { flex: 2.5, fontWeight: '700' }]}>Category</Text>
            <Text style={[styles.cell, { flex: 1.2, textAlign: 'center', fontWeight: '700' }]}>Transactions</Text>
            <Text style={[styles.cell, { flex: 1.8, textAlign: 'right', fontWeight: '700' }]}>Total Spent (₹)</Text>
            <Text style={[styles.cell, { flex: 1.5, textAlign: 'right', fontWeight: '700' }]}>% of Total</Text>
            <Text style={[styles.cell, { flex: 3.0, fontWeight: '700' }]}>Share</Text>
          </View>

          {categoryStats.length === 0 ? (
            <View style={styles.emptyTable}>
              <PieChart size={28} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No Spending Data to Report</Text>
              <Text style={styles.emptySub}>
                Upload a bank statement or record expenses to generate automated spending reports.
              </Text>
            </View>
          ) : (
            categoryStats.map(stat => (
              <View key={stat.category} style={styles.tableRow}>
                <Text style={[styles.cell, { flex: 2.5, fontWeight: '600' }]}>{stat.category}</Text>
                <Text style={[styles.cell, styles.monoText, { flex: 1.2, textAlign: 'center' }]}>
                  {stat.count}
                </Text>
                <Text style={[styles.cell, styles.monoText, { flex: 1.8, textAlign: 'right', fontWeight: '700' }]}>
                  {formatCurrency(stat.amount)}
                </Text>
                <Text style={[styles.cell, styles.monoText, { flex: 1.5, textAlign: 'right' }]}>
                  {stat.pct.toFixed(1)}%
                </Text>
                <View style={{ flex: 3.0, paddingLeft: 8 }}>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${stat.pct}%` }]} />
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </View>
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
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
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
  tableCard: {
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: 4,
    padding: 14,
    gap: 10,
  },
  tableTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
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
  barTrack: {
    height: 6,
    backgroundColor: colors.bgSurfaceAlt,
    borderRadius: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.primaryNavy,
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
