'use client';

import { useState } from 'react';
import { formatRelativeTime } from '@/lib/utils';

// Notification types
export type NotificationType = 
  | 'order'
  | 'quote'
  | 'team'
  | 'product'
  | 'promo'
  | 'system'
  | 'approval'
  | 'payment'
  | 'shipping'
  | 'alert';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

interface Notification {
  id: string;
  type: NotificationType;
  priority?: NotificationPriority;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, unknown>;
}

// Notification Center Component
interface NotificationCenterProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => Promise<void>;
  onMarkAllAsRead: () => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export function NotificationCenter({ 
  notifications, 
  onMarkAsRead, 
  onMarkAllAsRead,
  onDelete,
  isLoading = false 
}: NotificationCenterProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | NotificationType>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unread') return !n.isRead;
    return n.type === activeFilter;
  });

  const handleMarkAsRead = async (id: string) => {
    setProcessingId(id);
    try {
      await onMarkAsRead(id);
    } finally {
      setProcessingId(null);
    }
  };

  const filters: Array<{ key: 'all' | 'unread' | NotificationType; label: string; icon: string }> = [
    { key: 'all', label: 'All', icon: 'bell' },
    { key: 'unread', label: 'Unread', icon: 'bell-ringing' },
    { key: 'order', label: 'Orders', icon: 'shopping-cart' },
    { key: 'quote', label: 'Quotes', icon: 'file-invoice' },
    { key: 'promo', label: 'Promos', icon: 'discount' },
    { key: 'system', label: 'System', icon: 'settings' },
  ];

  return (
    <div className="notification-center">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Notifications</h4>
          <p className="text-muted mb-0">
            {unreadCount > 0 
              ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
              : 'All caught up!'
            }
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={onMarkAllAsRead}
            disabled={processingId === 'all'}
          >
            {processingId === 'all' ? (
              <span className="spinner-border spinner-border-sm me-1"></span>
            ) : (
              <i className="ti ti-checks me-1"></i>
            )}
            Mark all as read
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        {filters.map(filter => (
          <button
            key={filter.key}
            className={`btn btn-sm ${activeFilter === filter.key ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setActiveFilter(filter.key)}
          >
            <i className={`ti ti-${filter.icon} me-1`}></i>
            {filter.label}
            {filter.key === 'unread' && unreadCount > 0 && (
              <span className="badge bg-danger ms-1">{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {isLoading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary"></div>
          <p className="mt-3 text-muted">Loading notifications...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="text-center py-5">
          <i className="ti ti-bell-off ti-3x text-muted mb-3"></i>
          <h5>No notifications</h5>
          <p className="text-muted">
            {activeFilter === 'unread' 
              ? 'You have no unread notifications' 
              : 'No notifications in this category'
            }
          </p>
        </div>
      ) : (
        <div className="notifications-list">
          {filteredNotifications.map(notification => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
              onDelete={onDelete}
              isProcessing={processingId === notification.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Single notification item
interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete?: (id: string) => Promise<void>;
  isProcessing?: boolean;
  compact?: boolean;
}

export function NotificationItem({ 
  notification, 
  onMarkAsRead, 
  onDelete,
  isProcessing = false,
  compact = false 
}: NotificationItemProps) {
  const config = getNotificationConfig(notification.type);
  const priorityConfig = getPriorityConfig(notification.priority);

  return (
    <div 
      className={`card mb-2 ${!notification.isRead ? 'border-primary border-start border-3' : ''}`}
    >
      <div className={`card-body ${compact ? 'py-2' : ''}`}>
        <div className="d-flex gap-3">
          {/* Icon */}
          <div 
            className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 ${config.bgClass}`}
            style={{ width: compact ? 36 : 44, height: compact ? 36 : 44 }}
          >
            <i className={`ti ti-${config.icon} ${compact ? '' : 'fs-5'} text-white`}></i>
          </div>

          {/* Content */}
          <div className="flex-grow-1 min-width-0">
            <div className="d-flex justify-content-between align-items-start">
              <div className="flex-grow-1">
                <div className="d-flex align-items-center gap-2 mb-1">
                  <h6 className={`mb-0 ${!notification.isRead ? 'fw-bold' : ''}`}>
                    {notification.title}
                  </h6>
                  {notification.priority && notification.priority !== 'normal' && (
                    <span className={`badge ${priorityConfig.class} small`}>
                      {priorityConfig.label}
                    </span>
                  )}
                </div>
                <p className={`text-muted mb-1 ${compact ? 'small' : ''}`}>
                  {notification.message}
                </p>
                <div className="d-flex align-items-center gap-3">
                  <small className="text-muted">
                    {formatRelativeTime(notification.createdAt)}
                  </small>
                  {notification.actionUrl && (
                    <a 
                      href={notification.actionUrl} 
                      className="small"
                    >
                      {notification.actionLabel || 'View'} →
                    </a>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="d-flex gap-1 flex-shrink-0">
                {!notification.isRead && (
                  <button
                    className="btn btn-sm btn-text-primary"
                    onClick={() => onMarkAsRead(notification.id)}
                    disabled={isProcessing}
                    title="Mark as read"
                  >
                    {isProcessing ? (
                      <span className="spinner-border spinner-border-sm"></span>
                    ) : (
                      <i className="ti ti-check"></i>
                    )}
                  </button>
                )}
                {onDelete && (
                  <button
                    className="btn btn-sm btn-text-secondary"
                    onClick={() => onDelete(notification.id)}
                    title="Delete"
                  >
                    <i className="ti ti-trash"></i>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Notification dropdown for header
interface NotificationDropdownProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => Promise<void>;
  onViewAll: () => void;
  maxItems?: number;
}

export function NotificationDropdown({ 
  notifications, 
  onMarkAsRead, 
  onViewAll,
  maxItems = 5 
}: NotificationDropdownProps) {
  const unreadNotifications = notifications.filter(n => !n.isRead);
  const displayNotifications = unreadNotifications.slice(0, maxItems);

  return (
    <div className="dropdown">
      <button
        type="button"
        className="btn btn-icon position-relative"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        <i className="ti ti-bell"></i>
        {unreadNotifications.length > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {unreadNotifications.length > 99 ? '99+' : unreadNotifications.length}
          </span>
        )}
      </button>
      <div className="dropdown-menu dropdown-menu-end" style={{ width: 360, maxHeight: 400, overflowY: 'auto' }}>
        <div className="px-3 py-2 border-bottom d-flex justify-content-between align-items-center">
          <h6 className="mb-0">Notifications</h6>
          {unreadNotifications.length > 0 && (
            <span className="badge bg-primary">{unreadNotifications.length} new</span>
          )}
        </div>
        
        {displayNotifications.length === 0 ? (
          <div className="px-3 py-4 text-center text-muted">
            <i className="ti ti-bell-off mb-2"></i>
            <p className="mb-0 small">No new notifications</p>
          </div>
        ) : (
          <div className="px-2 py-2">
            {displayNotifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={onMarkAsRead}
                compact
              />
            ))}
          </div>
        )}
        
        <div className="px-3 py-2 border-top text-center">
          <button className="btn btn-link btn-sm" onClick={onViewAll}>
            View all notifications
          </button>
        </div>
      </div>
    </div>
  );
}

// Notification toast for real-time updates
interface NotificationToastProps {
  notification: Notification;
  onClose: () => void;
  onAction?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export function NotificationToast({ 
  notification, 
  onClose, 
  onAction,
  autoClose = true,
  autoCloseDelay = 5000 
}: NotificationToastProps) {
  const config = getNotificationConfig(notification.type);

  // Auto close effect handled by parent

  return (
    <div 
      className="toast show position-fixed" 
      style={{ top: 20, right: 20, zIndex: 1050, minWidth: 300 }}
      role="alert"
    >
      <div className="toast-header">
        <span className={`badge ${config.bgClass} me-2`}>
          <i className={`ti ti-${config.icon}`}></i>
        </span>
        <strong className="me-auto">{notification.title}</strong>
        <small>{formatRelativeTime(notification.createdAt)}</small>
        <button type="button" className="btn-close" onClick={onClose}></button>
      </div>
      <div className="toast-body">
        {notification.message}
        {(notification.actionUrl || onAction) && (
          <div className="mt-2 pt-2 border-top">
            <a 
              href={notification.actionUrl || '#'} 
              className="btn btn-primary btn-sm"
              onClick={(e) => {
                if (onAction) {
                  e.preventDefault();
                  onAction();
                }
              }}
            >
              {notification.actionLabel || 'View Details'}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

// Notification preferences component
interface NotificationPreference {
  type: NotificationType;
  email: boolean;
  push: boolean;
  inApp: boolean;
}

interface NotificationPreferencesProps {
  preferences: NotificationPreference[];
  onUpdate: (preferences: NotificationPreference[]) => Promise<void>;
  isSaving?: boolean;
}

export function NotificationPreferences({ 
  preferences, 
  onUpdate,
  isSaving = false 
}: NotificationPreferencesProps) {
  const [localPrefs, setLocalPrefs] = useState<NotificationPreference[]>(preferences);

  const handleToggle = (type: NotificationType, channel: 'email' | 'push' | 'inApp') => {
    setLocalPrefs(prev => prev.map(pref => 
      pref.type === type ? { ...pref, [channel]: !pref[channel] } : pref
    ));
  };

  const handleSave = () => {
    onUpdate(localPrefs);
  };

  const typeLabels: Record<NotificationType, string> = {
    order: 'Order Updates',
    quote: 'Quote Notifications',
    team: 'Team Activity',
    product: 'Product Updates',
    promo: 'Promotions & Offers',
    system: 'System Notifications',
    approval: 'Approval Requests',
    payment: 'Payment Notifications',
    shipping: 'Shipping Updates',
    alert: 'Important Alerts',
  };

  return (
    <div className="card">
      <div className="card-header">
        <h6 className="mb-0">
          <i className="ti ti-settings me-2"></i>
          Notification Preferences
        </h6>
      </div>
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table mb-0">
            <thead>
              <tr>
                <th>Notification Type</th>
                <th className="text-center">Email</th>
                <th className="text-center">Push</th>
                <th className="text-center">In-App</th>
              </tr>
            </thead>
            <tbody>
              {localPrefs.map(pref => (
                <tr key={pref.type}>
                  <td>{typeLabels[pref.type] || pref.type}</td>
                  <td className="text-center">
                    <div className="form-check form-switch d-inline-block">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={pref.email}
                        onChange={() => handleToggle(pref.type, 'email')}
                      />
                    </div>
                  </td>
                  <td className="text-center">
                    <div className="form-check form-switch d-inline-block">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={pref.push}
                        onChange={() => handleToggle(pref.type, 'push')}
                      />
                    </div>
                  </td>
                  <td className="text-center">
                    <div className="form-check form-switch d-inline-block">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={pref.inApp}
                        onChange={() => handleToggle(pref.type, 'inApp')}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="card-footer text-end">
        <button 
          className="btn btn-primary"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
              Saving...
            </>
          ) : (
            <>
              <i className="ti ti-check me-1"></i>
              Save Preferences
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// Helper functions
function getNotificationConfig(type: NotificationType) {
  const configs: Record<NotificationType, { icon: string; bgClass: string }> = {
    order: { icon: 'shopping-cart', bgClass: 'bg-primary' },
    quote: { icon: 'file-invoice', bgClass: 'bg-info' },
    team: { icon: 'users', bgClass: 'bg-purple' },
    product: { icon: 'package', bgClass: 'bg-warning' },
    promo: { icon: 'discount', bgClass: 'bg-success' },
    system: { icon: 'settings', bgClass: 'bg-secondary' },
    approval: { icon: 'checklist', bgClass: 'bg-warning' },
    payment: { icon: 'credit-card', bgClass: 'bg-success' },
    shipping: { icon: 'truck', bgClass: 'bg-info' },
    alert: { icon: 'alert-triangle', bgClass: 'bg-danger' },
  };
  return configs[type] || { icon: 'bell', bgClass: 'bg-secondary' };
}

function getPriorityConfig(priority?: NotificationPriority) {
  const configs: Record<NotificationPriority, { label: string; class: string }> = {
    low: { label: 'Low', class: 'bg-secondary' },
    normal: { label: 'Normal', class: 'bg-info' },
    high: { label: 'High', class: 'bg-warning' },
    urgent: { label: 'Urgent', class: 'bg-danger' },
  };
  return configs[priority || 'normal'];
}
