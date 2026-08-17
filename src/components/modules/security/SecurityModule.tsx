import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
  UserCheck,
  Key,
  Server,
  Filter,
} from 'lucide-react';
import { useFinance } from '../../../context/FinanceContext';
import { Badge } from '../../common/Badge';

export const SecurityModule: React.FC = () => {
  const { auditLogs, isCompactMode, currentRole } = useFinance();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState('ALL');

  const securityChecklist = [
    {
      id: 'sec-csrf',
      name: 'CSRF Token Protection',
      status: 'Enforced',
      description: 'Double-submit cookie validation with cryptographic nonces on all state-changing endpoints.',
      category: 'Network & Headers',
    },
    {
      id: 'sec-cookies',
      name: 'Secure & HttpOnly Cookie Flags',
      status: 'Enforced',
      description: 'SameSite=Strict, Secure, HttpOnly flags active on authentication and session tokens.',
      category: 'Session Security',
    },
    {
      id: 'sec-cors',
      name: 'CORS Origin Restrictions',
      status: 'Enforced',
      description: 'Strict origin whitelisting allowing only authorized agency domains; wildcards forbidden.',
      category: 'Network & Headers',
    },
    {
      id: 'sec-req-size',
      name: 'Request-Size Limits',
      status: 'Enforced',
      description: 'Payload body parser capped at 10MB to prevent DoS vector attacks.',
      category: 'API Defense',
    },
    {
      id: 'sec-pwd-reset',
      name: 'Password Reset Expiration',
      status: 'Enforced',
      description: 'Single-use cryptographic reset tokens with 15-minute strict time-to-live (TTL).',
      category: 'Authentication',
    },
    {
      id: 'sec-session-inv',
      name: 'Session Invalidation on Credential Change',
      status: 'Enforced',
      description: 'Instant revocation of all concurrent active JWT/OAuth tokens upon password change.',
      category: 'Authentication',
    },
    {
      id: 'sec-upload',
      name: 'File Upload Restrictions & MIME Validation',
      status: 'Enforced',
      description: 'MIME magic-byte verification for PDF/CSV/Excel; executable file headers blocked.',
      category: 'Data Ingestion',
    },
    {
      id: 'sec-payment',
      name: 'Payment Verification & 2-Person Rule',
      status: 'Enforced',
      description: 'Dual-approval signoff required for wire transfers exceeding $10,000.00.',
      category: 'Financial Controls',
    },
    {
      id: 'sec-audit',
      name: 'Immutable Audit Logging',
      status: 'Enforced',
      description: 'Append-only chronological trail capturing timestamp, user ID, role, action, and IP.',
      category: 'Compliance',
    },
    {
      id: 'sec-rbac',
      name: 'Role-Based Access Control (RBAC)',
      status: 'Enforced',
      description: 'Granular policy engine enforcing COO, CEO, CFO, and CTO permission boundaries.',
      category: 'Authorization',
    },
    {
      id: 'sec-ratelimit',
      name: 'API Rate Limiting & Brute Force Shield',
      status: 'Enforced',
      description: 'Token bucket algorithm limiting clients to 100 requests/minute on sensitive routes.',
      category: 'API Defense',
    },
  ];

  const roleMatrix = [
    { module: 'Executive Overview', ceo: 'Full', cfo: 'Full', coo: 'Full', cto: 'Tech Only' },
    { module: 'Expense Management (CRUD)', ceo: 'Full', cfo: 'Read/Audit', coo: 'Full (Lead)', cto: 'Tech Only' },
    { module: 'Bank Statement Import & Reconcile', ceo: 'Full', cfo: 'Full', coo: 'Full', cto: 'No Access' },
    { module: 'Automatic Categorization Rules', ceo: 'Full', cfo: 'Full', coo: 'Full', cto: 'No Access' },
    { module: 'Employee Reimbursements', ceo: 'Full', cfo: 'Disburse', coo: 'Full Approval', cto: 'Submit Only' },
    { module: 'Department Budget Adjustments', ceo: 'Approval', cfo: 'Full', coo: 'Full (Lead)', cto: 'Eng Only' },
    { module: 'Vendor Contracts & AP Directory', ceo: 'Full', cfo: 'Full', coo: 'Full', cto: 'Tech Vendors' },
    { module: 'Invoices (AP / AR)', ceo: 'Full', cfo: 'Full (Lead)', coo: 'Full', cto: 'No Access' },
    { module: 'Financial Statements (P&L)', ceo: 'Full', cfo: 'Full (Sign-off)', coo: 'Full', cto: 'No Access' },
    { module: 'Audit Log & Security Center', ceo: 'Full', cfo: 'Audit View', coo: 'Full', cto: 'No Access' },
  ];

  const filteredLogs = auditLogs.filter(log => {
    if (selectedAction !== 'ALL' && log.action !== selectedAction) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.user.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.entity.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.ipAddress.toLowerCase().includes(q)
      );
    }
    return true;
  });

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
            Security Controls, Compliance & Immutable Audit Trail
          </h1>
          <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            SOC-2 Type II financial security policy checklist, RBAC authorization matrix, and chronological event ledger.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldCheck size={16} style={{ color: 'var(--credit-text)' }} />
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--credit-text)' }}>
            All 11 Security Gates Active & Enforced
          </span>
        </div>
      </div>

      {/* Two Column: Security Checklist + RBAC Matrix */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '14px', marginBottom: '16px' }}>
        {/* Security Checklist */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', padding: '12px 14px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Lock size={14} style={{ color: 'var(--primary-navy)' }} />
            <span>Pre-Deployment Security Verification Checklist</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '340px', overflowY: 'auto' }}>
            {securityChecklist.map(item => (
              <div
                key={item.id}
                style={{
                  padding: '7px 10px',
                  background: 'var(--bg-surface-alt)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-xs)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '10px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle2 size={12} style={{ color: 'var(--credit-text)' }} />
                    <strong style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{item.name}</strong>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>({item.category})</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', paddingLeft: '18px' }}>
                    {item.description}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '1px 5px',
                    borderRadius: '2px',
                    background: 'var(--credit-bg)',
                    color: 'var(--credit-text)',
                    border: '1px solid var(--credit-border)',
                  }}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* RBAC Permission Matrix */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', padding: '12px 14px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <UserCheck size={14} style={{ color: 'var(--primary-navy)' }} />
            <span>Executive Role-Based Access Control (RBAC) Matrix</span>
          </div>

          <div className="table-container" style={{ maxHeight: '340px' }}>
            <table className="erp-table compact">
              <thead>
                <tr>
                  <th>Workspace Module</th>
                  <th style={{ width: '60px', textAlign: 'center' }}>CEO</th>
                  <th style={{ width: '60px', textAlign: 'center' }}>CFO</th>
                  <th style={{ width: '70px', textAlign: 'center' }}>COO</th>
                  <th style={{ width: '80px', textAlign: 'center' }}>CTO</th>
                </tr>
              </thead>
              <tbody>
                {roleMatrix.map((rm, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600 }}>{rm.module}</td>
                    <td style={{ textAlign: 'center' }} className="font-mono">{rm.ceo}</td>
                    <td style={{ textAlign: 'center' }} className="font-mono">{rm.cfo}</td>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: 'var(--primary-blue)' }} className="font-mono">{rm.coo}</td>
                    <td style={{ textAlign: 'center', color: rm.cto === 'No Access' ? 'var(--text-subtle)' : 'var(--text-primary)' }} className="font-mono">
                      {rm.cto}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Immutable Audit Log Table */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)', padding: '12px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-primary)', letterSpacing: '0.03em' }}>
              Chronological Audit Event Log (Immutable)
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Non-repudiation audit trail recording all financial modifications and approvals
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Search size={14} style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search user, action, entity, IP..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ width: '240px', height: '28px' }}
            />
          </div>
        </div>

        <div className="table-container">
          <table className={`erp-table ${isCompactMode ? 'compact' : ''}`}>
            <thead>
              <tr>
                <th>Timestamp (UTC)</th>
                <th>Operator / User</th>
                <th>Role</th>
                <th>Action Type</th>
                <th>Target Entity</th>
                <th>Audit Details & Parameters</th>
                <th>Source IP</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => (
                <tr key={log.id}>
                  <td className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {log.timestamp}
                  </td>
                  <td style={{ fontWeight: 600 }}>{log.user}</td>
                  <td>
                    <span
                      style={{
                        fontSize: '10.5px',
                        padding: '1px 5px',
                        background: 'var(--bg-surface-subtle)',
                        borderRadius: '2px',
                        border: '1px solid var(--border-subtle)',
                        fontWeight: 600,
                      }}
                    >
                      {log.role}
                    </span>
                  </td>
                  <td>
                    <code className="font-mono" style={{ fontSize: '11px', color: 'var(--primary-navy)', fontWeight: 600 }}>
                      {log.action}
                    </code>
                  </td>
                  <td style={{ fontWeight: 600, fontSize: '11.5px' }}>{log.entity}</td>
                  <td style={{ maxWidth: '400px' }}>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                      {log.details}
                    </div>
                  </td>
                  <td className="font-mono" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {log.ipAddress}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
