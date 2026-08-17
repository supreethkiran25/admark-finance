import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  Filter,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Calendar,
  ExternalLink,
  Edit3,
} from 'lucide-react';
import { useFinance } from '../../../context/FinanceContext';
import { Vendor, ExpenseCategory, Department } from '../../../types/finance';
import { Badge } from '../../common/Badge';
import { Modal } from '../../common/Modal';
import { formatCurrency } from '../../../utils/currency';
import { formatDate } from '../../../utils/date';

export const VendorModule: React.FC = () => {
  const { vendors, addVendor, updateVendor, recordVendorPayment, isCompactMode } = useFinance();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedCat, setSelectedCat] = useState('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [payingVendor, setPayingVendor] = useState<Vendor | null>(null);
  const [paymentAmountInput, setPaymentAmountInput] = useState('');

  // Form State
  const initialForm = {
    name: '',
    category: 'Software subscriptions' as ExpenseCategory,
    department: 'Engineering' as Department,
    contactEmail: '',
    paymentTerms: 'Net 30' as Vendor['paymentTerms'],
    outstandingBalance: '0.00',
    contractRenewalDate: '2027-01-01',
    taxId: 'XX-XXX0000',
    w9OnFile: true,
    status: 'Active' as Vendor['status'],
    paymentMethod: 'ACH Wire Transfer',
  };
  const [formData, setFormData] = useState(initialForm);

  const departments: Department[] = [
    'Engineering',
    'Sales & Marketing',
    'Operations',
    'Executive',
    'Design & Product',
    'Facilities & IT',
  ];

  const categories: ExpenseCategory[] = [
    'Salaries',
    'Office expenses',
    'Software subscriptions',
    'Cloud services',
    'Travel',
    'Food',
    'Marketing',
    'Equipment',
    'Utilities',
    'Miscellaneous',
  ];

  const termsOptions = ['Net 15', 'Net 30', 'Net 60', 'Monthly Auto-Debit', 'Due on Receipt'] as const;

  const filteredVendors = vendors.filter(v => {
    if (selectedDept !== 'ALL' && v.department !== selectedDept) return false;
    if (selectedCat !== 'ALL' && v.category !== selectedCat) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        v.name.toLowerCase().includes(q) ||
        v.contactEmail.toLowerCase().includes(q) ||
        v.taxId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalOutstanding = vendors.reduce((s, v) => s + v.outstandingBalance, 0);
  const totalYtdSpend = vendors.reduce((s, v) => s + v.totalYtdSpend, 0);

  const openPayModal = (v: Vendor) => {
    setPayingVendor(v);
    setPaymentAmountInput(v.outstandingBalance.toString());
  };

  const handleExecutePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingVendor) return;
    const parsed = parseFloat(paymentAmountInput);
    if (isNaN(parsed) || parsed <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }

    recordVendorPayment(payingVendor.id, parsed);
    setPayingVendor(null);
  };

  const handleSaveVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please provide a vendor name.');
      return;
    }

    const parsedBalance = parseFloat(formData.outstandingBalance) || 0;

    if (editingVendor) {
      updateVendor(editingVendor.id, {
        name: formData.name,
        category: formData.category,
        department: formData.department,
        contactEmail: formData.contactEmail,
        paymentTerms: formData.paymentTerms,
        outstandingBalance: parsedBalance,
        contractRenewalDate: formData.contractRenewalDate,
        taxId: formData.taxId,
        w9OnFile: formData.w9OnFile,
        status: formData.status,
        paymentMethod: formData.paymentMethod,
      });
      setEditingVendor(null);
    } else {
      addVendor({
        name: formData.name,
        category: formData.category,
        department: formData.department,
        contactEmail: formData.contactEmail,
        paymentTerms: formData.paymentTerms,
        outstandingBalance: parsedBalance,
        contractRenewalDate: formData.contractRenewalDate,
        taxId: formData.taxId,
        w9OnFile: formData.w9OnFile,
        status: formData.status,
        paymentMethod: formData.paymentMethod,
      });
      setIsAddModalOpen(false);
    }

    setFormData(initialForm);
  };

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
            Vendor Directory & Accounts Payable (AP)
          </h1>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Active commercial suppliers, contract renewals, payment terms, W-9 compliance, and AP disbursement settlements.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setFormData(initialForm);
            setIsAddModalOpen(true);
          }}
        >
          <Plus size={13} />
          <span>+ Add Vendor</span>
        </button>
      </div>

      {/* Aggregate Overview Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', marginBottom: '14px' }}>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
          <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            Active Commercial Vendors
          </div>
          <div className="num-val" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary-navy)', marginTop: '4px' }}>
            {vendors.length} Active Accounts
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            W-9 Compliant & Monitored
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
          <div style={{ fontSize: '10.5px', color: 'var(--debit-text)', textTransform: 'uppercase', fontWeight: 600 }}>
            Outstanding AP Balance
          </div>
          <div className="num-val" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--debit-text)', marginTop: '4px' }}>
            {formatCurrency(totalOutstanding)}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Payables across Net-15 / Net-30
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
          <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            Total YTD Cumulative Spend
          </div>
          <div className="num-val" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary-navy)', marginTop: '4px' }}>
            {formatCurrency(totalYtdSpend)}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            FY2026 Vendor Disbursements
          </div>
        </div>
      </div>

      {/* Filter Ribbon */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-sm)',
          padding: '8px 12px',
          marginBottom: '12px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '260px', flex: 1 }}>
          <Search size={14} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search vendor name, email, or tax ID..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ height: '28px' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Dept:</span>
            <select
              className="form-select"
              style={{ width: '130px', height: '28px', fontSize: '11px' }}
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
            >
              <option value="ALL">All Departments</option>
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Category:</span>
            <select
              className="form-select"
              style={{ width: '140px', height: '28px', fontSize: '11px' }}
              value={selectedCat}
              onChange={e => setSelectedCat(e.target.value)}
            >
              <option value="ALL">All Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Vendors Table */}
      <div className="table-container">
        <table className={`erp-table ${isCompactMode ? 'compact' : ''}`}>
          <thead>
            <tr>
              <th>Vendor Name</th>
              <th>Category</th>
              <th>Department</th>
              <th>Payment Terms</th>
              <th>Contact Email</th>
              <th>Tax ID / W-9</th>
              <th className="table-align-right">Outstanding (AP)</th>
              <th className="table-align-right">YTD Spend</th>
              <th>Renewal Date</th>
              <th>Status</th>
              <th className="table-align-center" style={{ width: '140px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVendors.map(vendor => (
              <tr key={vendor.id}>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {vendor.name}
                </td>
                <td>
                  <span
                    style={{
                      fontSize: '11px',
                      padding: '1px 5px',
                      background: 'var(--bg-surface-subtle)',
                      borderRadius: '2px',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    {vendor.category}
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{vendor.department}</span>
                </td>
                <td className="font-mono" style={{ fontSize: '11px' }}>
                  {vendor.paymentTerms}
                </td>
                <td className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {vendor.contactEmail}
                </td>
                <td>
                  <span style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span className="font-mono">{vendor.taxId}</span>
                    {vendor.w9OnFile && <CheckCircle2 size={11} style={{ color: 'var(--credit-text)' }} />}
                  </span>
                </td>
                <td className="table-align-right num-val" style={{ fontWeight: 600, color: vendor.outstandingBalance > 0 ? 'var(--debit-text)' : 'var(--text-muted)' }}>
                  {formatCurrency(vendor.outstandingBalance)}
                </td>
                <td className="table-align-right num-val">
                  {formatCurrency(vendor.totalYtdSpend)}
                </td>
                <td className="font-mono" style={{ fontSize: '11px' }}>
                  {formatDate(vendor.contractRenewalDate)}
                </td>
                <td>
                  <Badge status={vendor.status} size="sm" />
                </td>
                <td className="table-align-center">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    {vendor.outstandingBalance > 0 ? (
                      <button
                        type="button"
                        className="btn btn-sm btn-primary"
                        onClick={() => openPayModal(vendor)}
                        style={{ fontSize: '10.5px', height: '22px', padding: '1px 6px' }}
                      >
                        <CreditCard size={11} />
                        <span>Pay AP</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn btn-sm btn-icon-only"
                        onClick={() => {
                          setEditingVendor(vendor);
                          setFormData({
                            name: vendor.name,
                            category: vendor.category,
                            department: vendor.department,
                            contactEmail: vendor.contactEmail,
                            paymentTerms: vendor.paymentTerms,
                            outstandingBalance: vendor.outstandingBalance.toString(),
                            contractRenewalDate: vendor.contractRenewalDate,
                            taxId: vendor.taxId,
                            w9OnFile: vendor.w9OnFile,
                            status: vendor.status,
                            paymentMethod: vendor.paymentMethod,
                          });
                        }}
                        title="Edit Vendor Profile"
                      >
                        <Edit3 size={11} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pay Vendor AP Modal */}
      <Modal
        isOpen={!!payingVendor}
        onClose={() => setPayingVendor(null)}
        title={payingVendor ? `Disburse Payment: ${payingVendor.name}` : 'Vendor Payment'}
        subtitle="Executes payment clearing and records debit entry in operational ledger"
        size="md"
        footer={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" className="btn" onClick={() => setPayingVendor(null)}>Cancel</button>
            <button type="button" className="btn btn-primary" onClick={handleExecutePayment}>
              Authorize Disbursement
            </button>
          </div>
        }
      >
        {payingVendor && (
          <form onSubmit={handleExecutePayment} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '10px 12px', background: 'var(--bg-surface-alt)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Payment Method:</span>
                <strong>{payingVendor.paymentMethod}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginTop: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Payment Terms:</span>
                <strong>{payingVendor.paymentTerms}</strong>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Payment Amount (USD) *</label>
              <input
                type="number"
                step="0.01"
                required
                className="form-input font-mono"
                value={paymentAmountInput}
                onChange={e => setPaymentAmountInput(e.target.value)}
              />
            </div>
          </form>
        )}
      </Modal>

      {/* Add / Edit Vendor Modal */}
      <Modal
        isOpen={isAddModalOpen || !!editingVendor}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingVendor(null);
        }}
        title={editingVendor ? `Edit Vendor: ${editingVendor.name}` : 'Register New Vendor Account'}
        subtitle="Manage commercial agreement, contact, terms, and tax records"
        size="lg"
        footer={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingVendor(null);
              }}
            >
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSaveVendor}>
              {editingVendor ? 'Save Profile' : 'Register Vendor'}
            </button>
          </div>
        }
      >
        <form onSubmit={handleSaveVendor} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">Vendor Company Name *</label>
              <input
                type="text"
                required
                className="form-input"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Contact / AR Email *</label>
              <input
                type="email"
                required
                className="form-input font-mono"
                value={formData.contactEmail}
                onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                className="form-select"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Department *</label>
              <select
                className="form-select"
                value={formData.department}
                onChange={e => setFormData({ ...formData, department: e.target.value as Department })}
              >
                {departments.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Payment Terms *</label>
              <select
                className="form-select"
                value={formData.paymentTerms}
                onChange={e => setFormData({ ...formData, paymentTerms: e.target.value as Vendor['paymentTerms'] })}
              >
                {termsOptions.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">Outstanding AP (USD)</label>
              <input
                type="number"
                step="0.01"
                className="form-input font-mono"
                value={formData.outstandingBalance}
                onChange={e => setFormData({ ...formData, outstandingBalance: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Contract Renewal Date</label>
              <input
                type="date"
                className="form-input font-mono"
                value={formData.contractRenewalDate}
                onChange={e => setFormData({ ...formData, contractRenewalDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Tax ID / EIN</label>
              <input
                type="text"
                className="form-input font-mono"
                value={formData.taxId}
                onChange={e => setFormData({ ...formData, taxId: e.target.value })}
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
