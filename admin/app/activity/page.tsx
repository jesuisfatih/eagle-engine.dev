'use client';

import { useState, useEffect } from 'react';

export default function ActivityPage() {
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    loadActivity();
  }, []);

  const loadActivity = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.eagledtfsupply.com';
      const response = await fetch(`${API_URL}/api/v1/analytics/dashboard`);
      const data = await response.json();
      // Mock activity from stats
      setActivities([
        { type: 'sync', message: 'Customers synced', time: new Date() },
        { type: 'order', message: '1 order created', time: new Date() },
      ]);
    } catch (err) {
      setActivities([]);
    }
  };

  return (
    <div>
      <h4 className="fw-bold mb-4">Activity Log</h4>

      <div className="card">
        <div className="card-body">
          <div className="timeline">
            {activities.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted mb-0">No activity yet</p>
              </div>
            ) : (
              activities.map((activity, i) => (
                <div key={i} className="timeline-item mb-3">
                  <span className={`timeline-point timeline-point-${activity.type === 'order' ? 'success' : 'primary'}`}></span>
                  <div className="timeline-event">
                    <div className="timeline-header mb-1">
                      <h6 className="mb-0">{activity.message}</h6>
                      <small className="text-muted">{new Date(activity.time).toLocaleString()}</small>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

