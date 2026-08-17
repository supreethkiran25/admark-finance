export type UserRole = 'COO' | 'CEO' | 'CFO' | 'CTO';

export type ExpenseCategory =
  | 'Salaries'
  | 'Office expenses'
  | 'Software subscriptions'
  | 'Cloud services'
  | 'Travel'
  | 'Food'
  | 'Marketing'
  | 'Equipment'
  | 'Utilities'
  | 'Miscellaneous';

export type Department =
  | 'Engineering'
  | 'Sales & Marketing'
  | 'Operations'
  | 'Executive'
  | 'Design & Product'
  | 'Facilities & IT';

export type ExpenseStatus = 'Approved' | 'Pending Approval' | 'Under Review' | 'Rejected';

export interface AuditLogEntry {
  timestamp: string;
  user: string;
  role?: UserRole;
  action: string;
}

export interface Expense {
  id: string;
  referenceNumber: string;
  date: string;
  employee: string;
  department: Department;
  category: ExpenseCategory;
  amount: number;
  paymentMethod: string;
  description: string;
  receiptUrl?: string;
  receiptFileName?: string;
  status: ExpenseStatus;
  isTechExpense: boolean;
  glCode: string;
  projectCode?: string;
  taxAmount: number;
  notes?: string;
  auditHistory: AuditLogEntry[];
}

export interface BankTransaction {
  id: string;
  statementId: string;
  date: string;
  merchant: string;
  debitAmount: number;
  creditAmount: number;
  accountBalance: number;
  referenceNumber: string;
  category: ExpenseCategory;
  reconciliationStatus: 'Matched' | 'Unmatched' | 'Conflict' | 'Auto-Reconciled';
  matchedExpenseId?: string;
  ruleConfidence?: number;
  memo?: string;
}

export interface BankStatement {
  id: string;
  fileName: string;
  bankName: string;
  accountNumber: string;
  periodStart: string;
  periodEnd: string;
  openingBalance: number;
  closingBalance: number;
  totalDebits: number;
  totalCredits: number;
  importedAt: string;
  importedBy: string;
  transactionCount: number;
  reconciledCount: number;
}

export interface CategorizationRule {
  id: string;
  pattern: string;
  category: ExpenseCategory;
  department: Department;
  isRegex: boolean;
  priority: number;
  matchCount: number;
  isActive: boolean;
  lastMatched?: string;
}

export type ReimbursementType =
  | 'Travel Reimbursement'
  | 'Client Meeting'
  | 'Internet & WFH'
  | 'Equipment Purchase'
  | 'Food & Per Diem';

export type ReimbursementStatus = 'Submitted' | 'Under Review' | 'Approved' | 'Disbursed' | 'Rejected';

export interface EmployeeExpenseClaim {
  id: string;
  claimNumber: string;
  employeeName: string;
  employeeEmail: string;
  employeeRole: string;
  department: Department;
  date: string;
  claimType: ReimbursementType;
  amount: number;
  receiptAttached: boolean;
  receiptFileName?: string;
  status: ReimbursementStatus;
  description: string;
  submittedAt: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface DepartmentBudget {
  id: string;
  department: Department;
  fiscalMonth: string; // YYYY-MM
  allocatedBudget: number;
  spentAmount: number;
  committedAmount: number;
  notes?: string;
  lastUpdated: string;
}

export interface Vendor {
  id: string;
  name: string;
  category: ExpenseCategory;
  department: Department;
  contactEmail: string;
  paymentTerms: 'Net 15' | 'Net 30' | 'Net 60' | 'Monthly Auto-Debit' | 'Due on Receipt';
  outstandingBalance: number;
  totalYtdSpend: number;
  contractRenewalDate: string;
  taxId: string;
  w9OnFile: boolean;
  status: 'Active' | 'Under Review' | 'Paused';
  paymentMethod: string;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export type InvoiceType = 'Accounts Payable' | 'Accounts Receivable';
export type InvoiceStatus = 'Draft' | 'Sent' | 'Received' | 'Scheduled' | 'Paid' | 'Overdue';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  type: InvoiceType;
  partyName: string;
  contactEmail: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  taxAmount: number;
  status: InvoiceStatus;
  lineItems: InvoiceLineItem[];
  paymentReference?: string;
  notes: string;
  pdfGenerated?: boolean;
}

export interface AuditRecord {
  id: string;
  timestamp: string;
  user: string;
  role: UserRole;
  action: string;
  entity: string;
  entityId?: string;
  details: string;
  ipAddress: string;
}

export type NavigationModule =
  | 'overview'
  | 'expenses'
  | 'statements'
  | 'categorization'
  | 'employees'
  | 'budgets'
  | 'vendors'
  | 'invoices'
  | 'reports'
  | 'analytics'
  | 'security';
