import { BankStatement, BankTransaction } from '../types/finance';

export const SAMPLE_STATEMENT_METADATA: BankStatement[] = [
  {
    id: 'stmt-hdfc-2026-08',
    fileName: 'HDFC_Commercial_Current_August_2026.csv',
    bankName: 'HDFC Bank Ltd (Commercial Corporate)',
    accountNumber: '•••• •••• 9201 (Current Operating)',
    ifscCode: 'HDFC0000184',
    periodStart: '2026-08-01',
    periodEnd: '2026-08-16',
    openingBalance: 12459000.20,
    closingBalance: 14285500.42,
    totalDebits: 1343820.00,
    totalCredits: 2550000.00,
    importedAt: '2026-08-16 10:00:00',
    importedBy: 'Rachel Green (COO)',
    transactionCount: 3,
    reconciledCount: 2,
  },
];

export const SAMPLE_CHASE_TRANSACTIONS: BankTransaction[] = [
  {
    id: 'tx-001',
    statementId: 'stmt-hdfc-2026-08',
    date: '2026-08-16',
    merchant: 'POS: AWS INDIA SERVICES MUMBAI IN',
    debitAmount: 148920.00,
    creditAmount: 0.00,
    accountBalance: 14285500.42,
    referenceNumber: 'HDFC-TX-9908124',
    category: 'Cloud services',
    reconciliationStatus: 'Matched',
    matchedExpenseId: 'exp-001',
    ruleConfidence: 0.98,
    mode: 'POS',
    memo: 'Monthly recurring AWS Mumbai production compute & GPU',
  },
  {
    id: 'tx-002',
    statementId: 'stmt-hdfc-2026-08',
    date: '2026-08-15',
    merchant: 'NEFT: RAZORPAYX PAYROLL DISBURSEMENT REF-8891024',
    debitAmount: 845000.00,
    creditAmount: 0.00,
    accountBalance: 14434420.42,
    referenceNumber: 'NEFT-8891024',
    category: 'Salaries',
    reconciliationStatus: 'Matched',
    matchedExpenseId: 'exp-002',
    ruleConfidence: 0.99,
    mode: 'NEFT',
    memo: 'Mid-month core workforce salary settlement',
  },
  {
    id: 'tx-003',
    statementId: 'stmt-hdfc-2026-08',
    date: '2026-08-12',
    merchant: 'POS: APPLE INDIA STORE BKC MUMBAI IN',
    debitAmount: 349900.00,
    creditAmount: 0.00,
    accountBalance: 15279420.42,
    referenceNumber: 'POS-449102',
    category: 'Equipment',
    reconciliationStatus: 'Unmatched',
    ruleConfidence: 0.94,
    mode: 'POS',
    memo: 'Bank transaction awaiting 1-click reconciliation into internal ledger',
  },
];

export const SAMPLE_RAW_CSV_STRING = `Date,Narration / Merchant,Debit,Credit,Account Balance,Chq / Ref Number
2026-08-16,POS: AWS INDIA SERVICES MUMBAI IN,148920.00,0.00,14285500.42,HDFC-TX-9908124
2026-08-15,NEFT: RAZORPAYX PAYROLL DISBURSEMENT REF-8891024,845000.00,0.00,14434420.42,NEFT-8891024
2026-08-12,POS: APPLE INDIA STORE BKC MUMBAI IN,349900.00,0.00,15279420.42,POS-449102`;
