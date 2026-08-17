import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useFinance();

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        zIndex: 3000,
        maxWidth: '380px',
      }}
    >
      {toasts.map(toast => {
        let borderColor = 'var(--border-default)';
        let bg = 'var(--bg-surface)';
        let icon = <Info size={16} style={{ color: 'var(--info-text)' }} />;

        if (toast.type === 'success') {
          borderColor = 'var(--credit-border)';
          bg = '#f0fdf4';
          icon = <CheckCircle2 size={16} style={{ color: 'var(--credit-text)' }} />;
        } else if (toast.type === 'error') {
          borderColor = 'var(--debit-border)';
          bg = '#fef2f2';
          icon = <AlertCircle size={16} style={{ color: 'var(--debit-text)' }} />;
        } else if (toast.type === 'warning') {
          borderColor = 'var(--pending-border)';
          bg = '#fffbeb';
          icon = <AlertTriangle size={16} style={{ color: 'var(--pending-text)' }} />;
        }

        return (
          <div
            key={toast.id}
            style={{
              background: bg,
              border: `1px solid ${borderColor}`,
              borderRadius: 'var(--radius-sm)',
              padding: '10px 14px',
              boxShadow: 'var(--shadow-dropdown)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              animation: 'slideInRight 0.15s ease-out',
            }}
          >
            <div style={{ marginTop: '1px' }}>{icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '12px', color: 'var(--text-primary)' }}>
                {toast.title}
              </div>
              {toast.message && (
                <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {toast.message}
                </div>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                padding: '2px',
                display: 'flex',
              }}
            >
              <X size={13} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
