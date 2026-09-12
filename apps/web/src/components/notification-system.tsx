'use client';

import { Button, Badge, BellIcon, XIcon, ArrowRightIcon } from '@/components/ui';

import React, { useState, createContext, useContext } from 'react';
import Link from 'next/link';

// ==========================================
// Actionable Notification System (§204–205)
//
// Invariant (§205):
// Notifications inform and navigate. Notifications NEVER alter scientific state,
// change evidence tiers, re-rank candidates, or execute clinical actions automatically.
// ==========================================

export type NotificationSeverity = 'info' | 'important' | 'blocking';

export type NotificationCategory =
  | 'measurement_changed'
  | 'slate_stale'
  | 'evidence_release'
  | 'decision_signed'
  | 'module_authority'
  | 'system';

export interface ShellNotification {
  readonly id: string;
  readonly title: string;
  readonly message: string;
  readonly severity: NotificationSeverity;
  readonly category: NotificationCategory;
  readonly caseId?: string | undefined;
  readonly actionLabel?: string | undefined;
  readonly actionHref?: string | undefined;
  readonly timestamp: string;
  readonly isDismissed?: boolean | undefined;
}

interface NotificationContextValue {
  notifications: readonly ShellNotification[];
  unreadCount: number;
  addNotification: (notification: Omit<ShellNotification, 'id' | 'timestamp'>) => void;
  dismissNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return ctx;
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<ShellNotification[]>([
    {
      id: 'notif-init-1',
      title: 'Target Slate Current',
      message:
        'Active Target Slate is synchronized with approved clinical context and qualified measurements.',
      severity: 'info',
      category: 'system',
      timestamp: new Date().toISOString(),
    },
  ]);

  const addNotification = (notif: Omit<ShellNotification, 'id' | 'timestamp'>) => {
    const newNotif: ShellNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    setNotifications(prev => [newNotif, ...prev.slice(0, 19)]); // Keep last 20
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.isDismissed).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        dismissNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

// ==========================================
// Notification Bell & Dropdown Component
// ==========================================

export function NotificationBell() {
  const { notifications, unreadCount, dismissNotification, clearAll } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const severityBadgeClass = (sev: NotificationSeverity) => {
    switch (sev) {
      case 'blocking':
        return 'badge-reliability-unusable';
      case 'important':
        return 'badge-tier3';
      case 'info':
      default:
        return 'badge-neutral';
    }
  };

  return (
    <div className="notification-container">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="topbar-action-btn relative flex items-center gap-1"
        aria-label={`Notifications: ${unreadCount} unread`}
        aria-expanded={isOpen}
      >
        <span aria-hidden="true" className="inline-flex items-center">
          <BellIcon size={16} />
        </span>
        {unreadCount > 0 && (
          <Badge variant="danger" size="sm" className="notification-badge-count">
            {unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div role="region" aria-label="Notification Center" className="notification-popover">
          {/* Header */}
          <div className="notification-header">
            <div className="flex items-center gap-1.5">
              <strong className="text-sm text-primary">Notifications</strong>
              <Badge variant="neutral" className="text-xs">
                {unreadCount}
              </Badge>
            </div>
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="text-muted text-xs px-1.5 py-0.5"
              >
                Clear all
              </Button>
            )}
          </div>

          {/* List */}
          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="py-6 px-4 text-center text-muted text-sm">
                No active notifications.
              </div>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif.id}
                  className={`notification-item ${
                    notif.severity === 'blocking'
                      ? 'notification-item-blocking'
                      : notif.severity === 'important'
                        ? 'notification-item-important'
                        : 'notification-item-info'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <Badge className={`${severityBadgeClass(notif.severity)} text-xs`}>
                      {notif.severity.toUpperCase()}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissNotification(notif.id)}
                      aria-label="Dismiss notification"
                      className="text-muted p-0.5 inline-flex items-center"
                    >
                      <XIcon size={12} />
                    </Button>
                  </div>
                  <strong className="text-sm text-primary block mb-0.5">{notif.title}</strong>
                  <p className="m-0 mb-1.5 text-xs text-secondary leading-tight">{notif.message}</p>
                  {notif.actionHref && notif.actionLabel && (
                    <Link
                      href={notif.actionHref}
                      onClick={() => setIsOpen(false)}
                      className="text-xs text-cyan font-semibold inline-block"
                    >
                      {notif.actionLabel} <ArrowRightIcon size={14} className="ml-1 inline" />
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
