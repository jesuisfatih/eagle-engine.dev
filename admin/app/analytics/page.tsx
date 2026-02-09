'use client';

import { useState, useEffect } from 'react';
import { adminFetch } from '@/lib/api-client';
import { PageHeader, StatsCard } from '@/components/ui';

export default function AnalyticsPage() {
  const [stats, setStats] = useState({ companies: 0, users: 0, orders: 0, revenue: 0, products: 0, avgOrderValue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await adminFetch('/api/v1/merchants/stats');
        if (res.ok) {
          const d = await res.json();
          setStats({
            companies: d.companies || d.totalCompanies || 0,
            users: d.users || d.totalUsers || 0,
            orders: d.orders || d.totalOrders || 0,
            revenue: d.revenue || d.totalRevenue || 0,
            products: d.products || d.totalProducts || 0,
            avgOrderValue: d.avgOrderValue || 0,
          });
        }
      } catch { /* silent */ }
      finally { setLoading(false); }
    })();
  }, []);

  const funnel = [
    { label: 'Visitors', value: '-', icon: 'ti-eye', pct: 100, color: '#007aff' },
    { label: 'Registered', value: stats.users, icon: 'ti-user-plus', pct: 60, color: '#5856d6' },
    { label: 'Active Buyers', value: stats.companies, icon: 'ti-shopping-cart', pct: 40, color: '#ff9500' },
    { label: 'Converted', value: stats.orders, icon: 'ti-check', pct: 25, color: '#34c759' },
  ];

  return (
    <div>
      <PageHeader title="Analytics" subtitle="Platform performance overview" />

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <StatsCard title="Total Revenue" value={typeof stats.revenue === 'number' ? `$${stats.revenue.toFixed(2)}` : stats.revenue} icon="currency-dollar" iconColor="success" loading={loading} />
        <StatsCard title="Total Orders" value={stats.orders} icon="shopping-cart" iconColor="primary" loading={loading} />
        <StatsCard title="Avg Order Value" value={typeof stats.avgOrderValue === 'number' ? `$${stats.avgOrderValue.toFixed(2)}` : '$0'} icon="chart-line" iconColor="info" loading={loading} />
      </div>

      {/* Funnel */}
      <div className="apple-card" style={{ marginTop: 20 }}>
        <div className="apple-card-header"><h3 className="apple-card-title">Conversion Funnel</h3></div>
        <div className="apple-card-body">
          {funnel.map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${step.color}14`, color: step.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className={`ti ${step.icon}`} style={{ fontSize: 20 }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontWeight: 500, fontSize: 14 }}>{step.label}</span>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{step.value}</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${step.pct}%`, background: step.color, borderRadius: 3, transition: 'width 0.5s' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Products */}
      <div className="apple-card" style={{ marginTop: 20 }}>
        <div className="apple-card-header"><h3 className="apple-card-title">Overview</h3></div>
        <div className="apple-card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <div style={{ padding: 16, background: 'var(--bg-secondary)', borderRadius: 10 }}>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }}>Products</div>
              <div style={{ fontSize: 22, fontWeight: 600 }}>{stats.products}</div>
            </div>
            <div style={{ padding: 16, background: 'var(--bg-secondary)', borderRadius: 10 }}>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }}>Companies</div>
              <div style={{ fontSize: 22, fontWeight: 600 }}>{stats.companies}</div>
            </div>
            <div style={{ padding: 16, background: 'var(--bg-secondary)', borderRadius: 10 }}>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 4 }}>Active Users</div>
              <div style={{ fontSize: 22, fontWeight: 600 }}>{stats.users}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
