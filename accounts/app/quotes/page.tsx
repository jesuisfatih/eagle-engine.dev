'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';
import { accountsFetch } from '@/lib/api-client';

interface Quote {
  id: string;
  companyId: string;
  userId: string;
  notes: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestModal, setRequestModal] = useState(false);
  const [resultModal, setResultModal] = useState<{show: boolean; message: string}>({show: false, message: ''});
  
  const [formData, setFormData] = useState({
    email: '',
    notes: '',
  });

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    setLoading(true);
    try {
      const response = await accountsFetch('/api/v1/quotes');
      const data = await response.json();
      setQuotes(Array.isArray(data) ? data : []);
    } catch (err) {
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  };

  const submitQuote = async () => {
    try {
      const companyId = localStorage.getItem('eagle_companyId') || '';
      const userId = localStorage.getItem('eagle_userId') || '';
      
      const response = await accountsFetch('/api/v1/quotes', {
        method: 'POST',
        body: JSON.stringify({
          companyId,
          userId,
          notes: `${formData.notes} (Contact: ${formData.email})`,
        }),
      });
      
      setRequestModal(false);
      
      if (response.ok) {
        setResultModal({show: true, message: '✅ Quote request submitted successfully!'});
        setFormData({ email: '', notes: '' });
        loadQuotes();
      } else {
        const error = await response.json().catch(() => ({}));
        setResultModal({show: true, message: `❌ ${error.message || 'Failed to submit quote request'}`});
      }
    } catch (err) {
      setResultModal({show: true, message: '❌ Failed to submit quote request'});
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-success';
      case 'rejected':
        return 'bg-danger';
      default:
        return 'bg-warning';
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Quote Requests</h4>
          <p className="mb-0 text-muted">Request custom pricing for bulk orders</p>
        </div>
        <button
          onClick={() => setRequestModal(true)}
          className="btn btn-primary"
        >
          <i className="ti ti-plus me-1"></i>
          New Quote Request
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
              <p className="mt-3 text-muted">Loading quotes...</p>
            </div>
          ) : quotes.length === 0 ? (
            <div className="text-center py-5">
              <i className="ti ti-file-invoice ti-3x text-muted mb-3"></i>
              <h5>No quote requests yet</h5>
              <p className="text-muted">Request a quote for bulk orders to get custom pricing</p>
              <button 
                onClick={() => setRequestModal(true)}
                className="btn btn-primary mt-3"
              >
                <i className="ti ti-plus me-1"></i>
                Request Your First Quote
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Quote ID</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Notes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {quotes.map((quote) => (
                    <tr key={quote.id}>
                      <td className="fw-semibold">#{quote.id.substring(0, 8)}</td>
                      <td>{new Date(quote.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge ${getStatusBadge(quote.status)}`}>
                          {quote.status}
                        </span>
                      </td>
                      <td className="small text-truncate" style={{maxWidth: '200px'}}>
                        {quote.notes}
                      </td>
                      <td>
                        <button className="btn btn-sm btn-outline-primary">
                          <i className="ti ti-eye me-1"></i>
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
      </div>

      {/* Request Quote Modal */}
      <Modal
        show={requestModal}
        onClose={() => setRequestModal(false)}
        title="Request Quote"
      >
        <div className="mb-3">
          <label className="form-label">Contact Email</label>
          <input
            type="email"
            className="form-control"
            placeholder="you@company.com"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Requirements / Notes</label>
          <textarea
            className="form-control"
            rows={4}
            placeholder="Describe your requirements, quantities, products..."
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({...prev, notes: e.target.value}))}
          />
        </div>
        <div className="d-flex gap-2 justify-content-end">
          <button
            className="btn btn-secondary"
            onClick={() => setRequestModal(false)}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={submitQuote}
            disabled={!formData.notes.trim()}
          >
            Submit Request
          </button>
        </div>
      </Modal>

      {/* Result Modal */}
      <Modal
        show={resultModal.show}
        onClose={() => setResultModal({show: false, message: ''})}
        title="Result"
      >
        <p className="mb-0">{resultModal.message}</p>
        <div className="mt-3 text-end">
          <button
            className="btn btn-primary"
            onClick={() => setResultModal({show: false, message: ''})}
          >
            OK
          </button>
        </div>
      </Modal>
    </div>
  );
}
