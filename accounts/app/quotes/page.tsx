'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';
import { accountsFetch } from '@/lib/api-client';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';
import { QuoteRequestForm, QuoteFormData } from '@/components/quotes/QuoteRequestForm';
import { QuoteStatusBadge, QuoteTimeline } from '@/components/quotes/QuoteDetailView';
import type { QuoteStatus } from '@/components/quotes/QuoteDetailView';

interface QuoteItem {
  id: string;
  productId: string;
  title: string;
  variantTitle?: string;
  quantity: number;
  requestedPrice?: number;
  quotedPrice?: number;
  notes?: string;
}

interface Quote {
  id: string;
  quoteNumber?: string;
  companyId: string;
  userId: string;
  notes: string;
  status: QuoteStatus;
  priority?: 'normal' | 'urgent';
  items?: QuoteItem[];
  subtotal?: number;
  discount?: number;
  total?: number;
  validUntil?: string;
  quotedAt?: string;
  responseNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestModal, setRequestModal] = useState(false);
  const [detailModal, setDetailModal] = useState<Quote | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultModal, setResultModal] = useState<{show: boolean; message: string; type: 'success' | 'error'}>({show: false, message: '', type: 'success'});
  const [filter, setFilter] = useState<'all' | QuoteStatus>('all');

  useEffect(() => {
    loadQuotes();
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'new') {
      setRequestModal(true);
    }
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

  const submitQuote = async (formData: QuoteFormData) => {
    setIsSubmitting(true);
    try {
      const companyId = localStorage.getItem('eagle_companyId') || '';
      const userId = localStorage.getItem('eagle_userId') || '';
      
      const response = await accountsFetch('/api/v1/quotes', {
        method: 'POST',
        body: JSON.stringify({
          companyId,
          userId,
          items: formData.items,
          notes: formData.notes,
          priority: formData.priority,
          requestedDeliveryDate: formData.requestedDeliveryDate,
          contactEmail: formData.contactEmail,
          contactPhone: formData.contactPhone,
        }),
      });
      
      setRequestModal(false);
      
      if (response.ok) {
        setResultModal({show: true, message: 'Quote request submitted successfully!', type: 'success'});
        loadQuotes();
      } else {
        const error = await response.json().catch(() => ({}));
        setResultModal({show: true, message: error.message || 'Failed to submit quote request', type: 'error'});
      }
    } catch (err) {
      setResultModal({show: true, message: 'Failed to submit quote request', type: 'error'});
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptQuote = async (quoteId: string) => {
    try {
      // Backend uses POST /quotes/:id/approve (not PUT /accept)
      const response = await accountsFetch(`/api/v1/quotes/${quoteId}/approve`, { method: 'POST' });
      if (response.ok) {
        setResultModal({show: true, message: 'Quote accepted!', type: 'success'});
        setDetailModal(null);
        loadQuotes();
      } else {
        const error = await response.json().catch(() => ({}));
        setResultModal({show: true, message: error.message || 'Failed to accept quote', type: 'error'});
      }
    } catch (err) {
      setResultModal({show: true, message: 'Failed to accept quote', type: 'error'});
    }
  };

  const handleRejectQuote = async (quoteId: string) => {
    try {
      // Backend uses POST (not PUT)
      const response = await accountsFetch(`/api/v1/quotes/${quoteId}/reject`, { method: 'POST' });
      if (response.ok) {
        setResultModal({show: true, message: 'Quote declined.', type: 'success'});
        setDetailModal(null);
        loadQuotes();
      } else {
        const error = await response.json().catch(() => ({}));
        setResultModal({show: true, message: error.message || 'Failed to decline quote', type: 'error'});
      }
    } catch (err) {
      setResultModal({show: true, message: 'Failed to decline quote', type: 'error'});
    }
  };

  const filteredQuotes = quotes.filter(q => filter === 'all' || q.status === filter);
  const statusCounts = {
    pending: quotes.filter(q => q.status === 'pending').length,
    quoted: quotes.filter(q => q.status === 'quoted').length,
    approved: quotes.filter(q => q.status === 'approved').length,
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Quote Requests</h4>
          <p className="mb-0 text-muted">Request custom pricing for bulk orders</p>
        </div>
        <button onClick={() => setRequestModal(true)} className="btn btn-primary">
          <i className="ti ti-plus me-1"></i>New Quote Request
        </button>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="mb-0 opacity-75">Total Quotes</p>
                  <h3 className="mb-0">{quotes.length}</h3>
                </div>
                <i className="ti ti-file-invoice fs-1 opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="mb-0 text-muted">Pending</p>
                  <h3 className="mb-0 text-warning">{statusCounts.pending}</h3>
                </div>
                <i className="ti ti-clock fs-1 text-warning opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="mb-0 text-muted">Ready to Accept</p>
                  <h3 className="mb-0 text-info">{statusCounts.quoted}</h3>
                </div>
                <i className="ti ti-check fs-1 text-info opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="mb-0 text-muted">Approved</p>
                  <h3 className="mb-0 text-success">{statusCounts.approved}</h3>
                </div>
                <i className="ti ti-circle-check fs-1 text-success opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="d-flex gap-2 mb-4">
        {(['all', 'pending', 'quoted', 'approved', 'rejected'] as const).map(f => (
          <button
            key={f}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Quotes List */}
      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
              <p className="mt-3 text-muted">Loading quotes...</p>
            </div>
          ) : filteredQuotes.length === 0 ? (
            <div className="text-center py-5">
              <i className="ti ti-file-invoice ti-3x text-muted mb-3"></i>
              <h5>{filter === 'all' ? 'No quote requests yet' : `No ${filter} quotes`}</h5>
              <p className="text-muted">Request a quote for bulk orders to get custom pricing</p>
              {filter === 'all' && (
                <button onClick={() => setRequestModal(true)} className="btn btn-primary mt-3">
                  <i className="ti ti-plus me-1"></i>Request Your First Quote
                </button>
              )}
            </div>
          ) : (
            <div className="list-group list-group-flush">
              {filteredQuotes.map((quote) => {
                const itemCount = quote.items?.length || 0;
                const totalQuantity = quote.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
                
                return (
                  <div 
                    key={quote.id} 
                    className="list-group-item list-group-item-action p-3"
                    onClick={() => setDetailModal(quote)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <h6 className="mb-0 fw-semibold">Quote #{quote.quoteNumber || quote.id.substring(0, 8)}</h6>
                          <QuoteStatusBadge status={quote.status} size="sm" />
                          {quote.priority === 'urgent' && <span className="badge bg-danger small">Urgent</span>}
                        </div>
                        <p className="text-muted small mb-1">
                          {itemCount > 0 ? `${itemCount} product${itemCount !== 1 ? 's' : ''} • ${totalQuantity} units` : quote.notes?.substring(0, 100)}
                        </p>
                        <small className="text-muted"><i className="ti ti-clock me-1"></i>{formatRelativeTime(quote.createdAt)}</small>
                      </div>
                      <div className="text-end">
                        {quote.total && <div className="fw-bold text-success mb-1">{formatCurrency(quote.total)}</div>}
                        <i className="ti ti-chevron-right text-muted"></i>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Request Quote Modal */}
      <Modal show={requestModal} onClose={() => setRequestModal(false)} title="Request Quote">
        <QuoteRequestForm onSubmit={submitQuote} onCancel={() => setRequestModal(false)} isSubmitting={isSubmitting} />
      </Modal>

      {/* Quote Detail Modal */}
      {detailModal && (
        <Modal show={!!detailModal} onClose={() => setDetailModal(null)} title={`Quote #${detailModal.quoteNumber || detailModal.id.substring(0, 8)}`}>
          <div className="quote-detail">
            <div className="d-flex align-items-center gap-3 mb-4">
              <QuoteStatusBadge status={detailModal.status} size="lg" />
              {detailModal.priority === 'urgent' && <span className="badge bg-danger">Urgent</span>}
            </div>
            
            {detailModal.responseNotes && (
              <div className="alert alert-info mb-3">
                <i className="ti ti-message me-2"></i><strong>Sales Response:</strong>
                <p className="mb-0 mt-1">{detailModal.responseNotes}</p>
              </div>
            )}

            <div className="mb-3">
              <QuoteTimeline quote={detailModal as Parameters<typeof QuoteTimeline>[0]['quote']} />
            </div>

            {detailModal.items && detailModal.items.length > 0 && (
              <div className="card mb-3">
                <div className="card-header"><h6 className="mb-0">Quote Items</h6></div>
                <div className="table-responsive">
                  <table className="table mb-0">
                    <thead><tr><th>Product</th><th className="text-center">Qty</th><th className="text-end">Price</th></tr></thead>
                    <tbody>
                      {detailModal.items.map((item) => (
                        <tr key={item.id}>
                          <td><div className="fw-semibold">{item.title}</div>{item.variantTitle && <small className="text-muted">{item.variantTitle}</small>}</td>
                          <td className="text-center">{item.quantity}</td>
                          <td className="text-end">{item.quotedPrice ? formatCurrency(item.quotedPrice) : <span className="text-muted">Pending</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {detailModal.notes && (
              <div className="card mb-3">
                <div className="card-header"><h6 className="mb-0">Your Notes</h6></div>
                <div className="card-body"><p className="mb-0">{detailModal.notes}</p></div>
              </div>
            )}

            {detailModal.total && (
              <div className="card bg-light mb-3">
                <div className="card-body">
                  <div className="d-flex justify-content-between py-2 border-bottom"><span>Subtotal</span><span>{formatCurrency(detailModal.subtotal || 0)}</span></div>
                  {detailModal.discount && detailModal.discount > 0 && <div className="d-flex justify-content-between py-2 text-success"><span>Discount</span><span>-{formatCurrency(detailModal.discount)}</span></div>}
                  <div className="d-flex justify-content-between py-2 fw-bold fs-5"><span>Total</span><span className="text-success">{formatCurrency(detailModal.total)}</span></div>
                </div>
              </div>
            )}

            {detailModal.status === 'quoted' && (
              <div className="d-flex justify-content-end gap-2 pt-3 border-top">
                <button className="btn btn-outline-danger" onClick={() => handleRejectQuote(detailModal.id)}><i className="ti ti-x me-1"></i>Decline</button>
                <button className="btn btn-success" onClick={() => handleAcceptQuote(detailModal.id)}><i className="ti ti-check me-1"></i>Accept Quote</button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Result Modal */}
      <Modal show={resultModal.show} onClose={() => setResultModal({show: false, message: '', type: 'success'})} title={resultModal.type === 'success' ? 'Success' : 'Error'}>
        <div className="text-center py-3">
          <i className={`ti ti-${resultModal.type === 'success' ? 'circle-check text-success' : 'alert-circle text-danger'} ti-3x mb-3`}></i>
          <p className="mb-0">{resultModal.message}</p>
        </div>
        <div className="text-end mt-3">
          <button className="btn btn-primary" onClick={() => setResultModal({show: false, message: '', type: 'success'})}>OK</button>
        </div>
      </Modal>
    </div>
  );
}
