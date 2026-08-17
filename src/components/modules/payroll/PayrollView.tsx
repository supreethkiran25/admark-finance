import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileSpreadsheet,
  Plus,
  ArrowRight,
  Search,
  Check,
  X,
  DollarSign,
  Calendar,
  Users,
  Building,
  Sparkles,
} from 'lucide-react';
import { useFinance } from '../../../context/FinanceContext';
import { SelectPicker } from '../../common/SelectPicker';
import { Modal } from '../../common/Modal';
import { formatCurrency } from '../../../utils/currency';
import { formatDate } from '../../../utils/date';
import { Employee, PayrollStatus } from '../../../types/finance';
import { colors } from '../../../theme/colors';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export const PayrollView: React.FC = () => {
  const {
    employees,
    totalMonthlyPayroll,
    salariesPaidThisMonth,
    salariesPendingThisMonth,
    activeEmployeesCount,
    recordSalaryPayment,
    updateSalaryStatus,
    exportPayrollExcel,
    setActiveModule,
  } = useFinance();

  const currentYear = new Date().getFullYear();
  const currentMonthNum = new Date().getMonth() + 1;
  const currentFiscalMonth = `${currentYear}-${String(currentMonthNum).padStart(2, '0')}`;

  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentFiscalMonth);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Payment Workflow Modal State
  const [isPayModalOpen, setIsPayModalOpen] = useState<boolean>(false);
  const [payFormData, setPayFormData] = useState<{
    employeeId: string;
    fiscalMonth: string;
    paymentDate: string;
    paymentMethod: string;
    referenceNumber: string;
    notes: string;
  }>({
    employeeId: employees[0]?.id || '',
    fiscalMonth: currentFiscalMonth,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'NEFT / RTGS Corporate NetBanking',
    referenceNumber: `SAL-${currentFiscalMonth}-${Math.floor(1000 + Math.random() * 9000)}`,
    notes: 'Monthly regular payroll salary disbursement',
  });

  const selectedEmployeeObj = employees.find(e => e.id === payFormData.employeeId);
  const netSalaryForPayment = selectedEmployeeObj
    ? (selectedEmployeeObj.monthlySalary || 0) +
      (selectedEmployeeObj.allowances || 0) +
      (selectedEmployeeObj.bonuses || 0) -
      (selectedEmployeeObj.deductions || 0)
    : 0;

  const handleDisbursePayment = () => {
    if (!payFormData.employeeId) {
      alert('Please select an employee.');
      return;
    }
    if (!payFormData.paymentDate) {
      alert('Please select a payment date.');
      return;
    }

    recordSalaryPayment(payFormData.employeeId, payFormData.fiscalMonth, {
      paymentDate: payFormData.paymentDate,
      paymentMethod: payFormData.paymentMethod,
      referenceNumber: payFormData.referenceNumber,
      notes: payFormData.notes,
    });

    setIsPayModalOpen(false);
  };

  // Filter Employees
  const filteredEmployees = employees.filter(emp => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        emp.fullName.toLowerCase().includes(q) ||
        emp.employeeId.toLowerCase().includes(q) ||
        emp.position.toLowerCase().includes(q) ||
        emp.department.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const monthsList = Array.from({ length: 12 }, (_, i) => {
    const mStr = String(i + 1).padStart(2, '0');
    return `${selectedYear}-${mStr}`;
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, gap: 14 }}>
      {/* Title Ribbon */}
      <View style={styles.titleRibbon}>
        <View>
          <Text style={styles.pageTitle}>Payroll & Salary Management</Text>
          <Text style={styles.pageSubtitle}>
            Monthly salary configurations, staff disbursement ledger, and month-by-month tracker.
          </Text>
        </View>

        <View style={styles.actionGroup}>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => exportPayrollExcel(selectedMonth)}
          >
            <FileSpreadsheet size={13} color={colors.primaryNavy} />
            <Text style={styles.secondaryBtnText}>Export Payroll (.xlsx)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => {
              setPayFormData({
                employeeId: employees[0]?.id || '',
                fiscalMonth: selectedMonth,
                paymentDate: new Date().toISOString().split('T')[0],
                paymentMethod: 'NEFT / RTGS Corporate NetBanking',
                referenceNumber: `SAL-${selectedMonth}-${Math.floor(1000 + Math.random() * 9000)}`,
                notes: 'Monthly regular payroll salary disbursement',
              });
              setIsPayModalOpen(true);
            }}
          >
            <CreditCard size={13} color="#fff" />
            <Text style={styles.primaryBtnText}>Disburse Salary</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* PAYROLL DASHBOARD METRICS */}
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Total Monthly Payroll ({selectedMonth})</Text>
          <Text style={[styles.metricVal, styles.monoText, { color: colors.primaryNavy }]}>
            {formatCurrency(totalMonthlyPayroll)}
          </Text>
          <Text style={styles.metricSub}>{activeEmployeesCount} Active staff members</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Salaries Already Paid</Text>
          <Text style={[styles.metricVal, styles.monoText, { color: colors.creditText }]}>
            {formatCurrency(salariesPaidThisMonth)}
          </Text>
          <Text style={styles.metricSub}>Recorded & reconciled</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Pending Salaries (This Month)</Text>
          <Text style={[styles.metricVal, styles.monoText, { color: salariesPendingThisMonth > 0 ? colors.pendingText : colors.textMuted }]}>
            {formatCurrency(salariesPendingThisMonth)}
          </Text>
          <Text style={styles.metricSub}>Due before month-end</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Bank Statement Sync</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
            <Sparkles size={13} color={colors.creditText} />
            <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textPrimary }}>Auto-Match Enabled</Text>
          </View>
          <Text style={styles.metricSub}>Matches RazorpayX & bank payouts</Text>
        </View>
      </View>

      {/* MONTH-BY-MONTH SALARY TRACKER GRID */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Month-by-Month Salary Tracker ({selectedYear})</Text>
            <Text style={styles.sectionSubtitle}>
              Click any cell to toggle payment status: Paid (✓), Pending (⏳), Unpaid (✗)
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <TouchableOpacity
              style={styles.yearBtn}
              onPress={() => setSelectedYear(selectedYear - 1)}
            >
              <Text style={styles.yearBtnText}>← {selectedYear - 1}</Text>
            </TouchableOpacity>
            <Text style={[styles.yearDisplay, styles.monoText]}>{selectedYear}</Text>
            <TouchableOpacity
              style={styles.yearBtn}
              onPress={() => setSelectedYear(selectedYear + 1)}
            >
              <Text style={styles.yearBtnText}>{selectedYear + 1} →</Text>
            </TouchableOpacity>
          </View>
        </View>

        {employees.length === 0 ? (
          <View style={styles.emptyTracker}>
            <Users size={32} color={colors.textMuted} />
            <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textPrimary }}>
              No Employees Configured
            </Text>
            <Text style={{ fontSize: 11, color: colors.textMuted, textAlign: 'center' }}>
              Add staff members in the Employees module to start tracking monthly salary disbursements.
            </Text>
            <TouchableOpacity
              style={[styles.primaryBtn, { marginTop: 6 }]}
              onPress={() => setActiveModule('employees')}
            >
              <Text style={styles.primaryBtnText}>Go to Employees Module</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView horizontal style={{ width: '100%' }}>
            <View style={styles.gridTable}>
              {/* Header Row */}
              <View style={[styles.gridRow, styles.gridHeaderRow]}>
                <Text style={[styles.gridCell, styles.employeeColHeader]}>Employee</Text>
                <Text style={[styles.gridCell, styles.salaryColHeader]}>Monthly Pay (₹)</Text>
                {MONTH_NAMES.map((m, idx) => (
                  <Text key={m} style={[styles.gridCell, styles.monthColHeader]}>
                    {m}
                  </Text>
                ))}
              </View>

              {/* Employee Rows */}
              {filteredEmployees.map(emp => {
                const netPay = (emp.monthlySalary || 0) + (emp.allowances || 0) - (emp.deductions || 0);

                return (
                  <View key={emp.id} style={styles.gridRow}>
                    <View style={[styles.gridCell, styles.employeeCol]}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textPrimary }} numberOfLines={1}>
                        {emp.fullName}
                      </Text>
                      <Text style={{ fontSize: 9.5, color: colors.textMuted }}>
                        {emp.employeeId} • {emp.position}
                      </Text>
                    </View>

                    <Text style={[styles.gridCell, styles.salaryCol, styles.monoText]}>
                      {formatCurrency(netPay)}
                    </Text>

                    {/* 12 Months Status Cells */}
                    {monthsList.map((fMonth, mIdx) => {
                      const slip = emp.salaryHistory.find(s => s.fiscalMonth === fMonth);
                      const status: PayrollStatus = slip ? slip.paymentStatus : 'Unpaid';

                      return (
                        <TouchableOpacity
                          key={fMonth}
                          style={[
                            styles.gridCell,
                            styles.monthCell,
                            status === 'Paid' && styles.cellPaid,
                            status === 'Pending' && styles.cellPending,
                            status === 'Unpaid' && styles.cellUnpaid,
                          ]}
                          onPress={() => {
                            // Cycle status: Unpaid -> Pending -> Paid -> Unpaid
                            const nextStatus: PayrollStatus =
                              status === 'Unpaid' ? 'Pending' : status === 'Pending' ? 'Paid' : 'Unpaid';
                            updateSalaryStatus(emp.id, fMonth, nextStatus);
                          }}
                          accessibilityLabel={`Toggle ${emp.fullName} ${MONTH_NAMES[mIdx]} salary status`}
                        >
                          {status === 'Paid' && <Check size={11} color={colors.creditText} />}
                          {status === 'Pending' && <Clock size={11} color={colors.pendingText} />}
                          {status === 'Unpaid' && <X size={11} color={colors.debitText} />}
                          <Text
                            style={[
                              styles.cellStatusText,
                              status === 'Paid' && { color: colors.creditText },
                              status === 'Pending' && { color: colors.pendingText },
                              status === 'Unpaid' && { color: colors.debitText },
                            ]}
                          >
                            {status}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                );
              })}
            </View>
          </ScrollView>
        )}
      </View>

      {/* SALARY CONFIGURATION & BREAKDOWN TABLE */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Salary Configuration & Allowances</Text>
            <Text style={styles.sectionSubtitle}>
              Detailed breakdown of Base Pay, Allowances, Bonuses, and Statutory Deductions.
            </Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={true} style={{ width: '100%' }}>
          <View style={[styles.table, { minWidth: 720 }]}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.cell, { flex: 1.2, fontWeight: '700' }]}>Employee ID</Text>
              <Text style={[styles.cell, { flex: 2.5, fontWeight: '700' }]}>Full Name & Department</Text>
              <Text style={[styles.cell, { flex: 1.4, textAlign: 'right', fontWeight: '700' }]}>Base Pay (₹)</Text>
              <Text style={[styles.cell, { flex: 1.4, textAlign: 'right', fontWeight: '700' }]}>Allowances (₹)</Text>
              <Text style={[styles.cell, { flex: 1.4, textAlign: 'right', fontWeight: '700' }]}>Deductions (₹)</Text>
              <Text style={[styles.cell, { flex: 1.6, textAlign: 'right', fontWeight: '700' }]}>Net Salary (₹)</Text>
              <Text style={[styles.cell, { flex: 1.4, textAlign: 'center', fontWeight: '700' }]}>Action</Text>
            </View>

            {employees.length === 0 ? (
              <View style={{ padding: 24, alignItems: 'center' }}>
                <Text style={{ fontSize: 11, color: colors.textMuted }}>No employee salary records.</Text>
              </View>
            ) : (
              employees.map(emp => {
                const base = emp.monthlySalary || 0;
                const allow = emp.allowances || 0;
                const deduct = emp.deductions || 0;
                const net = base + allow - deduct;

                return (
                  <View key={emp.id} style={styles.tableRow}>
                    <Text style={[styles.cell, styles.monoText, { flex: 1.2, fontWeight: '700' }]}>
                      {emp.employeeId}
                    </Text>
                    <View style={{ flex: 2.5 }}>
                      <Text style={[styles.cell, { fontWeight: '700' }]}>{emp.fullName}</Text>
                      <Text style={{ fontSize: 9.5, color: colors.textMuted }}>{emp.department} • {emp.position}</Text>
                    </View>
                    <Text style={[styles.cell, styles.monoText, { flex: 1.4, textAlign: 'right' }]}>
                      {formatCurrency(base)}
                    </Text>
                    <Text style={[styles.cell, styles.monoText, { flex: 1.4, textAlign: 'right', color: colors.creditText }]}>
                      +{formatCurrency(allow)}
                    </Text>
                    <Text style={[styles.cell, styles.monoText, { flex: 1.4, textAlign: 'right', color: colors.debitText }]}>
                      -{formatCurrency(deduct)}
                    </Text>
                    <Text style={[styles.cell, styles.monoText, { flex: 1.6, textAlign: 'right', fontWeight: '700', color: colors.primaryNavy }]}>
                      {formatCurrency(net)}
                    </Text>
                    <View style={{ flex: 1.4, alignItems: 'center' }}>
                      <TouchableOpacity
                        style={styles.paySmallBtn}
                        onPress={() => {
                          setPayFormData({
                            employeeId: emp.id,
                            fiscalMonth: selectedMonth,
                            paymentDate: new Date().toISOString().split('T')[0],
                            paymentMethod: 'NEFT / RTGS Corporate NetBanking',
                            referenceNumber: `SAL-${selectedMonth}-${emp.employeeId}`,
                            notes: `Salary disbursement for ${emp.fullName}`,
                          });
                          setIsPayModalOpen(true);
                        }}
                      >
                        <Text style={styles.paySmallBtnText}>Disburse Pay</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      </View>

      {/* MODAL: SALARY PAYMENT WORKFLOW */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        title="Disburse Employee Salary"
        subtitle="Record official salary payout, update employee slip, and generate OpEx expense"
        size="md"
        footer={
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 6, width: '100%' }}>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => setIsPayModalOpen(false)}
            >
              <Text style={styles.secondaryBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleDisbursePayment}
            >
              <Text style={styles.primaryBtnText}>Confirm Payout & Record Expense</Text>
            </TouchableOpacity>
          </View>
        }
      >
        <View style={{ gap: 10 }}>
          <View style={styles.formCol}>
            <SelectPicker
              label="Select Employee"
              value={payFormData.employeeId}
              options={employees.map(e => ({
                label: `${e.fullName} (${e.employeeId}) - ₹${e.monthlySalary.toLocaleString('en-IN')}`,
                value: e.id,
              }))}
              onChange={(v: any) => setPayFormData(p => ({ ...p, employeeId: v }))}
              required
            />
          </View>

          {selectedEmployeeObj && (
            <View style={styles.payoutSummaryBox}>
              <View style={styles.payoutRow}>
                <Text style={styles.payoutLabel}>Base Monthly Salary:</Text>
                <Text style={[styles.payoutVal, styles.monoText]}>{formatCurrency(selectedEmployeeObj.monthlySalary)}</Text>
              </View>
              <View style={styles.payoutRow}>
                <Text style={styles.payoutLabel}>Allowances / Reimbursements:</Text>
                <Text style={[styles.payoutVal, styles.monoText, { color: colors.creditText }]}>
                  +{formatCurrency(selectedEmployeeObj.allowances || 0)}
                </Text>
              </View>
              <View style={styles.payoutRow}>
                <Text style={styles.payoutLabel}>Statutory Deductions (TDS/PF):</Text>
                <Text style={[styles.payoutVal, styles.monoText, { color: colors.debitText }]}>
                  -{formatCurrency(selectedEmployeeObj.deductions || 0)}
                </Text>
              </View>
              <View style={[styles.payoutRow, { borderTopWidth: 1, borderTopColor: colors.borderDefault, paddingTop: 6 }]}>
                <Text style={[styles.payoutLabel, { fontWeight: '800' }]}>Total Net Payout (₹ INR):</Text>
                <Text style={[styles.payoutVal, styles.monoText, { fontWeight: '800', fontSize: 13, color: colors.primaryNavy }]}>
                  {formatCurrency(netSalaryForPayment)}
                </Text>
              </View>
            </View>
          )}

          <View style={styles.formRow}>
            <View style={styles.formCol}>
              <Text style={styles.formLabel}>Fiscal Month (YYYY-MM) *</Text>
              <TextInput
                style={[styles.input, styles.monoText]}
                value={payFormData.fiscalMonth}
                onChangeText={v => setPayFormData(p => ({ ...p, fiscalMonth: v }))}
                placeholder="2026-08"
              />
            </View>
            <View style={styles.formCol}>
              <Text style={styles.formLabel}>Payment Date *</Text>
              <TextInput
                style={[styles.input, styles.monoText]}
                value={payFormData.paymentDate}
                onChangeText={v => setPayFormData(p => ({ ...p, paymentDate: v }))}
                placeholder="YYYY-MM-DD"
              />
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={styles.formCol}>
              <Text style={styles.formLabel}>Payment Method</Text>
              <TextInput
                style={styles.input}
                value={payFormData.paymentMethod}
                onChangeText={v => setPayFormData(p => ({ ...p, paymentMethod: v }))}
                placeholder="NEFT / RTGS / RazorpayX"
              />
            </View>
            <View style={styles.formCol}>
              <Text style={styles.formLabel}>Reference / UTR Number</Text>
              <TextInput
                style={[styles.input, styles.monoText]}
                value={payFormData.referenceNumber}
                onChangeText={v => setPayFormData(p => ({ ...p, referenceNumber: v }))}
                placeholder="e.g. UTR-9908129"
              />
            </View>
          </View>

          <View style={styles.formCol}>
            <Text style={styles.formLabel}>Payment Notes / Remarks</Text>
            <TextInput
              style={styles.input}
              value={payFormData.notes}
              onChangeText={v => setPayFormData(p => ({ ...p, notes: v }))}
              placeholder="e.g. Regular monthly payroll transfer via ICICI Corporate Banking"
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create<any>({
  container: {
    flex: 1,
    backgroundColor: colors.bgApp,
  },
  titleRibbon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
    flexWrap: 'wrap',
    gap: 8,
  },
  pageTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  pageSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryNavy,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 3,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 11.5,
    fontWeight: '700',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: 3,
  },
  secondaryBtnText: {
    color: colors.textPrimary,
    fontSize: 11.5,
    fontWeight: '600',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  metricCard: {
    flex: 1,
    minWidth: 180,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: 4,
    padding: 12,
    gap: 2,
  },
  metricLabel: {
    fontSize: 10,
    color: colors.textMuted,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  metricVal: {
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  metricSub: {
    fontSize: 9.5,
    color: colors.textMuted,
  },
  monoText: {
    fontFamily: 'Roboto Mono, monospace',
    fontVariant: ['tabular-nums'],
  },
  sectionCard: {
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: 4,
    padding: 12,
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 10.5,
    color: colors.textMuted,
  },
  yearBtn: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    backgroundColor: colors.bgSurfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: 2,
  },
  yearBtnText: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  yearDisplay: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primaryNavy,
  },
  emptyTracker: {
    padding: 28,
    alignItems: 'center',
    gap: 6,
  },
  gridTable: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 3,
    backgroundColor: colors.bgSurface,
  },
  gridRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  gridHeaderRow: {
    backgroundColor: colors.bgSurfaceAlt,
    borderBottomColor: colors.borderDefault,
  },
  gridCell: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  employeeColHeader: {
    width: 180,
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  salaryColHeader: {
    width: 120,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'right',
    color: colors.textPrimary,
  },
  monthColHeader: {
    width: 60,
    fontSize: 10.5,
    fontWeight: '700',
    textAlign: 'center',
    color: colors.textSecondary,
  },
  employeeCol: {
    width: 180,
  },
  salaryCol: {
    width: 120,
    fontSize: 11,
    textAlign: 'right',
    fontWeight: '700',
    color: colors.textPrimary,
  },
  monthCell: {
    width: 60,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: colors.borderSubtle,
    gap: 2,
  },
  cellPaid: {
    backgroundColor: colors.creditBg,
  },
  cellPending: {
    backgroundColor: '#fffbeb',
  },
  cellUnpaid: {
    backgroundColor: '#fef2f2',
  },
  cellStatusText: {
    fontSize: 8.5,
    fontWeight: '800',
  },
  table: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 3,
    backgroundColor: colors.bgSurface,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  tableHeader: {
    backgroundColor: colors.bgSurfaceAlt,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderDefault,
  },
  cell: {
    fontSize: 11,
    color: colors.textPrimary,
  },
  paySmallBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: colors.primaryNavy,
    borderRadius: 2,
  },
  paySmallBtnText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  payoutSummaryBox: {
    backgroundColor: colors.bgSurfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: 3,
    padding: 8,
    gap: 4,
  },
  payoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  payoutLabel: {
    fontSize: 10.5,
    color: colors.textMuted,
  },
  payoutVal: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  formRow: {
    flexDirection: 'row',
    gap: 10,
  },
  formCol: {
    flex: 1,
    gap: 3,
  },
  formLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: colors.bgSurfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: 3,
    paddingHorizontal: 8,
    paddingVertical: 5,
    fontSize: 11.5,
    color: colors.textPrimary,
    outlineStyle: 'none' as any,
  },
});
