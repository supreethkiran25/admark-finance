import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { formatCurrency } from '../../utils/currency';

export const DepartmentBurnChart: React.FC = () => {
  const { budgets } = useFinance();

  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '12px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            Department Budget Utilization & Burn Velocity
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            August 2026 Fiscal Allocations vs Actual Spend & Commitments
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {budgets.map(b => {
          const totalUtilized = b.spentAmount + b.committedAmount;
          const pct = (totalUtilized / b.allocatedBudget) * 100;
          const remaining = b.allocatedBudget - totalUtilized;

          let statusColor = 'var(--credit-text)';
          let barBg = 'var(--credit-text)';
          if (pct >= 100) {
            statusColor = 'var(--debit-text)';
            barBg = 'var(--debit-text)';
          } else if (pct >= 85) {
            statusColor = 'var(--pending-text)';
            barBg = 'var(--pending-text)';
          }

          return (
            <div
              key={b.id}
              style={{
                padding: '8px 10px',
                background: 'var(--bg-surface-alt)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-xs)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '12px', color: 'var(--text-primary)' }}>
                    {b.department}
                  </span>
                  <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                    (Allocated: {formatCurrency(b.allocatedBudget)})
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11.5px' }}>
                  <span>
                    Spent: <strong className="num-val">{formatCurrency(b.spentAmount)}</strong>
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>•</span>
                  <span>
                    Rem: <strong className="num-val" style={{ color: remaining < 0 ? 'var(--debit-text)' : 'inherit' }}>{formatCurrency(remaining)}</strong>
                  </span>
                  <span
                    className="num-val"
                    style={{
                      fontWeight: 700,
                      color: statusColor,
                      padding: '1px 4px',
                      background: 'var(--bg-surface)',
                      borderRadius: '2px',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '11px',
                    }}
                  >
                    {pct.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Utilization Bar */}
              <div
                style={{
                  height: '6px',
                  background: 'var(--bg-surface)',
                  borderRadius: '2px',
                  overflow: 'hidden',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(100, pct)}%`,
                    background: barBg,
                    transition: 'width 0.2s ease',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
