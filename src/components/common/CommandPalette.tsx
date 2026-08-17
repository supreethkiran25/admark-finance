import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  ArrowRight,
  PlusCircle,
  FileText,
  DollarSign,
  Building,
  Shield,
  Layers,
  PieChart,
  Users,
  Sliders,
  CheckCircle,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { NavigationModule } from '../../types/finance';
import { formatCurrency } from '../../utils/currency';

export const CommandPalette: React.FC = () => {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    setActiveModule,
    expenses,
    vendors,
    invoices,
    setIsCompactMode,
    isCompactMode,
  } = useFinance();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global key listener for Ctrl+K, Cmd+K, or /
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      } else if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        setCommandPaletteOpen(true);
      } else if (e.key === 'Escape' && commandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  // Build searchable items
  interface PaletteItem {
    id: string;
    title: string;
    subtitle?: string;
    group: 'Navigation' | 'Actions' | 'Expenses' | 'Vendors' | 'Invoices';
    icon: React.ReactNode;
    action: () => void;
  }

  const navItems: PaletteItem[] = [
    {
      id: 'nav-overview',
      title: 'Executive Overview',
      subtitle: 'Cash balance, operational metrics & ledger summary',
      group: 'Navigation',
      icon: <PieChart size={14} />,
      action: () => { setActiveModule('overview'); setCommandPaletteOpen(false); },
    },
    {
      id: 'nav-expenses',
      title: 'Expense Management',
      subtitle: 'Expense ledger, receipts, approvals & GL allocations',
      group: 'Navigation',
      icon: <DollarSign size={14} />,
      action: () => { setActiveModule('expenses'); setCommandPaletteOpen(false); },
    },
    {
      id: 'nav-statements',
      title: 'Bank Statement Import & Reconciliation',
      subtitle: 'Parse PDF/CSV/Excel statements & match ledger records',
      group: 'Navigation',
      icon: <Layers size={14} />,
      action: () => { setActiveModule('statements'); setCommandPaletteOpen(false); },
    },
    {
      id: 'nav-categorization',
      title: 'Automatic Categorization Engine',
      subtitle: 'Regex & keyword rules for automated GL coding',
      group: 'Navigation',
      icon: <Sliders size={14} />,
      action: () => { setActiveModule('categorization'); setCommandPaletteOpen(false); },
    },
    {
      id: 'nav-employees',
      title: 'Employee Reimbursements',
      subtitle: 'Travel, client meals, internet & equipment claims',
      group: 'Navigation',
      icon: <Users size={14} />,
      action: () => { setActiveModule('employees'); setCommandPaletteOpen(false); },
    },
    {
      id: 'nav-budgets',
      title: 'Department Budgets',
      subtitle: 'Monthly allocated vs spent variance & utilization',
      group: 'Navigation',
      icon: <CheckCircle size={14} />,
      action: () => { setActiveModule('budgets'); setCommandPaletteOpen(false); },
    },
    {
      id: 'nav-vendors',
      title: 'Vendor Management',
      subtitle: 'Contracts, payment terms, outstanding AP balances',
      group: 'Navigation',
      icon: <Building size={14} />,
      action: () => { setActiveModule('vendors'); setCommandPaletteOpen(false); },
    },
    {
      id: 'nav-invoices',
      title: 'Invoice Management (AP / AR)',
      subtitle: 'Vendor bills, client billing retainers & formal invoices',
      group: 'Navigation',
      icon: <FileText size={14} />,
      action: () => { setActiveModule('invoices'); setCommandPaletteOpen(false); },
    },
    {
      id: 'nav-reports',
      title: 'Financial Reports & P&L',
      subtitle: 'Cash position, burn rate, quarterly EBITDA & PDF exports',
      group: 'Navigation',
      icon: <FileText size={14} />,
      action: () => { setActiveModule('reports'); setCommandPaletteOpen(false); },
    },
    {
      id: 'nav-security',
      title: 'Security & Audit Log',
      subtitle: 'Immutable event trail & security checklist',
      group: 'Navigation',
      icon: <Shield size={14} />,
      action: () => { setActiveModule('security'); setCommandPaletteOpen(false); },
    },
  ];

  const actionItems: PaletteItem[] = [
    {
      id: 'act-density',
      title: `Toggle Table Density (${isCompactMode ? 'Currently Compact' : 'Currently Standard'})`,
      subtitle: 'Switch between 32px compact and 40px standard row spacing',
      group: 'Actions',
      icon: <Sliders size={14} />,
      action: () => { setIsCompactMode(prev => !prev); setCommandPaletteOpen(false); },
    },
    {
      id: 'act-new-exp',
      title: '+ Record New Expense',
      subtitle: 'Add operational transaction to internal ledger',
      group: 'Actions',
      icon: <PlusCircle size={14} />,
      action: () => { setActiveModule('expenses'); setCommandPaletteOpen(false); },
    },
    {
      id: 'act-import-stmt',
      title: '+ Import Bank Statement',
      subtitle: 'Upload CSV, Excel, or load sample Chase/SVB statement',
      group: 'Actions',
      icon: <PlusCircle size={14} />,
      action: () => { setActiveModule('statements'); setCommandPaletteOpen(false); },
    },
  ];

  // Dynamic search for expenses
  const expenseItems: PaletteItem[] = expenses
    .filter(
      e =>
        e.description.toLowerCase().includes(query.toLowerCase()) ||
        e.referenceNumber.toLowerCase().includes(query.toLowerCase()) ||
        e.employee.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 4)
    .map(e => ({
      id: `exp-${e.id}`,
      title: `${e.referenceNumber}: ${e.description}`,
      subtitle: `${e.date} • ${formatCurrency(e.amount)} • ${e.department} • ${e.status}`,
      group: 'Expenses',
      icon: <DollarSign size={14} />,
      action: () => {
        setActiveModule('expenses');
        setCommandPaletteOpen(false);
      },
    }));

  // Dynamic search for vendors
  const vendorItems: PaletteItem[] = vendors
    .filter(
      v =>
        v.name.toLowerCase().includes(query.toLowerCase()) ||
        v.category.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, 3)
    .map(v => ({
      id: `vnd-${v.id}`,
      title: `Vendor: ${v.name}`,
      subtitle: `${v.paymentTerms} • Outstanding: ${formatCurrency(v.outstandingBalance)}`,
      group: 'Vendors',
      icon: <Building size={14} />,
      action: () => {
        setActiveModule('vendors');
        setCommandPaletteOpen(false);
      },
    }));

  const allFiltered: PaletteItem[] = [
    ...navItems.filter(
      i =>
        i.title.toLowerCase().includes(query.toLowerCase()) ||
        (i.subtitle && i.subtitle.toLowerCase().includes(query.toLowerCase()))
    ),
    ...actionItems.filter(
      i =>
        i.title.toLowerCase().includes(query.toLowerCase()) ||
        (i.subtitle && i.subtitle.toLowerCase().includes(query.toLowerCase()))
    ),
    ...(query.length > 1 ? expenseItems : []),
    ...(query.length > 1 ? vendorItems : []),
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < allFiltered.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : allFiltered.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allFiltered[selectedIndex]) {
        allFiltered[selectedIndex].action();
      }
    }
  };

  return (
    <div className="command-palette-backdrop" onClick={() => setCommandPaletteOpen(false)}>
      <div className="command-palette-box" onClick={e => e.stopPropagation()}>
        <div className="command-search-bar">
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            ref={inputRef}
            type="text"
            className="command-input"
            placeholder="Search operational modules, transactions, vendors, actions... (ESC to close)"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
          />
          <kbd
            style={{
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              border: '1px solid var(--border-default)',
              padding: '2px 5px',
              borderRadius: '2px',
              color: 'var(--text-muted)',
              background: 'var(--bg-surface-alt)',
            }}
          >
            ESC
          </kbd>
        </div>

        <div className="command-results-list">
          {allFiltered.length === 0 ? (
            <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
              No operational records or commands matching "{query}"
            </div>
          ) : (
            allFiltered.map((item, index) => (
              <div
                key={item.id}
                className={`command-item ${index === selectedIndex ? 'selected' : ''}`}
                onClick={item.action}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{item.icon}</span>
                  <div>
                    <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{item.title}</div>
                    {item.subtitle && (
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {item.subtitle}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="command-item-badge">{item.group}</span>
                  {index === selectedIndex && (
                    <ArrowRight size={12} style={{ color: 'var(--text-muted)' }} />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
