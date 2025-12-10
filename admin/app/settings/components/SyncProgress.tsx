'use client';

import { useState, useEffect } from 'react';
import { adminFetch } from '@/lib/api-client';

export default function SyncProgress() {
  const [progress, setProgress] = useState({ customers: 0, products: 0, orders: 0 });

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await adminFetch('/api/v1/sync/status');
        
        if (!response.ok) {
          // Silently fail - don't spam console
          return;
        }
        
        const logs = await response.json();
        
        if (Array.isArray(logs) && logs.length > 0) {
          const latest = logs[0];
          if (latest && latest.status === 'running') {
            setProgress({
              customers: latest.recordsProcessed || 0,
              products: latest.recordsProcessed || 0,
              orders: latest.recordsProcessed || 0,
            });
          }
        }
      } catch (err) {
        // Silently fail - endpoint might not be available
      }
    }, 5000); // Reduced frequency to avoid 502 spam

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="card">
      <div className="card-body">
        <h6 className="card-title mb-3">Sync Progress</h6>
        <div className="mb-3">
          <div className="d-flex justify-content-between mb-1">
            <span className="small">Customers</span>
            <span className="small">{progress.customers}</span>
          </div>
          <div className="progress" style={{ height: '6px' }}>
            <div
              className="progress-bar bg-primary"
              role="progressbar"
              style={{ width: '100%' }}
            ></div>
          </div>
        </div>
        <div className="mb-3">
          <div className="d-flex justify-content-between mb-1">
            <span className="small">Products</span>
            <span className="small">{progress.products}</span>
          </div>
          <div className="progress" style={{ height: '6px' }}>
            <div
              className="progress-bar bg-success"
              role="progressbar"
              style={{ width: '100%' }}
            ></div>
          </div>
        </div>
        <div className="mb-0">
          <div className="d-flex justify-content-between mb-1">
            <span className="small">Orders</span>
            <span className="small">{progress.orders}</span>
          </div>
          <div className="progress" style={{ height: '6px' }}>
            <div
              className="progress-bar bg-warning"
              role="progressbar"
              style={{ width: '100%' }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}

