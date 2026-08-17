import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Building2, Search, Plus, CheckCircle, ExternalLink } from 'lucide-react-native';
import { useFinance } from '../../../context/FinanceContext';
import { Vendor, ExpenseCategory, Department } from '../../../types/finance';
import { Badge } from '../../common/Badge';
import { Modal } from '../../common/Modal';
import { formatCurrency } from '../../../utils/currency';
import { colors } from '../../../theme/colors';

export const VendorModule: React.FC = () => {
  const { vendors, addVendor, payVendor } = useFinance();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [payingVendor, setPayingVendor] = useState<Vendor | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  const initialForm = {
    name: '',
    category: 'Cloud services' as ExpenseCategory,
    department: 'Engineering' as Department,
    contactEmail: '',
    paymentTerms: 'Net 30' as 'Net 15' | 'Net 30' | 'Net 60' | 'Monthly Auto-Debit' | 'Due on Receipt',
    outstandingBalance: '',
    contractRenewalDate: '2027-01-15',
    gstin: '29AABCU9603R1ZM',
    pan: 'AABCU9603R',
    tdsApplicable: true,
    tdsRate: 10,
    msmeRegistered: false,
    paymentMethod: 'Corporate Card - HDFC 4821',
  };
  const [formData, setFormData] = useState(initialForm);

  const filteredVendors = vendors.filter(v => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      v.name.toLowerCase().includes(q) ||
      v.gstin.toLowerCase().includes(q) ||
      v.pan.toLowerCase().includes(q) ||
      v.category.toLowerCase().includes(q)
    );
  });

  const totalOutstanding = vendors.reduce((sum, v) => sum + v.outstandingBalance, 0);
  const totalYtd = vendors.reduce((sum, v) => sum + v.totalYtdSpend, 0);

  const handlePayVendorSubmit = () => {
    if (!payingVendor) return;
    const parsed = parseFloat(paymentAmount);
    if (isNaN(parsed) || parsed <= 0) {
      alert('Please enter a valid disbursement amount in INR (₹).');
      return;
    }
    payVendor(payingVendor.id, parsed);
    setPayingVendor(null);
    setPaymentAmount('');
  };

  const handleCreateVendor = () => {
    if (!formData.name.trim()) {
      alert('Please enter vendor name.');
      return;
    }
    addVendor({
      name: formData.name,
      category: formData.category,
      department: formData.department,
      contactEmail: formData.contactEmail || 'billing@vendor.internal',
      paymentTerms: formData.paymentTerms,
      outstandingBalance: parseFloat(formData.outstandingBalance) || 0,
      contractRenewalDate: formData.contractRenewalDate,
      gstin: formData.gstin,
      pan: formData.pan,
      tdsApplicable: formData.tdsApplicable,
      tdsRate: formData.tdsRate,
      msmeRegistered: formData.msmeRegistered,
      w9OnFile: true,
      status: 'Active',
      paymentMethod: formData.paymentMethod,
    });
    setIsAddModalOpen(false);
    setFormData(initialForm);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 14, gap: 12 }}>
      {/* Title Ribbon */}
      <View style={styles.titleRibbon}>
        <View>
          <Text style={styles.pageTitle}>Vendor Management & Accounts Payable (AP) (₹)</Text>
          <Text style={styles.pageSubtitle}>
            Commercial contracts, GSTIN / PAN records, Section 194J/194C TDS tracking, and Net-30 AP settlements.
          </Text>
        </View>

        <View style={styles.actionGroup}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => setIsAddModalOpen(true)}
          >
            <Plus size={13} color="#fff" />
            <Text style={styles.primaryBtnText}>+ Add Vendor</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* KPI Ribbon */}
      <View style={styles.kpiStrip}>
        <View>
          <Text style={styles.kpiLabel}>Total AP Liabilities Outstanding (₹)</Text>
          <Text style={[styles.kpiVal, styles.monoText, { color: colors.debitText }]}>
            {formatCurrency(totalOutstanding)}
          </Text>
        </View>
        <View>
          <Text style={styles.kpiLabel}>Total YTD Spend (₹)</Text>
          <Text style={[styles.kpiVal, styles.monoText]}>{formatCurrency(totalYtd)}</Text>
        </View>
        <View>
          <Text style={styles.kpiLabel}>Active Commercial Vendors</Text>
          <Text style={[styles.kpiVal, styles.monoText]}>{vendors.length} Contractors & SaaS</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Search size={14} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search vendor name, GSTIN, PAN, category..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Vendor Table */}
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.cell, { flex: 3.2, fontWeight: '700' }]}>Vendor / Supplier Name</Text>
          <Text style={[styles.cell, { flex: 2, fontWeight: '700' }]}>Category / Dept</Text>
          <Text style={[styles.cell, { flex: 2, fontWeight: '700' }]}>GSTIN / PAN</Text>
          <Text style={[styles.cell, { flex: 1.6, fontWeight: '700' }]}>Payment Terms</Text>
          <Text style={[styles.cell, { flex: 1.8, textAlign: 'right', fontWeight: '700' }]}>Outstanding (₹)</Text>
          <Text style={[styles.cell, { flex: 1.8, textAlign: 'right', fontWeight: '700' }]}>YTD Spend (₹)</Text>
          <Text style={[styles.cell, { flex: 1.4, textAlign: 'center', fontWeight: '700' }]}>AP Settlement</Text>
        </View>

        {filteredVendors.map(v => (
          <View key={v.id} style={styles.tableRow}>
            <View style={{ flex: 3.2 }}>
              <Text style={[styles.cell, { fontWeight: '700' }]}>{v.name}</Text>
              <Text style={{ fontSize: 9.5, color: colors.textMuted }}>{v.contactEmail}</Text>
            </View>
            <View style={{ flex: 2 }}>
              <Text style={[styles.cell, { fontWeight: '600' }]}>{v.category}</Text>
              <Text style={{ fontSize: 9.5, color: colors.textMuted }}>{v.department}</Text>
            </View>
            <View style={{ flex: 2 }}>
              <Text style={[styles.cell, styles.monoText, { fontSize: 10 }]}>{v.gstin}</Text>
              <Text style={[styles.monoText, { fontSize: 9.5, color: colors.textMuted }]}>
                PAN: {v.pan} {v.tdsApplicable ? `• TDS ${v.tdsRate}%` : ''}
              </Text>
            </View>
            <View style={{ flex: 1.6 }}>
              <Text style={[styles.cell]}>{v.paymentTerms}</Text>
              <Text style={{ fontSize: 9.5, color: colors.textMuted }}>Ren: {v.contractRenewalDate}</Text>
            </View>
            <Text
              style={[
                styles.cell,
                styles.monoText,
                { flex: 1.8, textAlign: 'right', fontWeight: '700', color: v.outstandingBalance > 0 ? colors.debitText : colors.textMuted },
              ]}
            >
              {formatCurrency(v.outstandingBalance)}
            </Text>
            <Text style={[styles.cell, styles.monoText, { flex: 1.8, textAlign: 'right' }]}>
              {formatCurrency(v.totalYtdSpend)}
            </Text>
            <View style={{ flex: 1.4, flexDirection: 'row', justifyContent: 'center' }}>
              {v.outstandingBalance > 0 ? (
                <TouchableOpacity
                  style={styles.payBtn}
                  onPress={() => {
                    setPayingVendor(v);
                    setPaymentAmount(v.outstandingBalance.toString());
                  }}
                >
                  <Text style={styles.payBtnText}>Pay Bill</Text>
                </TouchableOpacity>
              ) : (
                <Text style={{ fontSize: 10.5, color: colors.creditText, fontWeight: '700' }}>✓ Settled</Text>
              )}
            </View>
          </View>
        ))}
      </View>

      {/* Pay Vendor Modal */}
      <Modal
        isOpen={!!payingVendor}
        onClose={() => setPayingVendor(null)}
        title={`Disburse AP Payment: ${payingVendor?.name}`}
        subtitle="Settle outstanding vendor liabilities via HDFC / ICICI direct RTGS"
        size="md"
        footer={
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => setPayingVendor(null)}
            >
              <Text style={styles.secondaryBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handlePayVendorSubmit}
            >
              <Text style={styles.primaryBtnText}>Execute Payment (₹)</Text>
            </TouchableOpacity>
          </View>
        }
      >
        <View style={{ gap: 10 }}>
          <View>
            <Text style={styles.formLabel}>Payment Amount (₹ INR) *</Text>
            <TextInput
              style={[styles.input, styles.monoText]}
              value={paymentAmount}
              keyboardType="numeric"
              onChangeText={setPaymentAmount}
            />
          </View>
          <View>
            <Text style={styles.formLabel}>Disbursement Channel</Text>
            <TextInput
              style={styles.input}
              value={payingVendor?.paymentMethod}
              editable={false}
            />
          </View>
        </View>
      </Modal>

      {/* Add Vendor Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Commercial Vendor / Contractor"
        subtitle="Register vendor with Indian GSTIN, PAN, and TDS rate"
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
              onPress={handleCreateVendor}
            >
              <Text style={styles.primaryBtnText}>Save Vendor</Text>
            </TouchableOpacity>
          </View>
        }
      >
        <View style={{ gap: 10 }}>
          <View>
            <Text style={styles.formLabel}>Vendor Legal Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Amazon Web Services India Pvt Ltd"
              value={formData.name}
              onChangeText={v => setFormData({ ...formData, name: v })}
            />
          </View>
          <View style={styles.formRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.formLabel}>GSTIN *</Text>
              <TextInput
                style={[styles.input, styles.monoText]}
                placeholder="29AABCU9603R1ZM"
                value={formData.gstin}
                onChangeText={v => setFormData({ ...formData, gstin: v })}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.formLabel}>PAN *</Text>
              <TextInput
                style={[styles.input, styles.monoText]}
                placeholder="AABCU9603R"
                value={formData.pan}
                onChangeText={v => setFormData({ ...formData, pan: v })}
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: 3,
    paddingHorizontal: 8,
    height: 28,
  },
  searchInput: {
    flex: 1,
    fontSize: 11.5,
    color: colors.textPrimary,
    marginLeft: 6,
    outlineStyle: 'none' as any,
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
  payBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: colors.primaryNavy,
    borderRadius: 2,
  },
  payBtnText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
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
