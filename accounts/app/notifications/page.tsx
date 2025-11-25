'use client';

import { useState, useEffect } from 'react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.eagledtfsupply.com';
      const response = await fetch(`${API_URL}/api/v1/notifications`);
      const data = await response.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      setNotifications([]);
    }
  };

  return (
    <div>
      <h4 className="fw-bold mb-4">Notifications</h4>

      <div className="card">
        <div className="card-body">
          {notifications.length === 0 ? (
            <div className="text-center py-5">
              <i className="ti ti-bell-off ti-3x text-muted mb-3"></i>
              <h5>No notifications</h5>
              <p className="text-muted">You're all caught up!</p>
            </div>
          ) : (
            <div className="list-group list-group-flush">
              {notifications.map((notif) => (
                <div key={notif.id} className="list-group-item">
                  <div className="d-flex">
                    <div className="flex-shrink-0">
                      <i className={`ti ti-${notif.type === 'order' ? 'shopping-cart' : 'bell'} text-primary`}></i>
                    </div>
                    <div className="flex-grow-1 ms-3">
                      <h6 className="mb-1">{notif.title}</h6>
                      <p className="mb-0 small text-muted">{notif.message}</p>
                      <small className="text-muted">{new Date(notif.createdAt).toLocaleString()}</small>
                    </div>
                    {!notif.isRead && (
                      <span className="badge bg-primary rounded-pill">New</span>
                    )}
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

