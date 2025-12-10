'use client';

import { useState, useEffect } from 'react';
import { accountsFetch } from '@/lib/api-client';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingRead, setMarkingRead] = useState<string | null>(null);

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
      const response = await accountsFetch(`/api/v1/notifications/${id}/read`, {
        method: 'PUT',
      });
      
      if (response.ok) {
        // Update local state
        setNotifications(prev => 
          prev.map(n => n.id === id ? {...n, isRead: true} : n)
        );
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
      const response = await accountsFetch('/api/v1/notifications/read-all', {
        method: 'PUT',
      });
      
      if (response.ok) {
        // Update local state
        setNotifications(prev => prev.map(n => ({...n, isRead: true})));
      }
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    } finally {
      setMarkingRead(null);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order': return 'shopping-cart';
      case 'quote': return 'file-invoice';
      case 'team': return 'users';
      case 'product': return 'package';
      case 'promo': return 'discount';
      case 'system': return 'settings';
      default: return 'bell';
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-0">Notifications</h4>
          {unreadCount > 0 && (
            <small className="text-muted">{unreadCount} unread</small>
          )}
        </div>
        {unreadCount > 0 && (
          <button 
            className="btn btn-label-primary"
            onClick={markAllAsRead}
            disabled={markingRead === 'all'}
          >
            {markingRead === 'all' ? (
              <span className="spinner-border spinner-border-sm me-2"></span>
            ) : (
              <i className="ti ti-checks me-1"></i>
            )}
            Mark All Read
          </button>
        )}
      </div>

      <div className="card">
        <div className="card-body">
          {notifications.length === 0 ? (
            <div className="text-center py-5">
              <i className="ti ti-bell-off fs-1 text-muted mb-3 d-block"></i>
              <h5>No notifications</h5>
              <p className="text-muted">You're all caught up!</p>
            </div>
          ) : (
            <div className="list-group list-group-flush">
              {notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`list-group-item ${!notif.isRead ? 'bg-light-subtle' : ''}`}
                >
                  <div className="d-flex">
                    <div className="flex-shrink-0">
                      <div className={`avatar avatar-sm ${!notif.isRead ? 'bg-label-primary' : 'bg-label-secondary'}`}>
                        <i className={`ti ti-${getNotificationIcon(notif.type)}`}></i>
                      </div>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <div className="d-flex justify-content-between align-items-start">
                        <h6 className={`mb-1 ${!notif.isRead ? 'fw-bold' : ''}`}>
                          {notif.title}
                          {!notif.isRead && (
                            <span className="badge bg-primary ms-2" style={{fontSize: '0.6rem'}}>NEW</span>
                          )}
                        </h6>
                        <small className="text-muted text-nowrap ms-2">
                          {new Date(notif.createdAt).toLocaleDateString()}
                        </small>
                      </div>
                      <p className="mb-1 small text-muted">{notif.message}</p>
                      <div className="d-flex align-items-center gap-2">
                        <small className="text-muted">
                          {new Date(notif.createdAt).toLocaleTimeString()}
                        </small>
                        {!notif.isRead && (
                          <button
                            onClick={() => markAsRead(notif.id)}
                            className="btn btn-sm btn-link text-primary p-0"
                            disabled={markingRead === notif.id}
                          >
                            {markingRead === notif.id ? (
                              <span className="spinner-border spinner-border-sm"></span>
                            ) : (
                              'Mark as read'
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

