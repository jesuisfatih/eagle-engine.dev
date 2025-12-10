'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';
import { adminFetch } from '@/lib/api-client';

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [approveModal, setApproveModal] = useState<{show: boolean; quoteId: string}>({show: false, quoteId: ''});
  const [resultModal, setResultModal] = useState<{show: boolean; message: string}>({show: false, message: ''});

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    setLoading(true);
    try {
      const response = await adminFetch('/api/v1/quotes');
      const data = await response.json();
      setQuotes(Array.isArray(data) ? data : []);
    } catch (err) {
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  };

  const approveQuote = async (quoteId: string) => {
    try {
      const response = await adminFetch(`/api/v1/quotes/${quoteId}/approve`, {
        method: 'POST',
      });
      
      setApproveModal({show: false, quoteId: ''});
      
      if (response.ok) {
        setResultModal({show: true, message: '✅ Quote approved successfully!'});
        loadQuotes();
      } else {
        setResultModal({show: true, message: '❌ Failed to approve quote'});
      }
    } catch (err) {
      setResultModal({show: true, message: '❌ Failed to approve quote'});
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

      {approveModal.show && (
        <Modal
          show={approveModal.show}
          onClose={() => setApproveModal({show: false, quoteId: ''})}
          onConfirm={() => approveQuote(approveModal.quoteId)}
          title="Approve Quote"
          message="Are you sure you want to approve this quote?"
          confirmText="Approve"
          cancelText="Cancel"
          type="warning"
        />
      )}

      {resultModal.show && (
        <Modal
          show={resultModal.show}
          onClose={() => setResultModal({show: false, message: ''})}
          onConfirm={() => setResultModal({show: false, message: ''})}
          title={resultModal.message.includes('✅') ? 'Success' : 'Error'}
          message={resultModal.message}
          confirmText="OK"
          type={resultModal.message.includes('✅') ? 'success' : 'danger'}
        />
      )}
    </div>
  );
}

