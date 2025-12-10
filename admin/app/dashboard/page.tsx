'use client';

import { useEffect, useState } from 'react';
import { apiClient, adminFetch } from '@/lib/api-client';
import QuickActions from './components/QuickActions';
import StatsRefresh from './components/StatsRefresh';
import Modal from '@/components/Modal';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await adminFetch('/api/v1/merchants/stats');
      const data = await response.json();
      setStats(data);
      setError('');
    } catch (err: any) {
      setError(err.message);
      setStats({
        totalCompanies: 0,
        totalUsers: 0,
        totalOrders: 0,
        totalRevenue: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const [syncModal, setSyncModal] = useState<{show: boolean; message: string}>({show: false, message: ''});

  const triggerSync = async () => {
    try {
      const merchantId = localStorage.getItem('eagle_merchantId') || '';
      
      if (!merchantId) {
        setSyncModal({show: true, message: '❌ Merchant ID not found. Please configure merchant settings.'});
        return;
      }
      
      await adminFetch('/api/v1/sync/initial', {
        method: 'POST',
        body: JSON.stringify({ merchantId })
      });
      setSyncModal({show: true, message: '✅ Sync started! Data will appear in a few minutes.'});
      setTimeout(() => {
        loadStats();
        window.location.reload();
      }, 3000);
    } catch (err: any) {
      setSyncModal({show: true, message: '❌ Sync failed: ' + err.message});
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading stats...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="alert alert-warning alert-dismissible mb-4" role="alert">
          <h5 className="alert-heading mb-1">⚠️ API Connection</h5>
          <p className="mb-0">{error} - Showing default data</p>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Dashboard</h4>
          <p className="mb-0 text-muted">Eagle B2B Commerce Engine</p>
        </div>
        <div className="d-flex gap-2">
          <StatsRefresh onRefresh={loadStats} />
          <button
            onClick={triggerSync}
            className="btn btn-primary"
          >
            <i className="ti ti-refresh me-1"></i>
            Sync Shopify Data
          </button>
        </div>
      </div>

      <QuickActions />

      {/* Stats Cards - Vuexy Style */}
      <div className="row g-4 mb-4">
        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div className="card-info">
                  <p className="card-text mb-0">Total Companies</p>
                  <h4 className="mb-0">{stats.totalCompanies || 0}</h4>
                </div>
                <div className="card-icon">
                  <span className="badge bg-label-primary rounded p-2">
                    <i className="ti ti-building ti-sm"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div className="card-info">
                  <p className="card-text mb-0">Active Users</p>
                  <h4 className="mb-0">{stats.totalUsers || 0}</h4>
                </div>
                <div className="card-icon">
                  <span className="badge bg-label-info rounded p-2">
                    <i className="ti ti-users ti-sm"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div className="card-info">
                  <p className="card-text mb-0">Total Orders</p>
                  <h4 className="mb-0">{stats.totalOrders || 0}</h4>
                </div>
                <div className="card-icon">
                  <span className="badge bg-label-success rounded p-2">
                    <i className="ti ti-shopping-cart ti-sm"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-lg-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div className="card-info">
                  <p className="card-text mb-0">Total Revenue</p>
                  <h4 className="mb-0">${Number(stats.totalRevenue || 0).toLocaleString()}</h4>
                </div>
                <div className="card-icon">
                  <span className="badge bg-label-warning rounded p-2">
                    <i className="ti ti-currency-dollar ti-sm"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Status Card - Vuexy Style */}
      <div className="row g-4">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header d-flex justify-content-between">
              <h5 className="card-title mb-0">Recent Activity</h5>
              <button className="btn btn-sm btn-primary" onClick={loadStats}>
                <i className="ti ti-refresh me-1"></i>Refresh
              </button>
            </div>
            <div className="card-body">
              <div className="timeline">
                <div className="timeline-item">
                  <span className="timeline-point timeline-point-primary"></span>
                  <div className="timeline-event">
                    <div className="timeline-header mb-1">
                      <h6 className="mb-0">System Initialized</h6>
                      <small className="text-muted">Just now</small>
                    </div>
                    <p className="mb-0">Eagle B2B Commerce Engine is running</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h6 className="text-white mb-3">🎯 System Status</h6>
              <p className="mb-1 small">✅ API: ONLINE</p>
              <p className="mb-1 small">✅ DB: Connected</p>
              <p className="mb-1 small">✅ Sync: Running</p>
              <p className="mb-1 small">✅ Store: eagle-dtf-supply0</p>
            </div>
          </div>
        </div>
      </div>

      {syncModal.show && (
        <Modal
          show={syncModal.show}
          onClose={() => setSyncModal({show: false, message: ''})}
          onConfirm={() => setSyncModal({show: false, message: ''})}
          title={syncModal.message.includes('✅') ? 'Success' : 'Error'}
          message={syncModal.message}
          confirmText="OK"
          type={syncModal.message.includes('✅') ? 'success' : 'danger'}
        />
      )}
    </div>
  );
}
