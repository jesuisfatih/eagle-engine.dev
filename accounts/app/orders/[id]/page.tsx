'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import OrderTracking from '../components/OrderTracking';
import { accountsFetch } from '@/lib/api-client';
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils';
import { OrderStatusBadge, ReorderButton } from '@/components/orders';
import type { Order } from '@eagle/types';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [reordering, setReordering] = useState(false);

  useEffect(() => {
    loadOrder();
  }, [params.id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const response = await accountsFetch(`/api/v1/orders/${params.id}`);
      const data = await response.json();
      setOrder(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = async () => {
    if (!order?.lineItems) return;
    
    setReordering(true);
    try {
      const companyId = localStorage.getItem('eagle_companyId') || '';
      let addedCount = 0;
      
      for (const item of order.lineItems) {
        try {
          const response = await accountsFetch(`/api/v1/companies/${companyId}/cart`, {
            method: 'POST',
            body: JSON.stringify({
              productId: item.productId || item.shopifyProductId,
              variantId: item.variantId || item.shopifyVariantId,
              quantity: item.quantity,
            }),
          });
          if (response.ok) addedCount++;
        } catch (err) {
          console.error('Failed to add item:', err);
        }
      }
      
      if (addedCount > 0) {
        router.push('/cart');
      }
    } catch (err) {
      console.error('Reorder error:', err);
    } finally {
      setReordering(false);
    }
  };

  const getPaymentStatusConfig = (status: string) => {
    const configs: Record<string, { class: string; icon: string; label: string }> = {
      paid: { class: 'bg-success', icon: 'check', label: 'Paid' },
      pending: { class: 'bg-warning', icon: 'clock', label: 'Pending' },
      refunded: { class: 'bg-info', icon: 'arrow-back', label: 'Refunded' },
      partially_refunded: { class: 'bg-info', icon: 'arrow-back', label: 'Partial Refund' },
      voided: { class: 'bg-secondary', icon: 'x', label: 'Voided' },
    };
    return configs[status] || { class: 'bg-secondary', icon: 'question-mark', label: status };
  };

  const getFulfillmentStatusConfig = (status: string) => {
    const configs: Record<string, { class: string; icon: string; label: string }> = {
      fulfilled: { class: 'bg-success', icon: 'package', label: 'Fulfilled' },
      partial: { class: 'bg-warning', icon: 'package', label: 'Partially Fulfilled' },
      unfulfilled: { class: 'bg-secondary', icon: 'package-off', label: 'Unfulfilled' },
      shipped: { class: 'bg-info', icon: 'truck', label: 'Shipped' },
      delivered: { class: 'bg-success', icon: 'circle-check', label: 'Delivered' },
    };
    return configs[status] || { class: 'bg-secondary', icon: 'package', label: status || 'Processing' };
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary"></div>
        <p className="mt-3 text-muted">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-5">
        <i className="ti ti-file-off ti-3x text-muted mb-3"></i>
        <h5>Order not found</h5>
        <p className="text-muted mb-3">The order you're looking for doesn't exist or you don't have access.</p>
        <Link href="/orders" className="btn btn-primary">
          <i className="ti ti-arrow-left me-1"></i>Back to Orders
        </Link>
      </div>
    );
  }

  const paymentConfig = getPaymentStatusConfig(order.financialStatus);
  const fulfillmentConfig = getFulfillmentStatusConfig(order.fulfillmentStatus);

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="mb-4">
        <Link href="/orders" className="text-primary text-decoration-none">
          <i className="ti ti-arrow-left me-1"></i>Back to Orders
        </Link>
      </nav>

      {/* Order Header */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
            <div>
              <h4 className="mb-2">Order #{order.shopifyOrderNumber || order.id}</h4>
              <div className="d-flex flex-wrap gap-2 mb-2">
                <span className={`badge ${paymentConfig.class}`}>
                  <i className={`ti ti-${paymentConfig.icon} me-1`}></i>
                  {paymentConfig.label}
                </span>
                <span className={`badge ${fulfillmentConfig.class}`}>
                  <i className={`ti ti-${fulfillmentConfig.icon} me-1`}></i>
                  {fulfillmentConfig.label}
                </span>
              </div>
              <p className="text-muted mb-0">
                Placed on {formatDate(order.createdAt)} ({formatRelativeTime(order.createdAt)})
              </p>
            </div>
            <div className="d-flex gap-2">
              <button
                onClick={handleReorder}
                className="btn btn-primary"
                disabled={reordering}
              >
                {reordering ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1"></span>
                    Adding to cart...
                  </>
                ) : (
                  <>
                    <i className="ti ti-refresh me-1"></i>
                    Reorder
                  </>
                )}
              </button>
              <button
                onClick={() => window.print()}
                className="btn btn-outline-secondary"
              >
                <i className="ti ti-printer me-1"></i>
                Print
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Order Items */}
        <div className="col-lg-8">
          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">
                <i className="ti ti-package me-2"></i>
                Items ({order.lineItems?.length || 0})
              </h5>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th>Product</th>
                      <th className="text-center">Qty</th>
                      <th className="text-end">Unit Price</th>
                      <th className="text-end">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.lineItems?.map((item: any, i: number) => (
                      <tr key={i}>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            {item.image && (
                              <img 
                                src={item.image} 
                                alt={item.name}
                                className="rounded"
                                style={{ width: 50, height: 50, objectFit: 'cover' }}
                              />
                            )}
                            <div>
                              <p className="fw-semibold mb-0">{item.name}</p>
                              {item.sku && <small className="text-muted">SKU: {item.sku}</small>}
                              {item.variantTitle && item.variantTitle !== 'Default Title' && (
                                <small className="d-block text-muted">{item.variantTitle}</small>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="text-center align-middle">{item.quantity}</td>
                        <td className="text-end align-middle">{formatCurrency(item.price)}</td>
                        <td className="text-end align-middle fw-semibold">
                          {formatCurrency(item.price * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Shipping Info */}
          {order.shippingAddress && (
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  <i className="ti ti-truck me-2"></i>Shipping Information
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6 className="text-muted mb-2">Shipping Address</h6>
                    <p className="mb-1 fw-semibold">
                      {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                    </p>
                    {order.shippingAddress.company && (
                      <p className="mb-1">{order.shippingAddress.company}</p>
                    )}
                    <p className="mb-1">{order.shippingAddress.address1}</p>
                    {order.shippingAddress.address2 && (
                      <p className="mb-1">{order.shippingAddress.address2}</p>
                    )}
                    <p className="mb-1">
                      {order.shippingAddress.city}, {order.shippingAddress.province} {order.shippingAddress.zip}
                    </p>
                    <p className="mb-0">{order.shippingAddress.country}</p>
                  </div>
                  <div className="col-md-6">
                    <h6 className="text-muted mb-2">Shipping Method</h6>
                    <p className="mb-1 fw-semibold">
                      {order.shippingLines?.[0]?.title || 'Standard Shipping'}
                    </p>
                    {order.trackingNumber && (
                      <div className="mt-3">
                        <h6 className="text-muted mb-2">Tracking</h6>
                        <p className="mb-0">
                          <a href={order.trackingUrl || '#'} target="_blank" rel="noopener noreferrer" className="text-primary">
                            {order.trackingNumber}
                            <i className="ti ti-external-link ms-1"></i>
                          </a>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Order Timeline */}
          <OrderTracking order={order} />
        </div>

        {/* Order Summary Sidebar */}
        <div className="col-lg-4">
          <div className="card sticky-top" style={{ top: 80 }}>
            <div className="card-header">
              <h6 className="card-title mb-0">
                <i className="ti ti-receipt me-2"></i>Order Summary
              </h6>
            </div>
            <div className="card-body">
              <ul className="list-unstyled mb-0">
                <li className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </li>
                {order.totalShipping > 0 && (
                  <li className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Shipping</span>
                    <span>{formatCurrency(order.totalShipping)}</span>
                  </li>
                )}
                {order.totalTax > 0 && (
                  <li className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Tax</span>
                    <span>{formatCurrency(order.totalTax)}</span>
                  </li>
                )}
                {order.totalDiscounts > 0 && (
                  <li className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Discounts</span>
                    <span className="text-success">-{formatCurrency(order.totalDiscounts)}</span>
                  </li>
                )}
                <li className="border-top pt-2 mt-2">
                  <div className="d-flex justify-content-between">
                    <span className="fw-bold">Total</span>
                    <span className="fw-bold text-primary fs-5">
                      {formatCurrency(order.totalPrice)}
                    </span>
                  </div>
                </li>
              </ul>

              {/* B2B Savings Info */}
              {order.totalDiscounts > 0 && (
                <div className="alert alert-success-subtle mt-3 mb-0 small">
                  <i className="ti ti-pig-money me-1"></i>
                  You saved <strong>{formatCurrency(order.totalDiscounts)}</strong> with B2B pricing!
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="card-footer bg-transparent">
              <div className="d-grid gap-2">
                <button
                  onClick={handleReorder}
                  className="btn btn-primary"
                  disabled={reordering}
                >
                  {reordering ? (
                    <span className="spinner-border spinner-border-sm me-1"></span>
                  ) : (
                    <i className="ti ti-refresh me-1"></i>
                  )}
                  Reorder All Items
                </button>
                <button
                  onClick={() => window.print()}
                  className="btn btn-outline-secondary"
                >
                  <i className="ti ti-printer me-1"></i>
                  Print Invoice
                </button>
                <Link href="/support" className="btn btn-outline-secondary">
                  <i className="ti ti-headset me-1"></i>
                  Need Help?
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

