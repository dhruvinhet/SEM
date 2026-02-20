import React from 'react';
import type { BookingStatus } from '../types';

const STATUS_CONFIG: Record<string, { label: string; className: string; dot: string }> = {
  draft: { label: 'Draft', className: 'badge-neutral', dot: 'bg-dark-300' },
  pending: { label: 'Pending', className: 'badge-warning', dot: 'bg-amber-500' },
  held: { label: 'On Hold', className: 'badge-warning', dot: 'bg-amber-500' },
  confirmed: { label: 'Confirmed', className: 'badge-success', dot: 'bg-accent-500' },
  active: { label: 'Active', className: 'badge-info', dot: 'bg-blue-500' },
  completed: { label: 'Completed', className: 'badge-success', dot: 'bg-accent-500' },
  cancelled: { label: 'Cancelled', className: 'badge-danger', dot: 'bg-red-500' },
  disputed: { label: 'Disputed', className: 'badge-danger', dot: 'bg-red-500' },
  refunded: { label: 'Refunded', className: 'badge-info', dot: 'bg-blue-500' },
  archived: { label: 'Archived', className: 'badge-neutral', dot: 'bg-dark-300' },
};

interface Props {
  status: BookingStatus | string;
}

export default function StatusBadge({ status }: Props) {
  const config = STATUS_CONFIG[status] || { label: status, className: 'badge-neutral', dot: 'bg-dark-300' };
  return (
    <span className={config.className}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
