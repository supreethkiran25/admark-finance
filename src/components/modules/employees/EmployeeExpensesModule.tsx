import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Plus, Check, X, UserCheck, FileSpreadsheet, Search } from 'lucide-react-native';
import { useFinance } from '../../../context/FinanceContext';
import { EmployeeExpenseClaim, Department, ReimbursementType } from '../../../types/finance';
import { Badge } from '../../common/Badge';
import { Modal } from '../../common/Modal';
import { formatCurrency } from '../../../utils/currency';
import { formatDate } from '../../../utils/date';
import { colors } from '../../../theme/colors';

export const EmployeeExpensesModule: React.FC = () => {
  const { claims, addClaim, approveClaim, rejectClaim } = useFinance();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const initialForm = {
    employeeName: 'Sarah Chen',
    employeeEmail: 'sarah.chen@agency.internal',
    employeeRole: 'Lead Architect',
    department: 'Engineering' as Department,
    claimType: 'Travel Reimbursement' as ReimbursementType,
    amount: '',
    description: '',
    receiptFileName: 'Air_Invoice_Attached.pdf',
  };
  const [formData, setFormData] = useState(initialForm);

  const claimTypes: ReimbursementType[] = [
    'Travel Reimbursement',
    'Client Meeting',
    'Internet & WFH',
    'Equipment Purchase',
    'Food & Per Diem',
  ];

  const filteredClaims = claims.filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.employeeName.toLowerCase().includes(q) ||
      c.claimNumber.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.department.toLowerCase().includes(q)
    );
  });

  const totalSubmitted = claims
    .filter(c => c.status === 'Submitted')
    .reduce((sum, c) => sum + c.amount, 0);

  const handleSaveClaim = () => {
    const parsedAmount = parseFloat(formData.amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid amount in INR (₹).');
      return;
    }
    if (!formData.description.trim()) {
      alert('Please enter a claim description.');
      return;
    }

    addClaim({
      employeeName: formData.employeeName,
      employeeEmail: formData.employeeEmail,
      employeeRole: formData.employeeRole,
      department: formData.department,
      date: new Date().toISOString().split('T')[0],
      claimType: formData.claimType,
      amount: parsedAmount,
      receiptAttached: true,
      receiptFileName: formData.receiptFileName,
      status: 'Submitted',
      description: formData.description,
    });

    setIsAddModalOpen(false);
    setFormData(initialForm);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 14, gap: 12 }}>
      {/* Title Ribbon */}
      <View style={styles.titleRibbon}>
        <View>
          <Text style={styles.pageTitle}>Employee Reimbursement & Claims Queue (INR - ₹)</Text>
          <Text style={styles.pageSubtitle}>
            IndiGo travel, WFH internet allowances, client entertainment, and hardware allowance disbursements.
          </Text>
        </View>

        <View style={styles.actionGroup}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => setIsAddModalOpen(true)}
          >
            <Plus size={13} color="#fff" />
            <Text style={styles.primaryBtnText}>+ Submit Claim (₹)</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Summary Ribbon */}
      <View style={styles.summaryRibbon}>
        <View>
          <Text style={styles.summaryLabel}>Pending COO Approval Queue</Text>
          <Text style={[styles.summaryVal, styles.monoText]}>{formatCurrency(totalSubmitted)}</Text>
        </View>
        <View>
          <Text style={styles.summaryLabel}>Total Claims Filed</Text>
          <Text style={[styles.summaryVal, styles.monoText]}>{claims.length} Records</Text>
        </View>
        <View>
          <Text style={styles.summaryLabel}>Disbursement Mode</Text>
          <Text style={[styles.summaryVal, { fontSize: 12, color: colors.textSecondary }]}>
            RazorpayX / HDFC Direct Clearing
          </Text>
        </View>
      </View>

      {/* Claims Table */}
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.cell, { flex: 1.2, fontWeight: '700' }]}>Claim #</Text>
          <Text style={[styles.cell, { flex: 1.1, fontWeight: '700' }]}>Date</Text>
          <Text style={[styles.cell, { flex: 2.2, fontWeight: '700' }]}>Employee</Text>
          <Text style={[styles.cell, { flex: 1.8, fontWeight: '700' }]}>Claim Type</Text>
          <Text style={[styles.cell, { flex: 3.2, fontWeight: '700' }]}>Description / Justification</Text>
          <Text style={[styles.cell, { flex: 1.6, textAlign: 'right', fontWeight: '700' }]}>Amount (₹)</Text>
          <Text style={[styles.cell, { flex: 1.2, textAlign: 'center', fontWeight: '700' }]}>Status</Text>
          <Text style={[styles.cell, { flex: 1.4, textAlign: 'center', fontWeight: '700' }]}>COO Approval</Text>
        </View>

        {filteredClaims.map(c => {
          const isPending = c.status === 'Submitted';
          return (
            <View key={c.id} style={styles.tableRow}>
              <Text style={[styles.cell, styles.monoText, { flex: 1.2, color: colors.textMuted }]}>
                {c.claimNumber}
              </Text>
              <Text style={[styles.cell, styles.monoText, { flex: 1.1 }]}>{formatDate(c.date)}</Text>
              <View style={{ flex: 2.2 }}>
                <Text style={[styles.cell, { fontWeight: '700' }]}>{c.employeeName}</Text>
                <Text style={{ fontSize: 9.5, color: colors.textMuted }}>{c.employeeRole}</Text>
              </View>
              <Text style={[styles.cell, { flex: 1.8, color: colors.textSecondary }]}>{c.claimType}</Text>
              <View style={{ flex: 3.2 }}>
                <Text style={[styles.cell]} numberOfLines={1}>
                  {c.description}
                </Text>
                {c.receiptFileName && (
                  <Text style={[styles.monoText, { fontSize: 9.5, color: colors.creditText }]}>
                    📄 {c.receiptFileName}
                  </Text>
                )}
              </View>
              <Text style={[styles.cell, styles.monoText, { flex: 1.6, textAlign: 'right', fontWeight: '700' }]}>
                {formatCurrency(c.amount)}
              </Text>
              <View style={{ flex: 1.2, alignItems: 'center' }}>
                <Badge status={c.status} size="sm" />
              </View>
              <View style={{ flex: 1.4, flexDirection: 'row', justifyContent: 'center', gap: 4 }}>
                {isPending ? (
                  <>
                    <TouchableOpacity
                      style={styles.approveBtn}
                      onPress={() => approveClaim(c.id)}
                    >
                      <Check size={11} color="#fff" />
                      <Text style={styles.approveBtnText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.rejectBtn}
                      onPress={() => rejectClaim(c.id)}
                    >
                      <X size={11} color={colors.debitText} />
                    </TouchableOpacity>
                  </>
                ) : (
                  <Text style={{ fontSize: 10.5, color: colors.textMuted }}>
                    {c.status === 'Approved' ? '✓ Approved' : c.status}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>

      {/* New Claim Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Submit Employee Reimbursement Claim (₹)"
        subtitle="Claim for travel, client hospitality, home broadband or equipment"
        size="md"
        footer={
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => setIsAddModalOpen(false)}
            >
              <Text style={styles.secondaryBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleSaveClaim}
            >
              <Text style={styles.primaryBtnText}>Submit Claim</Text>
            </TouchableOpacity>
          </View>
        }
      >
        <View style={{ gap: 10 }}>
          <View style={styles.formRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.formLabel}>Employee Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.employeeName}
                onChangeText={v => setFormData({ ...formData, employeeName: v })}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.formLabel}>Amount (₹ INR) *</Text>
              <TextInput
                style={[styles.input, styles.monoText]}
                placeholder="0.00"
                keyboardType="numeric"
                value={formData.amount}
                onChangeText={v => setFormData({ ...formData, amount: v })}
              />
            </View>
          </View>

          <View>
            <Text style={styles.formLabel}>Claim Type *</Text>
            <TextInput
              style={styles.input}
              value={formData.claimType}
              onChangeText={v => setFormData({ ...formData, claimType: v as ReimbursementType })}
            />
          </View>

          <View>
            <Text style={styles.formLabel}>Description / Business Purpose *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Roundtrip IndiGo flights for client architectural kickoff"
              value={formData.description}
              onChangeText={v => setFormData({ ...formData, description: v })}
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
  summaryRibbon: {
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: 4,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 10,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  summaryVal: {
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
  approveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: colors.creditText,
    borderRadius: 2,
  },
  approveBtnText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  rejectBtn: {
    padding: 2,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: colors.debitBorder,
    backgroundColor: colors.debitBg,
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
