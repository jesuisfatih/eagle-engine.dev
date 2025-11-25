'use client';

import { useState } from 'react';

export default function OrdersPage() {
  const [orders] = useState([
    {
      id: '#ORD-1245',
      company: 'TechCorp Industries',
      date: '2024-11-20',
      items: 12,
      total: 2450.00,
      status: 'paid',
    },
    {
      id: '#ORD-1244',
      company: 'Global Supplies Ltd',
      date: '2024-11-18',
      items: 8,
      total: 1680.50,
      status: 'paid',
    },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="mt-1 text-sm text-gray-500">Manage all B2B orders</p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs font-medium uppercase text-gray-700">
                <th className="px-6 py-3">Order ID</th>
                <th className="px-6 py-3">Company</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Items</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-900">{order.id}</td>
                  <td className="px-6 py-4 text-gray-900">{order.company}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{order.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{order.items}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900">${order.total.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                      {order.status}
                    </span>
                  </td>
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
      </div>
    </div>
  );
}



