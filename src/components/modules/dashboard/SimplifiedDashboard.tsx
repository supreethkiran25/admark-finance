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
  Upload,
  Plus,
  ArrowRight,
  Receipt,
  FileSpreadsheet,
  Building2,
  Search,
  ExternalLink,
} from 'lucide-react';
import { useFinance } from '../../../context/FinanceContext';
import { formatCurrency } from '../../../utils/currency';
import { formatDate } from '../../../utils/date';
import { colors } from '../../../theme/colors';

export const SimplifiedDashboard: React.FC = () => {
  const {
    thisMonthSpending,
    totalTransactionsCount,
    pendingPaymentsTotal,
    largestExpense,
    recentTransactions,
    setActiveModule,
    exportExpensesExcel,
  } = useFinance();

  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredRecent = recentTransactions.filter(item => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.description.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.referenceNumber.toLowerCase().includes(q)
    );
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, gap: 14 }}>
      {/* Title & Primary Action Ribbon */}
      <View style={styles.titleRibbon}>
        <View>
          <Text style={styles.pageTitle}>CFO Dashboard</Text>
          <Text style={styles.pageSubtitle}>
            Overview of your company's spending, transactions, and pending payments.
          </Text>
        </View>

        <View style={styles.actionGroup}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => setActiveModule('upload-statement')}
          >
            <Upload size={13} color="#fff" />
            <Text style={styles.primaryBtnText}>Upload Statement</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => setActiveModule('expenses')}
          >
            <Plus size={13} color={colors.textPrimary} />
            <Text style={styles.secondaryBtnText}>Add Expense</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 4 CORE METRIC CARDS */}
      <View style={styles.metricGrid}>
        {/* Metric 1: This Month's Spending */}
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>This Month's Spending</Text>
          <Text style={[styles.metricValue, styles.monoText, { color: colors.primaryNavy }]}>
            {formatCurrency(thisMonthSpending)}
          </Text>
          <Text style={styles.metricSub}>
            {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
          </Text>
        </View>

        {/* Metric 2: Total Transactions */}
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Total Transactions</Text>
          <Text style={[styles.metricValue, styles.monoText]}>
            {totalTransactionsCount}
          </Text>
          <Text style={styles.metricSub}>Recorded in transaction history</Text>
        </View>

        {/* Metric 3: Pending Payments */}
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Pending Payments</Text>
          <Text
            style={[
              styles.metricValue,
              styles.monoText,
              { color: pendingPaymentsTotal > 0 ? colors.debitText : colors.textPrimary },
            ]}
          >
            {formatCurrency(pendingPaymentsTotal)}
          </Text>
          <Text style={styles.metricSub}>Due to suppliers & vendors</Text>
        </View>

        {/* Metric 4: Largest Expense */}
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Largest Expense (This Month)</Text>
          <Text style={[styles.metricValue, styles.monoText, { color: colors.textPrimary }]}>
            {formatCurrency(largestExpense)}
          </Text>
          <Text style={styles.metricSub}>Single highest expense item</Text>
        </View>
      </View>

      {/* RECENT TRANSACTIONS TABLE */}
      <View style={styles.tableCard}>
        <View style={styles.tableHeaderRow}>
          <View>
            <Text style={styles.tableTitle}>Recent Transactions</Text>
            <Text style={styles.tableSubtitle}>
              Latest entries from bank statements and recorded expenses
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={styles.searchBox}>
              <Search size={13} color={colors.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search recent transactions..."
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <TouchableOpacity
              style={styles.viewAllBtn}
              onPress={() => setActiveModule('expenses')}
            >
              <Text style={styles.viewAllBtnText}>View All Expenses</Text>
              <ArrowRight size={12} color={colors.primaryNavy} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={true} style={{ width: '100%' }}>
          <View style={[styles.table, { minWidth: 620 }]}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.cell, { flex: 1.1, fontWeight: '700' }]}>Ref #</Text>
              <Text style={[styles.cell, { flex: 1.1, fontWeight: '700' }]}>Date</Text>
              <Text style={[styles.cell, { flex: 3.2, fontWeight: '700' }]}>Description / Merchant</Text>
              <Text style={[styles.cell, { flex: 1.8, fontWeight: '700' }]}>Category</Text>
              <Text style={[styles.cell, { flex: 1.5, textAlign: 'right', fontWeight: '700' }]}>Amount (₹)</Text>
              <Text style={[styles.cell, { flex: 1.2, textAlign: 'center', fontWeight: '700' }]}>Status</Text>
            </View>

            {filteredRecent.length === 0 ? (
              <View style={styles.emptyTable}>
                <Receipt size={28} color={colors.textMuted} />
                <Text style={styles.emptyTitle}>No Transactions Recorded Yet</Text>
                <Text style={styles.emptySub}>
                  Upload a bank statement or add your first expense above to get started.
                </Text>
              </View>
            ) : (
              filteredRecent.map(tx => (
                <View key={tx.id} style={styles.tableRow}>
                  <Text style={[styles.cell, styles.monoText, { flex: 1.1, color: colors.textMuted }]}>
                    {tx.referenceNumber}
                  </Text>
                  <Text style={[styles.cell, styles.monoText, { flex: 1.1 }]}>{formatDate(tx.date)}</Text>
                  <Text style={[styles.cell, { flex: 3.2, fontWeight: '600' }]} numberOfLines={1}>
                    {tx.description}
                  </Text>
                  <Text style={[styles.cell, { flex: 1.8, color: colors.textSecondary }]}>{tx.category}</Text>
                  <Text style={[styles.cell, styles.monoText, { flex: 1.5, textAlign: 'right', fontWeight: '700', color: colors.debitText }]}>
                    {formatCurrency(tx.amount)}
                  </Text>
                  <View style={{ flex: 1.2, alignItems: 'center' }}>
                    <View style={styles.statusChip}>
                      <Text style={styles.statusChipText}>{tx.status}</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
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
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 3,
  },
  secondaryBtnText: {
    color: colors.textPrimary,
    fontSize: 11.5,
    fontWeight: '600',
  },
  metricGrid: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  metricCard: {
    flex: 1,
    minWidth: 220,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: 4,
    padding: 14,
    gap: 4,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
    marginVertical: 2,
  },
  metricSub: {
    fontSize: 10.5,
    color: colors.textSecondary,
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
    gap: 12,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  tableTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  tableSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSurfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: 3,
    paddingHorizontal: 8,
    height: 28,
    width: 220,
  },
  searchInput: {
    flex: 1,
    fontSize: 11,
    color: colors.textPrimary,
    marginLeft: 6,
    outlineStyle: 'none' as any,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: colors.bgSurfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: 3,
  },
  viewAllBtnText: {
    fontSize: 11,
    fontWeight: '700',
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
