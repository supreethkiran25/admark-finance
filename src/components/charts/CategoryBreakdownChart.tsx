import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { ExpenseCategory } from '../../types/finance';
import { formatCurrency } from '../../utils/currency';

export const CategoryBreakdownChart: React.FC = () => {
  const { filteredExpenses } = useFinance();

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

  const totalSpend = filteredExpenses
    .filter(e => e.status === 'Approved')
    .reduce((sum, e) => sum + e.amount, 0);

  const breakdown = categories
    .map(cat => {
      const items = filteredExpenses.filter(e => e.category === cat && e.status === 'Approved');
      const amount = items.reduce((sum, e) => sum + e.amount, 0);
      const percent = totalSpend > 0 ? (amount / totalSpend) * 100 : 0;
      return {
        category: cat,
        amount,
        count: items.length,
        percent,
      };
    })
    .filter(b => b.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '12px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            Operating Expense Breakdown by Category
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Active MTD Ledger Spend Distribution ({breakdown.length} Active Categories)
          </div>
        </div>
        <div style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
          Total OpEx: {formatCurrency(totalSpend)}
        </div>
      </div>

      {/* Horizontal Stacked Bar */}
      <div
        style={{
          display: 'flex',
          height: '14px',
          borderRadius: 'var(--radius-xs)',
          overflow: 'hidden',
          marginBottom: '14px',
          border: '1px solid var(--border-subtle)',
        }}
      >
        {breakdown.map((b, idx) => {
          const colors = [
            '#1e293b', // Navy Slate (Salaries)
            '#0284c7', // Sky (Cloud)
            '#4f46e5', // Indigo (Software)
            '#059669', // Emerald (Office)
            '#d97706', // Amber (Marketing)
            '#64748b', // Slate (Equipment)
            '#7c3aed', // Purple (Legal/Misc)
            '#0891b2', // Cyan (Travel)
            '#e11d48', // Rose (Food)
            '#475569', // Slate
          ];
          const bg = colors[idx % colors.length];

          return (
            <div
              key={b.category}
              style={{
                width: `${b.percent}%`,
                background: bg,
                height: '100%',
                borderRight: idx < breakdown.length - 1 ? '1px solid rgba(255,255,255,0.4)' : 'none',
              }}
              title={`${b.category}: ${formatCurrency(b.amount)} (${b.percent.toFixed(1)}%)`}
            />
          );
        })}
      </div>

      {/* Tabular Distribution Matrix */}
      <div className="table-container" style={{ border: '1px solid var(--border-subtle)' }}>
        <table className="erp-table compact">
          <thead>
            <tr>
              <th>Expense Category</th>
              <th className="table-align-right">Transactions</th>
              <th className="table-align-right">MTD Spend</th>
              <th className="table-align-right">% of OpEx</th>
              <th style={{ width: '120px' }}>Relative Distribution</th>
            </tr>
          </thead>
          <tbody>
            {breakdown.map((b) => (
              <tr key={b.category}>
                <td style={{ fontWeight: 600 }}>{b.category}</td>
                <td className="table-align-right font-mono">{b.count}</td>
                <td className="table-align-right num-val">{formatCurrency(b.amount)}</td>
                <td className="table-align-right font-mono">{b.percent.toFixed(1)}%</td>
                <td>
                  <div
                    style={{
                      height: '6px',
                      background: 'var(--bg-surface-subtle)',
                      borderRadius: '2px',
                      overflow: 'hidden',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.min(100, b.percent * 1.5)}%`,
                        background: 'var(--primary-navy)',
                      }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
