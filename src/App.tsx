import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinanceProvider, useFinance } from './context/FinanceContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { LoginView } from './components/auth/LoginView';
import { ToastContainer } from './components/common/ToastContainer';
import { colors } from './theme/colors';

// Modules
import { SimplifiedDashboard } from './components/modules/dashboard/SimplifiedDashboard';
import { StatementAnalysisWorkflow } from './components/modules/statement-analysis/StatementAnalysisWorkflow';
import { SimpleExpenseManagement } from './components/modules/expenses/SimpleExpenseManagement';
import { TransactionsHistoryView } from './components/modules/transactions/TransactionsHistoryView';
import { EmployeeManagementView } from './components/modules/employees/EmployeeManagementView';
import { PayrollView } from './components/modules/payroll/PayrollView';
import { SimpleBudgetsView } from './components/modules/budgets/SimpleBudgetsView';
import { SuppliersView } from './components/modules/suppliers/SuppliersView';
import { SimpleReportsView } from './components/modules/reports/SimpleReportsView';
import { SettingsView } from './components/modules/settings/SettingsView';

const WorkspaceShell: React.FC = () => {
  const { activeModule } = useFinance();

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <SimplifiedDashboard />;
      case 'upload-statement':
        return <StatementAnalysisWorkflow />;
      case 'expenses':
        return <SimpleExpenseManagement />;
      case 'transactions':
        return <TransactionsHistoryView />;
      case 'employees':
        return <EmployeeManagementView />;
      case 'payroll':
        return <PayrollView />;
      case 'budgets':
        return <SimpleBudgetsView />;
      case 'suppliers':
        return <SuppliersView />;
      case 'reports':
        return <SimpleReportsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <SimplifiedDashboard />;
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
        <ToastContainer />
      </View>
    </SafeAreaView>
  );
};

const AuthGate: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginView />;
  }

  return (
    <FinanceProvider>
      <WorkspaceShell />
    </FinanceProvider>
  );
};

export function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}

export default App;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bgApp,
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: colors.bgApp,
    height: '100%',
    overflow: 'hidden',
  },
  contentRow: {
    flex: 1,
    flexDirection: 'row',
    height: 'calc(100% - 48px)' as any,
  },
  mainContent: {
    flex: 1,
    backgroundColor: colors.bgApp,
    overflow: 'hidden',
  },
});
