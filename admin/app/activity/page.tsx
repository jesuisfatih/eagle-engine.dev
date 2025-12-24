'use client';

import { useState, useEffect } from 'react';
import { adminFetch } from '@/lib/api-client';
import type { Order, CompanyWithCounts, PricingRuleWithCompany } from '@/types';

interface ActivityItem {
  type: 'order' | 'company' | 'pricing';
  message: string;
  time: string;
}

export default function ActivityPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    loadActivity();
  }, []);

  const loadActivity = async () => {
    try {
      const [ordersData, companiesData, pricingRulesData] = await Promise.all([
        adminFetch('/api/v1/orders').then(r => r.json()).catch(() => []),
        adminFetch('/api/v1/companies').then(r => r.json()).catch(() => ({ data: [] })),
        adminFetch('/api/v1/pricing/rules').then(r => r.json()).catch(() => []),
      ]);
      
      // Handle different response formats
      const orders = Array.isArray(ordersData) ? ordersData : ordersData.data || [];
      const companies = Array.isArray(companiesData) ? companiesData : companiesData.data || [];
      const pricingRules = Array.isArray(pricingRulesData) ? pricingRulesData : pricingRulesData.data || [];
      
      const activityList: ActivityItem[] = [];
      (orders as Order[]).forEach((order) => {
        activityList.push({
          type: 'order',
          message: `Order #${order.orderNumber} created`,
          time: order.createdAt,
        });
      });
      (companies as CompanyWithCounts[]).forEach((company) => {
        activityList.push({
          type: 'company',
          message: `Company ${company.name} ${company.status}`,
          time: company.createdAt,
        });
      });
      (pricingRules as PricingRuleWithCompany[]).forEach((rule) => {
        activityList.push({
          type: 'pricing',
          message: `Pricing rule "${rule.name}" created`,
          time: rule.createdAt,
        });
      });
      
      activityList.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      setActivities(activityList.slice(0, 20));
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

