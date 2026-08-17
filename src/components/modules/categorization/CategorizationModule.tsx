import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Plus, RefreshCw, Search, Trash2, Edit3 } from 'lucide-react-native';
import { useFinance } from '../../../context/FinanceContext';
import { CategorizationRule, ExpenseCategory, Department } from '../../../types/finance';
import { Modal } from '../../common/Modal';
import { autoCategorizeMerchant } from '../../../utils/rulesEngine';
import { colors } from '../../../theme/colors';

export const CategorizationModule: React.FC = () => {
  const { rules, addRule, updateRule, deleteRule, reapplyAllRules } = useFinance();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<CategorizationRule | null>(null);

  // Live Simulator State
  const [testMerchant, setTestMerchant] = useState('AWS INDIA SERVICES MUMBAI AP-SOUTH-1');
  const testResult = autoCategorizeMerchant(testMerchant, rules);

  const initialFormState = {
    pattern: '',
    category: 'Software subscriptions' as ExpenseCategory,
    department: 'Engineering' as Department,
    isRegex: true,
    priority: 8,
    isActive: true,
  };
  const [formData, setFormData] = useState(initialFormState);

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

  const departments: Department[] = [
    'Engineering',
    'Sales & Marketing',
    'Operations',
    'Executive',
    'Design & Product',
    'Facilities & IT',
  ];

  const filteredRules = rules.filter(r => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.pattern.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q) ||
      r.department.toLowerCase().includes(q)
    );
  });

  const handleSaveRule = () => {
    if (!formData.pattern.trim()) {
      alert('Please enter a matching pattern.');
      return;
    }

    if (editingRule) {
      updateRule(editingRule.id, {
        pattern: formData.pattern,
        category: formData.category,
        department: formData.department,
        isRegex: formData.isRegex,
        priority: Number(formData.priority) || 5,
        isActive: formData.isActive,
      });
      setEditingRule(null);
    } else {
      addRule({
        pattern: formData.pattern,
        category: formData.category,
        department: formData.department,
        isRegex: formData.isRegex,
        priority: Number(formData.priority) || 5,
        isActive: formData.isActive,
      });
      setIsAddModalOpen(false);
    }

    setFormData(initialFormState);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 14, gap: 12 }}>
      {/* Title Ribbon */}
      <View style={styles.titleRibbon}>
        <View>
          <Text style={styles.pageTitle}>Automatic Categorization & GL Rules Engine</Text>
          <Text style={styles.pageSubtitle}>
            Deterministic pattern matching algorithms mapping Indian and global merchants to standard chart of accounts.
          </Text>
        </View>

        <View style={styles.actionGroup}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => reapplyAllRules()}
          >
            <RefreshCw size={13} color="#fff" />
            <Text style={styles.primaryBtnText}>Re-apply Rules to Ledger</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => {
              setFormData(initialFormState);
              setIsAddModalOpen(true);
            }}
          >
            <Plus size={13} color={colors.textPrimary} />
            <Text style={styles.secondaryBtnText}>+ Add Rule</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Simulator Sandbox */}
      <View style={styles.sandboxCard}>
        <Text style={styles.sandboxTitle}>Rule Engine Simulator (Test Categorization Accuracy)</Text>
        <View style={styles.sandboxGrid}>
          <TextInput
            style={styles.sandboxInput}
            value={testMerchant}
            onChangeText={setTestMerchant}
            placeholder="Type merchant narration to test match..."
          />
          <View style={styles.matchOutcome}>
            <Text style={styles.matchText}>
              Category: <Text style={{ fontWeight: '700' }}>{testResult.category}</Text> • Dept:{' '}
              <Text style={{ fontWeight: '700' }}>{testResult.department}</Text> • Confidence:{' '}
              <Text style={{ fontWeight: '700', color: testResult.confidence >= 0.9 ? colors.creditText : colors.pendingText }}>
                {(testResult.confidence * 100).toFixed(0)}%
              </Text>
            </Text>
          </View>
        </View>
      </View>

      {/* Rules Table */}
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.cell, { flex: 0.8, fontWeight: '700', textAlign: 'center' }]}>Prio</Text>
          <Text style={[styles.cell, { flex: 4, fontWeight: '700' }]}>Keyword / Regex Pattern</Text>
          <Text style={[styles.cell, { flex: 2, fontWeight: '700' }]}>Target Category</Text>
          <Text style={[styles.cell, { flex: 1.5, fontWeight: '700' }]}>Dept</Text>
          <Text style={[styles.cell, { flex: 1, textAlign: 'right', fontWeight: '700' }]}>Matches</Text>
          <Text style={[styles.cell, { flex: 1, textAlign: 'center', fontWeight: '700' }]}>Status</Text>
          <Text style={[styles.cell, { flex: 1, textAlign: 'center', fontWeight: '700' }]}>Actions</Text>
        </View>

        {filteredRules.map(rule => (
          <View key={rule.id} style={styles.tableRow}>
            <Text style={[styles.cell, styles.monoText, { flex: 0.8, textAlign: 'center' }]}>P{rule.priority}</Text>
            <View style={{ flex: 4 }}>
              <Text style={[styles.cell, styles.monoText, { color: colors.primaryNavy, fontWeight: '600' }]}>
                {rule.pattern}
              </Text>
            </View>
            <Text style={[styles.cell, { flex: 2, fontWeight: '700' }]}>{rule.category}</Text>
            <Text style={[styles.cell, { flex: 1.5, color: colors.textSecondary }]}>{rule.department}</Text>
            <Text style={[styles.cell, styles.monoText, { flex: 1, textAlign: 'right', fontWeight: '700' }]}>
              {rule.matchCount}
            </Text>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <TouchableOpacity
                onPress={() => updateRule(rule.id, { isActive: !rule.isActive })}
                style={[styles.statusPill, rule.isActive ? styles.statusActive : styles.statusInactive]}
              >
                <Text style={[styles.statusPillText, rule.isActive ? { color: colors.creditText } : { color: colors.textMuted }]}>
                  {rule.isActive ? 'Active' : 'Disabled'}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', gap: 3 }}>
              <TouchableOpacity
                style={styles.iconBtnSm}
                onPress={() => {
                  setEditingRule(rule);
                  setFormData({
                    pattern: rule.pattern,
                    category: rule.category,
                    department: rule.department,
                    isRegex: rule.isRegex,
                    priority: rule.priority,
                    isActive: rule.isActive,
                  });
                }}
              >
                <Edit3 size={11} color={colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconBtnSm}
                onPress={() => {
                  if (confirm(`Delete rule for ${rule.pattern}?`)) {
                    deleteRule(rule.id);
                  }
                }}
              >
                <Trash2 size={11} color={colors.debitText} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {/* Add / Edit Rule Modal */}
      <Modal
        isOpen={isAddModalOpen || !!editingRule}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingRule(null);
        }}
        title={editingRule ? 'Edit Automation Rule' : 'Create Automatic Categorization Rule'}
        subtitle="Match payee descriptions to standard Indian chart of accounts"
        size="md"
        footer={
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => {
                setIsAddModalOpen(false);
                setEditingRule(null);
              }}
            >
              <Text style={styles.secondaryBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleSaveRule}
            >
              <Text style={styles.primaryBtnText}>{editingRule ? 'Save Rule' : 'Create Rule'}</Text>
            </TouchableOpacity>
          </View>
        }
      >
        <View style={{ gap: 10 }}>
          <View>
            <Text style={styles.formLabel}>Merchant Pattern (Pipe separated) *</Text>
            <TextInput
              style={[styles.input, styles.monoText]}
              placeholder="e.g. AWS INDIA|AMAZON WEB SERVICES"
              value={formData.pattern}
              onChangeText={v => setFormData({ ...formData, pattern: v })}
            />
          </View>

          <View style={styles.formRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.formLabel}>Target Category</Text>
              <TextInput
                style={styles.input}
                value={formData.category}
                onChangeText={v => setFormData({ ...formData, category: v as ExpenseCategory })}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.formLabel}>Target Department</Text>
              <TextInput
                style={styles.input}
                value={formData.department}
                onChangeText={v => setFormData({ ...formData, department: v as Department })}
              />
            </View>
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
  sandboxCard: {
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: 4,
    padding: 12,
    gap: 8,
  },
  sandboxTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: colors.textSecondary,
  },
  sandboxGrid: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  sandboxInput: {
    flex: 1.4,
    minWidth: 260,
    height: 30,
    backgroundColor: colors.bgSurfaceSubtle,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: 3,
    paddingHorizontal: 8,
    fontSize: 11.5,
    color: colors.textPrimary,
    fontFamily: 'Roboto Mono, monospace',
  },
  matchOutcome: {
    flex: 1,
    minWidth: 240,
    padding: 7,
    backgroundColor: colors.bgSurfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 3,
  },
  matchText: {
    fontSize: 11,
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
  statusPill: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 2,
    borderWidth: 1,
  },
  statusActive: {
    backgroundColor: colors.creditBg,
    borderColor: colors.creditBorder,
  },
  statusInactive: {
    backgroundColor: colors.neutralPillBg,
    borderColor: colors.neutralPillBorder,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  iconBtnSm: {
    padding: 3,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  formRow: {
    flexDirection: 'row',
    gap: 8,
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
