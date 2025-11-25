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

  const approveQuote = async (id: string) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.eagledtfsupply.com';
      await fetch(`${API_URL}/api/v1/quotes/${id}/approve`, { method: 'POST' });
      alert('✅ Quote approved!');
      loadQuotes();
    } catch (err) {
      alert('❌ Failed to approve');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Quote Requests</h4>
          <p className="mb-0 text-muted">Manage B2B quote requests</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h5 className="card-title mb-0">All Quote Requests</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Quote ID</th>
                  <th>Company</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {quotes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4">
                      <p className="text-muted mb-0">No quote requests yet</p>
                    </td>
                  </tr>
                ) : (
                  quotes.map((quote) => (
                    <tr key={quote.id}>
                      <td>{quote.id}</td>
                      <td>{quote.company}</td>
                      <td>{quote.items}</td>
                      <td>${quote.total}</td>
                      <td>
                        <span className="badge bg-label-warning">Pending</span>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-primary">View</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

