import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Building,
  UserCheck,
  Plus,
  Upload,
  FileText,
  Eye,
  Check,
  X,
  FileSpreadsheet,
} from 'lucide-react-native';
import { useFinance } from '../../../context/FinanceContext';
import { MetricCard } from '../../common/MetricCard';
import { Badge } from '../../common/Badge';
import { Drawer } from '../../common/Drawer';
import { CashFlowChart } from '../../charts/CashFlowChart';
import { CategoryBreakdownChart } from '../../charts/CategoryBreakdownChart';
import { DepartmentBurnChart } from '../../charts/DepartmentBurnChart';
import { Expense } from '../../../types/finance';
import { formatCurrency } from '../../../utils/currency';
import { formatDate } from '../../../utils/date';
import { colors } from '../../../theme/colors';

export const ExecutiveOverview: React.FC = () => {
  const {
    currentRole,
    setActiveModule,
    todaySpend,
    weekSpend,
    monthSpend,
    cashBalance,
    pendingPayablesTotal,
    totalEmployeeExpenseTotal,
    totalVendorExpenseTotal,
    totalMonthlyRevenue,
    filteredExpenses,
    updateExpense,
    isCompactMode,
  } = useFinance();

  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const recentExpenses = [...filteredExpenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  const netCashFlow = totalMonthlyRevenue - monthSpend;
  const runwayMonths = cashBalance / (monthSpend * 2);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 14, gap: 12 }}>
      {/* Title Ribbon */}
      <View style={styles.titleRibbon}>
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={styles.pageTitle}>Executive Financial Operations Overview</Text>
            <View style={styles.roleTag}>
              <Text style={styles.roleTagText}>ACTIVE ROLE: {currentRole}</Text>
            </View>
          </View>
          <Text style={styles.pageSubtitle}>
            Centralized Indian operational accounting ledger, live cash trajectory, department burn & pending payables.
          </Text>
        </View>

        {/* Quick Action Buttons */}
        <View style={styles.actionGroup}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => setActiveModule('expenses')}
          >
            <Plus size={13} color="#fff" />
            <Text style={styles.primaryBtnText}>Record Expense</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => setActiveModule('statements')}
          >
            <Upload size={13} color={colors.textPrimary} />
            <Text style={styles.secondaryBtnText}>Import Statement</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => setActiveModule('reports')}
          >
            <FileText size={13} color={colors.textPrimary} />
            <Text style={styles.secondaryBtnText}>Generate P&L</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Metric Cards Grid */}
      <View style={styles.metricGrid}>
        <MetricCard
          label="Operating Cash Balance"
          value={formatCurrency(cashBalance)}
          subValue="HDFC & ICICI Commercial Accounts"
          badgeText="Verified Live"
          badgeType="credit"
        />
        <MetricCard
          label="Today's Approved Spend"
          value={formatCurrency(todaySpend)}
          subValue="August 16, 2026"
          badgeText="Today"
          badgeType="debit"
        />
        <MetricCard
          label="Weekly Spend (WTD)"
          value={formatCurrency(weekSpend)}
          subValue="10 - 16 Aug 2026"
          badgeText="7-Day Run"
          badgeType="pending"
        />
        <MetricCard
          label="Monthly OpEx (MTD)"
          value={formatCurrency(monthSpend)}
          subValue="August 2026 Actuals"
          badgeText="OpEx"
          badgeType="debit"
        />
        <MetricCard
          label="Pending Payables (AP)"
          value={formatCurrency(pendingPayablesTotal)}
          subValue="Vendor Invoices Under Review"
          badgeText="Scheduled"
          badgeType="pending"
        />
        <MetricCard
          label="Employee Claims Queue"
          value={formatCurrency(totalEmployeeExpenseTotal)}
          subValue="Travel, Stipends & Hardware"
          badgeText="FTE Claims"
          badgeType="neutral"
        />
        <MetricCard
          label="Vendor AP Liabilities"
          value={formatCurrency(totalVendorExpenseTotal)}
          subValue="Outstanding Net-30 Terms"
          badgeText="Committed"
          badgeType="debit"
        />
        <MetricCard
          label="Net Operating Cash Flow"
          value={formatCurrency(netCashFlow, { showSign: true })}
          subValue={`Runway: ~${runwayMonths.toFixed(1)} Months`}
          badgeText={netCashFlow >= 0 ? '+Positive' : '-Burn'}
          badgeType={netCashFlow >= 0 ? 'credit' : 'debit'}
        />
      </View>

      {/* Cash Flow & Department Burn */}
      <View style={styles.twoColumnGrid}>
        <View style={{ flex: 1.4 }}>
          <CashFlowChart />
        </View>
        <View style={{ flex: 1 }}>
          <DepartmentBurnChart />
        </View>
      </View>

      {/* Category Breakdown & Recent Transactions */}
      <View style={styles.twoColumnGrid}>
        <View style={{ flex: 1 }}>
          <CategoryBreakdownChart />
        </View>

        <View style={[styles.card, { flex: 1.3 }]}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>Recent Operational Ledger Entries (₹)</Text>
              <Text style={styles.cardSubtitle}>Latest 8 transactions across all departments</Text>
            </View>
            <TouchableOpacity
              style={styles.smBtn}
              onPress={() => setActiveModule('expenses')}
            >
              <Text style={styles.smBtnText}>View All ({filteredExpenses.length})</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.cell, { flex: 1.2, fontWeight: '700' }]}>Ref #</Text>
              <Text style={[styles.cell, { flex: 1.2, fontWeight: '700' }]}>Date</Text>
              <Text style={[styles.cell, { flex: 3, fontWeight: '700' }]}>Payee / Description</Text>
              <Text style={[styles.cell, { flex: 1.8, textAlign: 'right', fontWeight: '700' }]}>Amount (₹)</Text>
              <Text style={[styles.cell, { flex: 1.2, fontWeight: '700', textAlign: 'center' }]}>Status</Text>
              <Text style={[styles.cell, { flex: 1, textAlign: 'center', fontWeight: '700' }]}>Action</Text>
            </View>

            {recentExpenses.map(exp => (
              <View key={exp.id} style={styles.tableRow}>
                <Text style={[styles.cell, styles.monoText, { flex: 1.2 }]}>{exp.referenceNumber}</Text>
                <Text style={[styles.cell, styles.monoText, { flex: 1.2 }]}>{formatDate(exp.date)}</Text>
                <Text style={[styles.cell, { flex: 3, fontWeight: '600' }]} numberOfLines={1}>
                  {exp.description}
                </Text>
                <Text style={[styles.cell, styles.monoText, { flex: 1.8, textAlign: 'right', fontWeight: '700' }]}>
                  {formatCurrency(exp.amount)}
                </Text>
                <View style={{ flex: 1.2, alignItems: 'center' }}>
                  <Badge status={exp.status} size="sm" />
                </View>
                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', gap: 4 }}>
                  <TouchableOpacity
                    style={styles.iconBtnSm}
                    onPress={() => setSelectedExpense(exp)}
                  >
                    <Eye size={12} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Transaction Details Drawer */}
      <Drawer
        isOpen={!!selectedExpense}
        onClose={() => setSelectedExpense(null)}
        title={selectedExpense ? `Expense ${selectedExpense.referenceNumber}` : 'Detail'}
        subtitle={selectedExpense ? `${selectedExpense.date} • ${selectedExpense.department}` : ''}
        footer={
          selectedExpense && (
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <Text style={{ fontSize: 11, color: colors.textMuted }}>
                GL: <Text style={{ fontFamily: 'Roboto Mono, monospace', fontWeight: '700' }}>{selectedExpense.glCode}</Text>
              </Text>
              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => setSelectedExpense(null)}
              >
                <Text style={styles.secondaryBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          )
        }
      >
        {selectedExpense && (
          <View style={{ gap: 12 }}>
            <View style={styles.drawerSummary}>
              <Text style={{ fontSize: 10, color: colors.textMuted, textTransform: 'uppercase' }}>Amount in INR</Text>
              <Text style={styles.drawerAmount}>{formatCurrency(selectedExpense.amount)}</Text>
              {selectedExpense.taxAmount > 0 && (
                <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
                  Includes {formatCurrency(selectedExpense.taxAmount)} GST / Input Credit
                </Text>
              )}
            </View>

            <View style={styles.metadataCard}>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Description</Text>
                <Text style={styles.metaVal}>{selectedExpense.description}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Employee</Text>
                <Text style={styles.metaVal}>{selectedExpense.employee}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Department</Text>
                <Text style={styles.metaVal}>{selectedExpense.department}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Category</Text>
                <Text style={styles.metaVal}>{selectedExpense.category}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Payment Mode</Text>
                <Text style={[styles.metaVal, styles.monoText]}>{selectedExpense.paymentMethod}</Text>
              </View>
              {selectedExpense.gstin && (
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Vendor GSTIN</Text>
                  <Text style={[styles.metaVal, styles.monoText]}>{selectedExpense.gstin}</Text>
                </View>
              )}
            </View>

            {selectedExpense.receiptFileName && (
              <View style={styles.receiptBox}>
                <FileSpreadsheet size={20} color={colors.textMuted} />
                <Text style={[styles.monoText, { fontSize: 11 }]}>{selectedExpense.receiptFileName}</Text>
                <Text style={{ fontSize: 10.5, color: colors.creditText, fontWeight: '700' }}>
                  ✓ OCR GSTIN & Tax Verified
                </Text>
              </View>
            )}
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
  roleTag: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    backgroundColor: colors.bgSurfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: 2,
  },
  roleTagText: {
    fontSize: 9.5,
    fontWeight: '700',
    fontFamily: 'Roboto Mono, monospace',
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
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  twoColumnGrid: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  card: {
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 4,
    padding: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: 10.5,
    color: colors.textMuted,
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
  table: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 3,
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
});
