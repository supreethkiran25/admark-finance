import React, { useState, useRef } from 'react';
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Sliders,
  Check,
  FileText,
  Search,
  Filter,
} from 'lucide-react';
import { useFinance } from '../../../context/FinanceContext';
import { BankStatement, BankTransaction } from '../../../types/finance';
import { Badge } from '../../common/Badge';
import { Modal } from '../../common/Modal';
import { formatCurrency } from '../../../utils/currency';
import { formatDate } from '../../../utils/date';
import { parseBankStatementCSV } from '../../../utils/csvParser';
import { SAMPLE_RAW_CSV_STRING } from '../../../data/bankStatementSamples';

export const BankStatementModule: React.FC = () => {
  const {
    statements,
    transactions,
    importBankStatement,
    reconcileTransaction,
    autoReconcileAll,
    createExpenseFromTransaction,
    isCompactMode,
  } = useFinance();

  const [selectedStatementId, setSelectedStatementId] = useState<string>(
    statements[0]?.id || ''
  );
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);

  // Upload Form State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadBankName, setUploadBankName] = useState('JPMorgan Chase Commercial');
  const [uploadAccountNum, setUploadAccountNum] = useState('•••• 9012');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsedPreview, setParsedPreview] = useState<Array<Omit<BankTransaction, 'id' | 'statementId'>>>([]);
  const [parseError, setParseError] = useState<string | null>(null);

  // Active statement
  const activeStatement = statements.find(s => s.id === selectedStatementId) || statements[0];

  // Transactions belonging to active statement
  const statementTransactions = transactions.filter(
    t => !selectedStatementId || t.statementId === selectedStatementId
  );

  const filteredTransactions = statementTransactions.filter(tx => {
    if (filterStatus !== 'ALL' && tx.reconciliationStatus !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        tx.merchant.toLowerCase().includes(q) ||
        tx.referenceNumber.toLowerCase().includes(q) ||
        tx.category.toLowerCase().includes(q);
      if (!match) return false;
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

  // File Upload Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setParseError(null);

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const text = event.target?.result as string;
        const result = parseBankStatementCSV(text);
        if (result.transactions.length === 0) {
          setParseError('Unable to extract transactions from the provided file. Ensure CSV has Date, Description, and Debit columns.');
        } else {
          setParsedPreview(result.transactions);
        }
      } catch (err) {
        setParseError('Error parsing statement file: ' + String(err));
      }
    };
    reader.readAsText(file);
  };

  // Load Sample Statement (Instant 1-Click test)
  const handleLoadSampleChase = () => {
    const result = parseBankStatementCSV(SAMPLE_RAW_CSV_STRING);
    const totalDebits = result.transactions.reduce((sum, t) => sum + t.debitAmount, 0);
    const totalCredits = result.transactions.reduce((sum, t) => sum + t.creditAmount, 0);

    importBankStatement(
      {
        fileName: 'JPMorgan_Chase_Operating_Live_Sync.csv',
        bankName: 'JPMorgan Chase Bank, N.A.',
        accountNumber: '•••• •••• 9012 (Commercial Operating)',
        periodStart: '2026-08-01',
        periodEnd: '2026-08-16',
        openingBalance: 1245900.20,
        closingBalance: 1428500.42,
        totalDebits,
        totalCredits,
      },
      result.transactions
    );
    setIsUploadModalOpen(false);
  };

  const handleConfirmUpload = () => {
    if (parsedPreview.length === 0) return;

    const totalDebits = parsedPreview.reduce((sum, t) => sum + t.debitAmount, 0);
    const totalCredits = parsedPreview.reduce((sum, t) => sum + t.creditAmount, 0);
    const dates = parsedPreview.map(t => t.date).sort();

    importBankStatement(
      {
        fileName: uploadedFile?.name || 'Imported_Statement.csv',
        bankName: uploadBankName,
        accountNumber: uploadAccountNum,
        periodStart: dates[0] || '2026-08-01',
        periodEnd: dates[dates.length - 1] || '2026-08-16',
        openingBalance: 1400000.00,
        closingBalance: 1428500.42,
        totalDebits,
        totalCredits,
      },
      parsedPreview
    );

    setIsUploadModalOpen(false);
    setUploadedFile(null);
    setParsedPreview([]);
  };

  return (
    <div style={{ padding: '16px', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '14px',
          paddingBottom: '10px',
          borderBottom: '1px solid var(--border-default)',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '15px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              textTransform: 'uppercase',
              letterSpacing: '-0.02em',
            }}
          >
            Bank Statement Import & Operational Reconciliation
          </h1>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Parse CSV/Excel/PDF statements, extract banking lines, and reconcile with general ledger entries.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => autoReconcileAll()}
            title="Auto-match bank debits with approved ledger expenses"
          >
            <RefreshCw size={13} />
            <span>1-Click Auto Reconcile</span>
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => setIsUploadModalOpen(true)}
          >
            <Upload size={13} />
            <span>+ Import Statement File</span>
          </button>
        </div>
      </div>

      {/* Statement Selector & Summary Ribbon */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-sm)',
          padding: '12px 14px',
          marginBottom: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
              Active Statement:
            </span>
            <select
              className="form-select font-mono"
              style={{ width: '380px', height: '28px', fontSize: '11.5px', fontWeight: 600 }}
              value={selectedStatementId}
              onChange={e => setSelectedStatementId(e.target.value)}
            >
              {statements.map(s => (
                <option key={s.id} value={s.id}>
                  {s.bankName} • {s.fileName} ({formatDate(s.periodStart)} - {formatDate(s.periodEnd)})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Reconciliation Progress:</span>
            <span
              className="num-val"
              style={{
                fontWeight: 700,
                color: reconcilePct === 100 ? 'var(--credit-text)' : 'var(--pending-text)',
                padding: '1px 6px',
                background: 'var(--bg-surface-alt)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '2px',
              }}
            >
              {reconcilePct.toFixed(1)}% ({matchedCount}/{statementTransactions.length} Reconciled)
            </span>
          </div>
        </div>

        {/* Statement Metric Strip */}
        {activeStatement && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
              gap: '8px',
              paddingTop: '10px',
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <div>
              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Opening Balance</div>
              <div className="num-val" style={{ fontSize: '13.5px', fontWeight: 600 }}>{formatCurrency(activeStatement.openingBalance)}</div>
            </div>
            <div>
              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Debits (Out)</div>
              <div className="num-val" style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--debit-text)' }}>
                -{formatCurrency(activeStatement.totalDebits)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Credits (In)</div>
              <div className="num-val" style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--credit-text)' }}>
                +{formatCurrency(activeStatement.totalCredits)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Closing Balance</div>
              <div className="num-val" style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--primary-navy)' }}>
                {formatCurrency(activeStatement.closingBalance)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Unreconciled Items</div>
              <div className="num-val" style={{ fontSize: '13.5px', fontWeight: 700, color: unmatchedCount > 0 ? 'var(--debit-text)' : 'var(--credit-text)' }}>
                {unmatchedCount} Items Pending
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '10px',
          gap: '8px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, maxWidth: '450px' }}>
          <Search size={14} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search merchant, reference number, category..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ height: '28px' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Status:</span>
          <select
            className="form-select"
            style={{ width: '150px', height: '28px', fontSize: '11px' }}
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="ALL">All Items ({statementTransactions.length})</option>
            <option value="Unmatched">Unmatched ({unmatchedCount})</option>
            <option value="Matched">Matched</option>
            <option value="Auto-Reconciled">Auto-Reconciled</option>
          </select>
        </div>
      </div>

      {/* Transactions Reconciliation Table */}
      <div className="table-container">
        <table className={`erp-table ${isCompactMode ? 'compact' : ''}`}>
          <thead>
            <tr>
              <th>Ref #</th>
              <th>Date</th>
              <th>Bank Payee / Description</th>
              <th>Auto Category</th>
              <th className="table-align-right">Debit (Out)</th>
              <th className="table-align-right">Credit (In)</th>
              <th className="table-align-right">Running Balance</th>
              <th>Reconciliation Status</th>
              <th className="table-align-center" style={{ width: '160px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  No statement transactions matching the filter.
                </td>
              </tr>
            ) : (
              filteredTransactions.map(tx => {
                const isMatched =
                  tx.reconciliationStatus === 'Matched' || tx.reconciliationStatus === 'Auto-Reconciled';
                return (
                  <tr key={tx.id} style={{ background: !isMatched ? '#fffdf7' : undefined }}>
                    <td className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {tx.referenceNumber}
                    </td>
                    <td className="font-mono">{formatDate(tx.date)}</td>
                    <td style={{ maxWidth: '320px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {tx.merchant}
                      </div>
                      {tx.memo && (
                        <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                          Memo: {tx.memo}
                        </div>
                      )}
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '1px 5px',
                          background: 'var(--bg-surface-subtle)',
                          borderRadius: '2px',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        {tx.category}
                      </span>
                    </td>
                    <td className="table-align-right num-val" style={{ color: tx.debitAmount > 0 ? 'var(--debit-text)' : 'var(--text-muted)' }}>
                      {tx.debitAmount > 0 ? formatCurrency(tx.debitAmount) : '—'}
                    </td>
                    <td className="table-align-right num-val" style={{ color: tx.creditAmount > 0 ? 'var(--credit-text)' : 'var(--text-muted)', fontWeight: tx.creditAmount > 0 ? 600 : 'normal' }}>
                      {tx.creditAmount > 0 ? `+${formatCurrency(tx.creditAmount)}` : '—'}
                    </td>
                    <td className="table-align-right num-val">
                      {tx.accountBalance > 0 ? formatCurrency(tx.accountBalance) : '—'}
                    </td>
                    <td>
                      <Badge status={tx.reconciliationStatus} size="sm" />
                    </td>
                    <td className="table-align-center">
                      {isMatched ? (
                        <span style={{ fontSize: '11px', color: 'var(--credit-text)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                          <CheckCircle2 size={12} />
                          <span>Reconciled</span>
                        </span>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            onClick={() => createExpenseFromTransaction(tx.id)}
                            title="Create expense in ledger and reconcile"
                            style={{ fontSize: '10.5px', height: '22px', padding: '1px 6px' }}
                          >
                            <Plus size={11} />
                            <span>Add to Ledger</span>
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-success"
                            onClick={() => reconcileTransaction(tx.id)}
                            title="Force mark as reconciled"
                            style={{ fontSize: '10.5px', height: '22px', padding: '1px 6px' }}
                          >
                            <Check size={11} />
                            <span>Match</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Import Statement Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setUploadedFile(null);
          setParsedPreview([]);
        }}
        title="Import Bank Statement"
        subtitle="Support formats: CSV, Excel (.xlsx, .csv, .tsv), PDF statement text"
        size="lg"
        footer={
          <div style={{ display: 'flex', gap: '8px', width: '100%', justifyContent: 'space-between' }}>
            <button
              type="button"
              className="btn btn-blue"
              onClick={handleLoadSampleChase}
              title="Load preconfigured Chase Commercial Bank Statement for instant testing"
            >
              <FileSpreadsheet size={13} />
              <span>Load Sample Chase Statement (Instant Test)</span>
            </button>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setUploadedFile(null);
                  setParsedPreview([]);
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={parsedPreview.length === 0}
                onClick={handleConfirmUpload}
              >
                Import {parsedPreview.length} Transactions
              </button>
            </div>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">Financial Institution / Bank</label>
              <input
                type="text"
                className="form-input"
                value={uploadBankName}
                onChange={e => setUploadBankName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Account Number Identifier</label>
              <input
                type="text"
                className="form-input font-mono"
                value={uploadAccountNum}
                onChange={e => setUploadAccountNum(e.target.value)}
              />
            </div>
          </div>

          {/* Drag and Drop Zone */}
          <div
            style={{
              padding: '24px',
              border: '2px dashed var(--border-default)',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-surface-alt)',
              textAlign: 'center',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.tsv,.txt,.xlsx,.pdf"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <Upload size={28} style={{ color: 'var(--text-muted)' }} />
            <div>
              <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                {uploadedFile ? uploadedFile.name : 'Click or Drag Statement File to Import'}
              </strong>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                Extracts Date, Merchant, Debit, Credit, Running Balance, and Reference Numbers
              </div>
            </div>
          </div>

          {parseError && (
            <div style={{ padding: '8px 12px', background: 'var(--debit-bg)', border: '1px solid var(--debit-border)', color: 'var(--debit-text)', fontSize: '11.5px', borderRadius: 'var(--radius-xs)' }}>
              {parseError}
            </div>
          )}

          {/* Parsed Preview Table */}
          {parsedPreview.length > 0 && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Extracted Transactions Preview ({parsedPreview.length} lines)</span>
                <span className="font-mono" style={{ color: 'var(--credit-text)' }}>
                  Total Debits: {formatCurrency(parsedPreview.reduce((s, t) => s + t.debitAmount, 0))}
                </span>
              </div>
              <div className="table-container" style={{ maxHeight: '200px' }}>
                <table className="erp-table compact">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Payee / Description</th>
                      <th>Category Matched</th>
                      <th className="table-align-right">Debit</th>
                      <th className="table-align-right">Credit</th>
                      <th>Ref #</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedPreview.slice(0, 6).map((pt, idx) => (
                      <tr key={idx}>
                        <td className="font-mono">{pt.date}</td>
                        <td style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pt.merchant}</td>
                        <td>{pt.category}</td>
                        <td className="table-align-right num-val">{pt.debitAmount > 0 ? formatCurrency(pt.debitAmount) : '—'}</td>
                        <td className="table-align-right num-val">{pt.creditAmount > 0 ? formatCurrency(pt.creditAmount) : '—'}</td>
                        <td className="font-mono">{pt.referenceNumber}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
