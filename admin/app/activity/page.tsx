'use client';

import { useState, useEffect } from 'react';
import { adminFetch } from '@/lib/api-client';

export default function ActivityPage() {
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    loadActivity();
  }, []);

  const loadActivity = async () => {
    try {
      const [orders, companies, pricingRules] = await Promise.all([
        adminFetch('/api/v1/orders').then(r => r.json()).catch(() => []),
        adminFetch('/api/v1/companies').then(r => r.json()).catch(() => []),
        adminFetch('/api/v1/pricing/rules').then(r => r.json()).catch(() => []),
      ]);
      
      const activities: any[] = [];
      orders.forEach((order: any) => {
        activities.push({
          type: 'order',
          message: `Order #${order.shopifyOrderNumber} created`,
          time: order.createdAt,
        });
      });
      companies.forEach((company: any) => {
        activities.push({
          type: 'company',
          message: `Company ${company.name} ${company.status}`,
          time: company.createdAt,
        });
      });
      pricingRules.forEach((rule: any) => {
        activities.push({
          type: 'pricing',
          message: `Pricing rule "${rule.name}" created`,
          time: rule.createdAt,
        });
      });
      
      activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      setActivities(activities.slice(0, 20));
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

