import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Download,
  Printer,
  CheckCircle2,
  AlertCircle,
  Eye,
  Trash2,
  Calendar,
  Building,
  Upload,
} from 'lucide-react';
import { useFinance } from '../../../context/FinanceContext';
import { Invoice, InvoiceType, InvoiceStatus, InvoiceLineItem } from '../../../types/finance';
import { Badge } from '../../common/Badge';
import { Modal } from '../../common/Modal';
import { formatCurrency } from '../../../utils/currency';
import { formatDate } from '../../../utils/date';
import { exportInvoicesToCSV } from '../../../utils/csvParser';

export const InvoiceModule: React.FC = () => {
  const { invoices, addInvoice, updateInvoiceStatus, isCompactMode } = useFinance();

  const [activeTab, setActiveTab] = useState<'ALL' | 'AP' | 'AR'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Modals & Viewers
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form State
  const [invType, setInvType] = useState<InvoiceType>('Accounts Receivable');
  const [partyName, setPartyName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('2026-09-15');
  const [notes, setNotes] = useState('Payment due Net 30. Direct wire transfer preferred.');
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([
    { id: 'li-1', description: 'Engineering Architecture Consulting & Sprint Milestone', quantity: 1, unitPrice: 45000, total: 45000 },
  ]);

  const addLineItem = () => {
    setLineItems(prev => [
      ...prev,
      { id: `li-${Date.now()}`, description: '', quantity: 1, unitPrice: 0, total: 0 },
    ]);
  };

  const updateLineItem = (id: string, updates: Partial<InvoiceLineItem>) => {
    setLineItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          const updated = { ...item, ...updates };
          updated.total = (updated.quantity || 1) * (updated.unitPrice || 0);
          return updated;
        }
        return item;
      })
    );
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length <= 1) return;
    setLineItems(prev => prev.filter(i => i.id !== id));
  };

  const subtotal = lineItems.reduce((s, i) => s + i.total, 0);
  const calculatedTax = 0; // standard B2B services
  const totalAmount = subtotal + calculatedTax;

  const handleSaveInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partyName.trim()) {
      alert('Please enter a party name (client or vendor).');
      return;
    }

    const seq = invoices.length + 95;
    const invNum = invType === 'Accounts Receivable' ? `INV-2026-AR-0${seq}` : `AP-VND-2026-${seq}`;

    addInvoice({
      invoiceNumber: invNum,
      type: invType,
      partyName,
      contactEmail: contactEmail || 'billing@domain.internal',
      issueDate,
      dueDate,
      amount: totalAmount,
      taxAmount: calculatedTax,
      status: invType === 'Accounts Receivable' ? 'Sent' : 'Received',
      lineItems,
      notes,
      pdfGenerated: true,
    });

    setIsCreateModalOpen(false);
    setPartyName('');
    setContactEmail('');
    setLineItems([{ id: 'li-1', description: 'Software Engineering Services', quantity: 1, unitPrice: 25000, total: 25000 }]);
  };

  const filteredInvoices = invoices.filter(inv => {
    if (activeTab === 'AP' && inv.type !== 'Accounts Payable') return false;
    if (activeTab === 'AR' && inv.type !== 'Accounts Receivable') return false;
    if (selectedStatus !== 'ALL' && inv.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.partyName.toLowerCase().includes(q) ||
        inv.contactEmail.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalAR = invoices.filter(i => i.type === 'Accounts Receivable').reduce((s, i) => s + i.amount, 0);
  const totalAP = invoices.filter(i => i.type === 'Accounts Payable').reduce((s, i) => s + i.amount, 0);

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
            Invoice Management (Accounts Payable & Receivable)
          </h1>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Client billing retainers (AR), vendor invoice obligations (AP), formal invoice generator, and payment tracking.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="btn"
            onClick={() => exportInvoicesToCSV(filteredInvoices)}
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus size={13} />
            <span>+ Create Invoice</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Ribbon */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', marginBottom: '14px' }}>
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
          <div style={{ fontSize: '10.5px', color: 'var(--credit-text)', textTransform: 'uppercase', fontWeight: 600 }}>
            Accounts Receivable (Client Inflows)
          </div>
          <div className="num-val" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--credit-text)', marginTop: '4px' }}>
            {formatCurrency(totalAR)}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {invoices.filter(i => i.type === 'Accounts Receivable').length} Client Invoices
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
          <div style={{ fontSize: '10.5px', color: 'var(--debit-text)', textTransform: 'uppercase', fontWeight: 600 }}>
            Accounts Payable (Vendor Bills)
          </div>
          <div className="num-val" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--debit-text)', marginTop: '4px' }}>
            {formatCurrency(totalAP)}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {invoices.filter(i => i.type === 'Accounts Payable').length} Vendor Invoices
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
          <div style={{ fontSize: '10.5px', color: 'var(--pending-text)', textTransform: 'uppercase', fontWeight: 600 }}>
            Overdue Balance
          </div>
          <div className="num-val" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--pending-text)', marginTop: '4px' }}>
            {formatCurrency(invoices.filter(i => i.status === 'Overdue').reduce((s, i) => s + i.amount, 0))}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {invoices.filter(i => i.status === 'Overdue').length} Delinquent Notice
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="erp-tabs">
        <button
          type="button"
          className={`erp-tab ${activeTab === 'ALL' ? 'active' : ''}`}
          onClick={() => setActiveTab('ALL')}
        >
          All Invoices ({invoices.length})
        </button>
        <button
          type="button"
          className={`erp-tab ${activeTab === 'AR' ? 'active' : ''}`}
          onClick={() => setActiveTab('AR')}
        >
          Accounts Receivable (Client Billing)
        </button>
        <button
          type="button"
          className={`erp-tab ${activeTab === 'AP' ? 'active' : ''}`}
          onClick={() => setActiveTab('AP')}
        >
          Accounts Payable (Vendor Bills)
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '10px',
          gap: '8px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, maxWidth: '400px' }}>
          <Search size={14} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search invoice #, party name, or email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ height: '28px' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Status:</span>
          <select
            className="form-select"
            style={{ width: '140px', height: '28px', fontSize: '11px' }}
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Sent">Sent</option>
            <option value="Received">Received</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Overdue">Overdue</option>
            <option value="Draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="table-container">
        <table className={`erp-table ${isCompactMode ? 'compact' : ''}`}>
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Type</th>
              <th>Party / Entity</th>
              <th>Issue Date</th>
              <th>Due Date</th>
              <th className="table-align-right">Total Amount</th>
              <th>Status</th>
              <th className="table-align-center" style={{ width: '160px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.map(inv => (
              <tr key={inv.id}>
                <td className="font-mono" style={{ fontWeight: 600 }}>
                  {inv.invoiceNumber}
                </td>
                <td>
                  <span
                    style={{
                      fontSize: '10.5px',
                      padding: '1px 5px',
                      borderRadius: '2px',
                      fontWeight: 600,
                      background: inv.type === 'Accounts Receivable' ? 'var(--credit-bg)' : 'var(--debit-bg)',
                      color: inv.type === 'Accounts Receivable' ? 'var(--credit-text)' : 'var(--debit-text)',
                      border: `1px solid ${inv.type === 'Accounts Receivable' ? 'var(--credit-border)' : 'var(--debit-border)'}`,
                    }}
                  >
                    {inv.type === 'Accounts Receivable' ? 'Client AR' : 'Vendor AP'}
                  </span>
                </td>
                <td>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{inv.partyName}</div>
                  <div className="font-mono" style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>{inv.contactEmail}</div>
                </td>
                <td className="font-mono">{formatDate(inv.issueDate)}</td>
                <td className="font-mono">{formatDate(inv.dueDate)}</td>
                <td className="table-align-right num-val" style={{ fontWeight: 700, fontSize: '12.5px' }}>
                  {formatCurrency(inv.amount)}
                </td>
                <td>
                  <Badge status={inv.status} size="sm" />
                </td>
                <td className="table-align-center">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <button
                      type="button"
                      className="btn btn-sm btn-icon-only"
                      onClick={() => setViewingInvoice(inv)}
                      title="View Formal Printable Invoice"
                    >
                      <Eye size={12} />
                    </button>
                    {inv.status !== 'Paid' && (
                      <button
                        type="button"
                        className="btn btn-sm btn-success"
                        onClick={() => updateInvoiceStatus(inv.id, 'Paid')}
                        style={{ fontSize: '10.5px', height: '22px', padding: '1px 6px' }}
                      >
                        <CheckCircle2 size={11} />
                        <span>Mark Paid</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Formal Invoice Viewer Modal (Printable) */}
      <Modal
        isOpen={!!viewingInvoice}
        onClose={() => setViewingInvoice(null)}
        title={viewingInvoice ? `Formal Invoice: ${viewingInvoice.invoiceNumber}` : 'Invoice'}
        subtitle="Commercial Tax & Settlement Documentation"
        size="lg"
        footer={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => window.print()}
            >
              <Printer size={13} />
              <span>Print / Save as PDF</span>
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => setViewingInvoice(null)}
            >
              Close
            </button>
          </div>
        }
      >
        {viewingInvoice && (
          <div
            style={{
              padding: '24px',
              background: '#ffffff',
              border: '1px solid var(--border-default)',
              color: '#000000',
              fontFamily: 'var(--font-ui)',
            }}
          >
            {/* Invoice Document Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #0f172a', paddingBottom: '16px', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#0f172a' }}>
                  ADMARK AGENCY CORP
                </h2>
                <div style={{ fontSize: '11px', color: '#475569', marginTop: '4px', lineHeight: 1.4 }}>
                  500 Howard Street, Suite 400<br />
                  San Francisco, CA 94105<br />
                  operations@agency.internal • EIN: XX-XXX9281
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>INVOICE</div>
                <div className="font-mono" style={{ fontSize: '12px', fontWeight: 600, marginTop: '4px' }}>
                  #{viewingInvoice.invoiceNumber}
                </div>
                <div style={{ fontSize: '11px', color: '#475569', marginTop: '4px' }}>
                  Status: <strong>{viewingInvoice.status.toUpperCase()}</strong>
                </div>
              </div>
            </div>

            {/* Bill To & Metadata */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
                  {viewingInvoice.type === 'Accounts Receivable' ? 'Billed To (Client)' : 'Vendor (Payee)'}
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, marginTop: '4px' }}>{viewingInvoice.partyName}</div>
                <div style={{ fontSize: '11.5px', color: '#475569', marginTop: '2px' }}>{viewingInvoice.contactEmail}</div>
              </div>

              <div style={{ background: '#f8fafc', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '2px', fontSize: '11.5px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: '#64748b' }}>Issue Date:</span>
                  <strong>{formatDate(viewingInvoice.issueDate)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: '#64748b' }}>Payment Due:</span>
                  <strong style={{ color: '#991b1b' }}>{formatDate(viewingInvoice.dueDate)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Payment Terms:</span>
                  <strong>Net 30</strong>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                  <th style={{ padding: '8px', textAlign: 'left', fontWeight: 700 }}>Description</th>
                  <th style={{ padding: '8px', textAlign: 'center', width: '60px' }}>Qty</th>
                  <th style={{ padding: '8px', textAlign: 'right', width: '110px' }}>Unit Price</th>
                  <th style={{ padding: '8px', textAlign: 'right', width: '120px' }}>Amount (USD)</th>
                </tr>
              </thead>
              <tbody>
                {viewingInvoice.lineItems.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '8px' }}>{item.description}</td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>{item.quantity}</td>
                    <td style={{ padding: '8px', textAlign: 'right' }} className="num-val">{formatCurrency(item.unitPrice)}</td>
                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: 600 }} className="num-val">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals Calculation */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
              <div style={{ width: '240px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>Subtotal:</span>
                  <strong className="num-val">{formatCurrency(viewingInvoice.amount - viewingInvoice.taxAmount)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b' }}>Tax / VAT (0%):</span>
                  <span className="num-val">$0.00</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '2px solid #0f172a', fontSize: '14px' }}>
                  <strong>Net Total Due:</strong>
                  <strong className="num-val" style={{ color: '#0f172a' }}>{formatCurrency(viewingInvoice.amount)}</strong>
                </div>
              </div>
            </div>

            {/* Remittance Info */}
            <div style={{ padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '11px', color: '#475569' }}>
              <strong>Remittance Instructions:</strong>
              <div style={{ marginTop: '4px' }}>{viewingInvoice.notes}</div>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Invoice Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Invoice Record"
        subtitle="Generate client billing receivable or vendor payable entry"
        size="lg"
        footer={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" className="btn" onClick={() => setIsCreateModalOpen(false)}>Cancel</button>
            <button type="button" className="btn btn-primary" onClick={handleSaveInvoice}>Generate Invoice</button>
          </div>
        }
      >
        <form onSubmit={handleSaveInvoice} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">Invoice Classification *</label>
              <select
                className="form-select"
                value={invType}
                onChange={e => setInvType(e.target.value as InvoiceType)}
              >
                <option value="Accounts Receivable">Accounts Receivable (Client Inflow)</option>
                <option value="Accounts Payable">Accounts Payable (Vendor Outflow)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Party / Company Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Aether FinTech Inc."
                className="form-input"
                value={partyName}
                onChange={e => setPartyName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Email</label>
              <input
                type="email"
                placeholder="ap@client.io"
                className="form-input font-mono"
                value={contactEmail}
                onChange={e => setContactEmail(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">Issue Date</label>
              <input
                type="date"
                className="form-input font-mono"
                value={issueDate}
                onChange={e => setIssueDate(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input
                type="date"
                className="form-input font-mono"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
              />
            </div>
          </div>

          {/* Line Items Builder */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="form-label">Invoice Line Items</label>
              <button
                type="button"
                className="btn btn-sm"
                onClick={addLineItem}
              >
                <Plus size={11} />
                <span>+ Add Line Item</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {lineItems.map((item, idx) => (
                <div
                  key={item.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 80px 120px 100px 30px',
                    gap: '6px',
                    alignItems: 'center',
                  }}
                >
                  <input
                    type="text"
                    required
                    placeholder="Description of service/deliverable..."
                    className="form-input"
                    value={item.description}
                    onChange={e => updateLineItem(item.id, { description: e.target.value })}
                  />
                  <input
                    type="number"
                    min="1"
                    className="form-input font-mono"
                    value={item.quantity}
                    onChange={e => updateLineItem(item.id, { quantity: parseInt(e.target.value) || 1 })}
                  />
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="form-input font-mono"
                    value={item.unitPrice}
                    onChange={e => updateLineItem(item.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                  />
                  <div className="num-val" style={{ textAlign: 'right', fontWeight: 600 }}>
                    {formatCurrency(item.total)}
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-icon-only btn-danger"
                    disabled={lineItems.length <= 1}
                    onClick={() => removeLineItem(item.id)}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'right', marginTop: '10px', fontSize: '13px', fontWeight: 700 }}>
              Calculated Net Total: <span className="num-val">{formatCurrency(totalAmount)}</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Payment & Remittance Notes</label>
            <textarea
              className="form-textarea"
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
