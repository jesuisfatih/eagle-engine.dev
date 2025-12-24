'use client';

import { useState, useEffect } from 'react';
import { accountsFetch } from '@/lib/api-client';
import type { Order } from '@eagle/types';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [shopDomain, setShopDomain] = useState('');

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
      // Fetch orders for this company (auth from token)
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

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Order History</h4>
          <p className="mb-0 text-muted">View and track all your orders</p>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-5">
              <i className="ti ti-package ti-3x text-muted mb-3"></i>
              <h5>No orders yet</h5>
              <p className="text-muted">Your order history will appear here</p>
              <a href="/products" className="btn btn-primary mt-2">Start Shopping</a>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="fw-semibold">#{order.shopifyOrderNumber}</td>
                      <td className="small">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td>{order.lineItems?.length || 0} items</td>
                      <td className="fw-semibold">${order.totalPrice}</td>
                      <td>
                        <span className="badge bg-label-success">
                          {order.financialStatus}
                        </span>
                      </td>
                      <td>
                        <a href={`/orders/${order.id}`} className="btn btn-sm btn-primary">
                          <i className="ti ti-eye me-1"></i>View
                        </a>
                        <button
                          onClick={async () => {
                            try {
                              if (!shopDomain) {
                                alert('Shop domain not found');
                                return;
                              }
                              
                              interface LineItem {
                                variant_id: string;
                                quantity: number;
                              }
                              
                              // Direct Shopify reorder
                              const variantIds = order.lineItems?.map((item: LineItem) => 
                                `${item.variant_id}:${item.quantity}`
                              ).join(',') || '';
                              
                              if (variantIds) {
                                // Redirect to Shopify with cart items
                                window.location.href = `https://${shopDomain}/cart/${variantIds}`;
                              } else {
                                alert('No items to reorder');
                              }
                            } catch (err) {
                              console.error('Reorder error:', err);
                              alert('❌ Reorder failed');
                            }
                          }}
                          className="btn btn-sm btn-text-secondary ms-2"
                          title="Reorder"
                        >
                          <i className="ti ti-refresh"></i>
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
