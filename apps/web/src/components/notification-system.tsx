'use client';

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
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="topbar-action-btn"
        aria-label={`Notifications: ${unreadCount} unread`}
        aria-expanded={isOpen}
        style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '4px' }}
      >
        <span aria-hidden="true" style={{ fontSize: '1rem' }}>
          🔔
        </span>
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              backgroundColor: '#ef4444',
              color: '#ffffff',
              fontSize: '0.65rem',
              fontWeight: 700,
              borderRadius: '9999px',
              padding: '1px 5px',
              minWidth: '16px',
              textAlign: 'center',
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          role="region"
          aria-label="Notification Center"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '360px',
            maxHeight: '480px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <strong style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>
                Notifications
              </strong>
              <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                {unreadCount}
              </span>
            </div>
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  padding: '2px 6px',
                }}
              >
                Clear all
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ overflowY: 'auto', flex: 1, padding: '8px' }}>
            {notifications.length === 0 ? (
              <div
                style={{
                  padding: '24px 16px',
                  textAlign: 'center',
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                }}
              >
                No active notifications.
              </div>
            ) : (
              notifications.map(notif => (
                <div
                  key={notif.id}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    marginBottom: '6px',
                    borderLeft: `3px solid ${
                      notif.severity === 'blocking'
                        ? '#ef4444'
                        : notif.severity === 'important'
                          ? '#f59e0b'
                          : '#3b82f6'
                    }`,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '4px',
                    }}
                  >
                    <span
                      className={`badge ${severityBadgeClass(notif.severity)}`}
                      style={{ fontSize: '0.65rem' }}
                    >
                      {notif.severity.toUpperCase()}
                    </span>
                    <button
                      onClick={() => dismissNotification(notif.id)}
                      aria-label="Dismiss notification"
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        lineHeight: 1,
                        padding: '2px',
                      }}
                    >
                      ×
                    </button>
                  </div>
                  <strong
                    style={{
                      fontSize: '0.825rem',
                      color: 'var(--text-main)',
                      display: 'block',
                      marginBottom: '2px',
                    }}
                  >
                    {notif.title}
                  </strong>
                  <p
                    style={{
                      margin: '0 0 6px',
                      fontSize: '0.775rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.35,
                    }}
                  >
                    {notif.message}
                  </p>
                  {notif.actionHref && notif.actionLabel && (
                    <Link
                      href={notif.actionHref}
                      onClick={() => setIsOpen(false)}
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--accent-cyan)',
                        textDecoration: 'none',
                        fontWeight: 600,
                        display: 'inline-block',
                      }}
                    >
                      {notif.actionLabel} →
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
