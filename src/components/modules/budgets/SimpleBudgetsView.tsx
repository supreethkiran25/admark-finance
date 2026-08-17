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
  PieChart,
  Plus,
  Edit3,
  Trash2,
} from 'lucide-react';
import { useFinance } from '../../../context/FinanceContext';
import { SelectPicker } from '../../common/SelectPicker';
import { Modal } from '../../common/Modal';
import { formatCurrency } from '../../../utils/currency';
import { DepartmentBudget } from '../../../types/finance';
import { colors } from '../../../theme/colors';

const DEPARTMENTS = [
  'Engineering',
  'Operations',
  'Sales & Marketing',
  'Design & Product',
  'Facilities & IT',
  'Executive',
];

export const SimpleBudgetsView: React.FC = () => {
  const { budgets, addBudget, updateBudget, deleteBudget, expenses } = useFinance();

  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingBudget, setEditingBudget] = useState<DepartmentBudget | null>(null);

  const [selectedDept, setSelectedDept] = useState<string>('Engineering');
  const [allocatedInput, setAllocatedInput] = useState<string>('');
  const [notesInput, setNotesInput] = useState<string>('');

  const totalAllocated = budgets.reduce((sum, b) => sum + b.allocatedBudget, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spentAmount, 0);
  const totalRemaining = totalAllocated - totalSpent;
  const overallPct = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;

  const handleSave = () => {
    const num = parseFloat(allocatedInput);
    if (isNaN(num) || num <= 0) {
      alert('Please enter a valid monthly budget limit in INR (₹).');
      return;
    }

    if (editingBudget) {
      updateBudget(editingBudget.id, num, notesInput);
      setEditingBudget(null);
    } else {
      addBudget({
        department: selectedDept,
        fiscalMonth: new Date().toISOString().substring(0, 7),
        allocatedBudget: num,
        notes: notesInput,
      });
      setIsAddModalOpen(false);
    }

    setAllocatedInput('');
    setNotesInput('');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, gap: 14 }}>
      {/* Title Ribbon */}
      <View style={styles.titleRibbon}>
        <View>
          <Text style={styles.pageTitle}>Budgets</Text>
          <Text style={styles.pageSubtitle}>
            Set monthly spending limits for company departments and track utilization.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => {
            setEditingBudget(null);
            setAllocatedInput('');
            setNotesInput('');
            setIsAddModalOpen(true);
          }}
        >
          <Plus size={13} color="#fff" />
          <Text style={styles.primaryBtnText}>+ Create Budget</Text>
        </TouchableOpacity>
      </View>

      {/* Overview Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View>
            <Text style={styles.statLabel}>Total Budget Limit</Text>
            <Text style={[styles.statVal, styles.monoText]}>{formatCurrency(totalAllocated)}</Text>
          </View>
          <View>
            <Text style={styles.statLabel}>Total Spent</Text>
            <Text style={[styles.statVal, styles.monoText, { color: colors.debitText }]}>
              {formatCurrency(totalSpent)}
            </Text>
          </View>
          <View>
            <Text style={styles.statLabel}>Remaining</Text>
            <Text
              style={[
                styles.statVal,
                styles.monoText,
                { color: totalRemaining >= 0 ? colors.creditText : colors.debitText },
              ]}
            >
              {formatCurrency(totalRemaining)}
            </Text>
          </View>
          <View>
            <Text style={styles.statLabel}>Overall Spent %</Text>
            <Text
              style={[
                styles.statVal,
                styles.monoText,
                { color: overallPct > 90 ? colors.debitText : colors.creditText },
              ]}
            >
              {overallPct.toFixed(1)}%
            </Text>
          </View>
        </View>
      </View>

      {/* Department Cards Grid */}
      {budgets.length === 0 ? (
        <View style={styles.emptyCard}>
          <PieChart size={32} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No Budgets Created</Text>
          <Text style={styles.emptySub}>
            Click "+ Create Budget" to set spending ceilings for Engineering, Operations, Marketing, and Design.
          </Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {budgets.map(b => {
            const pct = b.allocatedBudget > 0 ? (b.spentAmount / b.allocatedBudget) * 100 : 0;
            const remaining = b.allocatedBudget - b.spentAmount;
            const isOver = pct > 100;

            return (
              <View key={b.id} style={[styles.card, isOver && { borderColor: colors.debitBorder }]}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.deptName}>{b.department}</Text>
                    <Text style={styles.monthText}>Month: {b.fiscalMonth}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 4 }}>
                    <TouchableOpacity
                      style={styles.iconBtn}
                      onPress={() => {
                        setEditingBudget(b);
                        setAllocatedInput(b.allocatedBudget.toString());
                        setNotesInput(b.notes || '');
                      }}
                    >
                      <Edit3 size={11} color={colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.iconBtn, { backgroundColor: colors.debitBg }]}
                      onPress={() => {
                        if (confirm(`Delete budget for ${b.department}?`)) {
                          deleteBudget(b.id);
                        }
                      }}
                    >
                      <Trash2 size={11} color={colors.debitText} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressBar,
                      {
                        width: `${Math.min(100, pct)}%`,
                        backgroundColor: isOver ? colors.debitText : pct > 80 ? colors.pendingText : colors.creditText,
                      },
                    ]}
                  />
                </View>

                <View style={styles.statLine}>
                  <Text style={styles.statLineText}>
                    Spent: <Text style={styles.monoText}>{formatCurrency(b.spentAmount)}</Text>
                  </Text>
                  <Text style={styles.statLineText}>
                    Limit: <Text style={styles.monoText}>{formatCurrency(b.allocatedBudget)}</Text>
                  </Text>
                </View>

                {b.notes && (
                  <Text style={styles.notesText} numberOfLines={2}>
                    {b.notes}
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      )}

      {/* Modal */}
      <Modal
        isOpen={isAddModalOpen || !!editingBudget}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingBudget(null);
        }}
        title={editingBudget ? `Edit ${editingBudget.department} Budget` : 'Create Department Budget'}
        subtitle="Set monthly spending ceiling"
        size="sm"
        footer={
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 6, width: '100%' }}>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => {
                setIsAddModalOpen(false);
                setEditingBudget(null);
              }}
            >
              <Text style={styles.secondaryBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleSave}
            >
              <Text style={styles.primaryBtnText}>Save Budget</Text>
            </TouchableOpacity>
          </View>
        }
      >
        <View style={{ gap: 10 }}>
          {!editingBudget && (
            <SelectPicker
              label="Department"
              value={selectedDept}
              options={DEPARTMENTS}
              onChange={setSelectedDept}
              required
            />
          )}

          <View style={styles.formCol}>
            <Text style={styles.formLabel}>Monthly Budget Limit (₹ INR) *</Text>
            <TextInput
              style={[styles.input, styles.monoText, { fontWeight: '700' }]}
              value={allocatedInput}
              onChangeText={setAllocatedInput}
              placeholder="e.g. 1000000.00"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formCol}>
            <Text style={styles.formLabel}>Notes (Optional)</Text>
            <TextInput
              style={[styles.input, { height: 44 }]}
              value={notesInput}
              onChangeText={setNotesInput}
              placeholder="Budget notes..."
              multiline
            />
          </View>
        </View>
      </Modal>
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
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
    paddingHorizontal: 10,
    paddingVertical: 5,
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    flex: 1,
    minWidth: 280,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: 4,
    padding: 12,
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deptName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  monthText: {
    fontSize: 10,
    color: colors.textMuted,
  },
  iconBtn: {
    padding: 4,
    borderRadius: 2,
    backgroundColor: colors.bgSurfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.bgSurfaceAlt,
    borderRadius: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  progressBar: {
    height: '100%',
  },
  statLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statLineText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  notesText: {
    fontSize: 10.5,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  emptyCard: {
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: 4,
    padding: 36,
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
  formCol: {
    gap: 3,
  },
  formLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: colors.bgSurfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: 3,
    paddingHorizontal: 8,
    paddingVertical: 5,
    fontSize: 11.5,
    color: colors.textPrimary,
    outlineStyle: 'none' as any,
  },
});
