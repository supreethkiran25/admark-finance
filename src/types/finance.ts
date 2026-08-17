export type UserRole = 'CFO';

export type ExpenseCategory =
  | 'Cloud Services'
  | 'Software'
  | 'Design Tools'
  | 'Employee Salaries'
  | 'Office Expenses'
  | 'Food'
  | 'Travel'
  | 'Marketing'
  | 'Equipment'
  | 'Utilities'
  | 'Taxes'
  | 'Miscellaneous';

export type Department =
  | 'Engineering'
  | 'Sales & Marketing'
  | 'Operations'
  | 'Executive'
  | 'Design & Product'
  | 'Facilities & IT';

export type ExpenseStatus = 'Approved' | 'Pending Payment' | 'Rejected';

export interface Expense {
  id: string;
  referenceNumber: string;
  date: string;
  rawDate?: string;
  description: string;
  category: ExpenseCategory;
  amount: number; // in INR (₹)
  receiptFileName?: string;
  receiptDataUrl?: string;
  receiptFileSize?: string;
  status: ExpenseStatus;
  notes?: string;
  createdAt: string;
}

export type ReviewTransactionStatus = 'Pending Review' | 'Approved' | 'Needs Verification' | 'Deleted';

export interface ImportedReviewTransaction {
  id: string;
  date: string;
  rawDate: string;
  description: string;
  merchant: string;
  debitAmount: number;
  creditAmount: number;
  accountBalance?: number;
  suggestedCategory: ExpenseCategory;
  selectedCategory: ExpenseCategory;
  referenceNumber: string;
  confidence: number;
  status: ReviewTransactionStatus;
  validationErrors?: string[];
  pageNumber?: number;
  isCustomCategory?: boolean;
}

export interface BankStatementUpload {
  id: string;
  fileName: string;
  fileType: 'PDF' | 'CSV' | 'Excel';
  bankName: string;
  accountNumber?: string;
  uploadedAt: string;
  totalTransactions: number;
  totalDebits: number;
  totalCredits: number;
  openingBalance: number;
  closingBalance: number;
  totalPages?: number;
  fileDataUrl?: string;
  rawPagesText?: string[];
}

export type EmploymentType = 'Full-time' | 'Part-time' | 'Contract';
export type EmployeeStatus = 'Active' | 'Inactive';
export type PayrollStatus = 'Paid' | 'Unpaid' | 'Pending';

export interface SalarySlip {
  id: string;
  employeeId: string;
  fiscalMonth: string; // YYYY-MM
  baseSalary: number; // in INR (₹)
  allowances: number; // in INR (₹)
  bonuses: number; // in INR (₹)
  deductions: number; // in INR (₹)
  netSalary: number; // in INR (₹)
  paymentStatus: PayrollStatus;
  paymentDate?: string;
  paymentMethod?: string;
  referenceNumber?: string;
  notes?: string;
}

export interface Employee {
  id: string;
  employeeId: string;
  fullName: string;
  email: string;
  phone: string;
  department: Department;
  position: string;
  employmentType: EmploymentType;
  joiningDate: string;
  monthlySalary: number; // base salary in INR (₹)
  allowances?: number;
  bonuses?: number;
  deductions?: number;
  status: EmployeeStatus;
  bankAccountNumber?: string;
  ifscCode?: string;
  pan?: string;
  salaryHistory: SalarySlip[];
}

export interface DepartmentBudget {
  id: string;
  department: string;
  fiscalMonth: string; // YYYY-MM
  allocatedBudget: number; // in INR (₹)
  spentAmount: number; // in INR (₹)
  notes?: string;
}

export interface Supplier {
  id: string;
  name: string;
  category: ExpenseCategory;
  contactEmail: string;
  paymentTerms: string;
  pendingPaymentAmount: number; // in INR (₹)
  totalPaidYTD: number; // in INR (₹)
  notes?: string;
}

export type NavigationModule =
  | 'dashboard'
  | 'upload-statement'
  | 'expenses'
  | 'transactions'
  | 'employees'
  | 'payroll'
  | 'budgets'
  | 'suppliers'
  | 'reports'
  | 'settings';
