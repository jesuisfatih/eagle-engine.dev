'use client';

import { useState, useEffect } from 'react';
import { accountsFetch } from '@/lib/api-client';
import { formatRelativeTime } from '@/lib/utils';
import type { NotificationType } from '@/components/notifications/NotificationCenter';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  actionLabel?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingRead, setMarkingRead] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | NotificationType>('all');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await accountsFetch('/api/v1/notifications');
      const data = await response.json();
      setNotifications(Array.isArray(data) ? data : data.notifications || []);
    } catch (err) {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      setMarkingRead(id);
      const response = await accountsFetch(`/api/v1/notifications/${id}/read`, { method: 'PUT' });
      if (response.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? {...n, isRead: true} : n));
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    } finally {
      setMarkingRead(null);
    }
  };

  const markAllAsRead = async () => {
    try {
      setMarkingRead('all');
      const response = await accountsFetch('/api/v1/notifications/read-all', { method: 'PUT' });
      if (response.ok) {
        setNotifications(prev => prev.map(n => ({...n, isRead: true})));
      }
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    } finally {
      setMarkingRead(null);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const response = await accountsFetch(`/api/v1/notifications/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const getNotificationConfig = (type: NotificationType) => {
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
  };

  const getPriorityBadge = (priority?: string) => {
    if (!priority || priority === 'normal') return null;
    const configs: Record<string, { label: string; class: string }> = {
      low: { label: 'Low', class: 'bg-secondary' },
      high: { label: 'High', class: 'bg-warning' },
      urgent: { label: 'Urgent', class: 'bg-danger' },
    };
    const config = configs[priority];
    return config ? <span className={`badge ${config.class} ms-2 small`}>{config.label}</span> : null;
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.isRead;
    return n.type === filter;
  });

  const filters: Array<{ key: 'all' | 'unread' | NotificationType; label: string; icon: string }> = [
    { key: 'all', label: 'All', icon: 'bell' },
    { key: 'unread', label: 'Unread', icon: 'bell-ringing' },
    { key: 'order', label: 'Orders', icon: 'shopping-cart' },
    { key: 'quote', label: 'Quotes', icon: 'file-invoice' },
    { key: 'promo', label: 'Promos', icon: 'discount' },
    { key: 'system', label: 'System', icon: 'settings' },
  ];

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Notifications</h4>
          <p className="mb-0 text-muted">
            {unreadCount > 0 
              ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
              : 'All caught up!'
            }
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            className="btn btn-outline-primary"
            onClick={markAllAsRead}
            disabled={markingRead === 'all'}
          >
            {markingRead === 'all' ? (
              <span className="spinner-border spinner-border-sm me-2"></span>
            ) : (
              <i className="ti ti-checks me-1"></i>
            )}
            Mark all as read
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="mb-0 opacity-75">Total</p>
                  <h3 className="mb-0">{notifications.length}</h3>
                </div>
                <i className="ti ti-bell fs-1 opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="mb-0 text-muted">Unread</p>
                  <h3 className="mb-0 text-danger">{unreadCount}</h3>
                </div>
                <i className="ti ti-bell-ringing fs-1 text-danger opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="mb-0 text-muted">Orders</p>
                  <h3 className="mb-0">{notifications.filter(n => n.type === 'order').length}</h3>
                </div>
                <i className="ti ti-shopping-cart fs-1 text-info opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="mb-0 text-muted">Promos</p>
                  <h3 className="mb-0">{notifications.filter(n => n.type === 'promo').length}</h3>
                </div>
                <i className="ti ti-discount fs-1 text-success opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        {filters.map(f => (
          <button
            key={f.key}
            className={`btn btn-sm ${filter === f.key ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setFilter(f.key)}
          >
            <i className={`ti ti-${f.icon} me-1`}></i>
            {f.label}
            {f.key === 'unread' && unreadCount > 0 && (
              <span className="badge bg-danger ms-1">{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
              <p className="mt-3 text-muted">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-5">
              <i className="ti ti-bell-off ti-3x text-muted mb-3"></i>
              <h5>No notifications</h5>
              <p className="text-muted">
                {filter === 'unread' 
                  ? 'You have no unread notifications' 
                  : 'No notifications in this category'
                }
              </p>
            </div>
          ) : (
            <div className="notifications-list">
              {filteredNotifications.map((notification) => {
                const config = getNotificationConfig(notification.type);
                
                return (
                  <div 
                    key={notification.id}
                    className={`card mb-2 ${!notification.isRead ? 'border-primary border-start border-3' : ''}`}
                  >
                    <div className="card-body py-3">
                      <div className="d-flex gap-3">
                        {/* Icon */}
                        <div 
                          className={`rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 ${config.bgClass}`}
                          style={{ width: 44, height: 44 }}
                        >
                          <i className={`ti ti-${config.icon} fs-5 text-white`}></i>
                        </div>

                        {/* Content */}
                        <div className="flex-grow-1 min-width-0">
                          <div className="d-flex justify-content-between align-items-start">
                            <div className="flex-grow-1">
                              <div className="d-flex align-items-center gap-2 mb-1">
                                <h6 className={`mb-0 ${!notification.isRead ? 'fw-bold' : ''}`}>
                                  {notification.title}
                                </h6>
                                {!notification.isRead && (
                                  <span className="badge bg-primary small">NEW</span>
                                )}
                                {getPriorityBadge(notification.priority)}
                              </div>
                              <p className="text-muted mb-1">{notification.message}</p>
                              <div className="d-flex align-items-center gap-3">
                                <small className="text-muted">
                                  {formatRelativeTime(notification.createdAt)}
                                </small>
                                {notification.actionUrl && (
                                  <a href={notification.actionUrl} className="small">
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
                                  onClick={() => markAsRead(notification.id)}
                                  disabled={markingRead === notification.id}
                                  title="Mark as read"
                                >
                                  {markingRead === notification.id ? (
                                    <span className="spinner-border spinner-border-sm"></span>
                                  ) : (
                                    <i className="ti ti-check"></i>
                                  )}
                                </button>
                              )}
                              <button
                                className="btn btn-sm btn-text-secondary"
                                onClick={() => deleteNotification(notification.id)}
                                title="Delete"
                              >
                                <i className="ti ti-trash"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

