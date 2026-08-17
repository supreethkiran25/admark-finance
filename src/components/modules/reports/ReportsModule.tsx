import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  PieChart,
  FileSpreadsheet,
} from 'lucide-react';
import { useFinance } from '../../../context/FinanceContext';
import { formatCurrency } from '../../../utils/currency';
import { formatDate } from '../../../utils/date';
import { ExpenseCategory } from '../../../types/finance';

type ReportType = 'PL_MONTHLY' | 'CASH_DAILY' | 'BURN_WEEKLY' | 'TAX_QUARTERLY' | 'DEPT_VARIANCE';

export const ReportsModule: React.FC = () => {
  const { expenses, invoices, budgets, vendors, cashBalance, monthSpend, totalMonthlyRevenue } = useFinance();

  const [reportType, setReportType] = useState<ReportType>('PL_MONTHLY');
  const [selectedPeriod, setSelectedPeriod] = useState('2026-08');

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

  // Calculations for P&L
  const approvedExpenses = expenses.filter(e => e.status === 'Approved');
  const grossRevenue = totalMonthlyRevenue;
  
  // Breakdown by category
  const categorySpendMap = categories.map(cat => {
    const catTotal = approvedExpenses
      .filter(e => e.category === cat)
      .reduce((sum, e) => sum + e.amount, 0);
    return {
      category: cat,
      amount: catTotal,
      percentOfRevenue: grossRevenue > 0 ? (catTotal / grossRevenue) * 100 : 0,
    };
  });

  const totalOperatingExpenses = categorySpendMap.reduce((s, c) => s + c.amount, 0);
  const netOperatingIncome = grossRevenue - totalOperatingExpenses;
  const ebitdaMargin = grossRevenue > 0 ? (netOperatingIncome / grossRevenue) * 100 : 0;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['Financial Line Item', 'Amount (USD)', '% of Revenue', 'Notes'];
    const rows = [
      ['Gross Client Inflow / Revenue', grossRevenue.toFixed(2), '100.0%', 'Client milestone retainers & engineering contracts'],
      ['--- Operating Expenses (OpEx) ---', '', '', ''],
      ...categorySpendMap.map(c => [
        `  ${c.category}`,
        c.amount.toFixed(2),
        `${c.percentOfRevenue.toFixed(1)}%`,
        'General Ledger itemized allocation',
      ]),
      ['Total Operating Expenses', totalOperatingExpenses.toFixed(2), `${((totalOperatingExpenses / grossRevenue) * 100).toFixed(1)}%`, 'Consolidated OpEx'],
      ['Net Operating Income (EBITDA)', netOperatingIncome.toFixed(2), `${ebitdaMargin.toFixed(1)}%`, 'Pre-tax net operating result'],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Statement_${reportType}_${selectedPeriod}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        className="no-print"
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
            Financial Reports & Operational Statements
          </h1>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            GAAP-structured financial statements, P&L reports, daily cash positions, and board-ready fiscal exports.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="btn"
            onClick={handleExportCSV}
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handlePrint}
          >
            <Printer size={13} />
            <span>Print / PDF Statement</span>
          </button>
        </div>
      </div>

      {/* Report Selector Controls */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-sm)',
          padding: '10px 14px',
          marginBottom: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
        }}
        className="no-print"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
            Select Statement:
          </span>
          <select
            className="form-select"
            style={{ width: '280px', height: '30px', fontWeight: 600 }}
            value={reportType}
            onChange={e => setReportType(e.target.value as ReportType)}
          >
            <option value="PL_MONTHLY">Profit & Loss (P&L) Statement</option>
            <option value="CASH_DAILY">Daily Cash Position & Treasury Summary</option>
            <option value="BURN_WEEKLY">Weekly Operational Burn & Payroll Rollup</option>
            <option value="DEPT_VARIANCE">Department Budget Variance Report</option>
            <option value="TAX_QUARTERLY">Quarterly Tax & Vendor 1099 Summary</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Period:</span>
          <select
            className="form-select font-mono"
            style={{ width: '160px', height: '30px' }}
            value={selectedPeriod}
            onChange={e => setSelectedPeriod(e.target.value)}
          >
            <option value="2026-08">August 2026 (MTD)</option>
            <option value="2026-Q3">Q3 2026 (QTD)</option>
            <option value="2026-YTD">FY2026 (YTD)</option>
          </select>
        </div>
      </div>

      {/* Rendered Financial Report Document (Clean, Print-Optimized) */}
      <div
        style={{
          background: '#ffffff',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-sm)',
          padding: '28px 32px',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        {/* Document Header */}
        <div style={{ borderBottom: '2px solid #0f172a', paddingBottom: '14px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b' }}>
              INTERNAL FINANCIAL OPERATIONS STATEMENT
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
              {reportType === 'PL_MONTHLY' && 'STATEMENT OF PROFIT AND LOSS (P&L)'}
              {reportType === 'CASH_DAILY' && 'DAILY TREASURY CASH POSITION REPORT'}
              {reportType === 'BURN_WEEKLY' && 'WEEKLY OPERATIONAL RUN-RATE & BURN REPORT'}
              {reportType === 'DEPT_VARIANCE' && 'DEPARTMENT BUDGET VARIANCE AUDIT'}
              {reportType === 'TAX_QUARTERLY' && 'QUARTERLY 1099 & TAX LIABILITIES SUMMARY'}
            </h2>
            <div style={{ fontSize: '11.5px', color: '#475569', marginTop: '2px' }}>
              Entity: <strong>ADMARK SOFTWARE AGENCY CORP</strong> • Fiscal Period: <strong>August 01 - August 16, 2026</strong>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div className="font-mono" style={{ fontSize: '11px', color: '#64748b' }}>
              Generated: {new Date().toISOString().replace('T', ' ').substring(0, 16)} UTC
            </div>
            <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>
              Prepared by: <strong>Rachel Green, COO</strong>
            </div>
            <div className="font-mono" style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
              Doc Ref: FIN-RPT-202608-019
            </div>
          </div>
        </div>

        {/* Report Content Based on Type */}
        {reportType === 'PL_MONTHLY' && (
          <div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #cbd5e1' }}>
                  <th style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700, textTransform: 'uppercase', fontSize: '11px' }}>Account Line Item</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, textTransform: 'uppercase', fontSize: '11px', width: '160px' }}>Actuals (USD)</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 700, textTransform: 'uppercase', fontSize: '11px', width: '120px' }}>% of Revenue</th>
                </tr>
              </thead>
              <tbody>
                {/* Revenue Section */}
                <tr style={{ background: '#f1f5f9', fontWeight: 700 }}>
                  <td colSpan={3} style={{ padding: '8px 10px' }}>I. OPERATING REVENUE / CLIENT INFLOWS</td>
                </tr>
                <tr>
                  <td style={{ padding: '7px 20px' }}>Client Retainers & Software Engineering Contracts</td>
                  <td className="table-align-right num-val" style={{ fontWeight: 600, color: 'var(--credit-text)' }}>{formatCurrency(grossRevenue)}</td>
                  <td className="table-align-right font-mono">100.0%</td>
                </tr>
                <tr style={{ borderTop: '1px solid #cbd5e1', fontWeight: 700 }}>
                  <td style={{ padding: '7px 10px' }}>Total Operating Revenue</td>
                  <td className="table-align-right num-val" style={{ fontWeight: 700, color: 'var(--credit-text)' }}>{formatCurrency(grossRevenue)}</td>
                  <td className="table-align-right font-mono">100.0%</td>
                </tr>

                {/* Operating Expenses */}
                <tr style={{ background: '#f1f5f9', fontWeight: 700 }}>
                  <td colSpan={3} style={{ padding: '10px 10px 8px' }}>II. OPERATING EXPENSES (OpEx)</td>
                </tr>
                {categorySpendMap.map(c => (
                  <tr key={c.category} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '6px 20px' }}>{c.category}</td>
                    <td className="table-align-right num-val">{formatCurrency(c.amount)}</td>
                    <td className="table-align-right font-mono">{c.percentOfRevenue.toFixed(1)}%</td>
                  </tr>
                ))}
                <tr style={{ borderTop: '1px solid #0f172a', fontWeight: 700, background: '#f8fafc' }}>
                  <td style={{ padding: '8px 10px' }}>Total Operating Expenses (OpEx)</td>
                  <td className="table-align-right num-val" style={{ color: 'var(--debit-text)' }}>{formatCurrency(totalOperatingExpenses)}</td>
                  <td className="table-align-right font-mono">{((totalOperatingExpenses / grossRevenue) * 100).toFixed(1)}%</td>
                </tr>

                {/* Net Income */}
                <tr style={{ borderTop: '2px solid #0f172a', background: '#e2e8f0', fontWeight: 800, fontSize: '13.5px' }}>
                  <td style={{ padding: '10px' }}>NET OPERATING INCOME / EBITDA</td>
                  <td className="table-align-right num-val" style={{ color: netOperatingIncome >= 0 ? 'var(--credit-text)' : 'var(--debit-text)' }}>
                    {formatCurrency(netOperatingIncome, { showSign: true })}
                  </td>
                  <td className="table-align-right font-mono">{ebitdaMargin.toFixed(1)}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'CASH_DAILY' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
              <div style={{ padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Opening Balance (Aug 01)</div>
                <div className="num-val" style={{ fontSize: '16px', fontWeight: 700, marginTop: '4px' }}>$1,245,900.20</div>
              </div>
              <div style={{ padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Total Cleared MTD</div>
                <div className="num-val" style={{ fontSize: '16px', fontWeight: 700, color: 'var(--credit-text)', marginTop: '4px' }}>+$182,600.22 Net</div>
              </div>
              <div style={{ padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11px', color: '#64748b' }}>Current Treasury Balance</div>
                <div className="num-val" style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>{formatCurrency(cashBalance)}</div>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Bank Account</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Account Type</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>Available Balance</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>Pending AP Cleared</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '8px', fontWeight: 600 }}>JPMorgan Chase Commercial Checking (•••• 9012)</td>
                  <td style={{ padding: '8px' }}>Operating Operating Checking</td>
                  <td className="table-align-right num-val">$842,500.42</td>
                  <td className="table-align-right num-val" style={{ color: 'var(--debit-text)' }}>-$15,700.00</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '8px', fontWeight: 600 }}>Silicon Valley Bank (SVB) Corporate (•••• 4821)</td>
                  <td style={{ padding: '8px' }}>Treasury Reserves & Corporate Cards</td>
                  <td className="table-align-right num-val">$586,000.00</td>
                  <td className="table-align-right num-val" style={{ color: 'var(--debit-text)' }}>-$0.00</td>
                </tr>
                <tr style={{ fontWeight: 700, background: '#f8fafc', borderTop: '2px solid #0f172a' }}>
                  <td style={{ padding: '8px' }}>Total Liquid Cash Position</td>
                  <td></td>
                  <td className="table-align-right num-val">{formatCurrency(cashBalance)}</td>
                  <td className="table-align-right num-val" style={{ color: 'var(--debit-text)' }}>-$15,700.00</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'DEPT_VARIANCE' && (
          <div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Department</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>Allocated Budget</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>Actual Spent</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>Committed</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>Variance (Rem)</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>Burn Velocity</th>
                </tr>
              </thead>
              <tbody>
                {budgets.map(b => {
                  const rem = b.allocatedBudget - (b.spentAmount + b.committedAmount);
                  const util = ((b.spentAmount + b.committedAmount) / b.allocatedBudget) * 100;
                  return (
                    <tr key={b.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '8px', fontWeight: 600 }}>{b.department}</td>
                      <td className="table-align-right num-val">{formatCurrency(b.allocatedBudget)}</td>
                      <td className="table-align-right num-val">{formatCurrency(b.spentAmount)}</td>
                      <td className="table-align-right num-val">{formatCurrency(b.committedAmount)}</td>
                      <td className="table-align-right num-val" style={{ color: rem < 0 ? 'var(--debit-text)' : 'inherit', fontWeight: 600 }}>
                        {formatCurrency(rem)}
                      </td>
                      <td className="table-align-right font-mono" style={{ fontWeight: 600, color: util >= 90 ? 'var(--debit-text)' : util >= 80 ? 'var(--pending-text)' : 'var(--credit-text)' }}>
                        {util.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'TAX_QUARTERLY' && (
          <div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Vendor / Contractor Entity</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Tax ID (EIN/SSN)</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>W-9 Status</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>Q3 Cumulative Spend</th>
                  <th style={{ padding: '8px', textAlign: 'right' }}>1099-NEC Threshold</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map(v => (
                  <tr key={v.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '8px', fontWeight: 600 }}>{v.name}</td>
                    <td className="font-mono" style={{ padding: '8px' }}>{v.taxId}</td>
                    <td style={{ padding: '8px' }}>
                      <span style={{ color: v.w9OnFile ? 'var(--credit-text)' : 'var(--debit-text)', fontWeight: 600 }}>
                        {v.w9OnFile ? '✓ W-9 on File' : '⚠ Missing W-9'}
                      </span>
                    </td>
                    <td className="table-align-right num-val">{formatCurrency(v.outstandingBalance + 4000)}</td>
                    <td className="table-align-right" style={{ color: 'var(--credit-text)', fontWeight: 600 }}>
                      Exceeds $600 (Reportable)
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'BURN_WEEKLY' && (
          <div>
            <div style={{ padding: '14px', background: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: '16px', fontSize: '12px' }}>
              <div style={{ fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Executive Run-Rate Summary:</div>
              <div>Current monthly OpEx burn run-rate is <strong>$215,000/month</strong> against current liquid cash reserves of <strong>{formatCurrency(cashBalance)}</strong>. Effective operational runway is <strong>~6.6 months</strong> without additional client retainers.</div>
            </div>
          </div>
        )}

        {/* Document Footer & Sign-off Block */}
        <div style={{ marginTop: '40px', borderTop: '1px solid #cbd5e1', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b' }}>
          <div>
            <div>Executive Certification:</div>
            <div style={{ marginTop: '12px', borderTop: '1px solid #000', width: '180px', paddingTop: '4px', fontWeight: 600, color: '#000' }}>
              Chief Operating Officer (COO)
            </div>
          </div>
          <div>
            <div>Financial Audit Approval:</div>
            <div style={{ marginTop: '12px', borderTop: '1px solid #000', width: '180px', paddingTop: '4px', fontWeight: 600, color: '#000' }}>
              Chief Financial Officer (CFO)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
