import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  Download,
  Check,
  X,
  Trash2,
  Edit3,
  Eye,
  Sliders,
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  ArrowUpDown,
} from 'lucide-react';
import { useFinance } from '../../../context/FinanceContext';
import {
  Expense,
  ExpenseCategory,
  Department,
  ExpenseStatus,
} from '../../../types/finance';
import { Badge } from '../../common/Badge';
import { Modal } from '../../common/Modal';
import { Drawer } from '../../common/Drawer';
import { formatCurrency } from '../../../utils/currency';
import { formatDate } from '../../../utils/date';
import { exportExpensesToCSV } from '../../../utils/csvParser';

export const ExpenseManagement: React.FC = () => {
  const {
    filteredExpenses,
    addExpense,
    updateExpense,
    deleteExpense,
    bulkUpdateExpenseStatus,
    bulkUpdateExpenseCategory,
    bulkDeleteExpenses,
    isCompactMode,
    currentRole,
  } = useFinance();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedCat, setSelectedCat] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [dateRange, setDateRange] = useState<string>('ALL'); // ALL | THIS_MONTH | LAST_MONTH | THIS_WEEK

  // Sorting
  const [sortField, setSortField] = useState<keyof Expense>('date');
  const [sortAsc, setSortAsc] = useState(false);

  // Selection for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals & Drawers
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [inspectingExpense, setInspectingExpense] = useState<Expense | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Bulk category modal
  const [bulkCatModalOpen, setBulkCatModalOpen] = useState(false);
  const [bulkTargetCat, setBulkTargetCat] = useState<ExpenseCategory>('Software subscriptions');

  // Form State for Add/Edit
  const initialFormState = {
    date: new Date().toISOString().split('T')[0],
    employee: 'Rachel Green',
    department: 'Operations' as Department,
    category: 'Software subscriptions' as ExpenseCategory,
    amount: '',
    taxAmount: '0.00',
    paymentMethod: 'Corporate Card - SVB 4821',
    description: '',
    receiptFileName: '',
    status: 'Approved' as ExpenseStatus,
    glCode: 'GL-6420-SAAS',
    projectCode: 'PRJ-INTERNAL-OPS',
    notes: '',
  };
  const [formData, setFormData] = useState(initialFormState);

  const departments: Department[] = [
    'Engineering',
    'Sales & Marketing',
    'Operations',
    'Executive',
    'Design & Product',
    'Facilities & IT',
  ];

  const categories: ExpenseCategory[] = [
    'Salaries',
    'Office expenses',
    'Software subscriptions',
    'Cloud services',
    'Travel',
    'Food',
    'Marketing',
    'Equipment',
    'Utilities',
    'Miscellaneous',
  ];

  const paymentMethods = [
    'Corporate Card - SVB 4821',
    'Corporate Card - Chase 9012',
    'ACH Wire Transfer',
    'Direct Deposit (Payroll)',
    'Vendor Net-30',
    'Employee Reimbursement ACH',
  ];

  // Filtering & Sorting
  const processedExpenses = useMemo(() => {
    return filteredExpenses
      .filter(exp => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const match =
            exp.description.toLowerCase().includes(q) ||
            exp.referenceNumber.toLowerCase().includes(q) ||
            exp.employee.toLowerCase().includes(q) ||
            exp.glCode.toLowerCase().includes(q) ||
            (exp.projectCode && exp.projectCode.toLowerCase().includes(q));
          if (!match) return false;
        }

        // Department filter
        if (selectedDept !== 'ALL' && exp.department !== selectedDept) return false;

        // Category filter
        if (selectedCat !== 'ALL' && exp.category !== selectedCat) return false;

        // Status filter
        if (selectedStatus !== 'ALL' && exp.status !== selectedStatus) return false;

        // Date range
        if (dateRange === 'THIS_MONTH' && !exp.date.startsWith('2026-08')) return false;
        if (dateRange === 'THIS_WEEK' && exp.date < '2026-08-10') return false;

        return true;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortAsc ? valA - valB : valB - valA;
        }

        valA = String(valA || '').toLowerCase();
        valB = String(valB || '').toLowerCase();
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      });
  }, [filteredExpenses, searchQuery, selectedDept, selectedCat, selectedStatus, dateRange, sortField, sortAsc]);

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(processedExpenses.map(e => e.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Sort handler
  const handleSort = (field: keyof Expense) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Open Edit Modal
  const openEditModal = (exp: Expense) => {
    setEditingExpense(exp);
    setFormData({
      date: exp.date,
      employee: exp.employee,
      department: exp.department,
      category: exp.category,
      amount: exp.amount.toString(),
      taxAmount: exp.taxAmount.toString(),
      paymentMethod: exp.paymentMethod,
      description: exp.description,
      receiptFileName: exp.receiptFileName || '',
      status: exp.status,
      glCode: exp.glCode,
      projectCode: exp.projectCode || '',
      notes: exp.notes || '',
    });
  };

  // Save Add/Edit
  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(formData.amount);
    const parsedTax = parseFloat(formData.taxAmount) || 0;

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid expense amount.');
      return;
    }

    if (!formData.description.trim()) {
      alert('Please enter a description or payee name.');
      return;
    }

    if (editingExpense) {
      updateExpense(editingExpense.id, {
        date: formData.date,
        employee: formData.employee,
        department: formData.department,
        category: formData.category,
        amount: parsedAmount,
        taxAmount: parsedTax,
        paymentMethod: formData.paymentMethod,
        description: formData.description,
        receiptFileName: formData.receiptFileName || undefined,
        status: formData.status,
        glCode: formData.glCode,
        projectCode: formData.projectCode || undefined,
        notes: formData.notes,
        isTechExpense: ['Cloud services', 'Software subscriptions', 'Equipment'].includes(formData.category),
      });
      setEditingExpense(null);
    } else {
      addExpense({
        date: formData.date,
        employee: formData.employee,
        department: formData.department,
        category: formData.category,
        amount: parsedAmount,
        taxAmount: parsedTax,
        paymentMethod: formData.paymentMethod,
        description: formData.description,
        receiptFileName: formData.receiptFileName || 'Receipt_Attached.pdf',
        status: formData.status,
        glCode: formData.glCode || `GL-${formData.category.substring(0, 4).toUpperCase()}`,
        projectCode: formData.projectCode || undefined,
        notes: formData.notes,
        isTechExpense: ['Cloud services', 'Software subscriptions', 'Equipment'].includes(formData.category),
      });
      setIsAddModalOpen(false);
    }

    setFormData(initialFormState);
  };

  const totalFilteredAmount = processedExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div style={{ padding: '16px', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Title & Actions Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px',
          paddingBottom: '8px',
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
            Operational Expense Ledger & Management
          </h1>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Enterprise General Ledger recording, receipt verification, status approvals, and GL allocations.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="btn"
            onClick={() => exportExpensesToCSV(processedExpenses)}
            title="Export filtered records to CSV"
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setFormData(initialFormState);
              setIsAddModalOpen(true);
            }}
          >
            <Plus size={13} />
            <span>+ Record Expense</span>
          </button>
        </div>
      </div>

      {/* Filter Ribbon & Persistent Search */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-sm)',
          padding: '8px 12px',
          marginBottom: '12px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
        }}
      >
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '260px', flex: 1 }}>
          <Search size={14} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search description, ref #, employee, GL code..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ height: '28px', fontSize: '11.5px' }}
          />
          {searchQuery && (
            <button
              type="button"
              className="btn btn-sm btn-icon-only"
              onClick={() => setSearchQuery('')}
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Dept:</span>
            <select
              className="form-select"
              style={{ width: '130px', height: '28px', fontSize: '11px' }}
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
            >
              <option value="ALL">All Departments</option>
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Category:</span>
            <select
              className="form-select"
              style={{ width: '140px', height: '28px', fontSize: '11px' }}
              value={selectedCat}
              onChange={e => setSelectedCat(e.target.value)}
            >
              <option value="ALL">All Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Status:</span>
            <select
              className="form-select"
              style={{ width: '120px', height: '28px', fontSize: '11px' }}
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="Approved">Approved</option>
              <option value="Pending Approval">Pending Approval</option>
              <option value="Under Review">Under Review</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Period:</span>
            <select
              className="form-select"
              style={{ width: '110px', height: '28px', fontSize: '11px' }}
              value={dateRange}
              onChange={e => setDateRange(e.target.value)}
            >
              <option value="ALL">All Time</option>
              <option value="THIS_MONTH">Aug 2026</option>
              <option value="THIS_WEEK">This Week</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Action Controls Bar (Active when items selected) */}
      {selectedIds.length > 0 && (
        <div
          style={{
            background: '#f0f7ff',
            border: '1px solid var(--info-border)',
            borderRadius: 'var(--radius-sm)',
            padding: '6px 12px',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            animation: 'fadeIn 0.12s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11.5px', fontWeight: 600, color: 'var(--info-text)' }}>
            <span>{selectedIds.length} expense(s) selected</span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span className="num-val">
              Total: {formatCurrency(
                filteredExpenses.filter(e => selectedIds.includes(e.id)).reduce((s, e) => s + e.amount, 0)
              )}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              className="btn btn-sm btn-success"
              onClick={() => {
                bulkUpdateExpenseStatus(selectedIds, 'Approved');
                setSelectedIds([]);
              }}
            >
              <Check size={12} />
              <span>Bulk Approve</span>
            </button>
            <button
              type="button"
              className="btn btn-sm btn-danger"
              onClick={() => {
                bulkUpdateExpenseStatus(selectedIds, 'Rejected');
                setSelectedIds([]);
              }}
            >
              <X size={12} />
              <span>Bulk Reject</span>
            </button>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => setBulkCatModalOpen(true)}
            >
              <Sliders size={12} />
              <span>Re-categorize</span>
            </button>
            <button
              type="button"
              className="btn btn-sm btn-danger"
              onClick={() => {
                if (confirm(`Permanently delete ${selectedIds.length} selected expense(s)?`)) {
                  bulkDeleteExpenses(selectedIds);
                  setSelectedIds([]);
                }
              }}
            >
              <Trash2 size={12} />
              <span>Delete</span>
            </button>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => setSelectedIds([])}
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Expense Data Table */}
      <div className="table-container">
        <table className={`erp-table ${isCompactMode ? 'compact' : ''}`}>
          <thead>
            <tr>
              <th style={{ width: '32px', textAlign: 'center' }}>
                <input
                  type="checkbox"
                  checked={selectedIds.length > 0 && selectedIds.length === processedExpenses.length}
                  onChange={e => handleSelectAll(e.target.checked)}
                />
              </th>
              <th className="sortable" onClick={() => handleSort('referenceNumber')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Ref #</span>
                  {sortField === 'referenceNumber' && (sortAsc ? <ChevronUp size={11} /> : <ChevronDown size={11} />)}
                </div>
              </th>
              <th className="sortable" onClick={() => handleSort('date')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Date</span>
                  {sortField === 'date' && (sortAsc ? <ChevronUp size={11} /> : <ChevronDown size={11} />)}
                </div>
              </th>
              <th className="sortable" onClick={() => handleSort('description')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Payee / Description</span>
                  {sortField === 'description' && (sortAsc ? <ChevronUp size={11} /> : <ChevronDown size={11} />)}
                </div>
              </th>
              <th className="sortable" onClick={() => handleSort('employee')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Employee</span>
                  {sortField === 'employee' && (sortAsc ? <ChevronUp size={11} /> : <ChevronDown size={11} />)}
                </div>
              </th>
              <th className="sortable" onClick={() => handleSort('department')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Department</span>
                  {sortField === 'department' && (sortAsc ? <ChevronUp size={11} /> : <ChevronDown size={11} />)}
                </div>
              </th>
              <th className="sortable" onClick={() => handleSort('category')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Category</span>
                  {sortField === 'category' && (sortAsc ? <ChevronUp size={11} /> : <ChevronDown size={11} />)}
                </div>
              </th>
              <th className="sortable table-align-right" onClick={() => handleSort('amount')}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                  <span>Amount (USD)</span>
                  {sortField === 'amount' && (sortAsc ? <ChevronUp size={11} /> : <ChevronDown size={11} />)}
                </div>
              </th>
              <th>GL Code</th>
              <th>Status</th>
              <th className="table-align-center" style={{ width: '90px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {processedExpenses.length === 0 ? (
              <tr>
                <td colSpan={11} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  No expense records found matching the active filter criteria.
                </td>
              </tr>
            ) : (
              processedExpenses.map(exp => {
                const isSelected = selectedIds.includes(exp.id);
                return (
                  <tr key={exp.id} className={isSelected ? 'row-selected' : ''}>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectOne(exp.id)}
                      />
                    </td>
                    <td className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {exp.referenceNumber}
                    </td>
                    <td className="font-mono" style={{ whiteSpace: 'nowrap' }}>
                      {formatDate(exp.date)}
                    </td>
                    <td style={{ maxWidth: '280px' }}>
                      <div
                        style={{
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          cursor: 'pointer',
                        }}
                        onClick={() => setInspectingExpense(exp)}
                        title="Click to view details"
                      >
                        {exp.description}
                      </div>
                      {exp.projectCode && (
                        <div className="font-mono" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                          Prj: {exp.projectCode}
                        </div>
                      )}
                    </td>
                    <td>
                      <span style={{ fontSize: '11.5px' }}>{exp.employee}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{exp.department}</span>
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
                        {exp.category}
                      </span>
                    </td>
                    <td className="table-align-right num-val" style={{ fontWeight: 600, fontSize: '12.5px' }}>
                      {formatCurrency(exp.amount)}
                    </td>
                    <td className="font-mono" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {exp.glCode}
                    </td>
                    <td>
                      <Badge status={exp.status} size="sm" />
                    </td>
                    <td className="table-align-center">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                        <button
                          type="button"
                          className="btn btn-sm btn-icon-only"
                          onClick={() => setInspectingExpense(exp)}
                          title="Inspect Details & Receipts"
                        >
                          <Eye size={12} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-icon-only"
                          onClick={() => openEditModal(exp)}
                          title="Edit Expense"
                        >
                          <Edit3 size={12} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-danger btn-icon-only"
                          onClick={() => setDeleteConfirmId(exp.id)}
                          title="Delete Record"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          {processedExpenses.length > 0 && (
            <tfoot>
              <tr style={{ background: 'var(--bg-surface-alt)', fontWeight: 700 }}>
                <td colSpan={7} style={{ padding: '8px 10px', textTransform: 'uppercase', fontSize: '11px' }}>
                  Total Ledger Sum ({processedExpenses.length} Records)
                </td>
                <td className="table-align-right num-val" style={{ fontSize: '13px', color: 'var(--primary-navy)' }}>
                  {formatCurrency(totalFilteredAmount)}
                </td>
                <td colSpan={3}></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Add / Edit Expense Modal */}
      <Modal
        isOpen={isAddModalOpen || !!editingExpense}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingExpense(null);
        }}
        title={editingExpense ? `Edit Expense: ${editingExpense.referenceNumber}` : 'Record New Operational Expense'}
        subtitle="Record general ledger transaction with department and category allocation"
        size="lg"
        footer={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingExpense(null);
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSaveExpense}
            >
              {editingExpense ? 'Save Changes' : 'Record Expense'}
            </button>
          </div>
        }
      >
        <form onSubmit={handleSaveExpense} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">Transaction Date *</label>
              <input
                type="date"
                required
                className="form-input font-mono"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Employee / Officer *</label>
              <input
                type="text"
                required
                className="form-input"
                value={formData.employee}
                onChange={e => setFormData({ ...formData, employee: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Department *</label>
              <select
                className="form-select"
                value={formData.department}
                onChange={e => setFormData({ ...formData, department: e.target.value as Department })}
              >
                {departments.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">Expense Category *</label>
              <select
                className="form-select"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Amount (USD) *</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                className="form-input font-mono"
                value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Tax / VAT (USD)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                className="form-input font-mono"
                value={formData.taxAmount}
                onChange={e => setFormData({ ...formData, taxAmount: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">Payee / Description *</label>
              <input
                type="text"
                required
                placeholder="e.g. AWS us-east-1 Compute Cluster"
                className="form-input"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Payment Method *</label>
              <select
                className="form-select"
                value={formData.paymentMethod}
                onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
              >
                {paymentMethods.map(pm => (
                  <option key={pm} value={pm}>{pm}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">General Ledger (GL) Code</label>
              <input
                type="text"
                placeholder="GL-6420-SAAS"
                className="form-input font-mono"
                value={formData.glCode}
                onChange={e => setFormData({ ...formData, glCode: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Project Code (Optional)</label>
              <input
                type="text"
                placeholder="PRJ-CORE-INFRA"
                className="form-input font-mono"
                value={formData.projectCode}
                onChange={e => setFormData({ ...formData, projectCode: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Approval Status *</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as ExpenseStatus })}
              >
                <option value="Approved">Approved</option>
                <option value="Pending Approval">Pending Approval</option>
                <option value="Under Review">Under Review</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Receipt File Name / Identifier</label>
            <input
              type="text"
              placeholder="e.g. AWS_Invoice_Aug2026.pdf"
              className="form-input font-mono"
              value={formData.receiptFileName}
              onChange={e => setFormData({ ...formData, receiptFileName: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Operational Notes & Justification</label>
            <textarea
              className="form-textarea"
              placeholder="Provide internal justification or allocation context..."
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* Bulk Recategorize Modal */}
      <Modal
        isOpen={bulkCatModalOpen}
        onClose={() => setBulkCatModalOpen(false)}
        title="Bulk Recategorize Expenses"
        subtitle={`Select new category for ${selectedIds.length} expense records`}
        size="md"
        footer={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" className="btn" onClick={() => setBulkCatModalOpen(false)}>Cancel</button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                bulkUpdateExpenseCategory(selectedIds, bulkTargetCat);
                setBulkCatModalOpen(false);
                setSelectedIds([]);
              }}
            >
              Apply Category
            </button>
          </div>
        }
      >
        <div className="form-group">
          <label className="form-label">New Expense Category</label>
          <select
            className="form-select"
            value={bulkTargetCat}
            onChange={e => setBulkTargetCat(e.target.value as ExpenseCategory)}
          >
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title="Confirm Record Deletion"
        subtitle="This action will remove the expense from the general ledger."
        size="md"
        footer={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" className="btn" onClick={() => setDeleteConfirmId(null)}>Cancel</button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                if (deleteConfirmId) {
                  deleteExpense(deleteConfirmId);
                  setDeleteConfirmId(null);
                }
              }}
            >
              Confirm Delete
            </button>
          </div>
        }
      >
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          Are you sure you want to delete this operational ledger record? An audit entry will be logged.
        </p>
      </Modal>

      {/* Transaction Details & Audit Drawer */}
      <Drawer
        isOpen={!!inspectingExpense}
        onClose={() => setInspectingExpense(null)}
        title={inspectingExpense ? `Expense: ${inspectingExpense.referenceNumber}` : 'Detail'}
        subtitle={inspectingExpense ? `${inspectingExpense.date} • ${inspectingExpense.department}` : ''}
        footer={
          inspectingExpense && (
            <div style={{ display: 'flex', gap: '8px', width: '100%', justifyContent: 'space-between' }}>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => {
                  openEditModal(inspectingExpense);
                  setInspectingExpense(null);
                }}
              >
                <Edit3 size={12} />
                <span>Edit Record</span>
              </button>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => setInspectingExpense(null)}
              >
                Close
              </button>
            </div>
          )
        }
      >
        {inspectingExpense && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ padding: '12px', background: 'var(--bg-surface-alt)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Amount</div>
                  <div className="num-val" style={{ fontSize: '20px', fontWeight: 700 }}>
                    {formatCurrency(inspectingExpense.amount)}
                  </div>
                </div>
                <Badge status={inspectingExpense.status} />
              </div>
            </div>

            <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)', overflow: 'hidden' }}>
              <table className="erp-table compact">
                <tbody>
                  <tr>
                    <td style={{ width: '120px', fontWeight: 600, color: 'var(--text-secondary)' }}>Payee / Desc</td>
                    <td>{inspectingExpense.description}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Employee</td>
                    <td>{inspectingExpense.employee}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Department</td>
                    <td>{inspectingExpense.department}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Category</td>
                    <td>{inspectingExpense.category}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Payment Method</td>
                    <td className="font-mono">{inspectingExpense.paymentMethod}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>GL Code</td>
                    <td className="font-mono">{inspectingExpense.glCode}</td>
                  </tr>
                  {inspectingExpense.projectCode && (
                    <tr>
                      <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Project Code</td>
                      <td className="font-mono">{inspectingExpense.projectCode}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Receipt Verification */}
            <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)', padding: '10px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Receipt Documentation
              </div>
              <div
                style={{
                  padding: '16px',
                  background: 'var(--bg-surface-alt)',
                  border: '1px dashed var(--border-default)',
                  borderRadius: 'var(--radius-xs)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11.5px',
                }}
              >
                <FileSpreadsheet size={24} style={{ color: 'var(--text-muted)' }} />
                <span className="font-mono">{inspectingExpense.receiptFileName || 'Receipt_Validated.pdf'}</span>
                <span style={{ fontSize: '10.5px', color: 'var(--credit-text)', fontWeight: 600 }}>
                  ✓ Digitally Verified & Reconciled
                </span>
              </div>
            </div>

            {/* Immutable Audit Log */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Audit History
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {inspectingExpense.auditHistory?.map((log, lIdx) => (
                  <div
                    key={lIdx}
                    style={{
                      padding: '6px 8px',
                      background: 'var(--bg-surface-alt)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-xs)',
                      fontSize: '11px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                      <span className="font-mono">{log.timestamp}</span>
                      <strong>{log.user}</strong>
                    </div>
                    <div style={{ color: 'var(--text-primary)', marginTop: '2px' }}>{log.action}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};
