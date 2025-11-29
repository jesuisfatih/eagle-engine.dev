'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AbandonedCartsPage() {
  const [carts, setCarts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCarts();
  }, []);

  const loadCarts = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.eagledtfsupply.com';
      const token = localStorage.getItem('eagle_token');
      
      const response = await fetch(`${API_URL}/api/v1/abandoned-carts/my-carts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setCarts(Array.isArray(data) ? data : []);
      } else {
        setCarts([]);
      }
    } catch (err) {
      console.error('Load abandoned carts error:', err);
      setCarts([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = (cart: any) => {
    return cart.items?.reduce((sum: number, item: any) => 
      sum + (parseFloat(item.unitPrice || item.listPrice || 0) * (item.quantity || 0)), 0) || 0;
  };

  const restoreCart = async (cart: any) => {
    // Redirect to cart page with items
    // For now, just show message
    alert('Cart restoration feature - will be implemented');
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Abandoned Carts</h4>
          <p className="mb-0 text-muted">Your incomplete shopping carts</p>
        </div>
        <button onClick={loadCarts} className="btn btn-label-secondary">
          <i className="ti ti-refresh me-1"></i>Refresh
        </button>
      </div>

      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary"></div>
              <p className="mt-3 text-muted">Loading abandoned carts...</p>
            </div>
          ) : carts.length === 0 ? (
            <div className="text-center py-5">
              <i className="ti ti-shopping-cart-check ti-3x text-muted mb-3"></i>
              <h5>No abandoned carts</h5>
              <p className="text-muted">You don't have any incomplete shopping carts.</p>
              <Link href="/products" className="btn btn-primary mt-3">
                <i className="ti ti-shopping-bag me-1"></i>
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
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
                        <div className="d-flex align-items-center">
                          <div className="flex-grow-1">
                            <div className="fw-semibold">
                              {cart.items?.length || 0} item{(cart.items?.length || 0) !== 1 ? 's' : ''}
                            </div>
                            <div className="small text-muted">
                              {cart.items?.slice(0, 2).map((item: any) => item.title || item.sku).join(', ')}
                              {cart.items?.length > 2 && ` +${cart.items.length - 2} more`}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="fw-semibold text-primary">
                          ${calculateTotal(cart).toFixed(2)}
                        </span>
                      </td>
                      <td className="small text-muted">
                        {new Date(cart.updatedAt).toLocaleString()}
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            onClick={() => restoreCart(cart)}
                            className="btn btn-sm btn-primary"
                          >
                            <i className="ti ti-shopping-cart me-1"></i>
                            Restore Cart
                          </button>
                          <Link
                            href="/cart"
                            className="btn btn-sm btn-label-secondary"
                          >
                            <i className="ti ti-eye me-1"></i>
                            View
                          </Link>
                        </div>
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

