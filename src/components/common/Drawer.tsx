import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div
        className="drawer-content"
        style={width ? { width } : undefined}
        onClick={e => e.stopPropagation()}
      >
        <div className="drawer-header">
          <div>
            <div className="modal-title">{title}</div>
            {subtitle && (
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {subtitle}
              </div>
            )}
          </div>
          <button
            type="button"
            className="btn btn-sm btn-icon-only"
            onClick={onClose}
            aria-label="Close inspector"
          >
            <X size={14} />
          </button>
        </div>

        <div className="drawer-body">{children}</div>

        {footer && <div className="drawer-footer">{footer}</div>}
      </div>
    </div>
  );
};
