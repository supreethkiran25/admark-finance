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
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  RefreshCw,
  Plus,
  Check,
  Search,
} from 'lucide-react-native';
import { useFinance } from '../../../context/FinanceContext';
import { Badge } from '../../common/Badge';
import { Modal } from '../../common/Modal';
import { formatCurrency } from '../../../utils/currency';
import { formatDate } from '../../../utils/date';
import { parseBankStatementCSV } from '../../../utils/csvParser';
import { SAMPLE_RAW_CSV_STRING } from '../../../data/bankStatementSamples';
import { colors } from '../../../theme/colors';

export const BankStatementModule: React.FC = () => {
  const {
    statements,
    transactions,
    importBankStatement,
    reconcileTransaction,
    autoReconcileAll,
    createExpenseFromTransaction,
  } = useFinance();

  const [selectedStatementId, setSelectedStatementId] = useState<string>(
    statements[0]?.id || ''
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);

  const activeStatement = statements.find(s => s.id === selectedStatementId) || statements[0];

  const statementTransactions = transactions.filter(
    t => !selectedStatementId || t.statementId === selectedStatementId
  );

  const filteredTransactions = statementTransactions.filter(tx => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        tx.merchant.toLowerCase().includes(q) ||
        tx.referenceNumber.toLowerCase().includes(q) ||
        tx.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const matchedCount = statementTransactions.filter(
    t => t.reconciliationStatus === 'Matched' || t.reconciliationStatus === 'Auto-Reconciled'
  ).length;
  const unmatchedCount = statementTransactions.filter(
    t => t.reconciliationStatus === 'Unmatched'
  ).length;
  const reconcilePct = statementTransactions.length > 0
    ? (matchedCount / statementTransactions.length) * 100
    : 100;

  const handleLoadSampleHDFC = () => {
    const result = parseBankStatementCSV(SAMPLE_RAW_CSV_STRING);
    const totalDebits = result.transactions.reduce((sum, t) => sum + t.debitAmount, 0);
    const totalCredits = result.transactions.reduce((sum, t) => sum + t.creditAmount, 0);

    importBankStatement(
      {
        fileName: 'HDFC_Commercial_Current_Live_Sync.csv',
        bankName: 'HDFC Bank Ltd (Commercial Corporate)',
        accountNumber: '•••• •••• 9201 (Current Operating)',
        ifscCode: 'HDFC0000184',
        periodStart: '2026-08-01',
        periodEnd: '2026-08-16',
        openingBalance: 12459000.20,
        closingBalance: 14285500.42,
        totalDebits,
        totalCredits,
      },
      result.transactions
    );
    setIsUploadModalOpen(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 14, gap: 12 }}>
      {/* Header Bar */}
      <View style={styles.titleRibbon}>
        <View>
          <Text style={styles.pageTitle}>HDFC / ICICI Bank Statement Import & Reconciliation (₹)</Text>
          <Text style={styles.pageSubtitle}>
            Parse NEFT/RTGS/IMPS/UPI feeds, match with general ledger, and auto-generate missing ledger entries.
          </Text>
        </View>

        <View style={styles.actionGroup}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => autoReconcileAll()}
          >
            <RefreshCw size={13} color="#fff" />
            <Text style={styles.primaryBtnText}>1-Click Auto Reconcile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => setIsUploadModalOpen(true)}
          >
            <Upload size={13} color={colors.textPrimary} />
            <Text style={styles.secondaryBtnText}>+ Import Statement</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Statement Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryTitle}>
            Active Statement: {activeStatement?.bankName} ({activeStatement?.fileName})
          </Text>
          <View style={styles.pctBadge}>
            <Text style={[styles.pctText, { color: reconcilePct === 100 ? colors.creditText : colors.pendingText }]}>
              {reconcilePct.toFixed(1)}% Reconciled ({matchedCount}/{statementTransactions.length})
            </Text>
          </View>
        </View>

        {activeStatement && (
          <View style={styles.statGrid}>
            <View>
              <Text style={styles.statLabel}>Opening Balance</Text>
              <Text style={[styles.statVal, styles.monoText]}>{formatCurrency(activeStatement.openingBalance)}</Text>
            </View>
            <View>
              <Text style={styles.statLabel}>Total Debits (Out)</Text>
              <Text style={[styles.statVal, styles.monoText, { color: colors.debitText }]}>
                -{formatCurrency(activeStatement.totalDebits)}
              </Text>
            </View>
            <View>
              <Text style={styles.statLabel}>Total Credits (In)</Text>
              <Text style={[styles.statVal, styles.monoText, { color: colors.creditText }]}>
                +{formatCurrency(activeStatement.totalCredits)}
              </Text>
            </View>
            <View>
              <Text style={styles.statLabel}>Closing Treasury</Text>
              <Text style={[styles.statVal, styles.monoText, { color: colors.primaryNavy, fontWeight: '800' }]}>
                {formatCurrency(activeStatement.closingBalance)}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Search size={14} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search narration, reference number, or category..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Statement Transactions Table */}
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.cell, { flex: 1.2, fontWeight: '700' }]}>Chq / Ref #</Text>
          <Text style={[styles.cell, { flex: 1.1, fontWeight: '700' }]}>Date</Text>
          <Text style={[styles.cell, { flex: 3.5, fontWeight: '700' }]}>Narration / Merchant</Text>
          <Text style={[styles.cell, { flex: 1.4, fontWeight: '700' }]}>Auto Category</Text>
          <Text style={[styles.cell, { flex: 1.6, textAlign: 'right', fontWeight: '700' }]}>Debit (₹)</Text>
          <Text style={[styles.cell, { flex: 1.6, textAlign: 'right', fontWeight: '700' }]}>Credit (₹)</Text>
          <Text style={[styles.cell, { flex: 1.2, textAlign: 'center', fontWeight: '700' }]}>Status</Text>
          <Text style={[styles.cell, { flex: 1.4, textAlign: 'center', fontWeight: '700' }]}>Action</Text>
        </View>

        {filteredTransactions.map(tx => {
          const isMatched =
            tx.reconciliationStatus === 'Matched' || tx.reconciliationStatus === 'Auto-Reconciled';
          return (
            <View key={tx.id} style={[styles.tableRow, !isMatched && { backgroundColor: '#fffdf7' }]}>
              <Text style={[styles.cell, styles.monoText, { flex: 1.2, color: colors.textMuted }]}>
                {tx.referenceNumber}
              </Text>
              <Text style={[styles.cell, styles.monoText, { flex: 1.1 }]}>{formatDate(tx.date)}</Text>
              <View style={{ flex: 3.5 }}>
                <Text style={[styles.cell, { fontWeight: '700' }]} numberOfLines={1}>
                  {tx.merchant}
                </Text>
                {tx.memo && (
                  <Text style={[styles.monoText, { fontSize: 9.5, color: colors.textMuted }]}>
                    {tx.memo}
                  </Text>
                )}
              </View>
              <Text style={[styles.cell, { flex: 1.4 }]}>{tx.category}</Text>
              <Text
                style={[
                  styles.cell,
                  styles.monoText,
                  { flex: 1.6, textAlign: 'right', color: tx.debitAmount > 0 ? colors.debitText : colors.textMuted },
                ]}
              >
                {tx.debitAmount > 0 ? formatCurrency(tx.debitAmount) : '—'}
              </Text>
              <Text
                style={[
                  styles.cell,
                  styles.monoText,
                  { flex: 1.6, textAlign: 'right', color: tx.creditAmount > 0 ? colors.creditText : colors.textMuted, fontWeight: tx.creditAmount > 0 ? '700' : 'normal' },
                ]}
              >
                {tx.creditAmount > 0 ? `+${formatCurrency(tx.creditAmount)}` : '—'}
              </Text>
              <View style={{ flex: 1.2, alignItems: 'center' }}>
                <Badge status={tx.reconciliationStatus} size="sm" />
              </View>
              <View style={{ flex: 1.4, flexDirection: 'row', justifyContent: 'center', gap: 4 }}>
                {isMatched ? (
                  <Text style={{ fontSize: 10.5, color: colors.creditText, fontWeight: '700' }}>✓ Reconciled</Text>
                ) : (
                  <TouchableOpacity
                    style={styles.addLedgerBtn}
                    onPress={() => createExpenseFromTransaction(tx.id)}
                  >
                    <Plus size={10} color="#fff" />
                    <Text style={styles.addLedgerBtnText}>Add</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
      </View>

      {/* Import Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Import HDFC / ICICI Bank Statement"
        subtitle="Support formats: CSV, Excel, NEFT/RTGS statement export"
        size="md"
        footer={
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
            <TouchableOpacity
              style={styles.sampleLoadBtn}
              onPress={handleLoadSampleHDFC}
            >
              <FileSpreadsheet size={12} color={colors.primaryBlue} />
              <Text style={styles.sampleLoadBtnText}>Load Sample HDFC Statement (Instant Test)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => setIsUploadModalOpen(false)}
            >
              <Text style={styles.secondaryBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        }
      >
        <View style={{ gap: 10 }}>
          <View style={styles.dragZone}>
            <Upload size={28} color={colors.textMuted} />
            <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textPrimary }}>
              Upload Indian Bank Statement CSV
            </Text>
            <Text style={{ fontSize: 11, color: colors.textMuted, textAlign: 'center' }}>
              Extracts Narration, Ref #, Debit, Credit, and Running Balance in INR (₹)
            </Text>
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
  summaryCard: {
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: 4,
    padding: 12,
    gap: 10,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  pctBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    backgroundColor: colors.bgSurfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 2,
  },
  pctText: {
    fontSize: 10.5,
    fontWeight: '700',
    fontFamily: 'Roboto Mono, monospace',
  },
  statGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    paddingTop: 8,
  },
  statLabel: {
    fontSize: 10,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  statVal: {
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
  addLedgerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: colors.primaryNavy,
    borderRadius: 2,
  },
  addLedgerBtnText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  dragZone: {
    padding: 24,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderStyle: 'dashed',
    borderRadius: 4,
    backgroundColor: colors.bgSurfaceAlt,
    alignItems: 'center',
    gap: 6,
  },
  sampleLoadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: colors.infoBg,
    borderWidth: 1,
    borderColor: colors.infoBorder,
    borderRadius: 3,
  },
  sampleLoadBtnText: {
    color: colors.infoText,
    fontSize: 11,
    fontWeight: '600',
  },
});
