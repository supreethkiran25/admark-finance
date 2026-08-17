import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  badgeText?: string;
  badgeType?: 'credit' | 'debit' | 'pending' | 'neutral';
  icon?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subValue,
  badgeText,
  badgeType = 'neutral',
  icon,
}) => {
  let badgeColorClass = 'color: var(--text-muted); background: var(--bg-surface-alt);';
  if (badgeType === 'credit') {
    badgeColorClass = 'color: var(--credit-text); background: var(--credit-bg); border: 1px solid var(--credit-border);';
  } else if (badgeType === 'debit') {
    badgeColorClass = 'color: var(--debit-text); background: var(--debit-bg); border: 1px solid var(--debit-border);';
  } else if (badgeType === 'pending') {
    badgeColorClass = 'color: var(--pending-text); background: var(--pending-bg); border: 1px solid var(--pending-border);';
  }

  return (
    <div className="metric-card">
      <div className="metric-label">
        <span>{label}</span>
        {icon && <span style={{ color: 'var(--text-subtle)' }}>{icon}</span>}
      </div>
      <div className="metric-value">{value}</div>
      <div className="metric-sub">
        {badgeText && (
          <span
            style={{
              padding: '1px 5px',
              borderRadius: '2px',
              fontSize: '10px',
              fontWeight: 600,
              fontFamily: 'var(--font-mono)',
              ...Object.fromEntries(
                badgeColorClass
                  .split(';')
                  .filter(Boolean)
                  .map(s => {
                    const [k, v] = s.split(':');
                    const camelK = k.trim().replace(/-([a-z])/g, g => g[1].toUpperCase());
                    return [camelK, v.trim()];
                  })
              ),
            }}
          >
            {badgeText}
          </span>
        )}
        {subValue && <span>{subValue}</span>}
      </div>
    </div>
  );
};
