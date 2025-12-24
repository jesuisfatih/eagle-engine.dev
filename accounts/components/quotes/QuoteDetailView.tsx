'use client';

import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils';

// Quote status type
export type QuoteStatus = 'draft' | 'pending' | 'reviewing' | 'quoted' | 'approved' | 'rejected' | 'expired';

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
  status: QuoteStatus;
  items: QuoteItem[];
  notes?: string;
  priority: 'normal' | 'urgent';
  requestedDeliveryDate?: string;
  validUntil?: string;
  subtotal?: number;
  discount?: number;
  total?: number;
  createdAt: string;
  updatedAt: string;
  quotedAt?: string;
  respondedBy?: string;
  responseNotes?: string;
}

interface QuoteDetailViewProps {
  quote: Quote;
  onAccept?: () => void;
  onReject?: () => void;
  onConvertToOrder?: () => void;
  isProcessing?: boolean;
}

export function QuoteDetailView({ 
  quote, 
  onAccept, 
  onReject, 
  onConvertToOrder,
  isProcessing = false 
}: QuoteDetailViewProps) {
  const statusConfig = getStatusConfig(quote.status);
  const isQuoted = quote.status === 'quoted';
  const isExpired = quote.validUntil && new Date(quote.validUntil) < new Date();

  return (
    <div className="quote-detail">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h4 className="mb-1">
            Quote #{quote.quoteNumber || quote.id.substring(0, 8)}
          </h4>
          <p className="text-muted mb-0">
            Requested {formatRelativeTime(quote.createdAt)}
          </p>
        </div>
        <div className="text-end">
          <span className={`badge ${statusConfig.class} fs-6`}>
            <i className={`ti ti-${statusConfig.icon} me-1`}></i>
            {statusConfig.label}
          </span>
          {quote.priority === 'urgent' && (
            <span className="badge bg-danger ms-2">
              <i className="ti ti-urgent me-1"></i>
              Urgent
            </span>
          )}
        </div>
      </div>

      {/* Expiry Warning */}
      {isQuoted && quote.validUntil && (
        <div className={`alert ${isExpired ? 'alert-danger' : 'alert-warning'} d-flex align-items-center`}>
          <i className={`ti ti-${isExpired ? 'alert-circle' : 'clock'} me-2`}></i>
          {isExpired ? (
            <span>This quote has expired on {formatDate(quote.validUntil)}</span>
          ) : (
            <span>Quote valid until <strong>{formatDate(quote.validUntil)}</strong> ({formatRelativeTime(quote.validUntil)})</span>
          )}
        </div>
      )}

      {/* Response from Seller */}
      {quote.responseNotes && (
        <div className="card border-primary mb-4">
          <div className="card-header bg-primary text-white">
            <i className="ti ti-message me-2"></i>
            Response from Sales Team
          </div>
          <div className="card-body">
            <p className="mb-0">{quote.responseNotes}</p>
            {quote.quotedAt && (
              <small className="text-muted d-block mt-2">
                Responded {formatRelativeTime(quote.quotedAt)}
                {quote.respondedBy && ` by ${quote.respondedBy}`}
              </small>
            )}
          </div>
        </div>
      )}

      {/* Items Table */}
      <div className="card mb-4">
        <div className="card-header">
          <h6 className="mb-0">
            <i className="ti ti-package me-2"></i>
            Quote Items ({quote.items.length})
          </h6>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Product</th>
                  <th className="text-center">Quantity</th>
                  <th className="text-end">Your Price</th>
                  <th className="text-end">Quoted Price</th>
                  <th className="text-end">Total</th>
                </tr>
              </thead>
              <tbody>
                {quote.items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="fw-semibold">{item.title}</div>
                      {item.variantTitle && (
                        <small className="text-muted">{item.variantTitle}</small>
                      )}
                      {item.notes && (
                        <div className="mt-1">
                          <small className="text-muted fst-italic">Note: {item.notes}</small>
                        </div>
                      )}
                    </td>
                    <td className="text-center">{item.quantity}</td>
                    <td className="text-end">
                      {item.requestedPrice 
                        ? formatCurrency(item.requestedPrice)
                        : <span className="text-muted">-</span>
                      }
                    </td>
                    <td className="text-end">
                      {item.quotedPrice ? (
                        <span className="text-success fw-semibold">
                          {formatCurrency(item.quotedPrice)}
                        </span>
                      ) : (
                        <span className="text-muted">Pending</span>
                      )}
                    </td>
                    <td className="text-end fw-semibold">
                      {item.quotedPrice 
                        ? formatCurrency(item.quotedPrice * item.quantity)
                        : '-'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quote Summary */}
      {(quote.subtotal || quote.total) && (
        <div className="card mb-4">
          <div className="card-body">
            <div className="row">
              <div className="col-md-6 offset-md-6">
                <div className="d-flex justify-content-between py-2">
                  <span className="text-muted">Subtotal</span>
                  <span>{formatCurrency(quote.subtotal || 0)}</span>
                </div>
                {quote.discount && quote.discount > 0 && (
                  <div className="d-flex justify-content-between py-2 text-success">
                    <span>Discount</span>
                    <span>-{formatCurrency(quote.discount)}</span>
                  </div>
                )}
                <div className="d-flex justify-content-between py-2 border-top fw-bold fs-5">
                  <span>Total</span>
                  <span>{formatCurrency(quote.total || 0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Request Details */}
      <div className="card mb-4">
        <div className="card-header">
          <h6 className="mb-0">
            <i className="ti ti-info-circle me-2"></i>
            Request Details
          </h6>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label text-muted small">Requested Delivery</label>
              <p className="mb-0">
                {quote.requestedDeliveryDate 
                  ? formatDate(quote.requestedDeliveryDate)
                  : 'No specific date'
                }
              </p>
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted small">Priority</label>
              <p className="mb-0">
                <span className={`badge ${quote.priority === 'urgent' ? 'bg-danger' : 'bg-secondary'}`}>
                  {quote.priority}
                </span>
              </p>
            </div>
            {quote.notes && (
              <div className="col-12">
                <label className="form-label text-muted small">Your Notes</label>
                <p className="mb-0">{quote.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {isQuoted && !isExpired && (
        <div className="card bg-light">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
              <p className="mb-0 text-muted">
                <i className="ti ti-info-circle me-1"></i>
                Accept this quote to proceed with your order
              </p>
              <div className="d-flex gap-2">
                {onReject && (
                  <button
                    className="btn btn-outline-danger"
                    onClick={onReject}
                    disabled={isProcessing}
                  >
                    <i className="ti ti-x me-1"></i>
                    Decline
                  </button>
                )}
                {onAccept && (
                  <button
                    className="btn btn-success"
                    onClick={onAccept}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <span className="spinner-border spinner-border-sm me-2"></span>
                    ) : (
                      <i className="ti ti-check me-1"></i>
                    )}
                    Accept Quote
                  </button>
                )}
                {onConvertToOrder && (
                  <button
                    className="btn btn-primary"
                    onClick={onConvertToOrder}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <span className="spinner-border spinner-border-sm me-2"></span>
                    ) : (
                      <i className="ti ti-shopping-cart me-1"></i>
                    )}
                    Convert to Order
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Quote list item component
interface QuoteListItemProps {
  quote: Quote;
  onClick?: () => void;
}

export function QuoteListItem({ quote, onClick }: QuoteListItemProps) {
  const statusConfig = getStatusConfig(quote.status);
  const itemCount = quote.items.length;
  const totalQuantity = quote.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div 
      className="card mb-2 cursor-pointer hover-shadow"
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h6 className="mb-1">
              Quote #{quote.quoteNumber || quote.id.substring(0, 8)}
              {quote.priority === 'urgent' && (
                <span className="badge bg-danger ms-2 small">Urgent</span>
              )}
            </h6>
            <p className="text-muted small mb-0">
              {itemCount} product{itemCount !== 1 ? 's' : ''} • {totalQuantity} unit{totalQuantity !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="text-end">
            <span className={`badge ${statusConfig.class}`}>
              <i className={`ti ti-${statusConfig.icon} me-1`}></i>
              {statusConfig.label}
            </span>
            <p className="text-muted small mb-0 mt-1">
              {formatRelativeTime(quote.updatedAt || quote.createdAt)}
            </p>
          </div>
        </div>
        {quote.total && (
          <div className="mt-2 pt-2 border-top">
            <div className="d-flex justify-content-between">
              <span className="text-muted">Quoted Total</span>
              <span className="fw-bold">{formatCurrency(quote.total)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Quote status badge
interface QuoteStatusBadgeProps {
  status: QuoteStatus;
  size?: 'sm' | 'md' | 'lg';
}

export function QuoteStatusBadge({ status, size = 'md' }: QuoteStatusBadgeProps) {
  const config = getStatusConfig(status);
  const sizeClass = size === 'sm' ? 'small' : size === 'lg' ? 'fs-6' : '';
  
  return (
    <span className={`badge ${config.class} ${sizeClass}`}>
      <i className={`ti ti-${config.icon} me-1`}></i>
      {config.label}
    </span>
  );
}

// Helper function for status configuration
function getStatusConfig(status: QuoteStatus) {
  const configs: Record<QuoteStatus, { label: string; class: string; icon: string }> = {
    draft: { label: 'Draft', class: 'bg-secondary', icon: 'edit' },
    pending: { label: 'Pending', class: 'bg-warning', icon: 'clock' },
    reviewing: { label: 'Under Review', class: 'bg-info', icon: 'eye' },
    quoted: { label: 'Quoted', class: 'bg-primary', icon: 'check' },
    approved: { label: 'Approved', class: 'bg-success', icon: 'check-circle' },
    rejected: { label: 'Declined', class: 'bg-danger', icon: 'x-circle' },
    expired: { label: 'Expired', class: 'bg-secondary', icon: 'clock-off' },
  };
  return configs[status] || configs.pending;
}

// Quote timeline for tracking
interface QuoteTimelineProps {
  quote: Quote;
}

export function QuoteTimeline({ quote }: QuoteTimelineProps) {
  const events = [
    { 
      date: quote.createdAt, 
      label: 'Quote Requested', 
      icon: 'file-plus',
      completed: true 
    },
    { 
      date: quote.status !== 'pending' && quote.status !== 'draft' ? quote.updatedAt : null, 
      label: 'Under Review', 
      icon: 'eye',
      completed: ['reviewing', 'quoted', 'approved', 'rejected'].includes(quote.status)
    },
    { 
      date: quote.quotedAt, 
      label: 'Quote Provided', 
      icon: 'file-check',
      completed: ['quoted', 'approved'].includes(quote.status)
    },
    { 
      date: quote.status === 'approved' ? quote.updatedAt : null, 
      label: 'Quote Accepted', 
      icon: 'check-circle',
      completed: quote.status === 'approved'
    },
  ];

  return (
    <div className="quote-timeline">
      {events.map((event, index) => (
        <div key={index} className="d-flex mb-3">
          <div className="me-3">
            <div 
              className={`rounded-circle d-flex align-items-center justify-content-center ${
                event.completed ? 'bg-success text-white' : 'bg-light text-muted'
              }`}
              style={{ width: 32, height: 32 }}
            >
              <i className={`ti ti-${event.icon}`}></i>
            </div>
            {index < events.length - 1 && (
              <div 
                className={`mx-auto ${event.completed ? 'bg-success' : 'bg-light'}`}
                style={{ width: 2, height: 24, marginTop: 4 }}
              ></div>
            )}
          </div>
          <div>
            <div className={event.completed ? 'fw-semibold' : 'text-muted'}>
              {event.label}
            </div>
            {event.date && (
              <small className="text-muted">{formatDate(event.date)}</small>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
