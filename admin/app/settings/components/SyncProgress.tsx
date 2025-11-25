'use client';

import { useState, useEffect } from 'react';

export default function SyncProgress() {
  const [progress, setProgress] = useState({ customers: 0, products: 0, orders: 0 });

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.eagledtfsupply.com';
        const response = await fetch(`${API_URL}/api/v1/sync/status`);
        const logs = await response.json();
        
        const latest = logs[0];
        if (latest && latest.status === 'running') {
          setProgress({
            customers: latest.recordsProcessed || 0,
            products: latest.recordsProcessed || 0,
            orders: latest.recordsProcessed || 0,
          });
        }
      } catch (err) {}
    }, 2000);

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

