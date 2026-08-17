import React, { useState } from 'react';
import {
  Plus,
  Sliders,
  RefreshCw,
  Search,
  Check,
  Trash2,
  Edit3,
  Play,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useFinance } from '../../../context/FinanceContext';
import { CategorizationRule, ExpenseCategory, Department } from '../../../types/finance';
import { Modal } from '../../common/Modal';
import { autoCategorizeMerchant } from '../../../utils/rulesEngine';

export const CategorizationModule: React.FC = () => {
  const { rules, addRule, updateRule, deleteRule, reapplyAllRules, isCompactMode } = useFinance();

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<CategorizationRule | null>(null);

  // Live Simulator State
  const [testMerchant, setTestMerchant] = useState('AWS EC2 Compute & Kubernetes us-east-1');
  const testResult = autoCategorizeMerchant(testMerchant, rules);

  // Form State
  const initialFormState = {
    pattern: '',
    category: 'Software subscriptions' as ExpenseCategory,
    department: 'Engineering' as Department,
    isRegex: true,
    priority: 8,
    isActive: true,
  };
  const [formData, setFormData] = useState(initialFormState);

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

  const departments: Department[] = [
    'Engineering',
    'Sales & Marketing',
    'Operations',
    'Executive',
    'Design & Product',
    'Facilities & IT',
  ];

  const filteredRules = rules.filter(r => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.pattern.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q) ||
      r.department.toLowerCase().includes(q)
    );
  });

  const openEditModal = (rule: CategorizationRule) => {
    setEditingRule(rule);
    setFormData({
      pattern: rule.pattern,
      category: rule.category,
      department: rule.department,
      isRegex: rule.isRegex,
      priority: rule.priority,
      isActive: rule.isActive,
    });
  };

  const handleSaveRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.pattern.trim()) {
      alert('Please provide a keyword or regex pattern.');
      return;
    }

    if (editingRule) {
      updateRule(editingRule.id, {
        pattern: formData.pattern,
        category: formData.category,
        department: formData.department,
        isRegex: formData.isRegex,
        priority: Number(formData.priority) || 5,
        isActive: formData.isActive,
      });
      setEditingRule(null);
    } else {
      addRule({
        pattern: formData.pattern,
        category: formData.category,
        department: formData.department,
        isRegex: formData.isRegex,
        priority: Number(formData.priority) || 5,
        isActive: formData.isActive,
      });
      setIsAddModalOpen(false);
    }

    setFormData(initialFormState);
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
            Automatic Categorization & GL Rules Engine
          </h1>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            Deterministic pattern matching algorithms that automatically assign categories and departments to transactions.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => reapplyAllRules()}
            title="Re-run rules engine across all existing ledger records"
          >
            <RefreshCw size={13} />
            <span>Re-apply Rules to Ledger</span>
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => {
              setFormData(initialFormState);
              setIsAddModalOpen(true);
            }}
          >
            <Plus size={13} />
            <span>+ Add Rule</span>
          </button>
        </div>
      </div>

      {/* Interactive Rule Simulator Sandbox */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-sm)',
          padding: '12px 14px',
          marginBottom: '14px',
        }}
      >
        <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '6px' }}>
          Rule Engine Simulator (Test Categorization Accuracy)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Type merchant string to test rule matches..."
              value={testMerchant}
              onChange={e => setTestMerchant(e.target.value)}
              style={{ height: '30px', fontSize: '12px' }}
            />
          </div>

          <div
            style={{
              padding: '6px 12px',
              background: 'var(--bg-surface-alt)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xs)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '11.5px',
            }}
          >
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Mapped Category: </span>
              <strong>{testResult.category}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Dept: </span>
              <strong>{testResult.department}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Confidence: </span>
              <strong className="num-val" style={{ color: testResult.confidence >= 0.9 ? 'var(--credit-text)' : 'var(--pending-text)' }}>
                {(testResult.confidence * 100).toFixed(0)}%
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Rules Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, maxWidth: '400px' }}>
          <Search size={14} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search pattern, category, or department..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ height: '28px' }}
          />
        </div>
        <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
          {filteredRules.length} Active Automation Rules
        </div>
      </div>

      {/* Rules Table */}
      <div className="table-container">
        <table className={`erp-table ${isCompactMode ? 'compact' : ''}`}>
          <thead>
            <tr>
              <th style={{ width: '60px' }}>Priority</th>
              <th>Keyword / Regex Pattern</th>
              <th>Target Category</th>
              <th>Target Department</th>
              <th>Match Type</th>
              <th className="table-align-right">Matches Logged</th>
              <th>Status</th>
              <th className="table-align-center" style={{ width: '100px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRules.map(rule => (
              <tr key={rule.id}>
                <td className="font-mono" style={{ textAlign: 'center', fontWeight: 600 }}>
                  P{rule.priority}
                </td>
                <td style={{ maxWidth: '380px' }}>
                  <code
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11.5px',
                      background: 'var(--bg-surface-subtle)',
                      padding: '2px 6px',
                      borderRadius: '2px',
                      border: '1px solid var(--border-subtle)',
                      display: 'inline-block',
                      maxWidth: '100%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {rule.pattern}
                  </code>
                </td>
                <td>
                  <span style={{ fontWeight: 600 }}>{rule.category}</span>
                </td>
                <td>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>{rule.department}</span>
                </td>
                <td>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {rule.isRegex ? 'Regex Pattern' : 'Substring Match'}
                  </span>
                </td>
                <td className="table-align-right font-mono" style={{ fontWeight: 600 }}>
                  {rule.matchCount}
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() => updateRule(rule.id, { isActive: !rule.isActive })}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    <span
                      style={{
                        fontSize: '10.5px',
                        padding: '1px 6px',
                        borderRadius: '2px',
                        fontWeight: 600,
                        background: rule.isActive ? 'var(--credit-bg)' : 'var(--neutral-pill-bg)',
                        color: rule.isActive ? 'var(--credit-text)' : 'var(--text-muted)',
                        border: `1px solid ${rule.isActive ? 'var(--credit-border)' : 'var(--border-subtle)'}`,
                      }}
                    >
                      {rule.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </button>
                </td>
                <td className="table-align-center">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                    <button
                      type="button"
                      className="btn btn-sm btn-icon-only"
                      onClick={() => openEditModal(rule)}
                      title="Edit Rule"
                    >
                      <Edit3 size={12} />
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-danger btn-icon-only"
                      onClick={() => {
                        if (confirm(`Delete rule for "${rule.pattern}"?`)) {
                          deleteRule(rule.id);
                        }
                      }}
                      title="Delete Rule"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Rule Modal */}
      <Modal
        isOpen={isAddModalOpen || !!editingRule}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingRule(null);
        }}
        title={editingRule ? 'Edit Categorization Rule' : 'Create Automatic Categorization Rule'}
        subtitle="Match payee descriptions to standard chart of accounts"
        size="md"
        footer={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingRule(null);
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSaveRule}
            >
              {editingRule ? 'Save Rule' : 'Create Rule'}
            </button>
          </div>
        }
      >
        <form onSubmit={handleSaveRule} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="form-group">
            <label className="form-label">Merchant Matching Pattern (Keyword or Regex) *</label>
            <input
              type="text"
              required
              placeholder="e.g. AWS|Amazon Web Services|EC2"
              className="form-input font-mono"
              value={formData.pattern}
              onChange={e => setFormData({ ...formData, pattern: e.target.value })}
            />
            <span className="form-hint">Use pipe | to separate multiple keywords. Case-insensitive.</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">Target Expense Category *</label>
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
              <label className="form-label">Target Department *</label>
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
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">Rule Priority (1 - 10)</label>
              <input
                type="number"
                min="1"
                max="10"
                className="form-input font-mono"
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: parseInt(e.target.value) || 5 })}
              />
            </div>
            <div className="form-group" style={{ justifyContent: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '16px' }}>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <span style={{ fontSize: '12px', fontWeight: 600 }}>Rule Active</span>
              </label>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
