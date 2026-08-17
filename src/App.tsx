import React from 'react';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { CommandPalette } from './components/common/CommandPalette';
import { ToastContainer } from './components/common/ToastContainer';

// Modules
import { ExecutiveOverview } from './components/modules/overview/ExecutiveOverview';
import { ExpenseManagement } from './components/modules/expenses/ExpenseManagement';
import { BankStatementModule } from './components/modules/statements/BankStatementModule';
import { CategorizationModule } from './components/modules/categorization/CategorizationModule';
import { EmployeeExpensesModule } from './components/modules/employees/EmployeeExpensesModule';
import { BudgetModule } from './components/modules/budgets/BudgetModule';
import { VendorModule } from './components/modules/vendors/VendorModule';
import { InvoiceModule } from './components/modules/invoices/InvoiceModule';
import { ReportsModule } from './components/modules/reports/ReportsModule';
import { AnalyticsModule } from './components/modules/analytics/AnalyticsModule';
import { SecurityModule } from './components/modules/security/SecurityModule';

const WorkspaceShell: React.FC = () => {
  const { activeModule } = useFinance();

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'overview':
        return <ExecutiveOverview />;
      case 'expenses':
        return <ExpenseManagement />;
      case 'statements':
        return <BankStatementModule />;
      case 'categorization':
        return <CategorizationModule />;
      case 'employees':
        return <EmployeeExpensesModule />;
      case 'budgets':
        return <BudgetModule />;
      case 'vendors':
        return <VendorModule />;
      case 'invoices':
        return <InvoiceModule />;
      case 'reports':
        return <ReportsModule />;
      case 'analytics':
        return <AnalyticsModule />;
      case 'security':
        return <SecurityModule />;
      default:
        return <ExecutiveOverview />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-app)' }}>
      <Header />
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <Sidebar />
        <main
          style={{
            flex: 1,
            minWidth: 0,
            overflowY: 'auto',
            height: 'calc(100vh - var(--header-height))',
            background: 'var(--bg-app)',
          }}
        >
          {renderActiveModule()}
        </main>
      </div>
      <CommandPalette />
      <ToastContainer />
    </div>
  );
};

export function App() {
  return (
    <FinanceProvider>
      <WorkspaceShell />
    </FinanceProvider>
  );
}

export default App;
