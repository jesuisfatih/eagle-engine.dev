'use client';

import { useState } from 'react';

export default function AccountsDashboard() {
  const [companyName] = useState('TechCorp Industries');
  const [stats] = useState({
    activeOrders: 5,
    pendingApprovals: 2,
    totalSpent: 45600,
    availableCredit: 50000,
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
            <p className="mt-1 text-gray-600">{companyName}</p>
          </div>
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            View Catalog
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Orders</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stats.activeOrders}</p>
              </div>
              <div className="rounded-full bg-blue-50 p-3">
                <iconify-icon icon="mdi:package-variant-closed" className="text-2xl text-blue-600"></iconify-icon>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Approvals</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{stats.pendingApprovals}</p>
              </div>
              <div className="rounded-full bg-orange-50 p-3">
                <iconify-icon icon="mdi:clock-outline" className="text-2xl text-orange-600"></iconify-icon>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">${stats.totalSpent.toLocaleString()}</p>
              </div>
              <div className="rounded-full bg-green-50 p-3">
                <iconify-icon icon="mdi:currency-usd" className="text-2xl text-green-600"></iconify-icon>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Available Credit</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">${stats.availableCredit.toLocaleString()}</p>
              </div>
              <div className="rounded-full bg-purple-50 p-3">
                <iconify-icon icon="mdi:credit-card" className="text-2xl text-purple-600"></iconify-icon>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          <div className="mt-4 space-y-4">
            {[
              { id: '#ORD-1245', date: '2024-11-20', items: 12, total: 2450, status: 'Delivered' },
              { id: '#ORD-1244', date: '2024-11-18', items: 8, total: 1680, status: 'In Transit' },
              { id: '#ORD-1243', date: '2024-11-15', items: 15, total: 3200, status: 'Processing' },
            ].map((order) => (
              <div key={order.id} className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                <div>
                  <p className="font-medium text-gray-900">{order.id}</p>
                  <p className="text-sm text-gray-500">{order.date} · {order.items} items</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${order.total}</p>
                  <span className="mt-1 inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Iconify Script */}
      <script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"></script>
    </div>
  );
}

