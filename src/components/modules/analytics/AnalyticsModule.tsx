import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  ShieldAlert,
  Building,
  Users,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';
import { useFinance } from '../../../context/FinanceContext';
import { formatCurrency } from '../../../utils/currency';
import { CashFlowChart } from '../../charts/CashFlowChart';
import { CategoryBreakdownChart } from '../../charts/CategoryBreakdownChart';
import { DepartmentBurnChart } from '../../charts/DepartmentBurnChart';

export const AnalyticsModule: React.FC = () => {
  const { expenses, vendors, budgets, claims, cashBalance, monthSpend, totalMonthlyRevenue } = useFinance();

  // Runway scenario simulation
  const [scenarioMonthlySpend, setScenarioMonthlySpend] = useState<number>(monthSpend * 1.5);
  const [scenarioRevenueGrowth, setScenarioRevenueGrowth] = useState<number>(0);

  const calculatedScenarioRunway = (cashBalance / Math.max(1000, scenarioMonthlySpend - (totalMonthlyRevenue * (1 + scenarioRevenueGrowth / 100)))).toFixed(1);

  // Vendor Concentration
  const topVendors = [...vendors]
    .sort((a, b) => (b.totalYtdSpend + b.outstandingBalance) - (a.totalYtdSpend + a.outstandingBalance))
    .slice(0, 6);

  const totalVendorSpendCombined = topVendors.reduce((s, v) => s + v.totalYtdSpend + v.outstandingBalance, 0);

  // Employee Spend Distribution
  const employeeSpendMap: Record<string, number> = {};
  claims.forEach(c => {
    employeeSpendMap[c.employeeName] = (employeeSpendMap[c.employeeName] || 0) + c.amount;
  });

  const employeeSpendList = Object.entries(employeeSpendMap)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount);

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
            Financial Analytics & Runway Intelligence
          </h1>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Operational spend distribution, vendor concentration risk, department burn velocity, and scenario modeling.
          </p>
        </div>
      </div>

      {/* Metric Strips */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '8px', marginBottom: '14px' }}>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
          <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            Gross Operating Margin
          </div>
          <div className="num-val" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--credit-text)', marginTop: '4px' }}>
            +{(((totalMonthlyRevenue - monthSpend) / totalMonthlyRevenue) * 100).toFixed(1)}%
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Net: {formatCurrency(totalMonthlyRevenue - monthSpend, { showSign: true })}
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
          <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            Average Daily Burn
          </div>
          <div className="num-val" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--debit-text)', marginTop: '4px' }}>
            {formatCurrency(monthSpend / 16)} / day
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Based on 16 days MTD run-rate
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
          <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            CapEx vs OpEx Ratio
          </div>
          <div className="num-val" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary-navy)', marginTop: '4px' }}>
            2.1% CapEx / 97.9% OpEx
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Software agency lean asset model
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
          <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            Current Reserve Runway
          </div>
          <div className="num-val" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--credit-text)', marginTop: '4px' }}>
            ~6.6 Months
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            $1.42M Liquid Treasury
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '12px', marginBottom: '14px' }}>
        <CashFlowChart />
        <DepartmentBurnChart />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px', marginBottom: '14px' }}>
        <CategoryBreakdownChart />

        {/* Vendor Concentration Risk Table */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '12px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                Vendor Concentration & Exposure Risk
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Top 6 suppliers ranked by annual commitment
              </div>
            </div>
          </div>

          <div className="table-container">
            <table className="erp-table compact">
              <thead>
                <tr>
                  <th>Vendor</th>
                  <th>Category</th>
                  <th className="table-align-right">Cumulative Value</th>
                  <th className="table-align-right">% Share</th>
                </tr>
              </thead>
              <tbody>
                {topVendors.map(v => {
                  const val = v.totalYtdSpend + v.outstandingBalance;
                  const pct = totalVendorSpendCombined > 0 ? (val / totalVendorSpendCombined) * 100 : 0;
                  return (
                    <tr key={v.id}>
                      <td style={{ fontWeight: 600 }}>{v.name}</td>
                      <td>{v.category}</td>
                      <td className="table-align-right num-val">{formatCurrency(val)}</td>
                      <td className="table-align-right font-mono">{pct.toFixed(1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Runway Scenario Simulator */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-sm)',
          padding: '14px 16px',
        }}
      >
        <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '4px' }}>
          Interactive Runway & Cash Exhaustion Scenario Modeling
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px' }}>
          Simulate operational stress tests by adjusting monthly burn rate and projected client revenue growth.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', alignItems: 'center' }}>
          <div>
            <label className="form-label">Simulated Monthly OpEx ($)</label>
            <input
              type="range"
              min="150000"
              max="450000"
              step="10000"
              value={scenarioMonthlySpend}
              onChange={e => setScenarioMonthlySpend(parseFloat(e.target.value))}
              style={{ width: '100%', marginTop: '6px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '2px' }}>
              <span>$150k</span>
              <strong className="num-val">{formatCurrency(scenarioMonthlySpend)} / mo</strong>
              <span>$450k</span>
            </div>
          </div>

          <div>
            <label className="form-label">Client Revenue Variance (%)</label>
            <input
              type="range"
              min="-50"
              max="50"
              step="5"
              value={scenarioRevenueGrowth}
              onChange={e => setScenarioRevenueGrowth(parseFloat(e.target.value))}
              style={{ width: '100%', marginTop: '6px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '2px' }}>
              <span>-50% (Loss)</span>
              <strong className="num-val">{scenarioRevenueGrowth >= 0 ? `+${scenarioRevenueGrowth}%` : `${scenarioRevenueGrowth}%`}</strong>
              <span>+50% (Growth)</span>
            </div>
          </div>

          <div
            style={{
              padding: '12px',
              background: 'var(--bg-surface-alt)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xs)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Projected Runway Outcome
            </div>
            <div
              className="num-val"
              style={{
                fontSize: '22px',
                fontWeight: 800,
                color: parseFloat(calculatedScenarioRunway) < 4 ? 'var(--debit-text)' : 'var(--credit-text)',
                marginTop: '2px',
              }}
            >
              {parseFloat(calculatedScenarioRunway) > 36 ? '36+ Months (Self-Sustaining)' : `${calculatedScenarioRunway} Months`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
