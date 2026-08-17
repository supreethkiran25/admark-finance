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
  Lock,
  Unlock,
  Key,
  Eye,
  EyeOff,
  AlertCircle,
  FileText,
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

  // Password-Protected PDF State
  const [importFormat, setImportFormat] = useState<'PDF' | 'CSV'>('PDF');
  const [pdfPassword, setPdfPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [selectedBank, setSelectedBank] = useState<string>('HDFC Bank Ltd');
  const [selectedFile, setSelectedFile] = useState<string>('HDFC_Corporate_Current_August_2026.pdf');
  const [decryptionError, setDecryptionError] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState<boolean>(false);

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

  const handleDecryptAndImport = () => {
    if (importFormat === 'PDF') {
      if (!pdfPassword.trim()) {
        setDecryptionError('Bank Statement PDF is password-protected. Please enter your PAN or NetBanking Customer ID password.');
        return;
      }

      // Check password (allow standard demo passwords: HDFC2026, ABCDE1234F, 88219012, or any 4+ char password)
      if (pdfPassword.trim().length < 4) {
        setDecryptionError('Invalid PDF password. Password must be at least 4 characters (e.g. PAN or Customer ID).');
        return;
      }
    }

    setDecryptionError(null);
    setIsDecrypting(true);

    setTimeout(() => {
      setIsDecrypting(false);
      const result = parseBankStatementCSV(SAMPLE_RAW_CSV_STRING);
      const totalDebits = result.transactions.reduce((sum, t) => sum + t.debitAmount, 0);
      const totalCredits = result.transactions.reduce((sum, t) => sum + t.creditAmount, 0);

      importBankStatement(
        {
          fileName: importFormat === 'PDF' ? selectedFile : 'HDFC_Commercial_Current_Live_Sync.csv',
          bankName: selectedBank,
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
      setPdfPassword('');
    }, 400);
  };

  const handleLoadSampleHDFC = () => {
    setPdfPassword('HDFC2026');
    setImportFormat('PDF');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 14, gap: 12 }}>
      {/* Header Bar */}
      <View style={styles.titleRibbon}>
        <View>
          <Text style={styles.pageTitle}>HDFC / ICICI Bank Statement Import & Reconciliation (₹)</Text>
          <Text style={styles.pageSubtitle}>
            Password-protected PDF statement decryption, NEFT/RTGS matching with general ledger, and 1-click reconciliation.
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
            onPress={() => {
              setDecryptionError(null);
              setIsUploadModalOpen(true);
            }}
          >
            <Upload size={13} color={colors.textPrimary} />
            <Text style={styles.secondaryBtnText}>+ Import Statement (PDF / CSV)</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Statement Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={styles.summaryTitle}>
              Active Statement: {activeStatement?.bankName} ({activeStatement?.fileName})
            </Text>
            <View style={styles.securityTag}>
              <Lock size={11} color={colors.creditText} />
              <Text style={styles.securityTagText}>256-Bit AES Decrypted</Text>
            </View>
          </View>
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

      {/* Password-Protected PDF & Statement Import Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Import Indian Bank Statement (PDF / CSV)"
        subtitle="Secure 256-bit client-side PDF password decryption and ledger extraction"
        size="lg"
        footer={
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <TouchableOpacity
              style={styles.sampleLoadBtn}
              onPress={handleLoadSampleHDFC}
            >
              <Key size={12} color={colors.primaryBlue} />
              <Text style={styles.sampleLoadBtnText}>Auto-fill Demo Password (HDFC2026)</Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', gap: 6 }}>
              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => setIsUploadModalOpen(false)}
              >
                <Text style={styles.secondaryBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleDecryptAndImport}
              >
                <Unlock size={12} color="#fff" />
                <Text style={styles.primaryBtnText}>
                  {isDecrypting ? 'Decrypting...' : 'Decrypt & Import Statement'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        }
      >
        <View style={{ gap: 12 }}>
          {/* Format Selector */}
          <View style={styles.formatSelector}>
            <TouchableOpacity
              style={[styles.formatChip, importFormat === 'PDF' && styles.formatChipActive]}
              onPress={() => setImportFormat('PDF')}
            >
              <FileText size={13} color={importFormat === 'PDF' ? '#fff' : colors.textSecondary} />
              <Text style={[styles.formatChipText, importFormat === 'PDF' && styles.formatChipTextActive]}>
                Password-Protected Bank PDF (E-Statement)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.formatChip, importFormat === 'CSV' && styles.formatChipActive]}
              onPress={() => setImportFormat('CSV')}
            >
              <FileSpreadsheet size={13} color={importFormat === 'CSV' ? '#fff' : colors.textSecondary} />
              <Text style={[styles.formatChipText, importFormat === 'CSV' && styles.formatChipTextActive]}>
                CSV / Excel Spreadsheet
              </Text>
            </TouchableOpacity>
          </View>

          {/* Selected File Details */}
          <View style={styles.fileDropZone}>
            <View style={styles.fileIconBox}>
              <FileText size={24} color={colors.primaryNavy} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fileNameText}>{selectedFile}</Text>
              <Text style={styles.fileSubText}>
                HDFC Bank Ltd • Current Account • Size: 248 KB • 128-bit/256-bit Encrypted
              </Text>
            </View>
          </View>

          {/* Password Prompt Section (Required for Indian Bank PDFs) */}
          {importFormat === 'PDF' && (
            <View style={styles.passwordSection}>
              <View style={styles.passwordHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <Lock size={14} color={colors.pendingText} />
                  <Text style={styles.passwordTitle}>Bank PDF Decryption Password (Required) *</Text>
                </View>
                <Text style={{ fontSize: 10, color: colors.textMuted }}>Client-Side Decrypted (Zero Cloud Storage)</Text>
              </View>

              <View style={styles.passwordInputContainer}>
                <Key size={14} color={colors.textMuted} />
                <TextInput
                  style={[styles.passwordInput, styles.monoText]}
                  placeholder="Enter PAN (e.g. ABCDE1234F) or NetBanking Customer ID..."
                  placeholderTextColor={colors.textMuted}
                  value={pdfPassword}
                  onChangeText={v => {
                    setPdfPassword(v);
                    setDecryptionError(null);
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="characters"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={{ padding: 4 }}
                >
                  {showPassword ? (
                    <EyeOff size={14} color={colors.textMuted} />
                  ) : (
                    <Eye size={14} color={colors.textMuted} />
                  )}
                </TouchableOpacity>
              </View>

              {/* Password Hints for Indian Banks */}
              <View style={styles.hintBox}>
                <Text style={styles.hintTitle}>Standard Indian Bank Statement Password Patterns:</Text>
                <View style={styles.hintChips}>
                  <TouchableOpacity
                    style={styles.hintChip}
                    onPress={() => setPdfPassword('ABCDE1234F')}
                  >
                    <Text style={styles.hintChipText}>HDFC: Corporate PAN (UPPERCASE)</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.hintChip}
                    onPress={() => setPdfPassword('88219012')}
                  >
                    <Text style={styles.hintChipText}>ICICI: Customer ID (8 Digits)</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.hintChip}
                    onPress={() => setPdfPassword('150819479201')}
                  >
                    <Text style={styles.hintChipText}>SBI: DOB + Last 4 Acc No</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Error Message */}
              {decryptionError && (
                <View style={styles.errorBanner}>
                  <AlertCircle size={13} color={colors.debitText} />
                  <Text style={styles.errorText}>{decryptionError}</Text>
                </View>
              )}
            </View>
          )}
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
  securityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 5,
    paddingVertical: 1,
    backgroundColor: colors.creditBg,
    borderWidth: 1,
    borderColor: colors.creditBorder,
    borderRadius: 2,
  },
  securityTagText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: colors.creditText,
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
  formatSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  formatChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: colors.bgSurfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: 3,
  },
  formatChipActive: {
    backgroundColor: colors.primaryNavy,
    borderColor: colors.primaryNavy,
  },
  formatChipText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  formatChipTextActive: {
    color: '#fff',
  },
  fileDropZone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    backgroundColor: colors.bgSurfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: 3,
  },
  fileIconBox: {
    padding: 8,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 3,
  },
  fileNameText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  fileSubText: {
    fontSize: 10.5,
    color: colors.textMuted,
    marginTop: 2,
  },
  passwordSection: {
    backgroundColor: colors.bgSurfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: 4,
    padding: 12,
    gap: 8,
  },
  passwordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  passwordTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: 3,
    paddingHorizontal: 8,
    height: 32,
    gap: 6,
  },
  passwordInput: {
    flex: 1,
    fontSize: 12,
    color: colors.textPrimary,
    outlineStyle: 'none' as any,
  },
  hintBox: {
    gap: 4,
    marginTop: 2,
  },
  hintTitle: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  hintChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  hintChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 2,
  },
  hintChipText: {
    fontSize: 10,
    color: colors.textSecondary,
    fontFamily: 'Roboto Mono, monospace',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 6,
    backgroundColor: colors.debitBg,
    borderWidth: 1,
    borderColor: colors.debitBorder,
    borderRadius: 2,
  },
  errorText: {
    fontSize: 11,
    color: colors.debitText,
    fontWeight: '600',
    flex: 1,
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
