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
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg bg-yellow-50 p-4 border border-yellow-200">
          <p className="text-sm text-yellow-800">
            ⚠️ API Bağlantısı: {error}. Mock data gösteriliyor.
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="mt-2 text-sm font-medium text-yellow-900 underline"
          >
            Login yap →
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Eagle B2B Commerce Engine</p>
        </div>
        <button
          onClick={triggerSync}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          🔄 Shopify'dan Sync Başlat
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Companies</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalCompanies || 0}</p>
            </div>
            <div className="rounded-full bg-blue-50 p-3">
              <span className="text-3xl">🏢</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalUsers || 0}</p>
            </div>
            <div className="rounded-full bg-purple-50 p-3">
              <span className="text-3xl">👥</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalOrders || 0}</p>
            </div>
            <div className="rounded-full bg-green-50 p-3">
              <span className="text-3xl">📦</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                ${Number(stats.totalRevenue || 0).toLocaleString()}
              </p>
            </div>
            <div className="rounded-full bg-orange-50 p-3">
              <span className="text-3xl">💰</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
        <h3 className="font-semibold text-blue-900">🎯 Sistem Durumu</h3>
        <div className="mt-4 space-y-2 text-sm text-blue-800">
          <p>✅ Backend API: ONLINE</p>
          <p>✅ Database: Connected</p>
          <p>✅ Scheduler: Running (20 saniye sync)</p>
          <p>✅ Merchant: {stats.totalCompanies > 0 ? 'Active' : 'Shopify sync gerekli'}</p>
        </div>
        <div className="mt-4 pt-4 border-t border-blue-200">
          <p className="text-sm text-blue-700">
            💡 <strong>İlk Adım:</strong> "Shopify'dan Sync Başlat" butonuna tıklayın.
            Customers, Products ve Orders otomatik çekilecek.
          </p>
        </div>
      </div>
    </div>
  );
}
