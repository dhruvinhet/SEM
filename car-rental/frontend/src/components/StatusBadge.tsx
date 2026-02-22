import { BookingStatus } from '../types';

interface StatusConfig {
  label: string;
  className: string;
  dot: string;
}

const STATUS_CONFIG: Record<string, StatusConfig> = {
  draft:     { label: 'Draft',     className: 'badge-neutral',  dot: '#9ea0a8' },
  pending:   { label: 'Pending',   className: 'badge-warning',  dot: '#fbbf24' },
  held:      { label: 'Held',      className: 'badge-info',     dot: '#00d4ff' },
  confirmed: { label: 'Confirmed', className: 'badge-success',  dot: '#00ff87' },
  active:    { label: 'Active',    className: 'badge-blue',     dot: '#00d4ff' },
  completed: { label: 'Completed', className: 'badge-success',  dot: '#00ff87' },
  cancelled: { label: 'Cancelled', className: 'badge-danger',   dot: '#ef4444' },
  disputed:  { label: 'Disputed',  className: 'badge-warning',  dot: '#fbbf24' },
  refunded:  { label: 'Refunded',  className: 'badge-neutral',  dot: '#9ea0a8' },
  archived:  { label: 'Archived',  className: 'badge-neutral',  dot: '#9ea0a8' },
  available: { label: 'Available', className: 'badge-success',  dot: '#00ff87' },
  rented:    { label: 'Rented',    className: 'badge-info',     dot: '#00d4ff' },
  maintenance: { label: 'Maintenance', className: 'badge-warning', dot: '#fbbf24' },
  unlisted:  { label: 'Unlisted',  className: 'badge-neutral',  dot: '#9ea0a8' },
};

interface StatusBadgeProps {
  status: BookingStatus | string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: 'badge-neutral',
    dot: '#9ea0a8',
  };

  return (
    <span className={`${config.className} inline-flex items-center gap-1.5`}>
      <span
        className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: config.dot }}
      />
      {config.label}
    </span>
  );
}
