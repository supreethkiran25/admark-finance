import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { FileText, Plus, Eye, Printer, Search, Download } from 'lucide-react-native';
import { useFinance } from '../../../context/FinanceContext';
import { Invoice, InvoiceType, InvoiceLineItem } from '../../../types/finance';
import { Badge } from '../../common/Badge';
import { Modal } from '../../common/Modal';
import { formatCurrency } from '../../../utils/currency';
import { formatDate } from '../../../utils/date';
import { colors } from '../../../theme/colors';

export const InvoiceModule: React.FC = () => {
  const { invoices, addInvoice, updateInvoiceStatus } = useFinance();

  const [activeTab, setActiveTab] = useState<'AR' | 'AP'>('AR');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Invoice Form
  const [invoiceType, setInvoiceType] = useState<InvoiceType>('Accounts Receivable');
  const [partyName, setPartyName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [gstin, setGstin] = useState('29AABCA8819Q1ZM');
  const [placeOfSupply, setPlaceOfSupply] = useState('Karnataka (29)');
  const [dueDate, setDueDate] = useState('2026-09-15');
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([
    { id: 'li-1', description: 'Enterprise Software & DevOps Architecture Milestone', hsnSacCode: '998314', quantity: 1, unitPrice: 500000, total: 500000 },
  ]);

  const filteredInvoices = invoices.filter(inv => {
    if (activeTab === 'AR' && inv.type !== 'Accounts Receivable') return false;
    if (activeTab === 'AP' && inv.type !== 'Accounts Payable') return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      inv.invoiceNumber.toLowerCase().includes(q) ||
      inv.partyName.toLowerCase().includes(q) ||
      inv.gstin.toLowerCase().includes(q)
    );
  });

  const totalARReceivable = invoices
    .filter(i => i.type === 'Accounts Receivable' && i.status !== 'Paid')
    .reduce((sum, i) => sum + i.amount, 0);

  const totalAPPayable = invoices
    .filter(i => i.type === 'Accounts Payable' && i.status !== 'Paid')
    .reduce((sum, i) => sum + i.amount, 0);

  const handleSaveInvoice = () => {
    if (!partyName.trim()) {
      alert('Please enter party name.');
      return;
    }
    const subtotal = lineItems.reduce((sum, li) => sum + li.total, 0);
    const isInterState = placeOfSupply.includes('27') || placeOfSupply.includes('07'); // Not Karnataka 29
    const cgst = isInterState ? 0 : subtotal * 0.09;
    const sgst = isInterState ? 0 : subtotal * 0.09;
    const igst = isInterState ? subtotal * 0.18 : 0;
    const tax = cgst + sgst + igst;
    const gross = subtotal + tax;

    addInvoice({
      invoiceNumber: `INV-2026-GST-${Math.floor(100 + Math.random() * 900)}`,
      type: invoiceType,
      partyName,
      contactEmail: contactEmail || 'accounts@client.in',
      gstin,
      placeOfSupply,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate,
      amount: gross,
      subtotal,
      cgstAmount: cgst,
      sgstAmount: sgst,
      igstAmount: igst,
      taxAmount: tax,
      status: 'Sent',
      lineItems,
      notes: 'Payment via NEFT/RTGS to HDFC Bank Commercial Account #5020008819201. IFSC: HDFC0000184. Net 30 terms.',
      pdfGenerated: true,
    });

    setIsAddModalOpen(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 14, gap: 12 }}>
      {/* Title Ribbon */}
      <View style={styles.titleRibbon}>
        <View>
          <Text style={styles.pageTitle}>GST Tax Invoices & Commercial Billings (₹ INR)</Text>
          <Text style={styles.pageSubtitle}>
            Accounts Receivable (Client Retainers) & Accounts Payable with HSN/SAC 998314 and CGST/SGST/IGST breakdown.
          </Text>
        </View>

        <View style={styles.actionGroup}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => setIsAddModalOpen(true)}
          >
            <Plus size={13} color="#fff" />
            <Text style={styles.primaryBtnText}>+ Create Tax Invoice</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* KPI Ribbon */}
      <View style={styles.kpiStrip}>
        <View>
          <Text style={styles.kpiLabel}>Outstanding Accounts Receivable (AR)</Text>
          <Text style={[styles.kpiVal, styles.monoText, { color: colors.creditText }]}>
            {formatCurrency(totalARReceivable)}
          </Text>
        </View>
        <View>
          <Text style={styles.kpiLabel}>Outstanding Accounts Payable (AP)</Text>
          <Text style={[styles.kpiVal, styles.monoText, { color: colors.debitText }]}>
            {formatCurrency(totalAPPayable)}
          </Text>
        </View>
        <View>
          <Text style={styles.kpiLabel}>SAC Code (IT Services)</Text>
          <Text style={[styles.kpiVal, styles.monoText]}>998314 (18% GST)</Text>
        </View>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'AR' && styles.tabActive]}
          onPress={() => setActiveTab('AR')}
        >
          <Text style={[styles.tabText, activeTab === 'AR' && styles.tabTextActive]}>
            Client Invoices (AR)
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'AP' && styles.tabActive]}
          onPress={() => setActiveTab('AP')}
        >
          <Text style={[styles.tabText, activeTab === 'AP' && styles.tabTextActive]}>
            Vendor Bills (AP)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Invoice Table */}
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.cell, { flex: 1.6, fontWeight: '700' }]}>Invoice #</Text>
          <Text style={[styles.cell, { flex: 3, fontWeight: '700' }]}>Client / Vendor Party</Text>
          <Text style={[styles.cell, { flex: 1.8, fontWeight: '700' }]}>GSTIN / State</Text>
          <Text style={[styles.cell, { flex: 1.2, fontWeight: '700' }]}>Due Date</Text>
          <Text style={[styles.cell, { flex: 1.8, textAlign: 'right', fontWeight: '700' }]}>Taxable (₹)</Text>
          <Text style={[styles.cell, { flex: 1.8, textAlign: 'right', fontWeight: '700' }]}>Gross Total (₹)</Text>
          <Text style={[styles.cell, { flex: 1.2, textAlign: 'center', fontWeight: '700' }]}>Status</Text>
          <Text style={[styles.cell, { flex: 1.2, textAlign: 'center', fontWeight: '700' }]}>Formal View</Text>
        </View>

        {filteredInvoices.map(inv => (
          <View key={inv.id} style={styles.tableRow}>
            <Text style={[styles.cell, styles.monoText, { flex: 1.6, fontWeight: '700', color: colors.primaryNavy }]}>
              {inv.invoiceNumber}
            </Text>
            <View style={{ flex: 3 }}>
              <Text style={[styles.cell, { fontWeight: '700' }]}>{inv.partyName}</Text>
              <Text style={{ fontSize: 9.5, color: colors.textMuted }}>{inv.contactEmail}</Text>
            </View>
            <View style={{ flex: 1.8 }}>
              <Text style={[styles.cell, styles.monoText, { fontSize: 10 }]}>{inv.gstin}</Text>
              <Text style={{ fontSize: 9.5, color: colors.textMuted }}>{inv.placeOfSupply}</Text>
            </View>
            <Text style={[styles.cell, styles.monoText, { flex: 1.2 }]}>{formatDate(inv.dueDate)}</Text>
            <Text style={[styles.cell, styles.monoText, { flex: 1.8, textAlign: 'right' }]}>
              {formatCurrency(inv.subtotal)}
            </Text>
            <Text style={[styles.cell, styles.monoText, { flex: 1.8, textAlign: 'right', fontWeight: '700' }]}>
              {formatCurrency(inv.amount)}
            </Text>
            <View style={{ flex: 1.2, alignItems: 'center' }}>
              <Badge status={inv.status} size="sm" />
            </View>
            <View style={{ flex: 1.2, flexDirection: 'row', justifyContent: 'center' }}>
              <TouchableOpacity
                style={styles.iconBtnSm}
                onPress={() => setSelectedInvoice(inv)}
              >
                <Eye size={12} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      {/* Formal Tax Invoice Printable Modal */}
      <Modal
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        title={`Tax Invoice: ${selectedInvoice?.invoiceNumber}`}
        subtitle="Formal Indian GST Compliant Invoice with HSN/SAC breakdown"
        size="xl"
        footer={
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => alert('Printing standard PDF tax invoice...')}
            >
              <Printer size={12} color="#fff" />
              <Text style={styles.primaryBtnText}>Print / Export PDF</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => setSelectedInvoice(null)}
            >
              <Text style={styles.secondaryBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        }
      >
        {selectedInvoice && (
          <View style={styles.taxInvoiceDoc}>
            {/* Header */}
            <View style={styles.docHeader}>
              <View>
                <Text style={styles.docCompany}>ADMARK FINANCIAL & SOFTWARE OPS PVT LTD</Text>
                <Text style={styles.docAddress}>100ft Road, Indiranagar, Bangalore, Karnataka - 560038</Text>
                <Text style={styles.docAddress}>GSTIN: 29AABCU9603R1ZM • PAN: AABCU9603R</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.docTaxTitle}>TAX INVOICE</Text>
                <Text style={[styles.monoText, { fontSize: 11, fontWeight: '700' }]}>{selectedInvoice.invoiceNumber}</Text>
                <Text style={[styles.monoText, { fontSize: 10, color: colors.textMuted }]}>Date: {selectedInvoice.issueDate}</Text>
              </View>
            </View>

            {/* Bill To */}
            <View style={styles.billToSection}>
              <Text style={{ fontSize: 10.5, fontWeight: '700', textTransform: 'uppercase', color: colors.textMuted }}>
                Billed To Client:
              </Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textPrimary, marginTop: 2 }}>
                {selectedInvoice.partyName}
              </Text>
              <Text style={[styles.monoText, { fontSize: 11, color: colors.textSecondary }]}>
                GSTIN: {selectedInvoice.gstin} • Place of Supply: {selectedInvoice.placeOfSupply}
              </Text>
            </View>

            {/* Line Items Table */}
            <View style={styles.docTable}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.cell, { flex: 4, fontWeight: '700' }]}>Description</Text>
                <Text style={[styles.cell, { flex: 1.2, fontWeight: '700' }]}>SAC Code</Text>
                <Text style={[styles.cell, { flex: 1, textAlign: 'center', fontWeight: '700' }]}>Qty</Text>
                <Text style={[styles.cell, { flex: 1.8, textAlign: 'right', fontWeight: '700' }]}>Rate (₹)</Text>
                <Text style={[styles.cell, { flex: 1.8, textAlign: 'right', fontWeight: '700' }]}>Total (₹)</Text>
              </View>
              {selectedInvoice.lineItems.map((li, idx) => (
                <View key={idx} style={styles.tableRow}>
                  <Text style={[styles.cell, { flex: 4, fontWeight: '600' }]}>{li.description}</Text>
                  <Text style={[styles.cell, styles.monoText, { flex: 1.2 }]}>{li.hsnSacCode || '998314'}</Text>
                  <Text style={[styles.cell, styles.monoText, { flex: 1, textAlign: 'center' }]}>{li.quantity}</Text>
                  <Text style={[styles.cell, styles.monoText, { flex: 1.8, textAlign: 'right' }]}>{formatCurrency(li.unitPrice)}</Text>
                  <Text style={[styles.cell, styles.monoText, { flex: 1.8, textAlign: 'right', fontWeight: '700' }]}>{formatCurrency(li.total)}</Text>
                </View>
              ))}
            </View>

            {/* Tax Computation Summary */}
            <View style={styles.taxSummary}>
              <View style={styles.taxRow}>
                <Text style={styles.taxLabel}>Taxable Subtotal:</Text>
                <Text style={[styles.taxVal, styles.monoText]}>{formatCurrency(selectedInvoice.subtotal)}</Text>
              </View>
              {selectedInvoice.cgstAmount > 0 && (
                <View style={styles.taxRow}>
                  <Text style={styles.taxLabel}>CGST @ 9%:</Text>
                  <Text style={[styles.taxVal, styles.monoText]}>+{formatCurrency(selectedInvoice.cgstAmount)}</Text>
                </View>
              )}
              {selectedInvoice.sgstAmount > 0 && (
                <View style={styles.taxRow}>
                  <Text style={styles.taxLabel}>SGST @ 9%:</Text>
                  <Text style={[styles.taxVal, styles.monoText]}>+{formatCurrency(selectedInvoice.sgstAmount)}</Text>
                </View>
              )}
              {selectedInvoice.igstAmount > 0 && (
                <View style={styles.taxRow}>
                  <Text style={styles.taxLabel}>IGST @ 18% (Inter-state):</Text>
                  <Text style={[styles.taxVal, styles.monoText]}>+{formatCurrency(selectedInvoice.igstAmount)}</Text>
                </View>
              )}
              <View style={[styles.taxRow, { borderTopWidth: 1, borderTopColor: colors.borderDefault, paddingTop: 4 }]}>
                <Text style={[styles.taxLabel, { fontWeight: '800', color: colors.primaryNavy }]}>Total Amount Payable (INR):</Text>
                <Text style={[styles.taxVal, styles.monoText, { fontWeight: '800', fontSize: 13, color: colors.primaryNavy }]}>
                  {formatCurrency(selectedInvoice.amount)}
                </Text>
              </View>
            </View>

            <View style={{ marginTop: 10, padding: 8, backgroundColor: colors.bgSurfaceAlt, borderRadius: 2 }}>
              <Text style={{ fontSize: 10, color: colors.textMuted }}>{selectedInvoice.notes}</Text>
            </View>
          </View>
        )}
      </Modal>

      {/* Create Invoice Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create GST Tax Invoice (₹)"
        subtitle="Generate client retainer milestone invoice with SAC 998314"
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
              onPress={handleSaveInvoice}
            >
              <Text style={styles.primaryBtnText}>Issue Invoice</Text>
            </TouchableOpacity>
          </View>
        }
      >
        <View style={{ gap: 10 }}>
          <View>
            <Text style={styles.formLabel}>Client / Party Legal Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Aether FinTech India Pvt Ltd"
              value={partyName}
              onChangeText={setPartyName}
            />
          </View>
          <View style={styles.formRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.formLabel}>Client GSTIN *</Text>
              <TextInput
                style={[styles.input, styles.monoText]}
                value={gstin}
                onChangeText={setGstin}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.formLabel}>Place of Supply</Text>
              <TextInput
                style={styles.input}
                value={placeOfSupply}
                onChangeText={setPlaceOfSupply}
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
  iconBtnSm: {
    padding: 3,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  taxInvoiceDoc: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: 3,
    padding: 16,
    backgroundColor: colors.bgSurface,
    gap: 12,
  },
  docHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
    paddingBottom: 10,
  },
  docCompany: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primaryNavy,
  },
  docAddress: {
    fontSize: 10.5,
    color: colors.textMuted,
    marginTop: 2,
  },
  docTaxTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primaryNavy,
    letterSpacing: 0.5,
  },
  billToSection: {
    backgroundColor: colors.bgSurfaceAlt,
    padding: 8,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  docTable: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: 2,
    overflow: 'hidden',
  },
  taxSummary: {
    alignSelf: 'flex-end',
    width: 280,
    gap: 4,
  },
  taxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  taxLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  taxVal: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textPrimary,
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
