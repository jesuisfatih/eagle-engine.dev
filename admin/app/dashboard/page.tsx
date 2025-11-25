'use client';

import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalCompanies: 24,
    activeUsers: 156,
    totalOrders: 1247,
    revenue: 84250,
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back! Here's what's happening with your B2B platform.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Companies */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Companies</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalCompanies}</p>
              <p className="mt-1 flex items-center text-sm text-green-600">
                <iconify-icon icon="mdi:trending-up" className="mr-1"></iconify-icon>
                <span>12% from last month</span>
              </p>
            </div>
            <div className="rounded-full bg-blue-50 p-3">
              <iconify-icon icon="mdi:office-building" className="text-3xl text-blue-600"></iconify-icon>
            </div>
          </div>
        </div>

        {/* Active Users */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stats.activeUsers}</p>
              <p className="mt-1 flex items-center text-sm text-green-600">
                <iconify-icon icon="mdi:trending-up" className="mr-1"></iconify-icon>
                <span>8% from last month</span>
              </p>
            </div>
            <div className="rounded-full bg-purple-50 p-3">
              <iconify-icon icon="mdi:account-multiple" className="text-3xl text-purple-600"></iconify-icon>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
              <p className="mt-1 flex items-center text-sm text-green-600">
                <iconify-icon icon="mdi:trending-up" className="mr-1"></iconify-icon>
                <span>23% from last month</span>
              </p>
            </div>
            <div className="rounded-full bg-green-50 p-3">
              <iconify-icon icon="mdi:shopping" className="text-3xl text-green-600"></iconify-icon>
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">${stats.revenue.toLocaleString()}</p>
              <p className="mt-1 flex items-center text-sm text-green-600">
                <iconify-icon icon="mdi:trending-up" className="mr-1"></iconify-icon>
                <span>18% from last month</span>
              </p>
            </div>
            <div className="rounded-full bg-orange-50 p-3">
              <iconify-icon icon="mdi:currency-usd" className="text-3xl text-orange-600"></iconify-icon>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Revenue Overview</h3>
              <p className="text-sm text-gray-500">Monthly revenue trends</p>
            </div>
            <select className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
              <option>Last 6 months</option>
              <option>Last year</option>
            </select>
          </div>
          <div className="h-64 flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
            <p className="text-gray-500">Chart: Revenue trend (Chart.js/ApexCharts)</p>
          </div>
        </div>

        {/* Orders by Company */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Top Companies</h3>
              <p className="text-sm text-gray-500">By order volume</p>
            </div>
            <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {[
              { name: 'TechCorp Industries', orders: 145, avatar: 'TC', color: 'bg-blue-500' },
              { name: 'Global Supplies Ltd', orders: 128, avatar: 'GS', color: 'bg-purple-500' },
              { name: 'Mega Wholesale Co', orders: 112, avatar: 'MW', color: 'bg-green-500' },
              { name: 'Prime Distribution', orders: 98, avatar: 'PD', color: 'bg-orange-500' },
            ].map((company, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`h-10 w-10 rounded-full ${company.color} flex items-center justify-center text-white font-semibold text-sm`}>
                    {company.avatar}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{company.name}</p>
                    <p className="text-sm text-gray-500">{company.orders} orders</p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <iconify-icon icon="mdi:chevron-right" className="text-xl"></iconify-icon>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <p className="text-sm text-gray-500">Latest actions across your platform</p>
            </div>
            <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              View All
            </button>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {[
            { type: 'order', company: 'TechCorp Industries', action: 'placed a new order', time: '2 minutes ago', icon: 'mdi:shopping', color: 'text-green-600 bg-green-50' },
            { type: 'user', company: 'Global Supplies', action: 'added 3 new users', time: '15 minutes ago', icon: 'mdi:account-plus', color: 'text-blue-600 bg-blue-50' },
            { type: 'pricing', company: 'Mega Wholesale', action: 'pricing rule applied', time: '1 hour ago', icon: 'mdi:tag', color: 'text-purple-600 bg-purple-50' },
            { type: 'company', company: 'Prime Distribution', action: 'account activated', time: '2 hours ago', icon: 'mdi:check-circle', color: 'text-orange-600 bg-orange-50' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-4 hover:bg-gray-50">
              <div className="flex items-center space-x-4">
                <div className={`rounded-full p-2 ${activity.color}`}>
                  <iconify-icon icon={activity.icon} className="text-xl"></iconify-icon>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    <span className="font-semibold">{activity.company}</span> {activity.action}
                  </p>
                  <p className="text-sm text-gray-500">{activity.time}</p>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <iconify-icon icon="mdi:dots-vertical" className="text-xl"></iconify-icon>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}



