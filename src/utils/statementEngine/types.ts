import { ExpenseCategory } from '../../types/finance';

export type BankCode =
  | 'HDFC'
  | 'ICICI'
  | 'SBI'
  | 'AXIS'
  | 'KOTAK'
  | 'YES_BANK'
  | 'INDUSIND'
  | 'STANDARD_CHARTERED'
  | 'CITIBANK'
  | 'GENERIC_CURRENT'
  | 'GENERIC_SAVINGS';

export interface ColumnDefinition {
  name: 'date' | 'valueDate' | 'description' | 'reference' | 'debit' | 'credit' | 'balance' | 'type';
  headerAliases: string[];
  minX?: number;
  maxX?: number;
}

export interface BankLayoutProfile {
  bankCode: BankCode;
  bankDisplayName: string;
  signatureKeywords: string[];
  dateFormats: string[];
  headerMarkers: string[][];
  footerMarkers: string[];
  hasSeparateDebitCredit: boolean;
  amountHasDrCrSuffix: boolean;
  defaultColumns: ColumnDefinition[];
}

export interface ExtractedStatementRow {
  id: string;
  rowNumber: number;
  pageNumber: number;
  rawLineText: string;
  
  // Exact Unrounded Values
  date: string; // ISO standardized YYYY-MM-DD
  rawDate: string; // Exactly as printed on PDF
  valueDate?: string;
  description: string; // Complete unedited narration string with wrapped lines
  merchant: string; // Clean identified merchant
  referenceNumber: string; // Exact Cheque/UTR/Txn Reference #
  debitAmount: number; // Exact unrounded debit
  creditAmount: number; // Exact unrounded credit
  runningBalance?: number; // Exact unrounded balance
  
  // Validation & Audit
  isValid: boolean;
  validationFlags: {
    missingDate: boolean;
    missingAmount: boolean;
    missingDescription: boolean;
    balanceMismatch: boolean;
    formatWarning: boolean;
  };
  validationMessages: string[];
  
  // Category & Approval
  suggestedCategory: ExpenseCategory;
  selectedCategory: ExpenseCategory;
  confidenceScore: number;
  isApproved: boolean;
  isCustomEdited: boolean;
}

export interface StatementExtractionSummary {
  bankCode: BankCode;
  bankName: string;
  accountNumber: string;
  accountHolderName?: string;
  statementPeriod?: {
    from: string;
    to: string;
  };
  totalPages: number;
  totalDetectedRows: number;
  validRowsCount: number;
  errorRowsCount: number;
  
  // Totals & Math Reconciliation
  calculatedTotalDebits: number;
  calculatedTotalCredits: number;
  statementStatedTotalDebits?: number;
  statementStatedTotalCredits?: number;
  openingBalance?: number;
  closingBalance?: number;
  
  // Reconciliation Audit
  isMathBalanced: boolean;
  balanceVariance: number;
  auditNotes: string[];
}

export interface StatementExtractionResult {
  summary: StatementExtractionSummary;
  rows: ExtractedStatementRow[];
  rawPagesText: string[];
  fileDataUrl: string;
  fileName: string;
  fileType: 'PDF' | 'CSV' | 'Excel';
}
