'use client';

import { useState, useEffect } from 'react';

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.eagledtfsupply.com';
      const response = await fetch(`${API_URL}/api/v1/quotes`);
      const data = await response.json();
      setQuotes(Array.isArray(data) ? data : []);
    } catch (err) {
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  };

  const sampleQuotes = [
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
  ];

  const displayQuotes = quotes.length > 0 ? quotes : sampleQuotes;

  return (
    <div>
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quote Requests</h1>
            <p className="mt-1 text-sm text-gray-500">Request custom pricing for bulk orders</p>
          </div>
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            New Quote Request
          </button>
        </div>

      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table">
                <thead>
                  <tr>
                    <th>Quote ID</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
              </thead>
                <tbody>
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
    </div>
  );
}

