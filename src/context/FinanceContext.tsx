import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  NavigationModule,
  Expense,
  ExpenseStatus,
  ExpenseCategory,
  Department,
  BankStatement,
  BankTransaction,
  CategorizationRule,
  DepartmentBudget,
  Vendor,
  Invoice,
  InvoiceStatus,
  EmployeeExpenseClaim,
  ReimbursementStatus,
  AuditRecord,
} from '../types/finance';
import {
  INITIAL_EXPENSES,
  INITIAL_BUDGETS,
  INITIAL_VENDORS,
  INITIAL_INVOICES,
  INITIAL_EMPLOYEE_CLAIMS,
  INITIAL_AUDIT_LOGS,
} from '../data/mockData';
import {
  SAMPLE_STATEMENT_METADATA,
  SAMPLE_CHASE_TRANSACTIONS,
} from '../data/bankStatementSamples';
import { DEFAULT_RULES, autoCategorizeMerchant } from '../utils/rulesEngine';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
}

interface FinanceContextType {
  // Navigation & Role
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeModule: NavigationModule;
  setActiveModule: (module: NavigationModule) => void;
  isCompactMode: boolean;
  setIsCompactMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (val: boolean | ((prev: boolean) => boolean)) => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (val: boolean) => void;

  // Expenses CRUD
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'referenceNumber' | 'auditHistory'>) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  bulkUpdateExpenseStatus: (ids: string[], status: ExpenseStatus) => void;
  bulkUpdateExpenseCategory: (ids: string[], category: ExpenseCategory) => void;
  bulkDeleteExpenses: (ids: string[]) => void;

  // Bank Statements & Transactions
  statements: BankStatement[];
  transactions: BankTransaction[];
  importBankStatement: (
    meta: Omit<BankStatement, 'id' | 'importedAt' | 'importedBy' | 'transactionCount' | 'reconciledCount'>,
    txs: Array<Omit<BankTransaction, 'id' | 'statementId'>>
  ) => void;
  reconcileTransaction: (txId: string, expenseId?: string) => void;
  autoReconcileAll: () => number;
  createExpenseFromTransaction: (txId: string) => void;

  // Categorization Rules
  rules: CategorizationRule[];
  addRule: (rule: Omit<CategorizationRule, 'id' | 'matchCount'>) => void;
  updateRule: (id: string, updates: Partial<CategorizationRule>) => void;
  deleteRule: (id: string) => void;
  reapplyAllRules: () => void;

  // Budgets
  budgets: DepartmentBudget[];
  updateBudget: (id: string, allocated: number, notes?: string) => void;

  // Vendors
  vendors: Vendor[];
  addVendor: (vendor: Omit<Vendor, 'id' | 'totalYtdSpend'>) => void;
  updateVendor: (id: string, updates: Partial<Vendor>) => void;
  recordVendorPayment: (vendorId: string, amount: number) => void;
  payVendor: (vendorId: string, amount: number) => void;

  // Invoices
  invoices: Invoice[];
  addInvoice: (inv: Omit<Invoice, 'id'>) => void;
  updateInvoiceStatus: (id: string, status: InvoiceStatus) => void;

  // Employee Claims
  claims: EmployeeExpenseClaim[];
  addClaim: (claim: Omit<EmployeeExpenseClaim, 'id' | 'claimNumber' | 'submittedAt'>) => void;
  updateClaimStatus: (id: string, status: ReimbursementStatus) => void;
  approveClaim: (id: string) => void;
  rejectClaim: (id: string) => void;

  // Audit Logs
  auditLogs: AuditRecord[];
  logAudit: (action: string, entity: string, details: string, entityId?: string) => void;

  // Toasts
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;

  // Computed & Filtered
  filteredExpenses: Expense[];
  cashBalance: number;
  todaySpend: number;
  weekSpend: number;
  monthSpend: number;
  pendingPayablesTotal: number;
  totalEmployeeExpenseTotal: number;
  totalVendorExpenseTotal: number;
  totalMonthlyRevenue: number;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const STORAGE_KEY = 'OPERATIONS_FINANCE_ERP_STATE_V1';

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from local storage or defaults
  const [currentRole, setCurrentRole] = useState<UserRole>('COO');
  const [activeModule, setActiveModule] = useState<NavigationModule>('overview');
  const [isCompactMode, setIsCompactMode] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState<boolean>(false);

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_EXPENSES`);
      return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
    } catch {
      return INITIAL_EXPENSES;
    }
  });

  const [statements, setStatements] = useState<BankStatement[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_STATEMENTS`);
      return saved ? JSON.parse(saved) : SAMPLE_STATEMENT_METADATA;
    } catch {
      return SAMPLE_STATEMENT_METADATA;
    }
  });

  const [transactions, setTransactions] = useState<BankTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_TRANSACTIONS`);
      return saved ? JSON.parse(saved) : SAMPLE_CHASE_TRANSACTIONS;
    } catch {
      return SAMPLE_CHASE_TRANSACTIONS;
    }
  });

  const [rules, setRules] = useState<CategorizationRule[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_RULES`);
      return saved ? JSON.parse(saved) : DEFAULT_RULES;
    } catch {
      return DEFAULT_RULES;
    }
  });

  const [budgets, setBudgets] = useState<DepartmentBudget[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_BUDGETS`);
      return saved ? JSON.parse(saved) : INITIAL_BUDGETS;
    } catch {
      return INITIAL_BUDGETS;
    }
  });

  const [vendors, setVendors] = useState<Vendor[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_VENDORS`);
      return saved ? JSON.parse(saved) : INITIAL_VENDORS;
    } catch {
      return INITIAL_VENDORS;
    }
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_INVOICES`);
      return saved ? JSON.parse(saved) : INITIAL_INVOICES;
    } catch {
      return INITIAL_INVOICES;
    }
  });

  const [claims, setClaims] = useState<EmployeeExpenseClaim[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_CLAIMS`);
      return saved ? JSON.parse(saved) : INITIAL_EMPLOYEE_CLAIMS;
    } catch {
      return INITIAL_EMPLOYEE_CLAIMS;
    }
  });

  const [auditLogs, setAuditLogs] = useState<AuditRecord[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_AUDIT`);
      return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_EXPENSES`, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_STATEMENTS`, JSON.stringify(statements));
  }, [statements]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_TRANSACTIONS`, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_RULES`, JSON.stringify(rules));
  }, [rules]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_BUDGETS`, JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_VENDORS`, JSON.stringify(vendors));
  }, [vendors]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_INVOICES`, JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_CLAIMS`, JSON.stringify(claims));
  }, [claims]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_AUDIT`, JSON.stringify(auditLogs));
  }, [auditLogs]);

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

  // Audit Logger Helper
  const logAudit = (action: string, entity: string, details: string, entityId?: string) => {
    const newRecord: AuditRecord = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      user: currentRole === 'COO' ? 'Rachel Green (COO)' : currentRole === 'CTO' ? 'Alex Rivera (CTO)' : currentRole === 'CEO' ? 'David Vance (CEO)' : 'Marcus Cole (CFO)',
      role: currentRole,
      action,
      entity,
      entityId,
      details,
      ipAddress: '192.168.1.45',
    };
    setAuditLogs(prev => [newRecord, ...prev]);
  };

  // Expenses Operations
  const addExpense = (newExpData: Omit<Expense, 'id' | 'referenceNumber' | 'auditHistory'>) => {
    const seq = expenses.length + 800 + 1;
    const ref = `EXP-2026-${seq}`;
    const newExp: Expense = {
      ...newExpData,
      id: `exp-${Date.now()}`,
      referenceNumber: ref,
      auditHistory: [
        {
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          user: `${currentRole} User`,
          role: currentRole,
          action: 'Created expense entry',
        },
      ],
    };

    setExpenses(prev => [newExp, ...prev]);
    logAudit('CREATE_EXPENSE', `Expense ${ref}`, `Logged expense of $${newExp.amount.toFixed(2)} for ${newExp.description}`, newExp.id);
    addToast({
      type: 'success',
      title: 'Expense Recorded',
      message: `${ref} ($${newExp.amount.toFixed(2)}) recorded successfully.`,
    });
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    setExpenses(prev =>
      prev.map(exp => {
        if (exp.id === id) {
          const updated = { ...exp, ...updates };
          const logEntry = {
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            user: `${currentRole} User`,
            role: currentRole,
            action: `Modified fields: ${Object.keys(updates).join(', ')}`,
          };
          updated.auditHistory = [logEntry, ...(exp.auditHistory || [])];
          return updated;
        }
        return exp;
      })
    );
    logAudit('UPDATE_EXPENSE', `Expense ${id}`, `Updated fields: ${Object.keys(updates).join(', ')}`, id);
    addToast({
      type: 'info',
      title: 'Expense Updated',
      message: `Changes saved for transaction.`,
    });
  };

  const deleteExpense = (id: string) => {
    const target = expenses.find(e => e.id === id);
    setExpenses(prev => prev.filter(e => e.id !== id));
    logAudit('DELETE_EXPENSE', `Expense ${target?.referenceNumber || id}`, `Deleted expense record`, id);
    addToast({
      type: 'warning',
      title: 'Expense Removed',
      message: `Record ${target?.referenceNumber || id} deleted.`,
    });
  };

  const bulkUpdateExpenseStatus = (ids: string[], status: ExpenseStatus) => {
    setExpenses(prev =>
      prev.map(exp => {
        if (ids.includes(exp.id)) {
          return {
            ...exp,
            status,
            auditHistory: [
              {
                timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                user: `${currentRole} User`,
                role: currentRole,
                action: `Status changed to ${status}`,
              },
              ...exp.auditHistory,
            ],
          };
        }
        return exp;
      })
    );
    logAudit('BULK_STATUS_CHANGE', `${ids.length} Expenses`, `Updated status to ${status}`);
    addToast({
      type: 'success',
      title: 'Batch Action Complete',
      message: `Updated status of ${ids.length} expense(s) to ${status}.`,
    });
  };

  const bulkUpdateExpenseCategory = (ids: string[], category: ExpenseCategory) => {
    setExpenses(prev =>
      prev.map(exp => {
        if (ids.includes(exp.id)) {
          return {
            ...exp,
            category,
            auditHistory: [
              {
                timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                user: `${currentRole} User`,
                role: currentRole,
                action: `Category recategorized to ${category}`,
              },
              ...exp.auditHistory,
            ],
          };
        }
        return exp;
      })
    );
    logAudit('BULK_RECATEGORIZE', `${ids.length} Expenses`, `Recategorized to ${category}`);
    addToast({
      type: 'info',
      title: 'Category Updated',
      message: `Recategorized ${ids.length} expense(s) to ${category}.`,
    });
  };

  const bulkDeleteExpenses = (ids: string[]) => {
    setExpenses(prev => prev.filter(e => !ids.includes(e.id)));
    logAudit('BULK_DELETE_EXPENSES', `${ids.length} Expenses`, `Deleted ${ids.length} expense records`);
    addToast({
      type: 'warning',
      title: 'Expenses Deleted',
      message: `Removed ${ids.length} selected expense(s).`,
    });
  };

  // Bank Statement Import
  const importBankStatement = (
    meta: Omit<BankStatement, 'id' | 'importedAt' | 'importedBy' | 'transactionCount' | 'reconciledCount'>,
    txs: Array<Omit<BankTransaction, 'id' | 'statementId'>>
  ) => {
    const stmtId = `stmt-${Date.now()}`;
    const newStatement: BankStatement = {
      ...meta,
      id: stmtId,
      importedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      importedBy: `${currentRole} User`,
      transactionCount: txs.length,
      reconciledCount: 0,
    };

    const newTransactions: BankTransaction[] = txs.map((t, idx) => ({
      ...t,
      id: `tx-${Date.now()}-${idx}`,
      statementId: stmtId,
    }));

    setStatements(prev => [newStatement, ...prev]);
    setTransactions(prev => [...newTransactions, ...prev]);
    logAudit('IMPORT_STATEMENT', `Bank Statement ${meta.fileName}`, `Imported ${txs.length} transactions totaling $${meta.totalDebits.toFixed(2)} debits.`);
    addToast({
      type: 'success',
      title: 'Statement Imported',
      message: `Loaded ${txs.length} transactions from ${meta.fileName}.`,
    });
  };

  const reconcileTransaction = (txId: string, expenseId?: string) => {
    setTransactions(prev =>
      prev.map(tx => {
        if (tx.id === txId) {
          return {
            ...tx,
            reconciliationStatus: 'Matched',
            matchedExpenseId: expenseId || tx.matchedExpenseId,
          };
        }
        return tx;
      })
    );
    logAudit('RECONCILE_TRANSACTION', `Transaction ${txId}`, `Reconciled with ledger expense`);
    addToast({
      type: 'success',
      title: 'Transaction Reconciled',
      message: `Bank line reconciled with ledger.`,
    });
  };

  const autoReconcileAll = (): number => {
    let matchedCount = 0;
    const updatedTxs = transactions.map(tx => {
      if (tx.reconciliationStatus === 'Matched' || tx.reconciliationStatus === 'Auto-Reconciled') {
        return tx;
      }
      // Attempt exact amount and date match against expenses
      const candidate = expenses.find(
        e => Math.abs(e.amount - tx.debitAmount) < 0.01 && e.status === 'Approved'
      );
      if (candidate) {
        matchedCount++;
        return {
          ...tx,
          reconciliationStatus: 'Auto-Reconciled' as const,
          matchedExpenseId: candidate.id,
        };
      }
      return tx;
    });

    setTransactions(updatedTxs);
    logAudit('AUTO_RECONCILE', 'Bank Statements', `Auto-reconciled ${matchedCount} transactions.`);
    addToast({
      type: 'success',
      title: 'Auto-Reconciliation Complete',
      message: `Successfully reconciled ${matchedCount} matching transactions.`,
    });
    return matchedCount;
  };

  const createExpenseFromTransaction = (txId: string) => {
    const tx = transactions.find(t => t.id === txId);
    if (!tx) return;

    const catResult = autoCategorizeMerchant(tx.merchant, rules);
    addExpense({
      date: tx.date,
      employee: 'Rachel Green',
      department: catResult.department,
      category: catResult.category,
      amount: tx.debitAmount > 0 ? tx.debitAmount : tx.creditAmount,
      gstAmount: 0,
      tdsAmount: 0,
      paymentMethod: 'Corporate Card / Bank Debit',
      description: tx.merchant,
      status: 'Approved',
      isTechExpense: ['Cloud services', 'Software subscriptions', 'Equipment'].includes(catResult.category),
      glCode: `GL-${catResult.category.substring(0, 4).toUpperCase()}-AUTO`,
      taxAmount: 0.0,
      notes: `Generated from unmatched bank transaction ${tx.referenceNumber}`,
    });

    // Mark reconciled
    reconcileTransaction(txId);
  };

  // Rules Engine
  const addRule = (newRuleData: Omit<CategorizationRule, 'id' | 'matchCount'>) => {
    const newRule: CategorizationRule = {
      ...newRuleData,
      id: `rule-${Date.now()}`,
      matchCount: 0,
    };
    setRules(prev => [newRule, ...prev]);
    logAudit('CREATE_RULE', `Rule ${newRule.pattern}`, `Added automatic categorization rule.`);
    addToast({
      type: 'success',
      title: 'Rule Created',
      message: `Rule for "${newRule.pattern}" added.`,
    });
  };

  const updateRule = (id: string, updates: Partial<CategorizationRule>) => {
    setRules(prev => prev.map(r => (r.id === id ? { ...r, ...updates } : r)));
    logAudit('UPDATE_RULE', `Rule ${id}`, `Updated rule parameters.`);
  };

  const deleteRule = (id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
    logAudit('DELETE_RULE', `Rule ${id}`, `Deleted rule.`);
    addToast({
      type: 'info',
      title: 'Rule Deleted',
      message: 'Categorization rule removed.',
    });
  };

  const reapplyAllRules = () => {
    let changed = 0;
    const updatedExpenses = expenses.map(exp => {
      const res = autoCategorizeMerchant(exp.description, rules);
      if (res.category !== exp.category && res.confidence >= 0.9) {
        changed++;
        return {
          ...exp,
          category: res.category,
          department: res.department,
        };
      }
      return exp;
    });

    setExpenses(updatedExpenses);
    logAudit('REAPPLY_RULES', 'Expense Ledger', `Re-applied rules across ${expenses.length} expenses; ${changed} updated.`);
    addToast({
      type: 'info',
      title: 'Rules Applied',
      message: `Re-evaluated rules. Updated categories for ${changed} items.`,
    });
  };

  // Budgets
  const updateBudget = (id: string, allocated: number, notes?: string) => {
    setBudgets(prev =>
      prev.map(b => (b.id === id ? { ...b, allocatedBudget: allocated, notes: notes ?? b.notes, lastUpdated: new Date().toISOString().split('T')[0] } : b))
    );
    logAudit('UPDATE_BUDGET', `Budget ${id}`, `Adjusted allocation to $${allocated.toFixed(2)}.`);
    addToast({
      type: 'success',
      title: 'Budget Updated',
      message: `Department budget allocation saved.`,
    });
  };

  // Vendors
  const addVendor = (vData: Omit<Vendor, 'id' | 'totalYtdSpend'>) => {
    const newVendor: Vendor = {
      ...vData,
      id: `vnd-${Date.now()}`,
      totalYtdSpend: 0,
    };
    setVendors(prev => [newVendor, ...prev]);
    logAudit('CREATE_VENDOR', `Vendor ${newVendor.name}`, `Added vendor with payment terms ${newVendor.paymentTerms}.`);
    addToast({
      type: 'success',
      title: 'Vendor Added',
      message: `${newVendor.name} added to vendor directory.`,
    });
  };

  const updateVendor = (id: string, updates: Partial<Vendor>) => {
    setVendors(prev => prev.map(v => (v.id === id ? { ...v, ...updates } : v)));
    logAudit('UPDATE_VENDOR', `Vendor ${id}`, `Updated vendor profile.`);
    addToast({
      type: 'info',
      title: 'Vendor Saved',
      message: `Vendor details updated.`,
    });
  };

  const recordVendorPayment = (vendorId: string, amount: number) => {
    const target = vendors.find(v => v.id === vendorId);
    if (!target) return;

    setVendors(prev =>
      prev.map(v => {
        if (v.id === vendorId) {
          return {
            ...v,
            outstandingBalance: Math.max(0, v.outstandingBalance - amount),
            totalYtdSpend: v.totalYtdSpend + amount,
          };
        }
        return v;
      })
    );

    // Create an expense
    addExpense({
      date: new Date().toISOString().split('T')[0],
      employee: 'Rachel Green',
      department: target.department,
      category: target.category,
      amount,
      gstAmount: 0,
      tdsAmount: 0,
      paymentMethod: target.paymentMethod,
      description: `Payment Disbursement - ${target.name}`,
      status: 'Approved',
      isTechExpense: ['Cloud services', 'Software subscriptions', 'Equipment'].includes(target.category),
      glCode: `GL-AP-${target.name.substring(0, 4).toUpperCase()}`,
      taxAmount: 0.0,
      notes: `AP Settlement on ${target.paymentTerms}`,
    });

    logAudit('VENDOR_PAYMENT', `Vendor ${target.name}`, `Disbursed AP payment of $${amount.toFixed(2)}.`);
  };

  // Invoices
  const addInvoice = (invData: Omit<Invoice, 'id'>) => {
    const newInv: Invoice = {
      ...invData,
      id: `inv-${Date.now()}`,
    };
    setInvoices(prev => [newInv, ...prev]);
    logAudit('CREATE_INVOICE', `Invoice ${newInv.invoiceNumber}`, `Created ${newInv.type} invoice for $${newInv.amount.toFixed(2)}.`);
    addToast({
      type: 'success',
      title: 'Invoice Created',
      message: `${newInv.invoiceNumber} recorded.`,
    });
  };

  const updateInvoiceStatus = (id: string, status: InvoiceStatus) => {
    setInvoices(prev => prev.map(inv => (inv.id === id ? { ...inv, status } : inv)));
    logAudit('UPDATE_INVOICE_STATUS', `Invoice ${id}`, `Status changed to ${status}.`);
    addToast({
      type: 'info',
      title: 'Invoice Updated',
      message: `Invoice status changed to ${status}.`,
    });
  };

  // Employee Claims
  const addClaim = (claimData: Omit<EmployeeExpenseClaim, 'id' | 'claimNumber' | 'submittedAt'>) => {
    const claimSeq = claims.length + 19;
    const newClaim: EmployeeExpenseClaim = {
      ...claimData,
      id: `clm-${Date.now()}`,
      claimNumber: `CLM-2026-0${claimSeq}`,
      submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    setClaims(prev => [newClaim, ...prev]);
    logAudit('CREATE_CLAIM', `Claim ${newClaim.claimNumber}`, `Submitted by ${newClaim.employeeName} for $${newClaim.amount.toFixed(2)}.`);
    addToast({
      type: 'success',
      title: 'Claim Submitted',
      message: `${newClaim.claimNumber} logged for approval.`,
    });
  };

  const updateClaimStatus = (id: string, status: ReimbursementStatus) => {
    const target = claims.find(c => c.id === id);
    setClaims(prev =>
      prev.map(c => {
        if (c.id === id) {
          return {
            ...c,
            status,
            approvedBy: status === 'Approved' ? `${currentRole} User` : c.approvedBy,
            approvedAt: status === 'Approved' ? new Date().toISOString().replace('T', ' ').substring(0, 16) : c.approvedAt,
          };
        }
        return c;
      })
    );

    if (status === 'Approved' && target) {
      // Create expense ledger entry automatically
      addExpense({
        date: target.date,
        employee: target.employeeName,
        department: target.department,
        category: target.claimType === 'Travel Reimbursement' ? 'Travel' : target.claimType === 'Food & Per Diem' ? 'Food' : target.claimType === 'Equipment Purchase' ? 'Equipment' : 'Office expenses',
        amount: target.amount,
        gstAmount: 0,
        tdsAmount: 0,
        paymentMethod: 'Employee Reimbursement ACH',
        description: `Reimbursement ${target.claimNumber}: ${target.description}`,
        status: 'Approved',
        isTechExpense: target.claimType === 'Equipment Purchase',
        glCode: 'GL-6800-REIMBURSEMENT',
        taxAmount: 0.0,
        notes: `Auto-generated from approved claim ${target.claimNumber}`,
      });
    }

    logAudit('CLAIM_STATUS_CHANGE', `Claim ${target?.claimNumber || id}`, `Changed status to ${status}.`);
    addToast({
      type: 'info',
      title: 'Claim Updated',
      message: `Claim status changed to ${status}.`,
    });
  };

  const approveClaim = (id: string) => updateClaimStatus(id, 'Approved');
  const rejectClaim = (id: string) => updateClaimStatus(id, 'Rejected');
  const payVendor = (vendorId: string, amount: number) => recordVendorPayment(vendorId, amount);

  // CTO filter: Technology expenses only
  const filteredExpenses = currentRole === 'CTO'
    ? expenses.filter(e => e.isTechExpense || ['Cloud services', 'Software subscriptions', 'Equipment'].includes(e.category) || e.department === 'Engineering')
    : expenses;

  // Computed Financial Overview Figures
  const cashBalance = 14285500.42; // ₹1.43 Crore HDFC/ICICI Treasury
  
  const todaySpend = expenses
    .filter(e => e.date === '2026-08-16' && e.status === 'Approved')
    .reduce((sum, e) => sum + e.amount, 0);

  const weekSpend = expenses
    .filter(e => e.date >= '2026-08-10' && e.status === 'Approved')
    .reduce((sum, e) => sum + e.amount, 0);

  const monthSpend = expenses
    .filter(e => e.date >= '2026-08-01' && e.status === 'Approved')
    .reduce((sum, e) => sum + e.amount, 0);

  const pendingPayablesTotal = invoices
    .filter(i => i.type === 'Accounts Payable' && (i.status === 'Scheduled' || i.status === 'Received'))
    .reduce((sum, i) => sum + i.amount, 0);

  const totalEmployeeExpenseTotal = claims
    .filter(c => c.status === 'Approved' || c.status === 'Disbursed')
    .reduce((sum, c) => sum + c.amount, 0);

  const totalVendorExpenseTotal = vendors.reduce((sum, v) => sum + v.outstandingBalance, 0);

  const totalMonthlyRevenue = invoices
    .filter(i => i.type === 'Accounts Receivable' && (i.status === 'Paid' || i.status === 'Sent'))
    .reduce((sum, i) => sum + i.amount, 0);

  return (
    <FinanceContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        activeModule,
        setActiveModule,
        isCompactMode,
        setIsCompactMode,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        commandPaletteOpen,
        setCommandPaletteOpen,
        expenses,
        addExpense,
        updateExpense,
        deleteExpense,
        bulkUpdateExpenseStatus,
        bulkUpdateExpenseCategory,
        bulkDeleteExpenses,
        statements,
        transactions,
        importBankStatement,
        reconcileTransaction,
        autoReconcileAll,
        createExpenseFromTransaction,
        rules,
        addRule,
        updateRule,
        deleteRule,
        reapplyAllRules,
        budgets,
        updateBudget,
        vendors,
        addVendor,
        updateVendor,
        recordVendorPayment,
        payVendor,
        invoices,
        addInvoice,
        updateInvoiceStatus,
        claims,
        addClaim,
        updateClaimStatus,
        approveClaim,
        rejectClaim,
        auditLogs,
        logAudit,
        toasts,
        addToast,
        removeToast,
        filteredExpenses,
        cashBalance,
        todaySpend,
        weekSpend,
        monthSpend,
        pendingPayablesTotal,
        totalEmployeeExpenseTotal,
        totalVendorExpenseTotal,
        totalMonthlyRevenue,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};
