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
  Users,
  Plus,
  Trash2,
  Edit3,
  Search,
  UserCheck,
  Building,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  Eye,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { useFinance } from '../../../context/FinanceContext';
import { SelectPicker } from '../../common/SelectPicker';
import { Modal } from '../../common/Modal';
import { formatCurrency } from '../../../utils/currency';
import { formatDate } from '../../../utils/date';
import {
  Employee,
  Department,
  EmploymentType,
  EmployeeStatus,
} from '../../../types/finance';
import { colors } from '../../../theme/colors';

const DEPARTMENTS: Department[] = [
  'Engineering',
  'Operations',
  'Sales & Marketing',
  'Design & Product',
  'Facilities & IT',
  'Executive',
];

const EMPLOYMENT_TYPES: EmploymentType[] = ['Full-time', 'Part-time', 'Contract'];
const EMPLOYEE_STATUSES: EmployeeStatus[] = ['Active', 'Inactive'];

export const EmployeeManagementView: React.FC = () => {
  const { employees, addEmployee, updateEmployee, deleteEmployee, setActiveModule } = useFinance();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');

  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    employeeId: string;
    fullName: string;
    email: string;
    phone: string;
    department: Department;
    position: string;
    employmentType: EmploymentType;
    joiningDate: string;
    monthlySalary: string;
    allowances: string;
    deductions: string;
    status: EmployeeStatus;
  }>({
    employeeId: `EMP-${String(employees.length + 101).padStart(3, '0')}`,
    fullName: '',
    email: '',
    phone: '',
    department: 'Engineering',
    position: '',
    employmentType: 'Full-time',
    joiningDate: new Date().toISOString().split('T')[0],
    monthlySalary: '',
    allowances: '0',
    deductions: '0',
    status: 'Active',
  });

  const handleSave = () => {
    if (!formData.fullName.trim()) {
      alert('Please enter employee full name.');
      return;
    }
    const salaryNum = parseFloat(formData.monthlySalary);
    if (isNaN(salaryNum) || salaryNum <= 0) {
      alert('Please enter a valid monthly salary in INR (₹).');
      return;
    }

    const allowNum = parseFloat(formData.allowances) || 0;
    const deductNum = parseFloat(formData.deductions) || 0;

    if (editingEmployee) {
      updateEmployee(editingEmployee.id, {
        employeeId: formData.employeeId,
        fullName: formData.fullName,
        email: formData.email || `${formData.fullName.toLowerCase().replace(/\s+/g, '.')}@agency.internal`,
        phone: formData.phone,
        department: formData.department,
        position: formData.position || 'Staff Engineer',
        employmentType: formData.employmentType,
        joiningDate: formData.joiningDate,
        monthlySalary: salaryNum,
        allowances: allowNum,
        deductions: deductNum,
        status: formData.status,
      });
      setEditingEmployee(null);
    } else {
      addEmployee({
        employeeId: formData.employeeId,
        fullName: formData.fullName,
        email: formData.email || `${formData.fullName.toLowerCase().replace(/\s+/g, '.')}@agency.internal`,
        phone: formData.phone,
        department: formData.department,
        position: formData.position || 'Staff Engineer',
        employmentType: formData.employmentType,
        joiningDate: formData.joiningDate,
        monthlySalary: salaryNum,
        allowances: allowNum,
        deductions: deductNum,
        status: formData.status,
      });
      setIsAddModalOpen(false);
    }

    setFormData({
      employeeId: `EMP-${String(employees.length + 102).padStart(3, '0')}`,
      fullName: '',
      email: '',
      phone: '',
      department: 'Engineering',
      position: '',
      employmentType: 'Full-time',
      joiningDate: new Date().toISOString().split('T')[0],
      monthlySalary: '',
      allowances: '0',
      deductions: '0',
      status: 'Active',
    });
  };

  const openEditModal = (emp: Employee) => {
    setEditingEmployee(emp);
    setFormData({
      employeeId: emp.employeeId,
      fullName: emp.fullName,
      email: emp.email,
      phone: emp.phone,
      department: emp.department,
      position: emp.position,
      employmentType: emp.employmentType,
      joiningDate: emp.joiningDate,
      monthlySalary: emp.monthlySalary.toString(),
      allowances: (emp.allowances || 0).toString(),
      deductions: (emp.deductions || 0).toString(),
      status: emp.status,
    });
  };

  // Filter Employees
  const filteredEmployees = employees.filter(emp => {
    if (selectedDeptFilter !== 'All' && emp.department !== selectedDeptFilter) return false;
    if (selectedStatusFilter !== 'All' && emp.status !== selectedStatusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        emp.fullName.toLowerCase().includes(q) ||
        emp.employeeId.toLowerCase().includes(q) ||
        emp.email.toLowerCase().includes(q) ||
        emp.position.toLowerCase().includes(q) ||
        emp.department.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const activeCount = employees.filter(e => e.status === 'Active').length;
  const totalBasePay = employees
    .filter(e => e.status === 'Active')
    .reduce((sum, e) => sum + e.monthlySalary, 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, gap: 14 }}>
      {/* Title Ribbon */}
      <View style={styles.titleRibbon}>
        <View>
          <Text style={styles.pageTitle}>Employee Management</Text>
          <Text style={styles.pageSubtitle}>
            Company staff directory, employment positions, monthly salaries, and salary records.
          </Text>
        </View>

        <View style={styles.actionGroup}>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => setActiveModule('payroll')}
          >
            <CreditCard size={13} color={colors.primaryNavy} />
            <Text style={styles.secondaryBtnText}>View Payroll</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => {
              setEditingEmployee(null);
              setFormData({
                employeeId: `EMP-${String(employees.length + 101).padStart(3, '0')}`,
                fullName: '',
                email: '',
                phone: '',
                department: 'Engineering',
                position: '',
                employmentType: 'Full-time',
                joiningDate: new Date().toISOString().split('T')[0],
                monthlySalary: '',
                allowances: '0',
                deductions: '0',
                status: 'Active',
              });
              setIsAddModalOpen(true);
            }}
          >
            <Plus size={13} color="#fff" />
            <Text style={styles.primaryBtnText}>+ Add Employee</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Summary Metrics */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View>
            <Text style={styles.statLabel}>Total Headcount</Text>
            <Text style={[styles.statVal, styles.monoText]}>{employees.length}</Text>
          </View>
          <View>
            <Text style={styles.statLabel}>Active Staff</Text>
            <Text style={[styles.statVal, styles.monoText, { color: colors.creditText }]}>
              {activeCount} Active
            </Text>
          </View>
          <View>
            <Text style={styles.statLabel}>Monthly Salary Obligation</Text>
            <Text style={[styles.statVal, styles.monoText, { color: colors.primaryNavy }]}>
              {formatCurrency(totalBasePay)}
            </Text>
          </View>
        </View>
      </View>

      {/* Filter & Search Bar */}
      <View style={styles.filterRow}>
        <View style={styles.searchBox}>
          <Search size={13} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search employee name, ID, position, or email..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <SelectPicker
          label="Department"
          value={selectedDeptFilter}
          options={['All', ...DEPARTMENTS]}
          onChange={setSelectedDeptFilter}
          style={{ minWidth: 150 }}
        />

        <SelectPicker
          label="Status"
          value={selectedStatusFilter}
          options={['All', ...EMPLOYEE_STATUSES]}
          onChange={setSelectedStatusFilter}
          style={{ minWidth: 120 }}
        />
      </View>

      {/* Employees Table */}
      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.cell, { flex: 1.1, fontWeight: '700' }]}>Emp ID</Text>
          <Text style={[styles.cell, { flex: 2.8, fontWeight: '700' }]}>Full Name & Email</Text>
          <Text style={[styles.cell, { flex: 1.8, fontWeight: '700' }]}>Department & Role</Text>
          <Text style={[styles.cell, { flex: 1.3, fontWeight: '700' }]}>Type</Text>
          <Text style={[styles.cell, { flex: 1.1, fontWeight: '700' }]}>Joined</Text>
          <Text style={[styles.cell, { flex: 1.6, textAlign: 'right', fontWeight: '700' }]}>Monthly Salary (₹)</Text>
          <Text style={[styles.cell, { flex: 1.0, textAlign: 'center', fontWeight: '700' }]}>Status</Text>
          <Text style={[styles.cell, { flex: 1.4, textAlign: 'center', fontWeight: '700' }]}>Actions</Text>
        </View>

        {filteredEmployees.length === 0 ? (
          <View style={styles.emptyTable}>
            <Users size={28} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No Employees Registered</Text>
            <Text style={styles.emptySub}>
              Click "+ Add Employee" above to record company team members and salary packages.
            </Text>
          </View>
        ) : (
          filteredEmployees.map(emp => (
            <View key={emp.id} style={styles.tableRow}>
              <Text style={[styles.cell, styles.monoText, { flex: 1.1, fontWeight: '700' }]}>
                {emp.employeeId}
              </Text>

              <View style={{ flex: 2.8 }}>
                <Text style={[styles.cell, { fontWeight: '700' }]}>{emp.fullName}</Text>
                <Text style={{ fontSize: 9.5, color: colors.textMuted }}>{emp.email}</Text>
              </View>

              <View style={{ flex: 1.8 }}>
                <Text style={[styles.cell, { fontWeight: '600' }]}>{emp.position}</Text>
                <Text style={{ fontSize: 9.5, color: colors.textSecondary }}>{emp.department}</Text>
              </View>

              <Text style={[styles.cell, { flex: 1.3, color: colors.textSecondary }]}>{emp.employmentType}</Text>
              <Text style={[styles.cell, styles.monoText, { flex: 1.1 }]}>{formatDate(emp.joiningDate)}</Text>

              <Text style={[styles.cell, styles.monoText, { flex: 1.6, textAlign: 'right', fontWeight: '700', color: colors.primaryNavy }]}>
                {formatCurrency(emp.monthlySalary)}
              </Text>

              <View style={{ flex: 1.0, alignItems: 'center' }}>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: emp.status === 'Active' ? colors.creditBg : colors.bgSurfaceAlt },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      { color: emp.status === 'Active' ? colors.creditText : colors.textMuted },
                    ]}
                  >
                    {emp.status}
                  </Text>
                </View>
              </View>

              <View style={{ flex: 1.4, flexDirection: 'row', justifyContent: 'center', gap: 4 }}>
                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={() => setViewingEmployee(emp)}
                  accessibilityLabel="View details and salary history"
                >
                  <Eye size={11} color={colors.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={() => openEditModal(emp)}
                  accessibilityLabel="Edit employee"
                >
                  <Edit3 size={11} color={colors.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.iconBtn, { backgroundColor: colors.debitBg }]}
                  onPress={() => {
                    if (confirm(`Remove ${emp.fullName} (${emp.employeeId}) from employee directory?`)) {
                      deleteEmployee(emp.id);
                    }
                  }}
                  accessibilityLabel="Delete employee"
                >
                  <Trash2 size={11} color={colors.debitText} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>

      {/* MODAL: ADD / EDIT EMPLOYEE */}
      <Modal
        isOpen={isAddModalOpen || !!editingEmployee}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingEmployee(null);
        }}
        title={editingEmployee ? `Edit Employee: ${editingEmployee.fullName}` : 'Register New Employee'}
        subtitle="Record employee profile, job details, and monthly salary configuration"
        size="md"
        footer={
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 6, width: '100%' }}>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => {
                setIsAddModalOpen(false);
                setEditingEmployee(null);
              }}
            >
              <Text style={styles.secondaryBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleSave}
            >
              <Text style={styles.primaryBtnText}>Save Employee</Text>
            </TouchableOpacity>
          </View>
        }
      >
        <View style={{ gap: 10 }}>
          <View style={styles.formRow}>
            <View style={styles.formCol}>
              <Text style={styles.formLabel}>Employee ID *</Text>
              <TextInput
                style={[styles.input, styles.monoText]}
                value={formData.employeeId}
                onChangeText={v => setFormData(p => ({ ...p, employeeId: v }))}
              />
            </View>
            <View style={styles.formCol}>
              <Text style={styles.formLabel}>Full Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.fullName}
                onChangeText={v => setFormData(p => ({ ...p, fullName: v }))}
                placeholder="e.g. Rahul Sharma"
              />
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={styles.formCol}>
              <Text style={styles.formLabel}>Email Address</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={v => setFormData(p => ({ ...p, email: v }))}
                placeholder="rahul@agency.internal"
                keyboardType="email-address"
              />
            </View>
            <View style={styles.formCol}>
              <Text style={styles.formLabel}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={v => setFormData(p => ({ ...p, phone: v }))}
                placeholder="+91 98765 43210"
              />
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={styles.formCol}>
              <SelectPicker
                label="Department"
                value={formData.department}
                options={DEPARTMENTS}
                onChange={(v: any) => setFormData(p => ({ ...p, department: v }))}
                required
              />
            </View>
            <View style={styles.formCol}>
              <Text style={styles.formLabel}>Job Position / Role *</Text>
              <TextInput
                style={styles.input}
                value={formData.position}
                onChangeText={v => setFormData(p => ({ ...p, position: v }))}
                placeholder="e.g. Lead Backend Engineer"
              />
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={styles.formCol}>
              <SelectPicker
                label="Employment Type"
                value={formData.employmentType}
                options={EMPLOYMENT_TYPES}
                onChange={(v: any) => setFormData(p => ({ ...p, employmentType: v }))}
                required
              />
            </View>
            <View style={styles.formCol}>
              <SelectPicker
                label="Status"
                value={formData.status}
                options={EMPLOYEE_STATUSES}
                onChange={(v: any) => setFormData(p => ({ ...p, status: v }))}
                required
              />
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={styles.formCol}>
              <Text style={styles.formLabel}>Joining Date *</Text>
              <TextInput
                style={[styles.input, styles.monoText]}
                value={formData.joiningDate}
                onChangeText={v => setFormData(p => ({ ...p, joiningDate: v }))}
                placeholder="YYYY-MM-DD"
              />
            </View>
            <View style={styles.formCol}>
              <Text style={styles.formLabel}>Base Monthly Salary (₹ INR) *</Text>
              <TextInput
                style={[styles.input, styles.monoText, { fontWeight: '700' }]}
                value={formData.monthlySalary}
                onChangeText={v => setFormData(p => ({ ...p, monthlySalary: v }))}
                placeholder="e.g. 85000.00"
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL: VIEW EMPLOYEE PROFILE & SALARY HISTORY */}
      <Modal
        isOpen={!!viewingEmployee}
        onClose={() => setViewingEmployee(null)}
        title={viewingEmployee ? `${viewingEmployee.fullName} (${viewingEmployee.employeeId})` : 'Employee Details'}
        subtitle="Employee Profile & Complete Salary History Ledger"
        size="md"
        footer={
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => setViewingEmployee(null)}
          >
            <Text style={styles.secondaryBtnText}>Close</Text>
          </TouchableOpacity>
        }
      >
        {viewingEmployee && (
          <View style={{ gap: 12 }}>
            <View style={styles.profileMetaBox}>
              <View style={styles.metaCol}>
                <Text style={styles.metaLabel}>Role:</Text>
                <Text style={styles.metaVal}>{viewingEmployee.position}</Text>
              </View>
              <View style={styles.metaCol}>
                <Text style={styles.metaLabel}>Department:</Text>
                <Text style={styles.metaVal}>{viewingEmployee.department}</Text>
              </View>
              <View style={styles.metaCol}>
                <Text style={styles.metaLabel}>Monthly Base Salary:</Text>
                <Text style={[styles.metaVal, styles.monoText, { fontWeight: '700', color: colors.primaryNavy }]}>
                  {formatCurrency(viewingEmployee.monthlySalary)}
                </Text>
              </View>
              <View style={styles.metaCol}>
                <Text style={styles.metaLabel}>Joining Date:</Text>
                <Text style={[styles.metaVal, styles.monoText]}>{formatDate(viewingEmployee.joiningDate)}</Text>
              </View>
            </View>

            {/* Salary History Table */}
            <View style={{ gap: 6 }}>
              <Text style={{ fontSize: 12, fontWeight: '800', color: colors.textPrimary }}>
                Salary Payment History
              </Text>

              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={[styles.cell, { flex: 1.2, fontWeight: '700' }]}>Fiscal Month</Text>
                  <Text style={[styles.cell, { flex: 1.5, textAlign: 'right', fontWeight: '700' }]}>Net Salary (₹)</Text>
                  <Text style={[styles.cell, { flex: 1.2, textAlign: 'center', fontWeight: '700' }]}>Status</Text>
                  <Text style={[styles.cell, { flex: 1.4, fontWeight: '700' }]}>Paid Date</Text>
                  <Text style={[styles.cell, { flex: 1.8, fontWeight: '700' }]}>Reference #</Text>
                </View>

                {viewingEmployee.salaryHistory.length === 0 ? (
                  <View style={{ padding: 16, alignItems: 'center' }}>
                    <Text style={{ fontSize: 11, color: colors.textMuted }}>
                      No salary disbursements recorded yet. Go to Payroll to disburse monthly salary.
                    </Text>
                  </View>
                ) : (
                  viewingEmployee.salaryHistory.map(slip => (
                    <View key={slip.id} style={styles.tableRow}>
                      <Text style={[styles.cell, styles.monoText, { flex: 1.2, fontWeight: '700' }]}>
                        {slip.fiscalMonth}
                      </Text>
                      <Text style={[styles.cell, styles.monoText, { flex: 1.5, textAlign: 'right', fontWeight: '700', color: colors.primaryNavy }]}>
                        {formatCurrency(slip.netSalary)}
                      </Text>
                      <View style={{ flex: 1.2, alignItems: 'center' }}>
                        <Text style={{ fontSize: 10, fontWeight: '700', color: slip.paymentStatus === 'Paid' ? colors.creditText : colors.pendingText }}>
                          {slip.paymentStatus}
                        </Text>
                      </View>
                      <Text style={[styles.cell, styles.monoText, { flex: 1.4 }]}>
                        {slip.paymentDate ? formatDate(slip.paymentDate) : '—'}
                      </Text>
                      <Text style={[styles.cell, styles.monoText, { flex: 1.8, fontSize: 9.5, color: colors.textMuted }]}>
                        {slip.referenceNumber || '—'}
                      </Text>
                    </View>
                  ))
                )}
              </View>
            </View>
          </View>
        )}
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
  summaryCard: {
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: 4,
    padding: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statLabel: {
    fontSize: 10.5,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  statVal: {
    fontSize: 13.5,
    fontWeight: '800',
    marginTop: 2,
  },
  monoText: {
    fontFamily: 'Roboto Mono, monospace',
    fontVariant: ['tabular-nums'],
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    flexWrap: 'wrap',
  },
  searchBox: {
    flex: 1,
    minWidth: 220,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: 3,
    paddingHorizontal: 8,
    height: 30,
  },
  searchInput: {
    flex: 1,
    fontSize: 11,
    color: colors.textPrimary,
    marginLeft: 6,
    outlineStyle: 'none' as any,
  },
  table: {
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: 3,
    backgroundColor: colors.bgSurface,
    overflow: 'hidden',
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
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 2,
  },
  statusBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
  },
  iconBtn: {
    padding: 4,
    borderRadius: 2,
    backgroundColor: colors.bgSurfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  emptyTable: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  emptySub: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
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
  profileMetaBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    backgroundColor: colors.bgSurfaceAlt,
    padding: 10,
    borderRadius: 3,
  },
  metaCol: {
    minWidth: 140,
    gap: 2,
  },
  metaLabel: {
    fontSize: 10,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  metaVal: {
    fontSize: 11.5,
    color: colors.textPrimary,
    fontWeight: '600',
  },
});
