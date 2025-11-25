'use client';

import { useState, useEffect } from 'react';
import { accountsApi } from '@/lib/api-client';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.eagledtfsupply.com';
      
      // Get current user's company
      const companyId = 'f0c2b2a5-4858-4d82-a542-5ce3bfe23a6d'; // Should come from login
      
      // Fetch orders for this company
      const response = await fetch(`${API_URL}/api/v1/orders?companyId=${companyId}`);
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
                              const items = order.lineItems || [];
                              const cart = await accountsApi.getActiveCart().catch(() => null);
                              
                              if (!cart) {
                                alert('Creating cart...');
                                return;
                              }

                              for (const item of items) {
                                if (item.variant_id) {
                                  await accountsApi.addToCart(
                                    item.product_id?.toString() || 'unknown',
                                    item.variant_id.toString(),
                                    item.quantity
                                  ).catch(console.error);
                                }
                              }
                              
                              alert('✅ Items added to cart!');
                              window.location.href = '/cart';
                            } catch (err: any) {
                              alert('❌ Reorder failed: ' + err.message);
                            }
                          }}
                          className="btn btn-sm btn-text-secondary ms-2"
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
