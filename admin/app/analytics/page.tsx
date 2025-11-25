'use client';

import { useState, useEffect } from 'react';

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    totalEvents: 0,
    productViews: 0,
    addToCarts: 0,
    conversionRate: 0,
  });

  useEffect(() => {
    // API'den analytics çek
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.eagledtfsupply.com';
    fetch(`${API_URL}/api/v1/analytics/dashboard`)
      .then(r => r.json())
      .then(data => setStats(data))
      .catch(() => {});
  }, []);

  return (
    <div>
      <h4 className="fw-bold mb-4">Analytics & Reports</h4>

      {/* Key Metrics */}
      <div className="row g-4 mb-4">
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <p className="card-text mb-0">Total Events</p>
                  <h4 className="mb-0">{stats.totalEvents}</h4>
                </div>
                <span className="badge bg-label-primary rounded p-2">
                  <i className="ti ti-chart-line ti-sm"></i>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <p className="card-text mb-0">Product Views</p>
                  <h4 className="mb-0">{stats.productViews}</h4>
                </div>
                <span className="badge bg-label-info rounded p-2">
                  <i className="ti ti-eye ti-sm"></i>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <p className="card-text mb-0">Add to Cart</p>
                  <h4 className="mb-0">{stats.addToCarts}</h4>
                </div>
                <span className="badge bg-label-success rounded p-2">
                  <i className="ti ti-shopping-cart-plus ti-sm"></i>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <p className="card-text mb-0">Conversion Rate</p>
                  <h4 className="mb-0">{stats.conversionRate}%</h4>
                </div>
                <span className="badge bg-label-warning rounded p-2">
                  <i className="ti ti-trending-up ti-sm"></i>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Funnel Chart */}
      <div className="card">
        <div className="card-header">
          <h5 className="card-title mb-0">Conversion Funnel</h5>
        </div>
        <div className="card-body">
          <div className="text-center py-5">
            <i className="ti ti-chart-infographic ti-3x text-primary mb-3"></i>
            <p className="text-muted">Chart: Product Views → Cart → Checkout → Orders</p>
            <p className="small text-muted">API Integration Ready</p>
          </div>
        </div>
      </div>
    </div>
  );
}
