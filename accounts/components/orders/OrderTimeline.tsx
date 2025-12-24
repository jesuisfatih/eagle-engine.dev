'use client';

import { formatDate, formatRelativeTime } from '@/lib/utils';

// Tracking event types
export type TrackingEventType = 
  | 'order_placed'
  | 'order_confirmed'
  | 'payment_received'
  | 'processing'
  | 'ready_for_pickup'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'refunded'
  | 'on_hold';

interface TrackingEvent {
  id: string;
  type: TrackingEventType;
  title: string;
  description?: string;
  location?: string;
  timestamp: string;
  isCompleted: boolean;
}

interface ShippingInfo {
  carrier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
  shippingMethod?: string;
}

interface OrderTimelineProps {
  events: TrackingEvent[];
  currentStatus?: string;
  shippingInfo?: ShippingInfo;
}

export function OrderTimeline({ events, currentStatus, shippingInfo }: OrderTimelineProps) {
  // Sort events by timestamp
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="order-timeline">
      {/* Shipping Info Card */}
      {shippingInfo && (shippingInfo.carrier || shippingInfo.trackingNumber) && (
        <div className="card border-primary mb-4">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h6 className="mb-1">
                  <i className="ti ti-truck me-2 text-primary"></i>
                  Shipping Information
                </h6>
                {shippingInfo.carrier && (
                  <p className="mb-1">
                    Carrier: <strong>{shippingInfo.carrier}</strong>
                  </p>
                )}
                {shippingInfo.trackingNumber && (
                  <p className="mb-1">
                    Tracking: <code className="bg-light px-2 py-1 rounded">{shippingInfo.trackingNumber}</code>
                  </p>
                )}
                {shippingInfo.shippingMethod && (
                  <p className="mb-0 text-muted small">
                    Method: {shippingInfo.shippingMethod}
                  </p>
                )}
              </div>
              <div className="text-end">
                {shippingInfo.estimatedDelivery && (
                  <div className="mb-2">
                    <small className="text-muted d-block">Estimated Delivery</small>
                    <strong className="text-success">{formatDate(shippingInfo.estimatedDelivery)}</strong>
                  </div>
                )}
                {shippingInfo.trackingUrl && (
                  <a 
                    href={shippingInfo.trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-primary"
                  >
                    <i className="ti ti-external-link me-1"></i>
                    Track Package
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {currentStatus && (
        <div className="card mb-4">
          <div className="card-body">
            <OrderProgressBar status={currentStatus} />
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="card">
        <div className="card-header">
          <h6 className="mb-0">
            <i className="ti ti-history me-2"></i>
            Order Timeline
          </h6>
        </div>
        <div className="card-body">
          {sortedEvents.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <i className="ti ti-clock ti-2x mb-2"></i>
              <p className="mb-0">No tracking events yet</p>
            </div>
          ) : (
            <div className="timeline">
              {sortedEvents.map((event, index) => {
                const config = getEventConfig(event.type);
                const isFirst = index === 0;
                
                return (
                  <div key={event.id} className="timeline-item d-flex mb-4">
                    <div className="timeline-marker me-3">
                      <div 
                        className={`rounded-circle d-flex align-items-center justify-content-center ${
                          isFirst ? config.bgClass : 'bg-light'
                        } ${isFirst ? 'text-white' : 'text-muted'}`}
                        style={{ width: 40, height: 40 }}
                      >
                        <i className={`ti ti-${config.icon}`}></i>
                      </div>
                      {index < sortedEvents.length - 1 && (
                        <div 
                          className="mx-auto bg-light"
                          style={{ width: 2, height: 24, marginTop: 4 }}
                        ></div>
                      )}
                    </div>
                    <div className="timeline-content flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className={`mb-1 ${isFirst ? '' : 'text-muted'}`}>
                            {event.title}
                          </h6>
                          {event.description && (
                            <p className="text-muted small mb-1">{event.description}</p>
                          )}
                          {event.location && (
                            <p className="text-muted small mb-0">
                              <i className="ti ti-map-pin me-1"></i>
                              {event.location}
                            </p>
                          )}
                        </div>
                        <div className="text-end text-muted small">
                          <div>{formatDate(event.timestamp)}</div>
                          <div>{formatRelativeTime(event.timestamp)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Order progress bar component
interface OrderProgressBarProps {
  status: string;
}

export function OrderProgressBar({ status }: OrderProgressBarProps) {
  const steps = [
    { key: 'placed', label: 'Ordered', icon: 'file-check' },
    { key: 'confirmed', label: 'Confirmed', icon: 'check' },
    { key: 'processing', label: 'Processing', icon: 'settings' },
    { key: 'shipped', label: 'Shipped', icon: 'truck' },
    { key: 'delivered', label: 'Delivered', icon: 'package' },
  ];

  const statusMapping: Record<string, number> = {
    'pending': 0,
    'placed': 1,
    'order_placed': 1,
    'confirmed': 2,
    'order_confirmed': 2,
    'processing': 3,
    'ready_for_pickup': 3,
    'shipped': 4,
    'out_for_delivery': 4,
    'delivered': 5,
    'fulfilled': 5,
  };

  const currentStep = statusMapping[status.toLowerCase()] || 1;

  return (
    <div className="order-progress">
      <div className="d-flex justify-content-between position-relative">
        {/* Progress line */}
        <div 
          className="position-absolute bg-light"
          style={{ 
            top: 16, 
            left: '10%', 
            right: '10%', 
            height: 4,
            zIndex: 0
          }}
        >
          <div 
            className="bg-success h-100 transition-all"
            style={{ 
              width: `${Math.min((currentStep - 1) / (steps.length - 1) * 100, 100)}%`,
              transition: 'width 0.3s ease'
            }}
          ></div>
        </div>

        {steps.map((step, index) => {
          const stepNum = index + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;
          
          return (
            <div 
              key={step.key} 
              className="text-center position-relative"
              style={{ zIndex: 1, flex: 1 }}
            >
              <div 
                className={`rounded-circle d-flex align-items-center justify-content-center mx-auto mb-2 ${
                  isCompleted || isCurrent 
                    ? 'bg-success text-white' 
                    : 'bg-light text-muted'
                }`}
                style={{ 
                  width: 36, 
                  height: 36,
                  border: isCurrent ? '3px solid #198754' : 'none'
                }}
              >
                {isCompleted ? (
                  <i className="ti ti-check"></i>
                ) : (
                  <i className={`ti ti-${step.icon}`}></i>
                )}
              </div>
              <small className={isCurrent ? 'fw-semibold' : 'text-muted'}>
                {step.label}
              </small>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Compact order status badge
interface OrderStatusBadgeProps {
  status: string;
  fulfillmentStatus?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function OrderStatusBadge({ status, fulfillmentStatus, size = 'md' }: OrderStatusBadgeProps) {
  const displayStatus = fulfillmentStatus || status;
  const config = getOrderStatusConfig(displayStatus);
  const sizeClass = size === 'sm' ? 'small' : size === 'lg' ? 'fs-6' : '';
  
  return (
    <span className={`badge ${config.class} ${sizeClass}`}>
      <i className={`ti ti-${config.icon} me-1`}></i>
      {config.label}
    </span>
  );
}

// Delivery estimate component
interface DeliveryEstimateProps {
  estimatedDate?: string;
  shippedDate?: string;
  className?: string;
}

export function DeliveryEstimate({ estimatedDate, shippedDate, className = '' }: DeliveryEstimateProps) {
  if (!estimatedDate && !shippedDate) return null;

  const now = new Date();
  const estimated = estimatedDate ? new Date(estimatedDate) : null;
  const daysUntil = estimated 
    ? Math.ceil((estimated.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className={`delivery-estimate ${className}`}>
      {estimated && daysUntil !== null && (
        <div className="d-flex align-items-center">
          <i className="ti ti-calendar-event me-2 text-primary"></i>
          <div>
            <div className="small text-muted">Estimated Delivery</div>
            <div className="fw-semibold">
              {formatDate(estimatedDate!)}
              {daysUntil > 0 && (
                <span className="text-success ms-2">({daysUntil} day{daysUntil !== 1 ? 's' : ''})</span>
              )}
              {daysUntil === 0 && (
                <span className="text-success ms-2">(Today!)</span>
              )}
              {daysUntil < 0 && (
                <span className="text-muted ms-2">(Delayed)</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper functions
function getEventConfig(type: TrackingEventType) {
  const configs: Record<TrackingEventType, { icon: string; bgClass: string }> = {
    order_placed: { icon: 'file-plus', bgClass: 'bg-primary' },
    order_confirmed: { icon: 'check', bgClass: 'bg-success' },
    payment_received: { icon: 'credit-card', bgClass: 'bg-success' },
    processing: { icon: 'settings', bgClass: 'bg-info' },
    ready_for_pickup: { icon: 'package', bgClass: 'bg-info' },
    shipped: { icon: 'truck', bgClass: 'bg-primary' },
    out_for_delivery: { icon: 'truck-delivery', bgClass: 'bg-warning' },
    delivered: { icon: 'package-check', bgClass: 'bg-success' },
    cancelled: { icon: 'x', bgClass: 'bg-danger' },
    refunded: { icon: 'receipt-refund', bgClass: 'bg-secondary' },
    on_hold: { icon: 'clock-pause', bgClass: 'bg-warning' },
  };
  return configs[type] || { icon: 'point', bgClass: 'bg-secondary' };
}

function getOrderStatusConfig(status: string) {
  const lowerStatus = status.toLowerCase();
  
  const configs: Record<string, { label: string; class: string; icon: string }> = {
    'pending': { label: 'Pending', class: 'bg-warning', icon: 'clock' },
    'paid': { label: 'Paid', class: 'bg-success', icon: 'credit-card' },
    'confirmed': { label: 'Confirmed', class: 'bg-success', icon: 'check' },
    'processing': { label: 'Processing', class: 'bg-info', icon: 'settings' },
    'shipped': { label: 'Shipped', class: 'bg-primary', icon: 'truck' },
    'fulfilled': { label: 'Fulfilled', class: 'bg-success', icon: 'package' },
    'delivered': { label: 'Delivered', class: 'bg-success', icon: 'package-check' },
    'cancelled': { label: 'Cancelled', class: 'bg-danger', icon: 'x' },
    'refunded': { label: 'Refunded', class: 'bg-secondary', icon: 'receipt-refund' },
    'partially_fulfilled': { label: 'Partial', class: 'bg-warning', icon: 'package' },
    'unfulfilled': { label: 'Unfulfilled', class: 'bg-secondary', icon: 'package-off' },
  };

  return configs[lowerStatus] || { label: status, class: 'bg-secondary', icon: 'point' };
}
