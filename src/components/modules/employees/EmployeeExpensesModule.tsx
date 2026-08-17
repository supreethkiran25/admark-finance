import React, { useState } from 'react';
import {
  UserCheck,
  Plus,
  Search,
  Filter,
  Check,
  X,
  CreditCard,
  FileSpreadsheet,
  Download,
  AlertCircle,
  Building,
} from 'lucide-react';
import { useFinance } from '../../../context/FinanceContext';
import {
  EmployeeExpenseClaim,
  ReimbursementType,
  ReimbursementStatus,
  Department,
} from '../../../types/finance';
import { Badge } from '../../common/Badge';
import { Modal } from '../../common/Modal';
import { formatCurrency } from '../../../utils/currency';
import { formatDate } from '../../../utils/date';

export const EmployeeExpensesModule: React.FC = () => {
  const { claims, addClaim, updateClaimStatus, isCompactMode, currentRole } = useFinance();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Add Claim Form State
  const initialForm = {
    employeeName: 'Sarah Chen',
    employeeEmail: 'sarah.chen@agency.internal',
    employeeRole: 'Lead Architect',
    department: 'Engineering' as Department,
    date: new Date().toISOString().split('T')[0],
    claimType: 'Travel Reimbursement' as ReimbursementType,
    amount: '',
    receiptAttached: true,
    receiptFileName: 'Receipt_Attached.pdf',
    status: 'Submitted' as ReimbursementStatus,
    description: '',
  };
  const [formData, setFormData] = useState(initialForm);

  const departments: Department[] = [
    'Engineering',
    'Sales & Marketing',
    'Operations',
    'Executive',
    'Design & Product',
    'Facilities & IT',
  ];

  const claimTypes: ReimbursementType[] = [
    'Travel Reimbursement',
    'Client Meeting',
    'Internet & WFH',
    'Equipment Purchase',
    'Food & Per Diem',
  ];

  const filteredClaims = claims.filter(c => {
    if (selectedDept !== 'ALL' && c.department !== selectedDept) return false;
    if (selectedStatus !== 'ALL' && c.status !== selectedStatus) return false;
    if (selectedType !== 'ALL' && c.claimType !== selectedType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        c.employeeName.toLowerCase().includes(q) ||
        c.claimNumber.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const totalClaimed = filteredClaims.reduce((s, c) => s + c.amount, 0);
  const pendingApprovals = claims.filter(c => c.status === 'Submitted' || c.status === 'Under Review');

  const handleSaveClaim = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(formData.amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Please enter a valid claim amount.');
      return;
    }

    addClaim({
      employeeName: formData.employeeName,
      employeeEmail: formData.employeeEmail,
      employeeRole: formData.employeeRole,
      department: formData.department,
      date: formData.date,
      claimType: formData.claimType,
      amount: parsedAmount,
      receiptAttached: formData.receiptAttached,
      receiptFileName: formData.receiptFileName,
      status: formData.status,
      description: formData.description,
    });

    setIsAddModalOpen(false);
    setFormData(initialForm);
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
            Employee Expense Tracking & Reimbursement Queue
          </h1>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Review FTE reimbursement submissions for travel, client entertaining, remote stipends, and hardware allowances.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setFormData(initialForm);
            setIsAddModalOpen(true);
          }}
        >
          <Plus size={13} />
          <span>+ Submit Reimbursement Claim</span>
        </button>
      </div>

      {/* Summary Ribbons */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', marginBottom: '14px' }}>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
          <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            Total Claims Value
          </div>
          <div className="num-val" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
            {formatCurrency(totalClaimed)}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {filteredClaims.length} Claims Total
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
          <div style={{ fontSize: '10.5px', color: 'var(--pending-text)', textTransform: 'uppercase', fontWeight: 600 }}>
            Pending COO Review
          </div>
          <div className="num-val" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--pending-text)', marginTop: '4px' }}>
            {pendingApprovals.length} Claims Pending
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Value: {formatCurrency(pendingApprovals.reduce((s, c) => s + c.amount, 0))}
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
          <div style={{ fontSize: '10.5px', color: 'var(--credit-text)', textTransform: 'uppercase', fontWeight: 600 }}>
            Approved & Disbursed
          </div>
          <div className="num-val" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--credit-text)', marginTop: '4px' }}>
            {claims.filter(c => c.status === 'Approved' || c.status === 'Disbursed').length} Claims Settled
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Transferred via direct clearing ACH
          </div>
        </div>
      </div>

      {/* Filter Ribbon */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '260px', flex: 1 }}>
          <Search size={14} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search employee, claim #, description..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ height: '28px' }}
          />
        </div>

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
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Type:</span>
            <select
              className="form-select"
              style={{ width: '150px', height: '28px', fontSize: '11px' }}
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
            >
              <option value="ALL">All Claim Types</option>
              {claimTypes.map(t => (
                <option key={t} value={t}>{t}</option>
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
              <option value="Submitted">Submitted</option>
              <option value="Approved">Approved</option>
              <option value="Disbursed">Disbursed</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Claims Queue Table */}
      <div className="table-container">
        <table className={`erp-table ${isCompactMode ? 'compact' : ''}`}>
          <thead>
            <tr>
              <th>Claim #</th>
              <th>Date</th>
              <th>Employee / Role</th>
              <th>Department</th>
              <th>Claim Type</th>
              <th>Description / Purpose</th>
              <th className="table-align-right">Amount</th>
              <th>Receipt</th>
              <th>Status</th>
              <th className="table-align-center" style={{ width: '140px' }}>Approval Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredClaims.map(claim => (
              <tr key={claim.id}>
                <td className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {claim.claimNumber}
                </td>
                <td className="font-mono">{formatDate(claim.date)}</td>
                <td>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{claim.employeeName}</div>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>{claim.employeeRole}</div>
                </td>
                <td>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{claim.department}</span>
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
                    {claim.claimType}
                  </span>
                </td>
                <td style={{ maxWidth: '280px' }}>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-primary)' }}>
                    {claim.description}
                  </div>
                </td>
                <td className="table-align-right num-val" style={{ fontWeight: 600, fontSize: '12.5px' }}>
                  {formatCurrency(claim.amount)}
                </td>
                <td>
                  {claim.receiptAttached ? (
                    <span style={{ fontSize: '11px', color: 'var(--credit-text)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Check size={12} />
                      <span>Attached</span>
                    </span>
                  ) : (
                    <span style={{ fontSize: '11px', color: 'var(--debit-text)' }}>Missing</span>
                  )}
                </td>
                <td>
                  <Badge status={claim.status} size="sm" />
                </td>
                <td className="table-align-center">
                  {claim.status === 'Submitted' || claim.status === 'Under Review' ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      <button
                        type="button"
                        className="btn btn-sm btn-success"
                        onClick={() => updateClaimStatus(claim.id, 'Approved')}
                        title="Approve and record in general ledger"
                        style={{ fontSize: '10.5px', height: '22px', padding: '1px 6px' }}
                      >
                        <Check size={11} />
                        <span>Approve</span>
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        onClick={() => updateClaimStatus(claim.id, 'Rejected')}
                        title="Reject claim"
                        style={{ fontSize: '10.5px', height: '22px', padding: '1px 6px' }}
                      >
                        <X size={11} />
                        <span>Reject</span>
                      </button>
                    </div>
                  ) : claim.status === 'Approved' ? (
                    <button
                      type="button"
                      className="btn btn-sm btn-primary"
                      onClick={() => updateClaimStatus(claim.id, 'Disbursed')}
                      style={{ fontSize: '10.5px', height: '22px', padding: '1px 6px' }}
                    >
                      <CreditCard size={11} />
                      <span>Disburse ACH</span>
                    </button>
                  ) : (
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Settled</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Reimbursement Claim Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Submit Employee Reimbursement Claim"
        subtitle="Log employee out-of-pocket operational or travel expense"
        size="md"
        footer={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" className="btn" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
            <button type="button" className="btn btn-primary" onClick={handleSaveClaim}>Submit Claim</button>
          </div>
        }
      >
        <form onSubmit={handleSaveClaim} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">Employee Name *</label>
              <input
                type="text"
                required
                className="form-input"
                value={formData.employeeName}
                onChange={e => setFormData({ ...formData, employeeName: e.target.value })}
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">Claim Type *</label>
              <select
                className="form-select"
                value={formData.claimType}
                onChange={e => setFormData({ ...formData, claimType: e.target.value as ReimbursementType })}
              >
                {claimTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Amount Claimed (USD) *</label>
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
          </div>

          <div className="form-group">
            <label className="form-label">Purpose / Description *</label>
            <textarea
              required
              className="form-textarea"
              placeholder="e.g. Flight and lodging for SF client architectural alignment kickoff..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Receipt File Name / Identification</label>
            <input
              type="text"
              className="form-input font-mono"
              value={formData.receiptFileName}
              onChange={e => setFormData({ ...formData, receiptFileName: e.target.value })}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
