'use client';

import { useState, useEffect } from 'react';

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    setLoading(true);
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

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Quote Requests</h4>
          <p className="mb-0 text-muted">Request custom pricing for bulk orders</p>
        </div>
        <button
          onClick={() => {
            const modal = document.createElement('div');
            modal.className = 'modal fade show d-block';
            modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
            modal.innerHTML = `
              <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title">Request Quote</h5>
                    <button type="button" class="btn-close" onclick="this.closest('.modal').remove()"></button>
                  </div>
                  <div class="modal-body">
                    <div class="mb-3">
                      <label class="form-label">Your Email</label>
                      <input type="email" class="form-control" id="quoteEmail" placeholder="you@company.com">
                    </div>
                    <div class="mb-3">
                      <label class="form-label">Notes</label>
                      <textarea class="form-control" id="quoteNotes" rows="3" placeholder="Describe your requirements..."></textarea>
                    </div>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                    <button type="button" class="btn btn-primary" onclick="window.submitQuote()">Submit</button>
                  </div>
                </div>
              </div>
            `;
            (window as any).submitQuote = async () => {
              const email = (document.getElementById('quoteEmail') as HTMLInputElement).value;
              const notes = (document.getElementById('quoteNotes') as HTMLTextAreaElement).value;
              
              try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.eagledtfsupply.com';
                await fetch(`${API_URL}/api/v1/quotes`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    companyId: localStorage.getItem('eagle_companyId') || '',
                    userId: localStorage.getItem('eagle_userId') || '',
                    notes: `${notes} (${email})`,
                  }),
                });
                
                const successModal = document.createElement('div');
                successModal.className = 'modal fade show d-block';
                successModal.style.backgroundColor = 'rgba(0,0,0,0.5)';
                successModal.innerHTML = `
                  <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                      <div class="modal-header">
                        <h5 class="modal-title">✅ Success</h5>
                        <button type="button" class="btn-close" onclick="this.closest('.modal').remove(); location.reload();"></button>
                      </div>
                      <div class="modal-body">Quote request submitted!</div>
                      <div class="modal-footer">
                        <button type="button" class="btn btn-primary" onclick="this.closest('.modal').remove(); location.reload();">OK</button>
                      </div>
                    </div>
                  </div>
                `;
                document.querySelectorAll('.modal').forEach(m => m.remove());
                document.body.appendChild(successModal);
              } catch (err) {
                console.error(err);
              }
            };
            document.body.appendChild(modal);
          }}
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
              <button className="btn btn-primary mt-3">
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
                        <span className={`badge ${
                          quote.status === 'approved' ? 'bg-success' :
                          quote.status === 'rejected' ? 'bg-danger' :
                          'bg-warning'
                        }`}>
                          {quote.status}
                        </span>
                      </td>
                      <td className="small">{quote.notes}</td>
                      <td>
                        <button className="btn btn-sm btn-primary">
                          <i className="ti ti-eye"></i>
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
    </div>
  );
}
