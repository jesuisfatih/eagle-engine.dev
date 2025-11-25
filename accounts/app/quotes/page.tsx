'use client';

import { useState } from 'react';

export default function QuotesPage() {
  const [quotes] = useState([
    {
      id: 'QT-001',
      date: '2024-11-20',
      items: 25,
      status: 'pending',
      total: 12500,
    },
    {
      id: 'QT-002',
      date: '2024-11-15',
      items: 15,
      status: 'approved',
      total: 8200,
    },
  ]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quote Requests</h1>
            <p className="mt-1 text-sm text-gray-500">Request custom pricing for bulk orders</p>
          </div>
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            New Quote Request
          </button>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs font-medium uppercase text-gray-700">
                  <th className="px-6 py-3">Quote ID</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Items</th>
                  <th className="px-6 py-3">Total</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {quotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-gray-900">{quote.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{quote.date}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{quote.items} items</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">${quote.total.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          quote.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : quote.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {quote.status}
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
    </div>
  );
}

