import React, { createContext, useContext, useState, useMemo } from 'react';
import {
  Expense,
  ExpenseCategory,
  ImportedReviewTransaction,
  BankStatementUpload,
  DepartmentBudget,
  Supplier,
  Employee,
  SalarySlip,
  PayrollStatus,
  NavigationModule,
} from '../types/finance';
import {
  processBankStatement,
  StatementExtractionResult,
  ExtractedStatementRow,
} from '../utils/statementEngine';
import { exportToExcel } from '../utils/excelParser';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

interface FinanceContextType {
  // Navigation
  activeModule: NavigationModule;
  setActiveModule: (module: NavigationModule) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  globalSearchQuery: string;
  setGlobalSearchQuery: (query: string) => void;

  // Bank Statement Extraction Engine & Verification (CORE FEATURE)
  statements: BankStatementUpload[];
  activeStatement: BankStatementUpload | null;
  extractionResult: StatementExtractionResult | null;
  pendingReviewTransactions: ImportedReviewTransaction[];
  isAnalyzingStatement: boolean;
  uploadAndAnalyzeStatement: (file: File, password?: string) => Promise<{ success: boolean; count: number; error?: string }>;
  updateReviewCategory: (id: string, category: ExpenseCategory) => void;
  editReviewTransaction: (id: string, updates: Partial<ImportedReviewTransaction>) => void;
  deleteReviewTransaction: (id: string) => void;
  batchChangeReviewCategory: (ids: string[], category: ExpenseCategory) => void;
  approveAndSaveAllReviewTransactions: () => void;
  approveAndSaveSelectedTransactions: (ids: string[]) => void;
  discardPendingReview: () => void;

  // Expenses (CRUD)
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'referenceNumber' | 'createdAt'>) => Expense;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;

  // Employees Module (CRUD)
  employees: Employee[];
  addEmployee: (employeeData: Omit<Employee, 'id' | 'salaryHistory'>) => Employee;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;

  // Payroll Module
  recordSalaryPayment: (
    employeeId: string,
    fiscalMonth: string,
    paymentDetails: {
      paymentDate: string;
      paymentMethod: string;
      referenceNumber?: string;
      notes?: string;
    }
  ) => void;
  updateSalaryStatus: (employeeId: string, fiscalMonth: string, status: PayrollStatus, paymentDate?: string) => void;
  totalMonthlyPayroll: number;
  salariesPaidThisMonth: number;
  salariesPendingThisMonth: number;
  activeEmployeesCount: number;

  // Budgets
  budgets: DepartmentBudget[];
  addBudget: (budget: Omit<DepartmentBudget, 'id' | 'spentAmount'>) => void;
  updateBudget: (id: string, allocatedBudget: number, notes?: string) => void;
  deleteBudget: (id: string) => void;

  // Suppliers (Pending Payments)
  suppliers: Supplier[];
  addSupplier: (supplier: Omit<Supplier, 'id' | 'totalPaidYTD'>) => void;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  paySupplier: (supplierId: string, amount: number) => void;

  // Simplified Dashboard Metrics
  thisMonthSpending: number;
  totalTransactionsCount: number;
  pendingPaymentsTotal: number;
  largestExpense: number;
  recentTransactions: Expense[];

  // Toasts & Notifications
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;

  // Utilities & Exports
  exportExpensesExcel: () => void;
  exportExpensesCSV: () => void;
  exportPayrollExcel: (fiscalMonth: string) => void;
  clearAllData: () => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const STORAGE_PREFIX = 'CFO_APP_STATE_V2';

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeModule, setActiveModule] = useState<NavigationModule>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');
  const [isAnalyzingStatement, setIsAnalyzingStatement] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // 1. Statements & Extraction State
  const [statements, setStatements] = useState<BankStatementUpload[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}_STATEMENTS`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeStatement, setActiveStatement] = useState<BankStatementUpload | null>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}_STATEMENTS`);
      if (saved) {
        const list = JSON.parse(saved);
        return list[0] || null;
      }
      return null;
    } catch {
      return null;
    }
  });

  const [extractionResult, setExtractionResult] = useState<StatementExtractionResult | null>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}_EXTRACT_RES`);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [pendingReviewTransactions, setPendingReviewTransactions] = useState<ImportedReviewTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}_REVIEW_TXS`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 2. Expenses State
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}_EXPENSES`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 3. Employees State
  const [employees, setEmployees] = useState<Employee[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}_EMPLOYEES`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 4. Budgets State
  const [budgets, setBudgets] = useState<DepartmentBudget[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}_BUDGETS`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 5. Suppliers State
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}_SUPPLIERS`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Toast Helper
  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Sync to localStorage
  const saveState = (key: string, data: any) => {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}_${key}`, JSON.stringify(data));
    } catch (e) {
      console.error('Storage sync error', e);
    }
  };

  // REAL-TIME DASHBOARD CALCULATIONS
  const currentYearMonth = new Date().toISOString().substring(0, 7);

  const thisMonthExpenses = useMemo(() => {
    return expenses.filter(e => e.date.startsWith(currentYearMonth) && e.status === 'Approved');
  }, [expenses, currentYearMonth]);

  const thisMonthSpending = useMemo(() => {
    return thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [thisMonthExpenses]);

  const totalTransactionsCount = expenses.length;

  const pendingPaymentsTotal = useMemo(() => {
    return suppliers.reduce((sum, s) => sum + (s.pendingPaymentAmount || 0), 0);
  }, [suppliers]);

  const largestExpense = useMemo(() => {
    if (thisMonthExpenses.length === 0) return 0;
    return Math.max(...thisMonthExpenses.map(e => e.amount));
  }, [thisMonthExpenses]);

  const recentTransactions = useMemo(() => {
    return [...expenses]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8);
  }, [expenses]);

  // REAL-TIME PAYROLL CALCULATIONS
  const activeEmployees = useMemo(() => {
    return employees.filter(e => e.status === 'Active');
  }, [employees]);

  const activeEmployeesCount = activeEmployees.length;

  const totalMonthlyPayroll = useMemo(() => {
    return activeEmployees.reduce((sum, e) => {
      const base = e.monthlySalary || 0;
      const allowances = e.allowances || 0;
      const bonuses = e.bonuses || 0;
      const deductions = e.deductions || 0;
      return sum + (base + allowances + bonuses - deductions);
    }, 0);
  }, [activeEmployees]);

  const salariesPaidThisMonth = useMemo(() => {
    let sum = 0;
    employees.forEach(emp => {
      emp.salaryHistory.forEach(slip => {
        if (slip.fiscalMonth === currentYearMonth && slip.paymentStatus === 'Paid') {
          sum += slip.netSalary;
        }
      });
    });
    return sum;
  }, [employees, currentYearMonth]);

  const salariesPendingThisMonth = useMemo(() => {
    return Math.max(0, totalMonthlyPayroll - salariesPaidThisMonth);
  }, [totalMonthlyPayroll, salariesPaidThisMonth]);

  // CORE WORKFLOW: REBUILT BANK STATEMENT EXTRACTION ENGINE
  const uploadAndAnalyzeStatement = async (
    file: File,
    password?: string
  ): Promise<{ success: boolean; count: number; error?: string }> => {
    setIsAnalyzingStatement(true);

    try {
      const result = await processBankStatement(file, password);
      setExtractionResult(result);
      saveState('EXTRACT_RES', result);

      // Convert ExtractedStatementRow[] to ImportedReviewTransaction[]
      const reviewTxs: ImportedReviewTransaction[] = result.rows.map((r, idx) => ({
        id: r.id || `rev-${Date.now()}-${idx}`,
        date: r.date,
        rawDate: r.rawDate,
        description: r.description,
        merchant: r.merchant,
        debitAmount: r.debitAmount,
        creditAmount: r.creditAmount,
        accountBalance: r.runningBalance,
        suggestedCategory: r.suggestedCategory,
        selectedCategory: r.selectedCategory,
        referenceNumber: r.referenceNumber,
        confidence: r.confidenceScore,
        status: !r.isValid || r.validationMessages.length > 0 ? 'Needs Verification' : 'Pending Review',
        validationErrors: r.validationMessages,
        pageNumber: r.pageNumber,
      }));

      const newStatementUpload: BankStatementUpload = {
        id: `stmt-${Date.now()}`,
        fileName: result.fileName,
        fileType: result.fileType,
        bankName: result.summary.bankName,
        accountNumber: result.summary.accountNumber,
        uploadedAt: new Date().toISOString(),
        totalTransactions: reviewTxs.length,
        totalDebits: result.summary.calculatedTotalDebits,
        totalCredits: result.summary.calculatedTotalCredits,
        openingBalance: result.summary.openingBalance || 0,
        closingBalance: result.summary.closingBalance || 0,
        totalPages: result.summary.totalPages,
        fileDataUrl: result.fileDataUrl,
        rawPagesText: result.rawPagesText,
      };

      setActiveStatement(newStatementUpload);
      setStatements(prev => {
        const updated = [newStatementUpload, ...prev];
        saveState('STATEMENTS', updated);
        return updated;
      });

      setPendingReviewTransactions(reviewTxs);
      saveState('REVIEW_TXS', reviewTxs);

      setActiveModule('upload-statement');

      addToast({
        type: 'success',
        title: `${result.summary.bankName} Analyzed`,
        message: `Extracted ${reviewTxs.length} exact transaction rows across ${result.summary.totalPages} page(s).`,
      });

      return { success: true, count: reviewTxs.length };
    } catch (err: any) {
      const errMsg = err?.message || 'Failed to extract statement data. Please verify password or file structure.';
      addToast({
        type: 'error',
        title: 'Extraction Error',
        message: errMsg,
      });
      return { success: false, count: 0, error: errMsg };
    } finally {
      setIsAnalyzingStatement(false);
    }
  };

  // REVIEW & MANUAL CORRECTION
  const updateReviewCategory = (id: string, category: ExpenseCategory) => {
    setPendingReviewTransactions(prev => {
      const updated = prev.map(t =>
        t.id === id ? { ...t, selectedCategory: category, isCustomCategory: true } : t
      );
      saveState('REVIEW_TXS', updated);
      return updated;
    });
  };

  const editReviewTransaction = (id: string, updates: Partial<ImportedReviewTransaction>) => {
    setPendingReviewTransactions(prev => {
      const updated = prev.map(t => {
        if (t.id === id) {
          const merged = { ...t, ...updates };
          if (merged.debitAmount > 0 || merged.creditAmount > 0) {
            merged.status = 'Pending Review';
            merged.validationErrors = [];
          }
          return merged;
        }
        return t;
      });
      saveState('REVIEW_TXS', updated);
      return updated;
    });

    addToast({
      type: 'info',
      title: 'Row Corrected',
      message: 'Transaction fields updated manually.',
    });
  };

  const deleteReviewTransaction = (id: string) => {
    setPendingReviewTransactions(prev => {
      const updated = prev.filter(t => t.id !== id);
      saveState('REVIEW_TXS', updated);
      return updated;
    });
    addToast({
      type: 'info',
      title: 'Row Removed',
      message: 'Transaction discarded from review queue.',
    });
  };

  const batchChangeReviewCategory = (ids: string[], category: ExpenseCategory) => {
    setPendingReviewTransactions(prev => {
      const updated = prev.map(t =>
        ids.includes(t.id) ? { ...t, selectedCategory: category, isCustomCategory: true } : t
      );
      saveState('REVIEW_TXS', updated);
      return updated;
    });
    addToast({
      type: 'success',
      title: 'Category Updated',
      message: `Updated category for ${ids.length} transactions to ${category}.`,
    });
  };

  const approveAndSaveAllReviewTransactions = () => {
    if (pendingReviewTransactions.length === 0) return;

    const newExpenses: Expense[] = pendingReviewTransactions
      .filter(t => t.debitAmount > 0)
      .map((t, idx) => ({
        id: `exp-${Date.now()}-${idx}`,
        referenceNumber: t.referenceNumber || `EXP-${new Date().getFullYear()}-${String(expenses.length + idx + 1).padStart(4, '0')}`,
        date: t.date,
        rawDate: t.rawDate,
        description: t.description || t.merchant,
        category: t.selectedCategory,
        amount: t.debitAmount,
        status: 'Approved',
        notes: `Extracted from statement: ${t.merchant}`,
        createdAt: new Date().toISOString(),
      }));

    setExpenses(prev => {
      const updated = [...newExpenses, ...prev];
      saveState('EXPENSES', updated);
      return updated;
    });

    // Auto-match salary payments if any
    pendingReviewTransactions.forEach(t => {
      if (t.selectedCategory === 'Employee Salaries' || /salary|payroll/i.test(t.description)) {
        const matchingEmp = employees.find(
          e => e.status === 'Active' && (t.description.toLowerCase().includes(e.fullName.toLowerCase()) || Math.abs(e.monthlySalary - t.debitAmount) < 10)
        );
        if (matchingEmp) {
          const month = t.date.substring(0, 7);
          updateSalaryStatus(matchingEmp.id, month, 'Paid', t.date);
        }
      }
    });

    setPendingReviewTransactions([]);
    saveState('REVIEW_TXS', []);

    addToast({
      type: 'success',
      title: 'Transactions Saved',
      message: `Saved ${newExpenses.length} exact verified transactions to official expenses.`,
    });

    setActiveModule('expenses');
  };

  const approveAndSaveSelectedTransactions = (ids: string[]) => {
    const toSave = pendingReviewTransactions.filter(t => ids.includes(t.id) && t.debitAmount > 0);
    if (toSave.length === 0) return;

    const newExpenses: Expense[] = toSave.map((t, idx) => ({
      id: `exp-${Date.now()}-${idx}`,
      referenceNumber: t.referenceNumber || `EXP-${new Date().getFullYear()}-${String(expenses.length + idx + 1).padStart(4, '0')}`,
      date: t.date,
      rawDate: t.rawDate,
      description: t.description || t.merchant,
      category: t.selectedCategory,
      amount: t.debitAmount,
      status: 'Approved',
      notes: `Extracted from statement: ${t.merchant}`,
      createdAt: new Date().toISOString(),
    }));

    setExpenses(prev => {
      const updated = [...newExpenses, ...prev];
      saveState('EXPENSES', updated);
      return updated;
    });

    setPendingReviewTransactions(prev => {
      const remaining = prev.filter(t => !ids.includes(t.id));
      saveState('REVIEW_TXS', remaining);
      return remaining;
    });

    addToast({
      type: 'success',
      title: 'Items Saved',
      message: `Saved ${newExpenses.length} verified transactions to expenses.`,
    });
  };

  const discardPendingReview = () => {
    setPendingReviewTransactions([]);
    setExtractionResult(null);
    saveState('REVIEW_TXS', []);
    saveState('EXTRACT_RES', null);
    addToast({
      type: 'info',
      title: 'Review Cleared',
      message: 'Pending statement review queue has been cleared.',
    });
  };

  // EXPENSES CRUD
  const addExpense = (expenseData: Omit<Expense, 'id' | 'referenceNumber' | 'createdAt'>): Expense => {
    const newRef = `EXP-${new Date().getFullYear()}-${String(expenses.length + 1).padStart(4, '0')}`;
    const newExpense: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      referenceNumber: newRef,
      createdAt: new Date().toISOString(),
    };

    setExpenses(prev => {
      const updated = [newExpense, ...prev];
      saveState('EXPENSES', updated);
      return updated;
    });

    addToast({
      type: 'success',
      title: 'Expense Added',
      message: `${newExpense.referenceNumber} recorded.`,
    });

    return newExpense;
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    setExpenses(prev => {
      const updated = prev.map(e => (e.id === id ? { ...e, ...updates } : e));
      saveState('EXPENSES', updated);
      return updated;
    });

    addToast({
      type: 'info',
      title: 'Expense Updated',
      message: 'Changes saved.',
    });
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => {
      const updated = prev.filter(e => e.id !== id);
      saveState('EXPENSES', updated);
      return updated;
    });

    addToast({
      type: 'warning',
      title: 'Expense Deleted',
      message: 'Expense removed.',
    });
  };

  // EMPLOYEES CRUD
  const addEmployee = (employeeData: Omit<Employee, 'id' | 'salaryHistory'>): Employee => {
    const newEmp: Employee = {
      ...employeeData,
      id: `emp-${Date.now()}`,
      allowances: employeeData.allowances || 0,
      bonuses: employeeData.bonuses || 0,
      deductions: employeeData.deductions || 0,
      salaryHistory: [],
    };

    setEmployees(prev => {
      const updated = [newEmp, ...prev];
      saveState('EMPLOYEES', updated);
      return updated;
    });

    addToast({
      type: 'success',
      title: 'Employee Added',
      message: `${newEmp.fullName} (${newEmp.position}) registered.`,
    });

    return newEmp;
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    setEmployees(prev => {
      const updated = prev.map(e => (e.id === id ? { ...e, ...updates } : e));
      saveState('EMPLOYEES', updated);
      return updated;
    });

    addToast({
      type: 'info',
      title: 'Employee Updated',
      message: 'Employee record updated.',
    });
  };

  const deleteEmployee = (id: string) => {
    setEmployees(prev => {
      const updated = prev.filter(e => e.id !== id);
      saveState('EMPLOYEES', updated);
      return updated;
    });

    addToast({
      type: 'warning',
      title: 'Employee Removed',
      message: 'Employee removed from registry.',
    });
  };

  // PAYROLL MANAGEMENT
  const recordSalaryPayment = (
    employeeId: string,
    fiscalMonth: string,
    paymentDetails: {
      paymentDate: string;
      paymentMethod: string;
      referenceNumber?: string;
      notes?: string;
    }
  ) => {
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) return;

    const base = emp.monthlySalary || 0;
    const allowances = emp.allowances || 0;
    const bonuses = emp.bonuses || 0;
    const deductions = emp.deductions || 0;
    const net = base + allowances + bonuses - deductions;

    const newSlip: SalarySlip = {
      id: `slip-${Date.now()}`,
      employeeId,
      fiscalMonth,
      baseSalary: base,
      allowances,
      bonuses,
      deductions,
      netSalary: net,
      paymentStatus: 'Paid',
      paymentDate: paymentDetails.paymentDate,
      paymentMethod: paymentDetails.paymentMethod,
      referenceNumber: paymentDetails.referenceNumber || `PAY-${fiscalMonth}-${emp.employeeId}`,
      notes: paymentDetails.notes,
    };

    setEmployees(prev => {
      const updated = prev.map(e => {
        if (e.id === employeeId) {
          const existingHistory = e.salaryHistory.filter(s => s.fiscalMonth !== fiscalMonth);
          return {
            ...e,
            salaryHistory: [newSlip, ...existingHistory],
          };
        }
        return e;
      });
      saveState('EMPLOYEES', updated);
      return updated;
    });

    addExpense({
      date: paymentDetails.paymentDate,
      description: `Salary Disbursement: ${emp.fullName} (${emp.employeeId}) - ${fiscalMonth}`,
      category: 'Employee Salaries',
      amount: net,
      status: 'Approved',
      notes: `Payroll for ${fiscalMonth} via ${paymentDetails.paymentMethod} (Ref: ${newSlip.referenceNumber})`,
    });

    addToast({
      type: 'success',
      title: 'Salary Disbursed',
      message: `Recorded ₹${net.toLocaleString('en-IN')} paid to ${emp.fullName} for ${fiscalMonth}.`,
    });
  };

  const updateSalaryStatus = (
    employeeId: string,
    fiscalMonth: string,
    status: PayrollStatus,
    paymentDate?: string
  ) => {
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) return;

    const base = emp.monthlySalary || 0;
    const allowances = emp.allowances || 0;
    const bonuses = emp.bonuses || 0;
    const deductions = emp.deductions || 0;
    const net = base + allowances + bonuses - deductions;

    setEmployees(prev => {
      const updated = prev.map(e => {
        if (e.id === employeeId) {
          const existingSlip = e.salaryHistory.find(s => s.fiscalMonth === fiscalMonth);
          if (existingSlip) {
            const updatedHistory = e.salaryHistory.map(s =>
              s.fiscalMonth === fiscalMonth
                ? { ...s, paymentStatus: status, paymentDate: paymentDate || s.paymentDate }
                : s
            );
            return { ...e, salaryHistory: updatedHistory };
          } else {
            const newSlip: SalarySlip = {
              id: `slip-${Date.now()}`,
              employeeId,
              fiscalMonth,
              baseSalary: base,
              allowances,
              bonuses,
              deductions,
              netSalary: net,
              paymentStatus: status,
              paymentDate: paymentDate || (status === 'Paid' ? new Date().toISOString().split('T')[0] : undefined),
              referenceNumber: `PAY-${fiscalMonth}-${e.employeeId}`,
            };
            return { ...e, salaryHistory: [newSlip, ...e.salaryHistory] };
          }
        }
        return e;
      });
      saveState('EMPLOYEES', updated);
      return updated;
    });

    if (status === 'Paid') {
      const alreadyHasExpense = expenses.some(
        exp => exp.category === 'Employee Salaries' && exp.description.includes(emp.employeeId) && exp.description.includes(fiscalMonth)
      );

      if (!alreadyHasExpense) {
        addExpense({
          date: paymentDate || new Date().toISOString().split('T')[0],
          description: `Salary Payment: ${emp.fullName} (${emp.employeeId}) - ${fiscalMonth}`,
          category: 'Employee Salaries',
          amount: net,
          status: 'Approved',
          notes: `Payroll tracker for ${fiscalMonth}`,
        });
      }
    }
  };

  // BUDGETS CRUD
  const addBudget = (budgetData: Omit<DepartmentBudget, 'id' | 'spentAmount'>) => {
    const newBudget: DepartmentBudget = {
      ...budgetData,
      id: `bgt-${Date.now()}`,
      spentAmount: 0,
    };

    setBudgets(prev => {
      const updated = [newBudget, ...prev];
      saveState('BUDGETS', updated);
      return updated;
    });

    addToast({
      type: 'success',
      title: 'Budget Created',
      message: `Budget set for ${newBudget.department}.`,
    });
  };

  const updateBudget = (id: string, allocatedBudget: number, notes?: string) => {
    setBudgets(prev => {
      const updated = prev.map(b => (b.id === id ? { ...b, allocatedBudget, notes: notes ?? b.notes } : b));
      saveState('BUDGETS', updated);
      return updated;
    });
  };

  const deleteBudget = (id: string) => {
    setBudgets(prev => {
      const updated = prev.filter(b => b.id !== id);
      saveState('BUDGETS', updated);
      return updated;
    });
  };

  // SUPPLIERS CRUD
  const addSupplier = (supplierData: Omit<Supplier, 'id' | 'totalPaidYTD'>) => {
    const newSupplier: Supplier = {
      ...supplierData,
      id: `sup-${Date.now()}`,
      totalPaidYTD: 0,
    };

    setSuppliers(prev => {
      const updated = [newSupplier, ...prev];
      saveState('SUPPLIERS', updated);
      return updated;
    });

    addToast({
      type: 'success',
      title: 'Supplier Added',
      message: `${newSupplier.name} added.`,
    });
  };

  const updateSupplier = (id: string, updates: Partial<Supplier>) => {
    setSuppliers(prev => {
      const updated = prev.map(s => (s.id === id ? { ...s, ...updates } : s));
      saveState('SUPPLIERS', updated);
      return updated;
    });
  };

  const deleteSupplier = (id: string) => {
    setSuppliers(prev => {
      const updated = prev.filter(s => s.id !== id);
      saveState('SUPPLIERS', updated);
      return updated;
    });
  };

  const paySupplier = (supplierId: string, amount: number) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    if (!supplier) return;

    addExpense({
      date: new Date().toISOString().split('T')[0],
      description: `Payment to ${supplier.name}`,
      category: supplier.category,
      amount,
      status: 'Approved',
      notes: `Supplier payment for ${supplier.name}`,
    });

    setSuppliers(prev => {
      const updated = prev.map(s =>
        s.id === supplierId
          ? {
              ...s,
              pendingPaymentAmount: Math.max(0, s.pendingPaymentAmount - amount),
              totalPaidYTD: s.totalPaidYTD + amount,
            }
          : s
      );
      saveState('SUPPLIERS', updated);
      return updated;
    });

    addToast({
      type: 'success',
      title: 'Payment Recorded',
      message: `Recorded payment of ₹${amount.toLocaleString('en-IN')} to ${supplier.name}.`,
    });
  };

  // EXPORTS
  const exportExpensesExcel = () => {
    if (expenses.length === 0) {
      addToast({ type: 'warning', title: 'No Data', message: 'No expenses available to export.' });
      return;
    }

    const rows = expenses.map(e => ({
      'Reference #': e.referenceNumber,
      Date: e.date,
      Category: e.category,
      Description: e.description,
      'Amount (INR)': e.amount,
      Status: e.status,
      Receipt: e.receiptFileName || 'No receipt',
      Notes: e.notes || '',
    }));

    exportToExcel(rows, `Expenses_Export_${new Date().toISOString().split('T')[0]}`);
  };

  const exportExpensesCSV = () => {
    if (expenses.length === 0) {
      addToast({ type: 'warning', title: 'No Data', message: 'No expenses available to export.' });
      return;
    }

    const headers = 'Reference,Date,Category,Description,Amount,Status,Receipt,Notes\n';
    const rows = expenses
      .map(
        e =>
          `"${e.referenceNumber}","${e.date}","${e.category}","${e.description.replace(/"/g, '""')}",${e.amount},"${e.status}","${e.receiptFileName || ''}","${(e.notes || '').replace(/"/g, '""')}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Expenses_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportPayrollExcel = (fiscalMonth: string) => {
    if (employees.length === 0) {
      addToast({ type: 'warning', title: 'No Data', message: 'No employees in registry.' });
      return;
    }

    const rows = employees.map(emp => {
      const slip = emp.salaryHistory.find(s => s.fiscalMonth === fiscalMonth);
      const base = emp.monthlySalary || 0;
      const allowances = emp.allowances || 0;
      const bonuses = emp.bonuses || 0;
      const deductions = emp.deductions || 0;
      const net = base + allowances + bonuses - deductions;

      return {
        'Employee ID': emp.employeeId,
        'Full Name': emp.fullName,
        Department: emp.department,
        Position: emp.position,
        'Employment Type': emp.employmentType,
        'Fiscal Month': fiscalMonth,
        'Base Salary (₹)': base,
        'Allowances (₹)': allowances,
        'Bonuses (₹)': bonuses,
        'Deductions (₹)': deductions,
        'Net Salary (₹)': net,
        'Payment Status': slip ? slip.paymentStatus : 'Unpaid',
        'Payment Date': slip ? slip.paymentDate || '—' : '—',
        'Reference #': slip ? slip.referenceNumber || '—' : '—',
      };
    });

    exportToExcel(rows, `Payroll_Summary_${fiscalMonth}`);
  };

  // Reset Clean State
  const clearAllData = () => {
    setExpenses([]);
    setPendingReviewTransactions([]);
    setStatements([]);
    setActiveStatement(null);
    setExtractionResult(null);
    setEmployees([]);
    setBudgets([]);
    setSuppliers([]);
    localStorage.clear();
    addToast({
      type: 'info',
      title: 'Ledger Reset',
      message: 'All records have been cleared to a clean state.',
    });
  };

  return (
    <FinanceContext.Provider
      value={{
        activeModule,
        setActiveModule,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        globalSearchQuery,
        setGlobalSearchQuery,

        // Bank Statement Engine & Verification
        statements,
        activeStatement,
        extractionResult,
        pendingReviewTransactions,
        isAnalyzingStatement,
        uploadAndAnalyzeStatement,
        updateReviewCategory,
        editReviewTransaction,
        deleteReviewTransaction,
        batchChangeReviewCategory,
        approveAndSaveAllReviewTransactions,
        approveAndSaveSelectedTransactions,
        discardPendingReview,

        // Expenses
        expenses,
        addExpense,
        updateExpense,
        deleteExpense,

        // Employees & Payroll
        employees,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        recordSalaryPayment,
        updateSalaryStatus,
        totalMonthlyPayroll,
        salariesPaidThisMonth,
        salariesPendingThisMonth,
        activeEmployeesCount,

        // Budgets
        budgets,
        addBudget,
        updateBudget,
        deleteBudget,

        // Suppliers
        suppliers,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        paySupplier,

        // Simplified Metrics
        thisMonthSpending,
        totalTransactionsCount,
        pendingPaymentsTotal,
        largestExpense,
        recentTransactions,

        // Toasts
        toasts,
        addToast,
        removeToast,

        // Exports
        exportExpensesExcel,
        exportExpensesCSV,
        exportPayrollExcel,
        clearAllData,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = (): FinanceContextType => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
