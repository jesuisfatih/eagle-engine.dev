'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { adminFetch } from '@/lib/api-client';

interface Stats {
  companies: number;
  users: number;
  orders: number;
  revenue: string;
}

interface Activity {
  id: string;
  type: string;
  description: string;
  createdAt: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ companies: 0, users: 0, orders: 0, revenue: '$0' });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState('');
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      const res = await adminFetch('/api/v1/merchants/stats');
      if (res.ok) {
        const data = await res.json();
        setStats({
          companies: data.companies || data.totalCompanies || 0,
          users: data.users || data.totalUsers || 0,
          orders: data.orders || data.totalOrders || 0,
          revenue: data.revenue || data.totalRevenue || '$0',
        });
      }
    } catch {
      // silently
    }
  }, []);

  const loadActivities = useCallback(async () => {
    try {
      const res = await adminFetch('/api/v1/events/admin-activity?limit=5');
      if (res.ok) {
        const data = await res.json();
        setActivities(data.activities || data.data || []);
      }
    } catch {
      // silently
    }
  }, []);

  useEffect(() => {
    Promise.all([loadStats(), loadActivities()]).finally(() => setLoading(false));
  }, [loadStats, loadActivities]);

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult('');
    try {
      const res = await adminFetch('/api/v1/sync/initial', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setSyncResult(`Synced: ${data.products || 0} products, ${data.customers || 0} customers, ${data.orders || 0} orders`);
        loadStats();
      } else {
        setSyncResult('Sync failed. Check API connection.');
      }
    } catch {
      setSyncResult('Sync error. Server might be unreachable.');
    } finally {
      setSyncing(false);
    }
  };

  const statsCards = [
    { title: 'Companies', value: stats.companies, icon: 'ti-building', color: '#007aff' },
    { title: 'Users', value: stats.users, icon: 'ti-users', color: '#34c759' },
    { title: 'Orders', value: stats.orders, icon: 'ti-shopping-cart', color: '#ff9500' },
    { title: 'Revenue', value: stats.revenue, icon: 'ti-currency-dollar', color: '#af52de' },
  ];

  const quickActions = [
    { title: 'Add Company', icon: 'ti-building-plus', href: '/companies?action=new', color: '#007aff' },
    { title: 'Sync Data', icon: 'ti-refresh', href: '#', color: '#34c759', onClick: handleSync },
    { title: 'View Orders', icon: 'ti-list-check', href: '/orders', color: '#ff9500' },
    { title: 'Support Tickets', icon: 'ti-help', href: '/support', color: '#ff3b30' },
  ];

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Welcome back to Eagle B2B Admin</p>
          </div>
        </div>
        <div className="stats-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="stat-card">
              <div className="skeleton" style={{ height: 14, width: 80, marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 28, width: 60 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back to Eagle B2B Admin</p>
        </div>
        <div className="page-header-actions">
          <button className="btn-apple primary" onClick={handleSync} disabled={syncing}>
            <i className={`ti ti-refresh ${syncing ? 'spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync Shopify'}
          </button>
        </div>
      </div>

      {syncResult && (
        <div className={`apple-alert ${syncResult.includes('failed') || syncResult.includes('error') ? 'danger' : 'success'}`} style={{ marginBottom: 20 }}>
          <i className={`ti ${syncResult.includes('failed') || syncResult.includes('error') ? 'ti-alert-circle' : 'ti-check'}`} />
          <span>{syncResult}</span>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid">
        {statsCards.map((card) => (
          <div key={card.title} className="stat-card">
            <div className="stat-icon" style={{ background: `${card.color}14`, color: card.color }}>
              <i className={`ti ${card.icon}`} />
            </div>
            <div className="stat-label">{card.title}</div>
            <div className="stat-value">{card.value}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions + Recent Activity */}
      <div className="content-grid cols-2" style={{ marginTop: 24 }}>
        {/* Quick Actions */}
        <div className="apple-card">
          <div className="apple-card-header">
            <h3 className="apple-card-title">Quick Actions</h3>
          </div>
          <div className="apple-card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {quickActions.map((action) => (
                action.onClick ? (
                  <button
                    key={action.title}
                    className="btn-apple secondary"
                    onClick={action.onClick}
                    disabled={syncing}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-start' }}
                  >
                    <i className={`ti ${action.icon}`} style={{ color: action.color }} />
                    {action.title}
                  </button>
                ) : (
                  <Link
                    key={action.title}
                    href={action.href}
                    className="btn-apple secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-start', textDecoration: 'none' }}
                  >
                    <i className={`ti ${action.icon}`} style={{ color: action.color }} />
                    {action.title}
                  </Link>
                )
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="apple-card">
          <div className="apple-card-header">
            <h3 className="apple-card-title">Recent Activity</h3>
            <Link href="/activity" className="btn-apple ghost" style={{ fontSize: 13 }}>
              View All
            </Link>
          </div>
          <div className="apple-card-body">
            {activities.length === 0 ? (
              <div className="empty-state" style={{ padding: '32px 16px' }}>
                <div className="empty-state-icon">
                  <i className="ti ti-activity" />
                </div>
                <h4 className="empty-state-title">No recent activity</h4>
                <p className="empty-state-desc">Activity will appear here as users interact with the platform.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {activities.map((activity) => (
                  <div key={activity.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 0',
                    borderBottom: '1px solid var(--border-light)',
                  }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: 'var(--bg-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <i className="ti ti-activity" style={{ fontSize: 16, color: 'var(--text-secondary)' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
                        {activity.description}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
                        {new Date(activity.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="apple-card" style={{ marginTop: 24 }}>
        <div className="apple-card-header">
          <h3 className="apple-card-title">System Status</h3>
        </div>
        <div className="apple-card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            {[
              { label: 'API Server', status: 'Online', icon: 'ti-server', color: '#34c759' },
              { label: 'Database', status: 'Connected', icon: 'ti-database', color: '#34c759' },
              { label: 'Redis Cache', status: 'Active', icon: 'ti-bolt', color: '#34c759' },
              { label: 'Shopify Sync', status: 'Ready', icon: 'ti-refresh', color: '#007aff' },
            ].map((item) => (
              <div key={item.label} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: 12,
                borderRadius: 10,
                background: 'var(--bg-secondary)',
              }}>
                <i className={`ti ${item.icon}`} style={{ fontSize: 20, color: item.color }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: item.color }}>{item.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
