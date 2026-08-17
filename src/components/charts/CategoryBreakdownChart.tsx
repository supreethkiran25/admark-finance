import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/currency';
import { ExpenseCategory } from '../../types/finance';
import { colors } from '../../theme/colors';

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

export const CategoryBreakdownChart: React.FC = () => {
  const { expenses } = useFinance();

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  const stats = CATEGORIES.map(cat => {
    const matching = expenses.filter(e => e.category === cat);
    const amount = matching.reduce((sum, e) => sum + e.amount, 0);
    const pct = total > 0 ? (amount / total) * 100 : 0;
    return {
      category: cat,
      amount,
      pct,
    };
  }).filter(c => c.amount > 0).sort((a, b) => b.amount - a.amount);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Category Spending Breakdown</Text>
      {stats.length === 0 ? (
        <Text style={styles.emptyText}>No spending recorded yet.</Text>
      ) : (
        <View style={{ gap: 6, marginTop: 8 }}>
          {stats.slice(0, 5).map(s => (
            <View key={s.category}>
              <View style={styles.row}>
                <Text style={styles.catName}>{s.category}</Text>
                <Text style={styles.catVal}>{formatCurrency(s.amount)} ({s.pct.toFixed(1)}%)</Text>
              </View>
              <View style={styles.track}>
                <View style={[styles.bar, { width: `${s.pct}%` }]} />
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create<any>({
  container: {
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: 4,
    padding: 12,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  emptyText: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  catName: {
    fontSize: 10.5,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  catVal: {
    fontSize: 10,
    color: colors.textMuted,
    fontFamily: 'Roboto Mono, monospace',
  },
  track: {
    height: 4,
    backgroundColor: colors.bgSurfaceAlt,
    borderRadius: 2,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    backgroundColor: colors.primaryNavy,
  },
});
