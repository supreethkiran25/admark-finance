import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/currency';
import { colors } from '../../theme/colors';

export const DepartmentBurnChart: React.FC = () => {
  const { budgets } = useFinance();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Department Budgets</Text>

      {budgets.length === 0 ? (
        <Text style={styles.emptyText}>No department budgets defined.</Text>
      ) : (
        <View style={{ gap: 8, marginTop: 8 }}>
          {budgets.map(b => {
            const pct = b.allocatedBudget > 0 ? (b.spentAmount / b.allocatedBudget) * 100 : 0;
            return (
              <View key={b.id} style={styles.deptCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.deptName}>{b.department}</Text>
                  <Text style={styles.spentText}>
                    {formatCurrency(b.spentAmount)} / {formatCurrency(b.allocatedBudget)} ({pct.toFixed(0)}%)
                  </Text>
                </View>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${Math.min(100, pct)}%` }]} />
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
  deptCard: {
    gap: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  deptName: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  spentText: {
    fontSize: 10.5,
    color: colors.textMuted,
    fontFamily: 'Roboto Mono, monospace',
  },
  barTrack: {
    height: 4,
    backgroundColor: colors.bgSurfaceAlt,
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.primaryNavy,
  },
});
