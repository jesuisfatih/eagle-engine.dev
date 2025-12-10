'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Modal from '@/components/Modal';
import { accountsFetch } from '@/lib/api-client';

interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  sku: string;
  title: string;
  quantity: number;
  unitPrice: number;
  listPrice: number;
}

interface AbandonedCart {
  id: string;
  items: CartItem[];
  updatedAt: string;
  createdAt: string;
}

export default function AbandonedCartsPage() {
  const [carts, setCarts] = useState<AbandonedCart[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [resultModal, setResultModal] = useState<{show: boolean; message: string; type: 'success' | 'error'}>({show: false, message: '', type: 'success'});

  useEffect(() => {
    loadCarts();
  }, []);

  const loadCarts = async () => {
    try {
      setLoading(true);
      const response = await accountsFetch('/api/v1/abandoned-carts/my-carts');
      
      if (response.ok) {
        const data = await response.json();
        setCarts(Array.isArray(data) ? data : data.carts || []);
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

  const calculateTotal = (cart: AbandonedCart) => {
    return cart.items?.reduce((sum: number, item: CartItem) => 
      sum + (parseFloat(String(item.unitPrice || item.listPrice || 0)) * (item.quantity || 0)), 0) || 0;
  };

  const restoreCart = async (cart: AbandonedCart) => {
    try {
      setRestoring(cart.id);
      const companyId = localStorage.getItem('eagle_companyId') || '';
      
      // Add each item from abandoned cart to current cart
      let successCount = 0;
      for (const item of cart.items) {
        try {
          const response = await accountsFetch(`/api/v1/companies/${companyId}/cart`, {
            method: 'POST',
            body: JSON.stringify({
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
            }),
          });
          
          if (response.ok) {
            successCount++;
          }
        } catch (err) {
          console.error('Failed to add item:', item.title);
        }
      }
      
      if (successCount === cart.items.length) {
        setResultModal({
          show: true, 
          message: `✅ All ${successCount} items restored to your cart! Redirecting to cart...`, 
          type: 'success'
        });
        
        // Mark abandoned cart as restored
        try {
          await accountsFetch(`/api/v1/abandoned-carts/${cart.id}/restore`, {
            method: 'POST',
          });
        } catch (err) {
          // Ignore - just for tracking
        }
        
        // Redirect to cart after delay
        setTimeout(() => {
          window.location.href = '/cart';
        }, 1500);
      } else if (successCount > 0) {
        setResultModal({
          show: true, 
          message: `⚠️ ${successCount} of ${cart.items.length} items restored. Some items may no longer be available.`, 
          type: 'success'
        });
      } else {
        setResultModal({
          show: true, 
          message: '❌ Failed to restore cart. Items may no longer be available.', 
          type: 'error'
        });
      }
    } catch (err) {
      console.error('Restore cart error:', err);
      setResultModal({
        show: true, 
        message: '❌ Failed to restore cart. Please try again.', 
        type: 'error'
      });
    } finally {
      setRestoring(null);
    }
  };

  const deleteCart = async (cartId: string) => {
    try {
      const response = await accountsFetch(`/api/v1/abandoned-carts/${cartId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setCarts(prev => prev.filter(c => c.id !== cartId));
        setResultModal({show: true, message: '✅ Cart removed successfully.', type: 'success'});
      } else {
        setResultModal({show: true, message: '❌ Failed to remove cart.', type: 'error'});
      }
    } catch (err) {
      setResultModal({show: true, message: '❌ Failed to remove cart.', type: 'error'});
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Abandoned Carts</h4>
          <p className="mb-0 text-muted">Your incomplete shopping carts</p>
        </div>
        <button onClick={loadCarts} className="btn btn-label-secondary" disabled={loading}>
          {loading ? (
            <span className="spinner-border spinner-border-sm me-1"></span>
          ) : (
            <i className="ti ti-refresh me-1"></i>
          )}
          Refresh
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
              <i className="ti ti-shopping-cart-check fs-1 text-muted mb-3 d-block"></i>
              <h5>No abandoned carts</h5>
              <p className="text-muted">You don't have any incomplete shopping carts.</p>
              <Link href="/products" className="btn btn-primary mt-3">
                <i className="ti ti-shopping-bag me-1"></i>
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
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
                              {cart.items?.slice(0, 2).map((item: CartItem) => item.title || item.sku).join(', ')}
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
                      <td>
                        <div className="small text-muted">
                          {new Date(cart.updatedAt).toLocaleDateString()}
                        </div>
                        <div className="small text-muted">
                          {new Date(cart.updatedAt).toLocaleTimeString()}
                        </div>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            onClick={() => restoreCart(cart)}
                            className="btn btn-sm btn-primary"
                            disabled={restoring === cart.id}
                          >
                            {restoring === cart.id ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-1"></span>
                                Restoring...
                              </>
                            ) : (
                              <>
                                <i className="ti ti-shopping-cart me-1"></i>
                                Restore
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => deleteCart(cart.id)}
                            className="btn btn-sm btn-text-danger"
                            disabled={restoring === cart.id}
                            title="Remove cart"
                          >
                            <i className="ti ti-trash"></i>
                          </button>
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

      {resultModal.show && (
        <Modal
          show={resultModal.show}
          onClose={() => setResultModal({show: false, message: '', type: 'success'})}
          onConfirm={() => setResultModal({show: false, message: '', type: 'success'})}
          title={resultModal.type === 'success' ? 'Success' : 'Error'}
          message={resultModal.message}
          confirmText="OK"
          type={resultModal.type === 'success' ? 'success' : 'danger'}
        />
      )}
    </div>
  );
}

