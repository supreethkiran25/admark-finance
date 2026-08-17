import React from 'react';
import {
  Search,
  Sliders,
  ShieldCheck,
  User,
  Activity,
  Menu,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { UserRole } from '../../types/finance';

export const Header: React.FC = () => {
  const {
    currentRole,
    setCurrentRole,
    setCommandPaletteOpen,
    isCompactMode,
    setIsCompactMode,
    isSidebarCollapsed,
    setIsSidebarCollapsed,
  } = useFinance();

  const roleDescriptions: Record<UserRole, string> = {
    COO: 'Chief Operating Officer (Primary: Expenses, Budgets, Ops, Vendors)',
    CEO: 'Chief Executive Officer (Complete Executive Oversight)',
    CFO: 'Chief Financial Officer (Financial Reports, Invoices & Reconciliation)',
    CTO: 'Chief Technology Officer (Cloud, SaaS & Tech Expenses Only)',
  };

  return (
    <header
      style={{
        height: 'var(--header-height)',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-default)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        zIndex: 50,
        position: 'sticky',
        top: 0,
      }}
      className="no-print"
    >
      {/* Left: Brand & Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <button
          type="button"
          className="btn btn-sm btn-icon-only"
          onClick={() => setIsSidebarCollapsed(prev => !prev)}
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Menu size={15} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '8px',
              height: '8px',
              backgroundColor: 'var(--credit-text)',
              borderRadius: '1px',
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontSize: '12.5px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                color: 'var(--primary-navy)',
                textTransform: 'uppercase',
              }}
            >
              FINANCIAL OPERATIONS WORKSPACE
            </span>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              Software Agency Operating Ledger • FY2026 Q3
            </span>
          </div>
        </div>
      </div>

      {/* Center: Command Palette Trigger */}
      <div style={{ flex: 1, maxWidth: '400px', margin: '0 20px' }}>
        <button
          type="button"
          onClick={() => setCommandPaletteOpen(true)}
          style={{
            width: '100%',
            height: '30px',
            background: 'var(--bg-surface-subtle)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '0 10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: 'var(--text-muted)',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Search size={13} />
            <span>Search ledger, vendors, invoices...</span>
          </span>
          <kbd
            style={{
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              border: '1px solid var(--border-default)',
              padding: '1px 5px',
              borderRadius: '2px',
              background: 'var(--bg-surface)',
              color: 'var(--text-secondary)',
            }}
          >
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right: Role Switcher & System Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Table Density Toggle */}
        <button
          type="button"
          className="btn btn-sm"
          onClick={() => setIsCompactMode(prev => !prev)}
          title={`Switch to ${isCompactMode ? 'Standard' : 'Compact'} row density`}
          style={{ height: '28px', fontSize: '11px' }}
        >
          <Sliders size={12} />
          <span>{isCompactMode ? 'Compact Density' : 'Standard Density'}</span>
        </button>

        {/* Sync Status Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11px',
            color: 'var(--text-muted)',
            padding: '0 6px',
            borderRight: '1px solid var(--border-subtle)',
          }}
        >
          <Activity size={12} style={{ color: 'var(--credit-text)' }} />
          <span>SVB & Chase Live</span>
        </div>

        {/* Role Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <User size={13} style={{ color: 'var(--text-muted)' }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <select
              value={currentRole}
              onChange={e => setCurrentRole(e.target.value as UserRole)}
              className="form-select"
              title={roleDescriptions[currentRole]}
              style={{
                height: '28px',
                fontSize: '11.5px',
                fontWeight: 600,
                padding: '2px 8px',
                borderColor: currentRole === 'CTO' ? 'var(--primary-blue)' : 'var(--border-strong)',
                background: currentRole === 'CTO' ? 'var(--info-bg)' : 'var(--bg-surface)',
                color: currentRole === 'CTO' ? 'var(--info-text)' : 'var(--text-primary)',
              }}
            >
              <option value="COO">Role: COO (Operations & Finance)</option>
              <option value="CEO">Role: CEO (Full Executive View)</option>
              <option value="CFO">Role: CFO (Financials & Invoices)</option>
              <option value="CTO">Role: CTO (Tech Expenses Only)</option>
            </select>
          </div>
        </div>

        <div
          style={{
            padding: '3px 6px',
            background: 'var(--bg-surface-subtle)',
            borderRadius: 'var(--radius-xs)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11px',
            fontWeight: 600,
          }}
          title="Enterprise Bank-grade Security Active"
        >
          <ShieldCheck size={13} style={{ color: 'var(--credit-text)' }} />
          <span>SOC-2</span>
        </div>
      </div>
    </header>
  );
};
