'use client';

import { useState, useEffect } from 'react';
import TopCompanies from './components/TopCompanies';
import DateRangeFilter from './components/DateRangeFilter';
import { adminFetch } from '@/lib/api-client';

interface AnalyticsStats {
  totalEvents: number;
  productViews: number;
  addToCarts: number;
  conversionRate: number;
}

interface TopProduct {
  productId: string;
  title: string;
  views: number;
  orders: number;
}

interface FunnelData {
  steps?: { name: string; count: number; rate?: number }[];
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<AnalyticsStats>({
    totalEvents: 0,
    productViews: 0,
    addToCarts: 0,
    conversionRate: 0,
  });
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [funnel, setFunnel] = useState<FunnelData | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const [dashboardData, funnelData, productsData] = await Promise.all([
        adminFetch('/api/v1/analytics/dashboard').then(r => r.json()).catch(() => ({})),
        adminFetch('/api/v1/analytics/funnel').then(r => r.json()).catch(() => null),
        adminFetch('/api/v1/analytics/top-products').then(r => r.json()).catch(() => []),
      ]);
      setStats(dashboardData);
      setFunnel(funnelData);
      setTopProducts(Array.isArray(productsData) ? productsData : []);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Analytics & Reports</h4>
          <p className="mb-0 text-muted">Track performance and behavior</p>
        </div>
      </div>

      <DateRangeFilter onDateChange={(from, to) => {
        console.log('Date range:', from, to);
        loadAnalytics();
      }} />

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

      {/* Funnel */}
      <div className="row g-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Conversion Funnel</h5>
            </div>
            <div className="card-body">
              {funnel?.steps?.map((step, i) => (
                <div key={i} className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
                  <div>
                    <h6 className="mb-1">{step.name}</h6>
                    <p className="text-muted small mb-0">{step.count} events</p>
                  </div>
                  <h4 className="mb-0 text-primary">{step.count}</h4>
                </div>
              ))}
              {funnel?.conversionRate && (
                <div className="alert alert-success mt-3">
                  <strong>Conversion Rate:</strong> {funnel.conversionRate}%
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Top Products</h5>
            </div>
            <div className="card-body">
              {topProducts.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted mb-0">No product views yet</p>
                </div>
              ) : (
                topProducts.map((product, i) => (
                  <div key={i} className="d-flex justify-content-between mb-3">
                    <span>Product: {product.title}</span>
                    <span className="badge bg-label-primary">{product._count?.id} views</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <TopCompanies />
        </div>
      </div>
    </div>
  );
}
