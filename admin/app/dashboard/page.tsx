'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Gerçek API'den veri çek
      const data = await apiClient.getMerchantStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message);
      // Mock data ile devam et (development için)
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

  const triggerSync = async () => {
    try {
      await apiClient.triggerInitialSync();
      alert('Sync başlatıldı! Birkaç dakika içinde veriler gelecek.');
      setTimeout(loadStats, 3000);
    } catch (err: any) {
      alert('Sync başlatılamadı: ' + err.message);
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
        <button
          onClick={triggerSync}
          className="btn btn-primary"
        >
          <i className="ti ti-refresh me-1"></i>
          Sync Shopify Data
        </button>
      </div>

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
      <div className="card bg-primary text-white mb-3">
        <div className="card-body">
          <h5 className="card-title text-white mb-3">🎯 System Status</h5>
          <div className="mb-3">
            <p className="mb-1">✅ Backend API: <strong>ONLINE</strong></p>
            <p className="mb-1">✅ Database: <strong>Connected</strong></p>
            <p className="mb-1">✅ Scheduler: <strong>Running (20s sync)</strong></p>
            <p className="mb-1">✅ Store: <strong>eagle-dtf-supply0.myshopify.com</strong></p>
          </div>
          <div className="alert alert-warning">
            <h6 className="alert-heading mb-1">💡 First Step</h6>
            <p className="mb-0 small">Click "Sync Shopify Data" to import customers, products and orders.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
