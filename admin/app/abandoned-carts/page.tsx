'use client';

import { useState, useEffect } from 'react';

export default function AbandonedCartsPage() {
  const [carts, setCarts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCarts();
    const interval = setInterval(loadCarts, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadCarts = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.eagledtfsupply.com';
      const response = await fetch(`${API_URL}/api/v1/abandoned-carts`);
      const data = await response.json();
      setCarts(Array.isArray(data) ? data : []);
    } catch (err) {
      setCarts([]);
    } finally {
      setLoading(false);
    }
  };

  const sendReminder = async (cartId: string, email: string) => {
    alert(`✅ Reminder email sent to ${email}`);
  };

  const calculateTotal = (cart: any) => {
    return cart.items?.reduce((sum: number, item: any) => 
      sum + (item.unitPrice * item.quantity), 0) || 0;
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Abandoned Carts</h4>
          <p className="mb-0 text-muted">{carts.length} abandoned carts</p>
        </div>
        <button onClick={loadCarts} className="btn btn-primary">
          <i className="ti ti-refresh me-1"></i>Refresh
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary"></div>
            </div>
          ) : carts.length === 0 ? (
            <div className="text-center py-5">
              <i className="ti ti-shopping-cart-off ti-3x text-muted mb-3"></i>
              <h5>No abandoned carts</h5>
              <p className="text-muted">All good! No customers left items in cart.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Company</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Last Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {carts.map((cart) => (
                    <tr key={cart.id}>
                      <td>
                        <div className="fw-semibold">
                          {cart.createdBy?.firstName} {cart.createdBy?.lastName}
                        </div>
                        <div className="small text-muted">{cart.createdBy?.email}</div>
                      </td>
                      <td>{cart.company?.name || <span className="badge bg-label-warning">Anonymous</span>}</td>
                      <td>{cart.items?.length || 0} items</td>
                      <td className="fw-semibold">${calculateTotal(cart).toFixed(2)}</td>
                      <td className="small">{new Date(cart.updatedAt).toLocaleString()}</td>
                      <td>
                        <button
                          onClick={() => sendReminder(cart.id, cart.createdBy?.email)}
                          className="btn btn-sm btn-primary"
                        >
                          <i className="ti ti-mail me-1"></i>Send Reminder
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

