import React from 'react';
import { AlertTriangle, RefreshCw, Inbox } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ title = 'Something went wrong', message = 'Please try again later.', onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-5">
        <AlertTriangle className="w-7 h-7 text-red-400" />
      </div>
      <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
      <p className="text-sm text-dark-400 max-w-xs mb-6">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary text-sm !rounded-full">
          <RefreshCw className="w-4 h-4" /> Try again
        </button>
      )}
    </div>
  );
}

interface EmptyStateProps {
  title?: string;
  message?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({
  title = 'Nothing here yet',
  message,
  description,
  icon,
  action,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  const text = message || description || 'Check back later!';
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <div className="w-16 h-16 bg-dark-800/60 rounded-full flex items-center justify-center mb-5">
        {icon || <Inbox className="w-7 h-7 text-dark-400" />}
      </div>
      <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
      <p className="text-sm text-dark-400 max-w-xs mb-6">{text}</p>
      {action}
      {!action && actionLabel && actionHref && (
        <a href={actionHref} className="btn-primary text-sm !rounded-full">{actionLabel}</a>
      )}
    </div>
  );
}
