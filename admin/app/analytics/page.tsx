'use client';

import { useState } from 'react';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
        <p className="mt-1 text-sm text-gray-500">Track performance and customer behavior</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-600">Total Events</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">15,482</p>
          <p className="mt-1 text-sm text-green-600">↑ 12% from last week</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-600">Product Views</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">8,234</p>
          <p className="mt-1 text-sm text-green-600">↑ 8% from last week</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-600">Add to Cart</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">1,456</p>
          <p className="mt-1 text-sm text-green-600">↑ 15% from last week</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-600">Conversion Rate</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">17.7%</p>
          <p className="mt-1 text-sm text-green-600">↑ 2.3% from last week</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="font-semibold text-gray-900">Event Funnel</h3>
          <div className="mt-4 h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Funnel Chart: Views → Cart → Checkout → Orders</p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="font-semibold text-gray-900">Top Products</h3>
          <div className="mt-4 space-y-3">
            {[
              { name: 'Premium Laptop Stand', views: 1245, carts: 234 },
              { name: 'Wireless Keyboard', views: 987, carts: 156 },
              { name: 'Ergonomic Mouse', views: 856, carts: 142 },
            ].map((product, i) => (
              <div key={i} className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-sm text-gray-500">{product.views} views · {product.carts} carts</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-blue-600">
                    {((product.carts / product.views) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}




