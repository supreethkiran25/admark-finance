import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { FileText, Download, Printer } from 'lucide-react-native';
import { useFinance } from '../../../context/FinanceContext';
import { ExpenseCategory } from '../../../types/finance';
import { formatCurrency, formatPercent } from '../../../utils/currency';
import { colors } from '../../../theme/colors';

export const ReportsModule: React.FC = () => {
  const { filteredExpenses, totalMonthlyRevenue } = useFinance();

  const [activeReport, setActiveReport] = useState<'PL' | 'CASH' | 'DEPT' | 'TAX'>('PL');

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

  const approvedExpenses = filteredExpenses.filter(e => e.status === 'Approved');

  const categoryTotals: Record<ExpenseCategory, number> = categories.reduce((acc, cat) => {
    acc[cat] = approvedExpenses
      .filter(e => e.category === cat)
      .reduce((sum, e) => sum + e.amount, 0);
    return acc;
  }, {} as Record<ExpenseCategory, number>);

  const totalOpEx = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
  const grossProfit = totalMonthlyRevenue;
  const netIncome = grossProfit - totalOpEx;
  const ebitdaMargin = grossProfit > 0 ? (netIncome / grossProfit) * 100 : 0;

  const totalGSTInputCredit = approvedExpenses.reduce((sum, e) => sum + (e.taxAmount || 0), 0);
  const totalTDSWithheld = approvedExpenses.reduce((sum, e) => sum + (e.tdsAmount || 0), 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 14, gap: 12 }}>
      {/* Title Ribbon */}
      <View style={styles.titleRibbon}>
        <View>
          <Text style={styles.pageTitle}>Financial Statements & Statutory Reports (₹ INR)</Text>
          <Text style={styles.pageSubtitle}>
            GAAP compliant Profit & Loss, Daily Treasury Cash Position, Departmental Variance, and GST/TDS tax statements.
          </Text>
        </View>

        <View style={styles.actionGroup}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => alert('Printing formal statutory report...')}
          >
            <Printer size={13} color="#fff" />
            <Text style={styles.primaryBtnText}>Print Report (PDF)</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Report Switcher Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeReport === 'PL' && styles.tabActive]}
          onPress={() => setActiveReport('PL')}
        >
          <Text style={[styles.tabText, activeReport === 'PL' && styles.tabTextActive]}>
            Profit & Loss (P&L)
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeReport === 'TAX' && styles.tabActive]}
          onPress={() => setActiveReport('TAX')}
        >
          <Text style={[styles.tabText, activeReport === 'TAX' && styles.tabTextActive]}>
            GST & TDS Summary
          </Text>
        </TouchableOpacity>
      </View>

      {/* P&L Statement View */}
      {activeReport === 'PL' && (
        <View style={styles.reportSheet}>
          <View style={styles.reportHeader}>
            <Text style={styles.reportOrg}>ADMARK SOFTWARE AGENCY OPERATIONS PVT LTD</Text>
            <Text style={styles.reportTitle}>STATEMENT OF PROFIT AND LOSS (₹ INR)</Text>
            <Text style={styles.reportMeta}>For the Period 01 August 2026 – 16 August 2026 (FY26 Q2)</Text>
          </View>

          {/* Revenue */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>I. REVENUE FROM OPERATIONS</Text>
          </View>
          <View style={styles.lineItem}>
            <Text style={styles.itemLabel}>Client Milestone Retainers & Software Eng Contracts</Text>
            <Text style={[styles.itemVal, styles.monoText]}>{formatCurrency(grossProfit)}</Text>
          </View>
          <View style={[styles.lineItem, styles.subtotalLine]}>
            <Text style={[styles.itemLabel, { fontWeight: '700' }]}>Total Gross Revenue (A)</Text>
            <Text style={[styles.itemVal, styles.monoText, { fontWeight: '800' }]}>{formatCurrency(grossProfit)}</Text>
          </View>

          {/* Operating Expenses */}
          <View style={[styles.sectionHeader, { marginTop: 12 }]}>
            <Text style={styles.sectionTitle}>II. OPERATING EXPENSES (OpEx)</Text>
          </View>
          {categories.map(cat => (
            <View key={cat} style={styles.lineItem}>
              <Text style={styles.itemLabel}>{cat}</Text>
              <Text style={[styles.itemVal, styles.monoText]}>{formatCurrency(categoryTotals[cat] || 0)}</Text>
            </View>
          ))}
          <View style={[styles.lineItem, styles.subtotalLine]}>
            <Text style={[styles.itemLabel, { fontWeight: '700' }]}>Total Operating Expenses (B)</Text>
            <Text style={[styles.itemVal, styles.monoText, { fontWeight: '800', color: colors.debitText }]}>
              {formatCurrency(totalOpEx)}
            </Text>
          </View>

          {/* Net Profit */}
          <View style={[styles.lineItem, styles.netLine]}>
            <View>
              <Text style={[styles.itemLabel, { fontWeight: '800', fontSize: 12.5, color: colors.primaryNavy }]}>
                NET OPERATING INCOME (EBITDA) (A - B)
              </Text>
              <Text style={{ fontSize: 10, color: colors.textMuted }}>
                EBITDA Margin: {formatPercent(ebitdaMargin)}
              </Text>
            </View>
            <Text
              style={[
                styles.itemVal,
                styles.monoText,
                { fontWeight: '800', fontSize: 14, color: netIncome >= 0 ? colors.creditText : colors.debitText },
              ]}
            >
              {formatCurrency(netIncome, { showSign: true })}
            </Text>
          </View>
        </View>
      )}

      {/* Tax & GST Summary View */}
      {activeReport === 'TAX' && (
        <View style={styles.reportSheet}>
          <View style={styles.reportHeader}>
            <Text style={styles.reportOrg}>ADMARK SOFTWARE AGENCY OPERATIONS PVT LTD</Text>
            <Text style={styles.reportTitle}>GST INPUT CREDIT & TDS WITHHOLDING SUMMARY</Text>
            <Text style={styles.reportMeta}>August 2026 Fiscal Filing Preparation</Text>
          </View>

          <View style={{ gap: 8, marginTop: 10 }}>
            <View style={styles.taxBox}>
              <Text style={styles.taxTitle}>Total GST Input Tax Credit (ITC) Available</Text>
              <Text style={[styles.taxAmount, styles.monoText, { color: colors.creditText }]}>
                {formatCurrency(totalGSTInputCredit)}
              </Text>
              <Text style={styles.taxSub}>Eligible for setoff against output GST on client billing invoices.</Text>
            </View>

            <View style={styles.taxBox}>
              <Text style={styles.taxTitle}>Total TDS Deductions (Section 194J / 194I / 194C)</Text>
              <Text style={[styles.taxAmount, styles.monoText, { color: colors.pendingText }]}>
                {formatCurrency(totalTDSWithheld)}
              </Text>
              <Text style={styles.taxSub}>To be deposited with TRACES / IT Department by 7th of next month.</Text>
            </View>
          </View>
        </View>
      )}
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
  tabContainer: {
    flexDirection: 'row',
    gap: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
    paddingBottom: 4,
  },
  tab: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 2,
  },
  tabActive: {
    backgroundColor: colors.primaryNavy,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: '#fff',
  },
  reportSheet: {
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: 4,
    padding: 16,
    gap: 6,
  },
  reportHeader: {
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
    paddingBottom: 10,
    marginBottom: 6,
  },
  reportOrg: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primaryNavy,
    marginVertical: 2,
  },
  reportMeta: {
    fontSize: 10.5,
    color: colors.textMuted,
  },
  sectionHeader: {
    backgroundColor: colors.bgSurfaceAlt,
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  lineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  itemLabel: {
    fontSize: 11,
    color: colors.textPrimary,
  },
  itemVal: {
    fontSize: 11,
  },
  monoText: {
    fontFamily: 'Roboto Mono, monospace',
    fontVariant: ['tabular-nums'],
  },
  subtotalLine: {
    backgroundColor: colors.bgSurfaceAlt,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  netLine: {
    backgroundColor: '#f0fdf4',
    borderTopWidth: 2,
    borderTopColor: colors.primaryNavy,
    marginTop: 10,
    paddingVertical: 8,
  },
  taxBox: {
    backgroundColor: colors.bgSurfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 3,
    padding: 12,
    gap: 4,
  },
  taxTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  taxAmount: {
    fontSize: 18,
    fontWeight: '800',
  },
  taxSub: {
    fontSize: 10.5,
    color: colors.textMuted,
  },
});
