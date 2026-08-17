import React from 'react';

interface BadgeProps {
  status: string;
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ status, className = '', size = 'md' }) => {
  const norm = (status || '').toLowerCase().trim();

  let badgeClass = 'badge-neutral';

  if (
    norm === 'approved' ||
    norm === 'paid' ||
    norm === 'active' ||
    norm === 'reconciled' ||
    norm === 'matched' ||
    norm === 'auto-reconciled' ||
    norm === 'credit'
  ) {
    badgeClass = 'badge-approved';
  } else if (
    norm === 'rejected' ||
    norm === 'overdue' ||
    norm === 'critical' ||
    norm === 'debit' ||
    norm === 'unmatched'
  ) {
    badgeClass = 'badge-rejected';
  } else if (
    norm === 'pending' ||
    norm === 'pending approval' ||
    norm === 'under review' ||
    norm === 'review' ||
    norm === 'scheduled' ||
    norm === 'warning' ||
    norm === 'conflict'
  ) {
    badgeClass = 'badge-pending';
  } else if (norm === 'draft' || norm === 'sent' || norm === 'info' || norm === 'submitted') {
    badgeClass = 'badge-info';
  }

  const sizeStyle = size === 'sm' ? { fontSize: '10px', padding: '0px 5px', height: '18px' } : {};

  return (
    <span className={`badge ${badgeClass} ${className}`} style={sizeStyle}>
      {status}
    </span>
  );
};
