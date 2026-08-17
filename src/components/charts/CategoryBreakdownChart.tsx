import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useFinance } from '../../context/FinanceContext';
import { ExpenseCategory } from '../../types/finance';
import { formatCurrency } from '../../utils/currency';
import { colors } from '../../theme/colors';

export const CategoryBreakdownChart: React.FC = () => {
  const { filteredExpenses } = useFinance();

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

  const totalSpend = filteredExpenses
    .filter(e => e.status === 'Approved')
    .reduce((sum, e) => sum + e.amount, 0);

  const breakdown = categories
    .map(cat => {
      const items = filteredExpenses.filter(e => e.category === cat && e.status === 'Approved');
      const amount = items.reduce((sum, e) => sum + e.amount, 0);
      const percent = totalSpend > 0 ? (amount / totalSpend) * 100 : 0;
      return {
        category: cat,
        amount,
        count: items.length,
        percent,
      };
    })
    .filter(b => b.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Operating Expense Breakdown by Category (₹ INR)</Text>
          <Text style={styles.subtitle}>Active MTD Ledger Distribution ({breakdown.length} Active Categories)</Text>
        </View>
        <Text style={styles.totalOpEx}>Total OpEx: {formatCurrency(totalSpend)}</Text>
      </View>

      {/* Segmented Distribution Bar */}
      <View style={styles.stackedBar}>
        {breakdown.map((b, idx) => {
          const colorList = [
            '#1e293b', // Navy Slate (Salaries)
            '#0284c7', // Sky (Cloud)
            '#4f46e5', // Indigo (Software)
            '#059669', // Emerald (Office)
            '#d97706', // Amber (Marketing)
            '#64748b', // Slate (Equipment)
            '#7c3aed', // Purple (Legal)
            '#0891b2', // Cyan (Travel)
            '#e11d48', // Rose (Food)
            '#475569',
          ];
          const bg = colorList[idx % colorList.length];
          return (
            <View
              key={b.category}
              style={{
                width: `${b.percent}%`,
                backgroundColor: bg,
                height: '100%',
              }}
            />
          );
        })}
      </View>

      {/* Tabular Distribution Matrix */}
      <View style={styles.table}>
        <View style={[styles.row, styles.th]}>
          <Text style={[styles.cell, { flex: 2, fontWeight: '700' }]}>Category</Text>
          <Text style={[styles.cell, { flex: 1, textAlign: 'right', fontWeight: '700' }]}>Txs</Text>
          <Text style={[styles.cell, { flex: 2, textAlign: 'right', fontWeight: '700' }]}>MTD Spend (₹)</Text>
          <Text style={[styles.cell, { flex: 1, textAlign: 'right', fontWeight: '700' }]}>% OpEx</Text>
        </View>
        {breakdown.map(b => (
          <View key={b.category} style={styles.row}>
            <Text style={[styles.cell, { flex: 2, fontWeight: '600' }]}>{b.category}</Text>
            <Text style={[styles.cell, { flex: 1, textAlign: 'right', fontFamily: 'Roboto Mono, monospace' }]}>
              {b.count}
            </Text>
            <Text style={[styles.cell, { flex: 2, textAlign: 'right', fontFamily: 'Roboto Mono, monospace', fontWeight: '600' }]}>
              {formatCurrency(b.amount)}
            </Text>
            <Text style={[styles.cell, { flex: 1, textAlign: 'right', fontFamily: 'Roboto Mono, monospace' }]}>
              {b.percent.toFixed(1)}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 4,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 11.5,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 10.5,
    color: colors.textMuted,
  },
  totalOpEx: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Roboto Mono, monospace',
    color: colors.primaryNavy,
  },
  stackedBar: {
    flexDirection: 'row',
    height: 10,
    borderRadius: 2,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginVertical: 8,
  },
  table: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 3,
    overflow: 'hidden',
  },
  th: {
    backgroundColor: colors.bgSurfaceAlt,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  cell: {
    fontSize: 11,
    color: colors.textPrimary,
  },
});
