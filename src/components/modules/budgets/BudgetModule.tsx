import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Edit3, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react-native';
import { useFinance } from '../../../context/FinanceContext';
import { DepartmentBudget } from '../../../types/finance';
import { Modal } from '../../common/Modal';
import { formatCurrency } from '../../../utils/currency';
import { colors } from '../../../theme/colors';

export const BudgetModule: React.FC = () => {
  const { budgets, updateBudget } = useFinance();

  const [editingBudget, setEditingBudget] = useState<DepartmentBudget | null>(null);
  const [allocatedInput, setAllocatedInput] = useState('');
  const [notesInput, setNotesInput] = useState('');

  const totalAllocated = budgets.reduce((sum, b) => sum + b.allocatedBudget, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spentAmount, 0);
  const totalCommitted = budgets.reduce((sum, b) => sum + b.committedAmount, 0);
  const totalRemaining = totalAllocated - (totalSpent + totalCommitted);

  const handleSaveBudget = () => {
    if (!editingBudget) return;
    const parsedAllocated = parseFloat(allocatedInput);
    if (isNaN(parsedAllocated) || parsedAllocated <= 0) {
      alert('Please enter a valid budget allocation in INR (₹).');
      return;
    }

    updateBudget(editingBudget.id, parsedAllocated, notesInput);
    setEditingBudget(null);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 14, gap: 12 }}>
      {/* Title Ribbon */}
      <View style={styles.titleRibbon}>
        <View>
          <Text style={styles.pageTitle}>Department Budget Allocation & Variance (INR - ₹)</Text>
          <Text style={styles.pageSubtitle}>
            Monthly department caps (in ₹ Lakhs), actual disbursements, committed liabilities, and variance thresholds.
          </Text>
        </View>
      </View>

      {/* Summary KPI Strip */}
      <View style={styles.kpiStrip}>
        <View>
          <Text style={styles.kpiLabel}>Total Monthly Allocation (₹)</Text>
          <Text style={[styles.kpiVal, styles.monoText]}>{formatCurrency(totalAllocated)}</Text>
        </View>
        <View>
          <Text style={styles.kpiLabel}>Total MTD Spent (₹)</Text>
          <Text style={[styles.kpiVal, styles.monoText, { color: colors.debitText }]}>
            {formatCurrency(totalSpent)}
          </Text>
        </View>
        <View>
          <Text style={styles.kpiLabel}>Committed AP & POs (₹)</Text>
          <Text style={[styles.kpiVal, styles.monoText, { color: colors.pendingText }]}>
            {formatCurrency(totalCommitted)}
          </Text>
        </View>
        <View>
          <Text style={styles.kpiLabel}>Remaining Headroom</Text>
          <Text style={[styles.kpiVal, styles.monoText, { color: colors.creditText, fontWeight: '800' }]}>
            {formatCurrency(totalRemaining)}
          </Text>
        </View>
      </View>

      {/* Budgets Table */}
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.cell, { flex: 2, fontWeight: '700' }]}>Department</Text>
          <Text style={[styles.cell, { flex: 1.8, textAlign: 'right', fontWeight: '700' }]}>Allocated (₹)</Text>
          <Text style={[styles.cell, { flex: 1.8, textAlign: 'right', fontWeight: '700' }]}>Spent (₹)</Text>
          <Text style={[styles.cell, { flex: 1.6, textAlign: 'right', fontWeight: '700' }]}>Committed (₹)</Text>
          <Text style={[styles.cell, { flex: 1.8, textAlign: 'right', fontWeight: '700' }]}>Remaining (₹)</Text>
          <Text style={[styles.cell, { flex: 1.4, textAlign: 'center', fontWeight: '700' }]}>Util %</Text>
          <Text style={[styles.cell, { flex: 1, textAlign: 'center', fontWeight: '700' }]}>Edit</Text>
        </View>

        {budgets.map(b => {
          const totalUtil = b.spentAmount + b.committedAmount;
          const pct = (totalUtil / b.allocatedBudget) * 100;
          const rem = b.allocatedBudget - totalUtil;

          let statusColor = colors.creditText;
          if (pct >= 100) statusColor = colors.debitText;
          else if (pct >= 85) statusColor = colors.pendingText;

          return (
            <View key={b.id} style={styles.tableRow}>
              <View style={{ flex: 2 }}>
                <Text style={[styles.cell, { fontWeight: '700' }]}>{b.department}</Text>
                {b.notes && (
                  <Text style={{ fontSize: 9.5, color: colors.textMuted }} numberOfLines={1}>
                    {b.notes}
                  </Text>
                )}
              </View>
              <Text style={[styles.cell, styles.monoText, { flex: 1.8, textAlign: 'right', fontWeight: '700' }]}>
                {formatCurrency(b.allocatedBudget)}
              </Text>
              <Text style={[styles.cell, styles.monoText, { flex: 1.8, textAlign: 'right', color: colors.debitText }]}>
                {formatCurrency(b.spentAmount)}
              </Text>
              <Text style={[styles.cell, styles.monoText, { flex: 1.6, textAlign: 'right', color: colors.pendingText }]}>
                {formatCurrency(b.committedAmount)}
              </Text>
              <Text
                style={[
                  styles.cell,
                  styles.monoText,
                  { flex: 1.8, textAlign: 'right', fontWeight: '700', color: rem < 0 ? colors.debitText : colors.creditText },
                ]}
              >
                {formatCurrency(rem)}
              </Text>
              <View style={{ flex: 1.4, alignItems: 'center' }}>
                <View style={[styles.pctBadge, { borderColor: colors.borderSubtle }]}>
                  <Text style={[styles.pctText, { color: statusColor }]}>{pct.toFixed(1)}%</Text>
                </View>
              </View>
              <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center' }}>
                <TouchableOpacity
                  style={styles.iconBtnSm}
                  onPress={() => {
                    setEditingBudget(b);
                    setAllocatedInput(b.allocatedBudget.toString());
                    setNotesInput(b.notes || '');
                  }}
                >
                  <Edit3 size={11} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>

      {/* Edit Budget Modal */}
      <Modal
        isOpen={!!editingBudget}
        onClose={() => setEditingBudget(null)}
        title={`Adjust Budget: ${editingBudget?.department}`}
        subtitle="Modify monthly departmental cap in INR (₹)"
        size="md"
        footer={
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => setEditingBudget(null)}
            >
              <Text style={styles.secondaryBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleSaveBudget}
            >
              <Text style={styles.primaryBtnText}>Save Allocation</Text>
            </TouchableOpacity>
          </View>
        }
      >
        <View style={{ gap: 10 }}>
          <View>
            <Text style={styles.formLabel}>Monthly Allocated Budget (₹ INR) *</Text>
            <TextInput
              style={[styles.input, styles.monoText]}
              value={allocatedInput}
              keyboardType="numeric"
              onChangeText={setAllocatedInput}
            />
          </View>
          <View>
            <Text style={styles.formLabel}>Budget Justification Notes</Text>
            <TextInput
              style={styles.input}
              value={notesInput}
              onChangeText={setNotesInput}
            />
          </View>
        </View>
      </Modal>
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
  kpiStrip: {
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: 4,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  kpiLabel: {
    fontSize: 10,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  kpiVal: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
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
  pctBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    backgroundColor: colors.bgSurfaceAlt,
    borderWidth: 1,
    borderRadius: 2,
  },
  pctText: {
    fontSize: 10.5,
    fontWeight: '700',
    fontFamily: 'Roboto Mono, monospace',
  },
  iconBtnSm: {
    padding: 3,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  primaryBtn: {
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
});
