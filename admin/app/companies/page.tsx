'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [shopifyCustomers, setShopifyCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'companies' | 'shopify'>('companies');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [companiesData, customersData] = await Promise.all([
        apiClient.getCompanies().catch(() => []),
        fetch('http://localhost:4000/api/v1/shopify-customers', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('eagle_admin_token')}` }
        }).then(r => r.json()).catch(() => []),
      ]);
      setCompanies(companiesData);
      setShopifyCustomers(Array.isArray(customersData) ? customersData : []);
    } catch (err) {
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const convertToCompany = async (customerId: string) => {
    if (!confirm('Bu Shopify müşterisini B2B firmaya dönüştürmek istiyor musunuz?')) return;
    
    try {
      await fetch(`http://localhost:4000/api/v1/shopify-customers/${customerId}/convert-to-company`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('eagle_admin_token')}`,
          'Content-Type': 'application/json',
        },
      });
      alert('Firma oluşturuldu! Davet emaili gönderildi.');
      loadData();
    } catch (err: any) {
      alert('Hata: ' + err.message);
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Companies & Shopify Customers</h1>
          <p className="mt-1 text-sm text-gray-500">
            B2B firmalarını yönetin veya Shopify müşterilerini firmaya dönüştürün
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('companies')}
            className={`border-b-2 pb-4 text-sm font-medium ${
              activeTab === 'companies'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            B2B Companies ({companies.length})
          </button>
          <button
            onClick={() => setActiveTab('shopify')}
            className={`border-b-2 pb-4 text-sm font-medium ${
              activeTab === 'shopify'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Shopify Customers ({shopifyCustomers.length})
          </button>
        </nav>
      </div>

      {/* Companies Tab */}
      {activeTab === 'companies' && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          {companies.length === 0 ? (
            <div className="p-12 text-center">
              <span className="text-6xl">🏢</span>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Henüz firma yok</h3>
              <p className="mt-2 text-sm text-gray-500">
                Shopify Customers sekmesinden müşteri davet edin veya yeni firma oluşturun.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr className="text-left text-xs font-medium uppercase text-gray-700">
                    <th className="px-6 py-3">Company</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Users</th>
                    <th className="px-6 py-3">Orders</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {companies.map((company: any) => (
                    <tr key={company.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{company.name}</div>
                        <div className="text-sm text-gray-500">{company.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          company.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {company.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">{company._count?.users || 0}</td>
                      <td className="px-6 py-4 text-sm">{company._count?.orders || 0}</td>
                      <td className="px-6 py-4">
                        <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Shopify Customers Tab */}
      {activeTab === 'shopify' && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          {shopifyCustomers.length === 0 ? (
            <div className="p-12 text-center">
              <span className="text-6xl">🛍️</span>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Shopify müşterisi bulunamadı</h3>
              <p className="mt-2 text-sm text-gray-500">
                "Shopify'dan Sync Başlat" butonuna tıklayarak müşterileri çekin.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr className="text-left text-xs font-medium uppercase text-gray-700">
                    <th className="px-6 py-3">Customer</th>
                    <th className="px-6 py-3">Orders</th>
                    <th className="px-6 py-3">Total Spent</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {shopifyCustomers.map((customer: any) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {customer.firstName} {customer.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{customer.email}</div>
                      </td>
                      <td className="px-6 py-4 text-sm">{customer.ordersCount}</td>
                      <td className="px-6 py-4 text-sm font-medium">${customer.totalSpent}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => convertToCompany(customer.id)}
                          className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
                        >
                          Firmaya Dönüştür
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
