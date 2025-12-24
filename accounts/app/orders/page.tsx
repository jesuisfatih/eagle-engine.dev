'use client';

import { useState, useEffect } from 'react';
import { accountsFetch } from '@/lib/api-client';
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils';
import { OrderStatusBadge } from '@/components/orders/OrderTimeline';
import { ReorderButton, QuickReorderPanel } from '@/components/orders/ReorderComponents';
import type { Order } from '@eagle/types';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [shopDomain, setShopDomain] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid' | 'fulfilled'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'total'>('date');

  useEffect(() => {
    loadOrders();
    loadShopDomain();
  }, []);

  const loadShopDomain = async () => {
    try {
      const companyId = localStorage.getItem('eagle_companyId') || '';
      const response = await accountsFetch(`/api/v1/companies/${companyId}`);
      if (response.ok) {
        const company = await response.json();
        setShopDomain(company.merchant?.shopDomain || '');
      }
    } catch (err) {}
  };

  const loadOrders = async () => {
    try {
      const response = await accountsFetch('/api/v1/orders');
      const data = await response.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Load orders error:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort orders
  const filteredOrders = orders
    .filter(order => {
      if (filter === 'all') return true;
      const status = (order.financialStatus || order.fulfillmentStatus || '').toLowerCase();
      return status.includes(filter);
    })
    .sort((a, b) => {
      if (sortBy === 'total') {
        return (parseFloat(String(b.totalPrice)) || 0) - (parseFloat(String(a.totalPrice)) || 0);
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  // Calculate stats
  const totalSpent = orders.reduce((sum, o) => sum + (parseFloat(String(o.totalPrice)) || 0), 0);
  const avgOrderValue = orders.length > 0 ? totalSpent / orders.length : 0;

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Order History</h4>
          <p className="mb-0 text-muted">View and track all your orders</p>
        </div>
        <a href="/products" className="btn btn-primary">
          <i className="ti ti-shopping-cart me-1"></i>
          New Order
        </a>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="mb-0 opacity-75">Total Orders</p>
                  <h3 className="mb-0">{orders.length}</h3>
                </div>
                <i className="ti ti-package fs-1 opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="mb-0 text-muted">Total Spent</p>
                  <h3 className="mb-0 text-success">{formatCurrency(totalSpent)}</h3>
                </div>
                <i className="ti ti-wallet fs-1 text-success opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card">
            <div className="card-body py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="mb-0 text-muted">Avg Order Value</p>
                  <h3 className="mb-0">{formatCurrency(avgOrderValue)}</h3>
                </div>
                <i className="ti ti-chart-line fs-1 text-info opacity-50"></i>
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
                  <h3 className="mb-0 text-warning">
                    {orders.filter(o => (o.fulfillmentStatus || '').toLowerCase() === 'unfulfilled').length}
                  </h3>
                </div>
                <i className="ti ti-clock fs-1 text-warning opacity-50"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Main Content */}
        <div className="col-lg-8">
          {/* Filters */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex gap-2">
              {(['all', 'pending', 'paid', 'fulfilled'] as const).map(f => (
                <button
                  key={f}
                  className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setFilter(f)}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <select 
              className="form-select form-select-sm" 
              style={{ width: 'auto' }}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'total')}
            >
              <option value="date">Sort by Date</option>
              <option value="total">Sort by Total</option>
            </select>
          </div>

          {/* Orders List */}
          <div className="card">
            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary"></div>
                  <p className="mt-3 text-muted">Loading orders...</p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-5">
                  <i className="ti ti-package ti-3x text-muted mb-3"></i>
                  <h5>{filter === 'all' ? 'No orders yet' : `No ${filter} orders`}</h5>
                  <p className="text-muted">Your order history will appear here</p>
                  <a href="/products" className="btn btn-primary mt-2">Start Shopping</a>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {filteredOrders.map((order) => (
                    <div key={order.id} className="list-group-item p-3">
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center gap-2 mb-2">
                            <h6 className="mb-0 fw-bold">
                              #{order.orderNumber || order.shopifyOrderNumber}
                            </h6>
                            <OrderStatusBadge 
                              status={order.financialStatus || 'pending'} 
                              fulfillmentStatus={order.fulfillmentStatus}
                              size="sm" 
                            />
                          </div>
                          <div className="d-flex flex-wrap gap-3 text-muted small">
                            <span>
                              <i className="ti ti-calendar me-1"></i>
                              {formatDate(order.createdAt)}
                            </span>
                            <span>
                              <i className="ti ti-package me-1"></i>
                              {order.lineItems?.length || 0} item{(order.lineItems?.length || 0) !== 1 ? 's' : ''}
                            </span>
                            <span className="text-muted">
                              {formatRelativeTime(order.createdAt)}
                            </span>
                          </div>
                        </div>
                        <div className="text-end">
                          <div className="fw-bold fs-5 mb-2">
                            {formatCurrency(parseFloat(String(order.totalPrice)) || 0)}
                          </div>
                          <div className="d-flex gap-2">
                            <a href={`/orders/${order.id}`} className="btn btn-sm btn-primary">
                              <i className="ti ti-eye me-1"></i>View
                            </a>
                            {shopDomain && (
                              <ReorderButton
                                order={{
                                  id: order.id,
                                  orderNumber: String(order.orderNumber || order.shopifyOrderNumber),
                                  lineItems: (order.lineItems || []).map((item: { variant_id?: string; variantId?: string; title?: string; name?: string; quantity: number; price: number; sku?: string }) => ({
                                    id: item.variant_id || item.variantId || '',
                                    productId: item.variant_id || item.variantId || '',
                                    variantId: item.variant_id || item.variantId,
                                    title: item.title || item.name || '',
                                    quantity: item.quantity,
                                    price: item.price,
                                    sku: item.sku,
                                  })),
                                  totalPrice: parseFloat(String(order.totalPrice)) || 0,
                                  createdAt: order.createdAt,
                                }}
                                shopDomain={shopDomain}
                                variant="outline"
                                size="sm"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Line Items Preview */}
                      {order.lineItems && order.lineItems.length > 0 && (
                        <div className="mt-3 pt-3 border-top">
                          <div className="d-flex flex-wrap gap-2">
                            {order.lineItems.slice(0, 3).map((item: { variant_id?: string; variantId?: string; title?: string; name?: string; quantity: number; price: number }, idx: number) => (
                              <span key={idx} className="badge bg-light text-dark">
                                {item.title || item.name} × {item.quantity}
                              </span>
                            ))}
                            {order.lineItems.length > 3 && (
                              <span className="badge bg-secondary">
                                +{order.lineItems.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="col-lg-4">
          {/* Quick Reorder */}
          {shopDomain && orders.length > 0 && (
            <QuickReorderPanel
              orders={orders.slice(0, 3).map(o => ({
                id: o.id,
                orderNumber: String(o.orderNumber || o.shopifyOrderNumber),
                lineItems: (o.lineItems || []).map((item: { variant_id?: string; variantId?: string; title?: string; name?: string; quantity: number; price: number }) => ({
                  id: item.variant_id || item.variantId || '',
                  productId: item.variant_id || item.variantId || '',
                  variantId: item.variant_id || item.variantId,
                  title: item.title || item.name || '',
                  quantity: item.quantity,
                  price: item.price,
                })),
                totalPrice: parseFloat(String(o.totalPrice)) || 0,
                createdAt: o.createdAt,
              }))}
              shopDomain={shopDomain}
              maxItems={3}
            />
          )}

          {/* Order Summary */}
          <div className="card mt-4">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="ti ti-chart-pie me-2"></i>
                Order Summary
              </h6>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between py-2 border-bottom">
                <span className="text-muted">This Month</span>
                <span className="fw-semibold">
                  {orders.filter(o => {
                    const orderDate = new Date(o.createdAt);
                    const now = new Date();
                    return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
                  }).length} orders
                </span>
              </div>
              <div className="d-flex justify-content-between py-2 border-bottom">
                <span className="text-muted">Last 30 Days</span>
                <span className="fw-semibold">
                  {formatCurrency(
                    orders
                      .filter(o => new Date(o.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
                      .reduce((sum, o) => sum + (parseFloat(String(o.totalPrice)) || 0), 0)
                  )}
                </span>
              </div>
              <div className="d-flex justify-content-between py-2">
                <span className="text-muted">Lifetime Orders</span>
                <span className="fw-semibold">{orders.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
