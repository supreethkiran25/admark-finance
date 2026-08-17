import React, { useState } from 'react';
import { formatCurrency } from '../../utils/currency';

interface CashFlowPoint {
  date: string;
  inflow: number;
  outflow: number;
  net: number;
  balance: number;
}

const CASH_FLOW_DATA: CashFlowPoint[] = [
  { date: 'Aug 01', inflow: 245000, outflow: 9200, net: 235800, balance: 1488202 },
  { date: 'Aug 03', inflow: 0, outflow: 840, net: -840, balance: 1487362 },
  { date: 'Aug 05', inflow: 0, outflow: 2150, net: -2150, balance: 1485212 },
  { date: 'Aug 07', inflow: 0, outflow: 6500, net: -6500, balance: 1478712 },
  { date: 'Aug 08', inflow: 0, outflow: 850, net: -850, balance: 1477862 },
  { date: 'Aug 09', inflow: 0, outflow: 2410, net: -2410, balance: 1475452 },
  { date: 'Aug 10', inflow: 0, outflow: 4500, net: -4500, balance: 1470952 },
  { date: 'Aug 11', inflow: 0, outflow: 9200, net: -9200, balance: 1461752 },
  { date: 'Aug 12', inflow: 0, outflow: 5319, net: -5319, balance: 1456433 },
  { date: 'Aug 13', inflow: 0, outflow: 1800, net: -1800, balance: 1454633 },
  { date: 'Aug 14', inflow: 110000, outflow: 3200, net: 106800, balance: 1561433 },
  { date: 'Aug 15', inflow: 0, outflow: 126800, net: -126800, balance: 1434633 },
  { date: 'Aug 16', inflow: 0, outflow: 15853, net: -15853, balance: 1428500 },
];

export const CashFlowChart: React.FC = () => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const width = 640;
  const height = 180;
  const padding = { top: 15, right: 20, bottom: 25, left: 60 };

  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const minBal = 1400000;
  const maxBal = 1600000;

  const getY = (val: number) => {
    const ratio = (val - minBal) / (maxBal - minBal);
    return padding.top + chartH - ratio * chartH;
  };

  const getX = (index: number) => {
    return padding.left + (index / (CASH_FLOW_DATA.length - 1)) * chartW;
  };

  // Generate SVG path
  const points = CASH_FLOW_DATA.map((d, i) => `${getX(i)},${getY(d.balance)}`).join(' ');

  const hoveredData = hoveredIdx !== null ? CASH_FLOW_DATA[hoveredIdx] : null;

  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '12px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
            Daily Operating Cash Trajectory
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Treasury & Operating Checking Balance (Aug 01 - Aug 16, 2026)
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', background: 'var(--primary-navy)' }}></span>
            <span>Operating Balance</span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', background: 'var(--credit-text)' }}></span>
            <span>Client Inflow</span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '8px', height: '8px', background: 'var(--debit-text)' }}></span>
            <span>OpEx / Payroll Outflow</span>
          </span>
        </div>
      </div>

      <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
          {/* Grid lines */}
          {[1400000, 1450000, 1500000, 1550000, 1600000].map(val => {
            const y = getY(val);
            return (
              <g key={val}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="var(--border-subtle)"
                  strokeWidth="1"
                  strokeDasharray="2,2"
                />
                <text
                  x={padding.left - 6}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="9.5"
                  fill="var(--text-muted)"
                  fontFamily="var(--font-mono)"
                >
                  ${(val / 1000).toFixed(0)}k
                </text>
              </g>
            );
          })}

          {/* Area under line */}
          <polygon
            points={`${getX(0)},${padding.top + chartH} ${points} ${getX(CASH_FLOW_DATA.length - 1)},${padding.top + chartH}`}
            fill="rgba(15, 23, 42, 0.04)"
          />

          {/* Balance Line */}
          <polyline
            fill="none"
            stroke="var(--primary-navy)"
            strokeWidth="1.75"
            points={points}
          />

          {/* Data Points and Inflow/Outflow Bars */}
          {CASH_FLOW_DATA.map((d, i) => {
            const cx = getX(i);
            const cy = getY(d.balance);
            const isHovered = hoveredIdx === i;

            return (
              <g key={i}>
                {/* Vertical cursor guide */}
                {isHovered && (
                  <line
                    x1={cx}
                    y1={padding.top}
                    x2={cx}
                    y2={padding.top + chartH}
                    stroke="var(--primary-blue)"
                    strokeWidth="1"
                  />
                )}

                {/* Point */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 4 : 2.5}
                  fill={isHovered ? 'var(--primary-blue)' : 'var(--primary-navy)'}
                  stroke="#fff"
                  strokeWidth="1.5"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />

                {/* X axis tick */}
                {(i % 2 === 0 || i === CASH_FLOW_DATA.length - 1) && (
                  <text
                    x={cx}
                    y={height - 6}
                    textAnchor="middle"
                    fontSize="9.5"
                    fill="var(--text-muted)"
                    fontFamily="var(--font-mono)"
                  >
                    {d.date}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Precise Tooltip */}
        {hoveredData && (
          <div
            style={{
              position: 'absolute',
              top: '10px',
              right: '20px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              padding: '6px 10px',
              borderRadius: 'var(--radius-xs)',
              fontSize: '11px',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex',
              gap: '12px',
            }}
          >
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Date: </span>
              <strong>{hoveredData.date}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Balance: </span>
              <strong className="num-val">{formatCurrency(hoveredData.balance)}</strong>
            </div>
            {hoveredData.inflow > 0 && (
              <div style={{ color: 'var(--credit-text)' }}>
                <span>In: </span>
                <strong className="num-val">+{formatCurrency(hoveredData.inflow)}</strong>
              </div>
            )}
            {hoveredData.outflow > 0 && (
              <div style={{ color: 'var(--debit-text)' }}>
                <span>Out: </span>
                <strong className="num-val">-{formatCurrency(hoveredData.outflow)}</strong>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
