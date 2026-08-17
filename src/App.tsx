import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { CommandPalette } from './components/common/CommandPalette';
import { ToastContainer } from './components/common/ToastContainer';
import { colors } from './theme/colors';

// Enterprise Accounting Modules in React Native
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Header />
        <View style={styles.contentRow}>
          <Sidebar />
          <View style={styles.mainContent}>
            {renderActiveModule()}
          </View>
        </View>
        <CommandPalette />
        <ToastContainer />
      </View>
    </SafeAreaView>
  );
};

export function App() {
  return (
    <FinanceProvider>
      <WorkspaceShell />
    </FinanceProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bgApp,
    height: '100%',
    width: '100%',
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    height: '100%',
    backgroundColor: colors.bgApp,
  },
  contentRow: {
    flex: 1,
    flexDirection: 'row',
    height: '100%',
    overflow: 'hidden',
  },
  mainContent: {
    flex: 1,
    backgroundColor: colors.bgApp,
    height: '100%',
    overflow: 'hidden',
  },
});

export default App;
