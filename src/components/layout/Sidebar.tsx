import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  FileSpreadsheet,
  Cpu,
  UserCheck,
  PieChart,
  Building2,
  FileText,
  BarChart3,
  Shield,
  Plus,
  Upload,
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';
import { NavigationModule } from '../../types/finance';

export const Sidebar: React.FC = () => {
  const {
    activeModule,
    setActiveModule,
    currentRole,
    isSidebarCollapsed,
    expenses,
    transactions,
    claims,
    invoices,
  } = useFinance();

  const pendingExpensesCount = expenses.filter(e => e.status === 'Pending Approval').length;
  const unmatchedTxsCount = transactions.filter(t => t.reconciliationStatus === 'Unmatched').length;
  const pendingClaimsCount = claims.filter(c => c.status === 'Submitted').length;
  const overdueInvoicesCount = invoices.filter(i => i.status === 'Overdue').length;

  interface NavSection {
    title: string;
    items: Array<{
      id: NavigationModule;
      label: string;
      icon: React.ReactNode;
      badge?: number | string;
      badgeType?: 'credit' | 'debit' | 'pending' | 'info';
      rolesAllowed?: string[];
      highlight?: boolean;
    }>;
  }

  const sections: NavSection[] = [
    {
      title: 'Operations Ledger',
      items: [
        {
          id: 'overview',
          label: 'Executive Overview',
          icon: <LayoutDashboard size={15} />,
        },
        {
          id: 'expenses',
          label: 'Expense Management',
          icon: <Receipt size={15} />,
          badge: pendingExpensesCount > 0 ? pendingExpensesCount : undefined,
          badgeType: 'pending',
        },
        {
          id: 'statements',
          label: 'Bank Statements & Reconcile',
          icon: <FileSpreadsheet size={15} />,
          badge: unmatchedTxsCount > 0 ? `${unmatchedTxsCount} open` : undefined,
          badgeType: 'debit',
        },
        {
          id: 'categorization',
          label: 'Auto-Categorization',
          icon: <Cpu size={15} />,
        },
      ],
    },
    {
      title: 'Workforce & Capacity',
      items: [
        {
          id: 'employees',
          label: 'Employee Reimbursements',
          icon: <UserCheck size={15} />,
          badge: pendingClaimsCount > 0 ? pendingClaimsCount : undefined,
          badgeType: 'pending',
        },
        {
          id: 'budgets',
          label: 'Department Budgets',
          icon: <PieChart size={15} />,
        },
      ],
    },
    {
      title: 'Commercial & AP / AR',
      items: [
        {
          id: 'vendors',
          label: 'Vendor Directory',
          icon: <Building2 size={15} />,
        },
        {
          id: 'invoices',
          label: 'Invoices (AP / AR)',
          icon: <FileText size={15} />,
          badge: overdueInvoicesCount > 0 ? `${overdueInvoicesCount} overdue` : undefined,
          badgeType: 'debit',
        },
      ],
    },
    {
      title: 'Financial Intelligence',
      items: [
        {
          id: 'reports',
          label: 'Financial Reports & P&L',
          icon: <FileText size={15} />,
        },
        {
          id: 'analytics',
          label: 'Financial Analytics',
          icon: <BarChart3 size={15} />,
        },
        {
          id: 'security',
          label: 'Security & Audit Trail',
          icon: <Shield size={15} />,
        },
      ],
    },
  ];

  return (
    <aside
      className="no-print"
      style={{
        width: isSidebarCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
        minWidth: isSidebarCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
        background: 'var(--bg-surface-alt)',
        borderRight: '1px solid var(--border-default)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: 'calc(100vh - var(--header-height))',
        position: 'sticky',
        top: 'var(--header-height)',
        transition: 'width 0.15s ease, min-width 0.15s ease',
        overflowY: 'auto',
        overflowX: 'hidden',
        userSelect: 'none',
      }}
    >
      <div style={{ padding: isSidebarCollapsed ? '8px 4px' : '10px 8px' }}>
        {/* Role Banner if filtered */}
        {currentRole === 'CTO' && !isSidebarCollapsed && (
          <div
            style={{
              padding: '6px 8px',
              marginBottom: '10px',
              background: 'var(--info-bg)',
              border: '1px solid var(--info-border)',
              borderRadius: 'var(--radius-xs)',
              fontSize: '10.5px',
              color: 'var(--info-text)',
              lineHeight: 1.3,
            }}
          >
            <strong>CTO View Filter:</strong> Showing Tech & Infrastructure expenses only.
          </div>
        )}

        {sections.map((section, sIdx) => (
          <div key={sIdx} style={{ marginBottom: '14px' }}>
            {!isSidebarCollapsed && (
              <div
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--text-muted)',
                  padding: '4px 8px',
                  marginBottom: '2px',
                }}
              >
                {section.title}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              {section.items.map(item => {
                const isActive = activeModule === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveModule(item.id)}
                    title={isSidebarCollapsed ? item.label : undefined}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
                      width: '100%',
                      padding: isSidebarCollapsed ? '8px 0' : '6px 8px',
                      fontSize: '12px',
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? 'var(--primary-navy)' : 'var(--text-secondary)',
                      background: isActive ? 'var(--bg-surface)' : 'transparent',
                      border: '1px solid',
                      borderColor: isActive ? 'var(--border-default)' : 'transparent',
                      borderRadius: 'var(--radius-xs)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                      transition: 'background-color 0.1s, border-color 0.1s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          color: isActive ? 'var(--primary-blue)' : 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        {item.icon}
                      </span>
                      {!isSidebarCollapsed && <span>{item.label}</span>}
                    </div>

                    {!isSidebarCollapsed && item.badge && (
                      <span
                        style={{
                          fontSize: '10px',
                          fontFamily: 'var(--font-mono)',
                          padding: '1px 5px',
                          borderRadius: '2px',
                          fontWeight: 600,
                          background:
                            item.badgeType === 'debit'
                              ? 'var(--debit-bg)'
                              : item.badgeType === 'pending'
                              ? 'var(--pending-bg)'
                              : 'var(--bg-surface-subtle)',
                          color:
                            item.badgeType === 'debit'
                              ? 'var(--debit-text)'
                              : item.badgeType === 'pending'
                              ? 'var(--pending-text)'
                              : 'var(--text-secondary)',
                          border: `1px solid ${
                            item.badgeType === 'debit'
                              ? 'var(--debit-border)'
                              : item.badgeType === 'pending'
                              ? 'var(--pending-border)'
                              : 'var(--border-subtle)'
                          }`,
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Action Ribbon at bottom */}
      {!isSidebarCollapsed && (
        <div
          style={{
            padding: '10px 8px',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-surface)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <button
            type="button"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => setActiveModule('expenses')}
          >
            <Plus size={13} />
            <span>+ Record Expense</span>
          </button>
          <button
            type="button"
            className="btn"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => setActiveModule('statements')}
          >
            <Upload size={13} />
            <span>Import Statement</span>
          </button>
        </div>
      )}
    </aside>
  );
};
