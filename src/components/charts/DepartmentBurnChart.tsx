import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/currency';
import { colors } from '../../theme/colors';

export const DepartmentBurnChart: React.FC = () => {
  const { budgets } = useFinance();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Department Budget Utilization & Burn Velocity (₹)</Text>
        <Text style={styles.subtitle}>August 2026 Fiscal Allocations vs Actual Spend & Commitments</Text>
      </View>

      <View style={{ gap: 8, marginTop: 8 }}>
        {budgets.map(b => {
          const totalUtil = b.spentAmount + b.committedAmount;
          const pct = (totalUtil / b.allocatedBudget) * 100;
          const remaining = b.allocatedBudget - totalUtil;

          let statusColor = colors.creditText;
          if (pct >= 100) statusColor = colors.debitText;
          else if (pct >= 85) statusColor = colors.pendingText;

          return (
            <View key={b.id} style={styles.deptCard}>
              <View style={styles.cardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.deptName}>{b.department}</Text>
                  <Text style={styles.allocatedText}>({formatCurrency(b.allocatedBudget)})</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={styles.spentText}>
                    Spent: <Text style={{ fontWeight: '700', fontFamily: 'Roboto Mono, monospace' }}>{formatCurrency(b.spentAmount)}</Text>
                  </Text>
                  <Text style={styles.spentText}>
                    Rem: <Text style={{ fontWeight: '700', fontFamily: 'Roboto Mono, monospace', color: remaining < 0 ? colors.debitText : colors.textPrimary }}>{formatCurrency(remaining)}</Text>
                  </Text>
                  <View style={[styles.pctBadge, { borderColor: colors.borderSubtle }]}>
                    <Text style={[styles.pctText, { color: statusColor }]}>{pct.toFixed(1)}%</Text>
                  </View>
                </View>
              </View>

              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${Math.min(100, pct)}%`,
                      backgroundColor: statusColor,
                    },
                  ]}
                />
              </View>
            </View>
          );
        })}
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
    marginBottom: 4,
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
  deptCard: {
    padding: 8,
    backgroundColor: colors.bgSurfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  deptName: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  allocatedText: {
    fontSize: 10,
    color: colors.textMuted,
  },
  spentText: {
    fontSize: 10.5,
    color: colors.textSecondary,
  },
  pctBadge: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderRadius: 2,
  },
  pctText: {
    fontSize: 10.5,
    fontWeight: '700',
    fontFamily: 'Roboto Mono, monospace',
  },
  progressBarBg: {
    height: 5,
    backgroundColor: colors.bgSurface,
    borderRadius: 2,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  progressBarFill: {
    height: '100%',
  },
});
