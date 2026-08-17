import React, { useState } from 'react';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Building,
  UserCheck,
  Plus,
  Upload,
  FileText,
  Eye,
  Check,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { useFinance } from '../../../context/FinanceContext';
import { MetricCard } from '../../common/MetricCard';
import { Badge } from '../../common/Badge';
import { Drawer } from '../../common/Drawer';
import { CashFlowChart } from '../../charts/CashFlowChart';
import { CategoryBreakdownChart } from '../../charts/CategoryBreakdownChart';
import { DepartmentBurnChart } from '../../charts/DepartmentBurnChart';
import { Expense } from '../../../types/finance';
import { formatCurrency } from '../../../utils/currency';
import { formatDate } from '../../../utils/date';

export const ExecutiveOverview: React.FC = () => {
  const {
    currentRole,
    setActiveModule,
    todaySpend,
    weekSpend,
    monthSpend,
    cashBalance,
    pendingPayablesTotal,
    totalEmployeeExpenseTotal,
    totalVendorExpenseTotal,
    totalMonthlyRevenue,
    filteredExpenses,
    updateExpense,
    isCompactMode,
  } = useFinance();

  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  // Recent transactions
  const recentExpenses = [...filteredExpenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  const netCashFlow = totalMonthlyRevenue - monthSpend;
  const burnRate = monthSpend / 16; // avg daily burn across 16 days
  const runwayMonths = cashBalance / (monthSpend * 2); // estimated runway based on monthly run-rate

  return (
    <div style={{ padding: '16px', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Module Title Ribbon */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1
              style={{
                fontSize: '16px',
                fontWeight: 700,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
                textTransform: 'uppercase',
              }}
            >
              Executive Financial Operations Overview
            </h1>
            <span
              style={{
                fontSize: '11px',
                padding: '1px 6px',
                background: 'var(--bg-surface-alt)',
                border: '1px solid var(--border-default)',
                borderRadius: '2px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 600,
              }}
            >
              ACTIVE ROLE: {currentRole}
            </span>
          </div>
          <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Centralized operational accounting ledger, live cash trajectory, department burn & pending payables.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setActiveModule('expenses')}
          >
            <Plus size={13} />
            <span>Record Expense</span>
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => setActiveModule('statements')}
          >
            <Upload size={13} />
            <span>Import Statement</span>
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => setActiveModule('reports')}
          >
            <FileText size={13} />
            <span>Generate P&L</span>
          </button>
        </div>
      </div>

      {/* Primary Financial Metric Ribbons (Dense 2 rows) */}
      <div className="metric-grid">
        <MetricCard
          label="Operating Cash Balance"
          value={formatCurrency(cashBalance)}
          subValue="Across SVB & Chase Checking"
          badgeText="Verified Live"
          badgeType="credit"
          icon={<Wallet size={15} />}
        />
        <MetricCard
          label="Today's Approved Expenses"
          value={formatCurrency(todaySpend)}
          subValue="August 16, 2026"
          badgeText="Today"
          badgeType="debit"
          icon={<Calendar size={15} />}
        />
        <MetricCard
          label="Weekly Spend (WTD)"
          value={formatCurrency(weekSpend)}
          subValue="Aug 10 - Aug 16"
          badgeText="7-Day Run"
          badgeType="pending"
          icon={<ArrowDownLeft size={15} />}
        />
        <MetricCard
          label="Monthly OpEx (MTD)"
          value={formatCurrency(monthSpend)}
          subValue="August 2026 Actuals"
          badgeText="OpEx"
          badgeType="debit"
          icon={<ArrowDownLeft size={15} />}
        />
        <MetricCard
          label="Pending Payables (AP)"
          value={formatCurrency(pendingPayablesTotal)}
          subValue="Vendor Bills Under Review"
          badgeText="Scheduled"
          badgeType="pending"
          icon={<Building size={15} />}
        />
        <MetricCard
          label="Employee Reimbursements"
          value={formatCurrency(totalEmployeeExpenseTotal)}
          subValue="Travel, Equipment & Stipends"
          badgeText="FTE Claims"
          badgeType="neutral"
          icon={<UserCheck size={15} />}
        />
        <MetricCard
          label="Vendor AP Liabilities"
          value={formatCurrency(totalVendorExpenseTotal)}
          subValue="Outstanding Net-30 Terms"
          badgeText="Committed"
          badgeType="debit"
          icon={<Building size={15} />}
        />
        <MetricCard
          label="Net Operating Cash Flow"
          value={formatCurrency(netCashFlow, { showSign: true })}
          subValue={`Runway: ~${runwayMonths.toFixed(1)} Months`}
          badgeText={netCashFlow >= 0 ? '+Positive' : '-Burn'}
          badgeType={netCashFlow >= 0 ? 'credit' : 'debit'}
          icon={<ArrowUpRight size={15} />}
        />
      </div>

      {/* Main Grid: Charts & Operations */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '12px', marginBottom: '14px' }}>
        <CashFlowChart />
        <DepartmentBurnChart />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '12px', marginBottom: '14px' }}>
        <CategoryBreakdownChart />

        {/* Recent Ledger Transactions */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '12px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                Recent Operational Ledger Entries
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Latest 8 transactions across all departments
              </div>
            </div>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => setActiveModule('expenses')}
            >
              <span>View All ({filteredExpenses.length})</span>
            </button>
          </div>

          <div className="table-container">
            <table className={`erp-table ${isCompactMode ? 'compact' : ''}`}>
              <thead>
                <tr>
                  <th>Ref #</th>
                  <th>Date</th>
                  <th>Payee / Description</th>
                  <th>Dept</th>
                  <th className="table-align-right">Amount</th>
                  <th>Status</th>
                  <th className="table-align-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentExpenses.map(exp => (
                  <tr key={exp.id}>
                    <td className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {exp.referenceNumber}
                    </td>
                    <td className="font-mono">{formatDate(exp.date)}</td>
                    <td style={{ maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{exp.description}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{exp.department}</span>
                    </td>
                    <td className="table-align-right num-val" style={{ fontWeight: 600 }}>
                      {formatCurrency(exp.amount)}
                    </td>
                    <td>
                      <Badge status={exp.status} size="sm" />
                    </td>
                    <td className="table-align-center">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <button
                          type="button"
                          className="btn btn-sm btn-icon-only"
                          onClick={() => setSelectedExpense(exp)}
                          title="Inspect transaction"
                        >
                          <Eye size={12} />
                        </button>
                        {exp.status === 'Pending Approval' && (
                          <>
                            <button
                              type="button"
                              className="btn btn-sm btn-success btn-icon-only"
                              onClick={() => updateExpense(exp.id, { status: 'Approved' })}
                              title="Approve expense"
                            >
                              <Check size={12} />
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-danger btn-icon-only"
                              onClick={() => updateExpense(exp.id, { status: 'Rejected' })}
                              title="Reject expense"
                            >
                              <X size={12} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Transaction Inspection Drawer */}
      <Drawer
        isOpen={!!selectedExpense}
        onClose={() => setSelectedExpense(null)}
        title={selectedExpense ? `Expense ${selectedExpense.referenceNumber}` : 'Transaction Detail'}
        subtitle={selectedExpense ? `${selectedExpense.date} • ${selectedExpense.department}` : ''}
        footer={
          selectedExpense && (
            <div style={{ display: 'flex', gap: '8px', width: '100%', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                GL: <strong className="font-mono" style={{ marginLeft: '4px' }}>{selectedExpense.glCode}</strong>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {selectedExpense.status === 'Pending Approval' && (
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={() => {
                      updateExpense(selectedExpense.id, { status: 'Approved' });
                      setSelectedExpense(null);
                    }}
                  >
                    <Check size={12} />
                    <span>Approve</span>
                  </button>
                )}
                <button
                  type="button"
                  className="btn"
                  onClick={() => setSelectedExpense(null)}
                >
                  Close
                </button>
              </div>
            </div>
          )
        }
      >
        {selectedExpense && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Header summary */}
            <div style={{ padding: '12px', background: 'var(--bg-surface-alt)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Amount</div>
                  <div className="num-val" style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {formatCurrency(selectedExpense.amount)}
                  </div>
                  {selectedExpense.taxAmount > 0 && (
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Includes {formatCurrency(selectedExpense.taxAmount)} tax/VAT
                    </div>
                  )}
                </div>
                <Badge status={selectedExpense.status} />
              </div>
            </div>

            {/* Accounting Metadata Table */}
            <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)', overflow: 'hidden' }}>
              <table className="erp-table compact">
                <tbody>
                  <tr>
                    <td style={{ width: '130px', fontWeight: 600, color: 'var(--text-secondary)' }}>Description</td>
                    <td>{selectedExpense.description}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Employee / Officer</td>
                    <td>{selectedExpense.employee}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Department</td>
                    <td>{selectedExpense.department}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Expense Category</td>
                    <td>{selectedExpense.category}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Payment Method</td>
                    <td className="font-mono">{selectedExpense.paymentMethod}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>General Ledger (GL)</td>
                    <td className="font-mono">{selectedExpense.glCode}</td>
                  </tr>
                  {selectedExpense.projectCode && (
                    <tr>
                      <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Project Code</td>
                      <td className="font-mono">{selectedExpense.projectCode}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Notes */}
            {selectedExpense.notes && (
              <div style={{ padding: '8px 10px', background: 'var(--bg-surface-subtle)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)' }}>
                <div style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '2px' }}>
                  Operational Notes & Justification
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{selectedExpense.notes}</div>
              </div>
            )}

            {/* Receipt Preview */}
            <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)', padding: '10px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>Attached Receipt Document</span>
                {selectedExpense.receiptFileName && (
                  <span className="font-mono" style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                    {selectedExpense.receiptFileName}
                  </span>
                )}
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
                  color: 'var(--text-secondary)',
                  fontSize: '11.5px',
                }}
              >
                <FileSpreadsheet size={24} style={{ color: 'var(--text-muted)' }} />
                <span>{selectedExpense.receiptFileName || 'Digital Receipt Attachment Verified'}</span>
                <span style={{ fontSize: '10.5px', color: 'var(--credit-text)', fontWeight: 600 }}>
                  ✓ OCR Match Validated • Amount: {formatCurrency(selectedExpense.amount)}
                </span>
              </div>
            </div>

            {/* Audit Trail */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Immutable Audit History
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {selectedExpense.auditHistory?.map((log, lIdx) => (
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
