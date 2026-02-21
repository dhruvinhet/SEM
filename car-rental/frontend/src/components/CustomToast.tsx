import React from 'react';
import toast, { Toast } from 'react-hot-toast';
import { Car, CheckCircle, XCircle, AlertTriangle, Info, PartyPopper, CreditCard, Star, Bell } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info' | 'booking' | 'payment' | 'review' | 'celebration';

const TOAST_CONFIG: Record<ToastType, {
  icon: React.ElementType;
  bg: string;
  border: string;
  iconColor: string;
  glow: string;
}> = {
  success: {
    icon: CheckCircle,
    bg: 'bg-green-500/[0.08]',
    border: 'border-green-500/20',
    iconColor: 'text-green-400',
    glow: 'shadow-[0_0_20px_rgba(34,197,94,0.15)]',
  },
  error: {
    icon: XCircle,
    bg: 'bg-red-500/[0.08]',
    border: 'border-red-500/20',
    iconColor: 'text-red-400',
    glow: 'shadow-[0_0_20px_rgba(239,68,68,0.15)]',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-yellow-500/[0.08]',
    border: 'border-yellow-500/20',
    iconColor: 'text-yellow-400',
    glow: 'shadow-[0_0_20px_rgba(234,179,8,0.15)]',
  },
  info: {
    icon: Info,
    bg: 'bg-blue-500/[0.08]',
    border: 'border-blue-500/20',
    iconColor: 'text-blue-400',
    glow: 'shadow-[0_0_20px_rgba(59,130,246,0.15)]',
  },
  booking: {
    icon: Car,
    bg: 'bg-primary-500/[0.08]',
    border: 'border-primary-500/20',
    iconColor: 'text-primary-400',
    glow: 'shadow-[0_0_20px_rgba(255,68,51,0.15)]',
  },
  payment: {
    icon: CreditCard,
    bg: 'bg-neon-blue/[0.08]',
    border: 'border-neon-blue/20',
    iconColor: 'text-neon-blue',
    glow: 'shadow-[0_0_20px_rgba(0,212,255,0.15)]',
  },
  review: {
    icon: Star,
    bg: 'bg-yellow-500/[0.08]',
    border: 'border-yellow-500/20',
    iconColor: 'text-yellow-400',
    glow: 'shadow-[0_0_20px_rgba(234,179,8,0.15)]',
  },
  celebration: {
    icon: PartyPopper,
    bg: 'bg-neon-purple/[0.08]',
    border: 'border-neon-purple/20',
    iconColor: 'text-neon-purple',
    glow: 'shadow-[0_0_20px_rgba(168,85,247,0.15)]',
  },
};

function ToastContent({ t, type, message, title }: { t: Toast; type: ToastType; message: string; title?: string }) {
  const config = TOAST_CONFIG[type];
  const Icon = config.icon;

  return (
    <div
      className={`
        flex items-start gap-3 max-w-md px-4 py-3 rounded-2xl border backdrop-blur-xl
        ${config.bg} ${config.border} ${config.glow}
        ${t.visible ? 'animate-toast-enter' : 'animate-toast-exit'}
      `}
      style={{ background: 'rgba(22,23,31,0.92)' }}
    >
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${config.bg} ${config.border} border`}>
        <Icon className={`w-4 h-4 ${config.iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        {title && <p className="text-sm font-semibold text-white mb-0.5">{title}</p>}
        <p className="text-sm text-dark-300">{message}</p>
      </div>
      <button
        onClick={() => toast.dismiss(t.id)}
        className="text-dark-500 hover:text-white transition-colors flex-shrink-0 mt-0.5"
        aria-label="Dismiss"
      >
        <XCircle className="w-4 h-4" />
      </button>
    </div>
  );
}

/**
 * Custom themed toast functions — use instead of plain toast()
 */
export const customToast = {
  success: (message: string, title?: string) =>
    toast.custom((t) => <ToastContent t={t} type="success" message={message} title={title} />, { duration: 3000 }),

  error: (message: string, title?: string) =>
    toast.custom((t) => <ToastContent t={t} type="error" message={message} title={title} />, { duration: 4000 }),

  warning: (message: string, title?: string) =>
    toast.custom((t) => <ToastContent t={t} type="warning" message={message} title={title} />, { duration: 3500 }),

  info: (message: string, title?: string) =>
    toast.custom((t) => <ToastContent t={t} type="info" message={message} title={title} />, { duration: 3000 }),

  booking: (message: string, title = 'Booking Update') =>
    toast.custom((t) => <ToastContent t={t} type="booking" message={message} title={title} />, { duration: 4000 }),

  payment: (message: string, title = 'Payment') =>
    toast.custom((t) => <ToastContent t={t} type="payment" message={message} title={title} />, { duration: 4000 }),

  review: (message: string, title = 'Review') =>
    toast.custom((t) => <ToastContent t={t} type="review" message={message} title={title} />, { duration: 3000 }),

  celebration: (message: string, title = '🎉 Congrats!') =>
    toast.custom((t) => <ToastContent t={t} type="celebration" message={message} title={title} />, { duration: 4000 }),
};
