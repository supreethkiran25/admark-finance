import React, { useState } from 'react';
import {
  PieChart,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Edit3,
  Building,
  Info,
} from 'lucide-react';
import { useFinance } from '../../../context/FinanceContext';
import { DepartmentBudget, Department } from '../../../types/finance';
import { Modal } from '../../common/Modal';
import { formatCurrency } from '../../../utils/currency';
import { formatDate } from '../../../utils/date';

export const BudgetModule: React.FC = () => {
  const { budgets, updateBudget, isCompactMode, currentRole } = useFinance();

  const [editingBudget, setEditingBudget] = useState<DepartmentBudget | null>(null);
  const [allocatedInput, setAllocatedInput] = useState<string>('');
  const [notesInput, setNotesInput] = useState<string>('');

  const totalAllocated = budgets.reduce((s, b) => s + b.allocatedBudget, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spentAmount, 0);
  const totalCommitted = budgets.reduce((s, b) => s + b.committedAmount, 0);
  const totalRemaining = totalAllocated - (totalSpent + totalCommitted);
  const overallUtilization = (totalSpent / totalAllocated) * 100;

  const openAdjustModal = (b: DepartmentBudget) => {
    setEditingBudget(b);
    setAllocatedInput(b.allocatedBudget.toString());
    setNotesInput(b.notes || '');
  };

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBudget) return;
    const parsed = parseFloat(allocatedInput);
    if (isNaN(parsed) || parsed <= 0) {
      alert('Please enter a valid allocation amount.');
      return;
    }

    updateBudget(editingBudget.id, parsed, notesInput);
    setEditingBudget(null);
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
            Department Budget Management & Variance Analysis
          </h1>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Fiscal monthly departmental budget caps, real-time burn velocity tracking, and variance thresholds.
          </p>
        </div>

        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          FISCAL PERIOD: AUGUST 2026 (MTD)
        </div>
      </div>

      {/* Aggregate Overview Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '8px', marginBottom: '14px' }}>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
          <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            Total Allocated Budget
          </div>
          <div className="num-val" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary-navy)', marginTop: '4px' }}>
            {formatCurrency(totalAllocated)}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Across 6 Agency Departments
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
          <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            Actual Spent MTD
          </div>
          <div className="num-val" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--debit-text)', marginTop: '4px' }}>
            {formatCurrency(totalSpent)}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {overallUtilization.toFixed(1)}% of aggregate cap
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
          <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            Committed / Pending AP
          </div>
          <div className="num-val" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--pending-text)', marginTop: '4px' }}>
            {formatCurrency(totalCommitted)}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Scheduled invoices & claims
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
          <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            Remaining Headroom
          </div>
          <div className="num-val" style={{ fontSize: '18px', fontWeight: 700, color: totalRemaining >= 0 ? 'var(--credit-text)' : 'var(--debit-text)', marginTop: '4px' }}>
            {formatCurrency(totalRemaining)}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Remaining for August 17-31
          </div>
        </div>
      </div>

      {/* Department Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '12px', marginBottom: '14px' }}>
        {budgets.map(b => {
          const totalUtil = b.spentAmount + b.committedAmount;
          const pct = (totalUtil / b.allocatedBudget) * 100;
          const rem = b.allocatedBudget - totalUtil;

          let statusBadge = { bg: 'var(--credit-bg)', text: 'var(--credit-text)', border: 'var(--credit-border)', label: 'Normal' };
          if (pct >= 100) {
            statusBadge = { bg: 'var(--debit-bg)', text: 'var(--debit-text)', border: 'var(--debit-border)', label: 'Over Budget' };
          } else if (pct >= 85) {
            statusBadge = { bg: 'var(--pending-bg)', text: 'var(--pending-text)', border: 'var(--pending-border)', label: 'Near Capacity (85%+)' };
          }

          return (
            <div
              key={b.id}
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Building size={14} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {b.department}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '10.5px',
                      fontWeight: 600,
                      padding: '1px 6px',
                      background: statusBadge.bg,
                      color: statusBadge.text,
                      border: `1px solid ${statusBadge.border}`,
                      borderRadius: '2px',
                    }}
                  >
                    {statusBadge.label}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', margin: '10px 0' }}>
                  <div>
                    <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Allocated</div>
                    <div className="num-val" style={{ fontSize: '15px', fontWeight: 700 }}>
                      {formatCurrency(b.allocatedBudget)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Spent + Committed</div>
                    <div className="num-val" style={{ fontSize: '15px', fontWeight: 700 }}>
                      {formatCurrency(totalUtil)}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div style={{ margin: '8px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Utilization:</span>
                    <strong className="num-val" style={{ color: statusBadge.text }}>{pct.toFixed(1)}%</strong>
                  </div>
                  <div
                    style={{
                      height: '7px',
                      background: 'var(--bg-surface-subtle)',
                      borderRadius: '2px',
                      overflow: 'hidden',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.min(100, pct)}%`,
                        background: statusBadge.text,
                      }}
                    />
                  </div>
                </div>

                {b.notes && (
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.35 }}>
                    {b.notes}
                  </div>
                )}
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '8px', marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Remaining: <strong className="num-val" style={{ color: rem < 0 ? 'var(--debit-text)' : 'inherit' }}>{formatCurrency(rem)}</strong>
                </span>
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => openAdjustModal(b)}
                >
                  <Edit3 size={11} />
                  <span>Adjust Budget</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Adjust Budget Modal */}
      <Modal
        isOpen={!!editingBudget}
        onClose={() => setEditingBudget(null)}
        title={editingBudget ? `Adjust Budget: ${editingBudget.department}` : 'Budget Allocation'}
        subtitle="Modify departmental fiscal cap and add justification note"
        size="md"
        footer={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" className="btn" onClick={() => setEditingBudget(null)}>Cancel</button>
            <button type="button" className="btn btn-primary" onClick={handleSaveBudget}>Save Allocation</button>
          </div>
        }
      >
        <form onSubmit={handleSaveBudget} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="form-group">
            <label className="form-label">Department</label>
            <input
              type="text"
              disabled
              className="form-input font-mono"
              value={editingBudget?.department || ''}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Allocated Monthly Budget (USD) *</label>
            <input
              type="number"
              step="500"
              required
              className="form-input font-mono"
              value={allocatedInput}
              onChange={e => setAllocatedInput(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Operational Notes & Justification</label>
            <textarea
              className="form-textarea"
              placeholder="Explain rationale for budget increase/decrease..."
              value={notesInput}
              onChange={e => setNotesInput(e.target.value)}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
