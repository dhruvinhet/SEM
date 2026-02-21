import React, { useEffect, useState } from 'react';
import { notificationsAPI } from '../lib/api';
import { EmptyState, ErrorState } from '../components/States';
import ScrollReveal from '../components/ScrollReveal';
import { Bell, Check, CheckCheck, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { customToast } from '../components/CustomToast';
import type { Notification } from '../types';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationsAPI.list({ page, limit: 20 });
      setNotifications(res.data.items || res.data.notifications || res.data);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [page]);

  const handleMarkAllRead = async () => {
    try {
      const unreadIds = notifications.filter((n) => !n.read).map((n) => n._id);
      if (unreadIds.length === 0) return;
      await notificationsAPI.markRead(unreadIds);
      customToast.success('All marked as read');
      loadNotifications();
    } catch {
      customToast.error('Failed to mark as read');
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await notificationsAPI.markRead([id]);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      customToast.error('Failed');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'booking_confirmed': return '✅';
      case 'booking_cancelled': return '❌';
      case 'payment_received': return '💰';
      case 'review_received': return '⭐';
      case 'hold_expiring': return '⏰';
      default: return '🔔';
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ScrollReveal>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-dark-400 text-sm mt-1">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="btn-ghost text-sm flex items-center gap-1">
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>
      </ScrollReveal>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-dark-800 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-dark-800 rounded w-3/4" />
                  <div className="h-3 bg-dark-800 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={loadNotifications} />
      ) : notifications.length === 0 ? (
        <EmptyState title="No notifications" description="You're all caught up!" />
      ) : (
        <div className="space-y-2">
          {notifications.map((n, idx) => (
            <ScrollReveal key={n._id} delay={idx * 50}>
            <div
              className={`card p-4 transition-colors cursor-pointer ${
                !n.read ? 'bg-primary-500/5 border-primary-500/20' : ''
              }`}
              onClick={() => !n.read && handleMarkRead(n._id)}
            >
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-dark-800/60 flex items-center justify-center text-lg flex-shrink-0">
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!n.read ? 'font-semibold text-white' : 'text-dark-300'}`}>
                    {n.message}
                  </p>
                  <p className="text-xs text-dark-300 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {n.createdAt ? formatDistanceToNow(new Date(n.createdAt), { addSuffix: true }) : ''}
                  </p>
                </div>
                {!n.read && (
                  <div className="w-2.5 h-2.5 rounded-full bg-primary-500 flex-shrink-0 mt-1.5" />
                )}
              </div>
            </div>
            </ScrollReveal>
          ))}

          {/* Pagination */}
          <div className="flex items-center justify-between pt-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="btn-ghost text-sm"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Previous
            </button>
            <span className="text-sm text-dark-400">Page {page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={notifications.length < 20}
              className="btn-ghost text-sm"
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
