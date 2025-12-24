'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Modal from '@/components/Modal';
import { accountsFetch } from '@/lib/api-client';
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils';

interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  sku: string;
  title: string;
  quantity: number;
  unitPrice: number;
  listPrice: number;
  image?: string;
}

interface AbandonedCart {
  id: string;
  items: CartItem[];
  updatedAt: string;
  createdAt: string;
}

type TimeFilter = 'all' | 'week' | 'month' | 'older';

export default function AbandonedCartsPage() {
  const [carts, setCarts] = useState<AbandonedCart[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [selectedCarts, setSelectedCarts] = useState<Set<string>>(new Set());
  const [expandedCart, setExpandedCart] = useState<string | null>(null);
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

  const getTimeCategory = (dateStr: string): TimeFilter => {
    const date = new Date(dateStr);
    const now = new Date();
    const daysDiff = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysDiff <= 7) return 'week';
    if (daysDiff <= 30) return 'month';
    return 'older';
  };

  const filteredCarts = useMemo(() => {
    if (timeFilter === 'all') return carts;
    return carts.filter(cart => getTimeCategory(cart.updatedAt) === timeFilter);
  }, [carts, timeFilter]);

  // Stats
  const stats = useMemo(() => {
    const totalValue = carts.reduce((sum, cart) => sum + calculateTotal(cart), 0);
    const totalItems = carts.reduce((sum, cart) => sum + (cart.items?.length || 0), 0);
    const thisWeek = carts.filter(cart => getTimeCategory(cart.updatedAt) === 'week').length;
    const thisMonth = carts.filter(cart => getTimeCategory(cart.updatedAt) === 'month').length;
    
    return { totalCarts: carts.length, totalValue, totalItems, thisWeek, thisMonth };
  }, [carts]);

  const restoreCart = async (cart: AbandonedCart) => {
    try {
      setRestoring(cart.id);
      const merchantId = localStorage.getItem('eagle_merchantId') || '';
      const companyId = localStorage.getItem('eagle_companyId') || '';
      const userId = localStorage.getItem('eagle_userId') || '';
      
      // First get or create active cart
      let cartResponse = await accountsFetch('/api/v1/carts/active');
      let activeCart = null;
      
      if (cartResponse.ok && cartResponse.status !== 204) {
        activeCart = await cartResponse.json().catch(() => null);
      }
      
      if (!activeCart || !activeCart.id) {
        const createResponse = await accountsFetch('/api/v1/carts', {
          method: 'POST',
          body: JSON.stringify({ merchantId, companyId, createdByUserId: userId }),
        });
        if (createResponse.ok) {
          activeCart = await createResponse.json();
        }
      }
      
      if (!activeCart || !activeCart.id) {
        setResultModal({show: true, message: 'Failed to create cart', type: 'error'});
        setRestoring(null);
        return;
      }
      
      let successCount = 0;
      for (const item of cart.items) {
        try {
          const response = await accountsFetch(`/api/v1/carts/${activeCart.id}/items`, {
            method: 'POST',
            body: JSON.stringify({
              variantId: item.variantId || item.productId,
              shopifyVariantId: (item.variantId || item.productId || '').toString(),
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
          message: `All ${successCount} items restored to your cart! Redirecting...`, 
          type: 'success'
        });
        
        try {
          await accountsFetch(`/api/v1/abandoned-carts/${cart.id}/restore`, {
            method: 'POST',
          });
        } catch (err) {
          // Ignore - just for tracking
        }
        
        setTimeout(() => {
          window.location.href = '/cart';
        }, 1500);
      } else if (successCount > 0) {
        setResultModal({
          show: true, 
          message: `${successCount} of ${cart.items.length} items restored. Some items may no longer be available.`, 
          type: 'success'
        });
      } else {
        setResultModal({
          show: true, 
          message: 'Failed to restore cart. Items may no longer be available.', 
          type: 'error'
        });
      }
    } catch (err) {
      console.error('Restore cart error:', err);
      setResultModal({
        show: true, 
        message: 'Failed to restore cart. Please try again.', 
        type: 'error'
      });
    } finally {
      setRestoring(null);
    }
  };

  const deleteCart = async (cartId: string) => {
    try {
      setDeleting(cartId);
      const response = await accountsFetch(`/api/v1/abandoned-carts/${cartId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setCarts(prev => prev.filter(c => c.id !== cartId));
        setSelectedCarts(prev => {
          const next = new Set(prev);
          next.delete(cartId);
          return next;
        });
        setResultModal({show: true, message: 'Cart removed successfully.', type: 'success'});
      } else {
        setResultModal({show: true, message: 'Failed to remove cart.', type: 'error'});
      }
    } catch (err) {
      setResultModal({show: true, message: 'Failed to remove cart.', type: 'error'});
    } finally {
      setDeleting(null);
    }
  };

  const toggleCartSelection = (cartId: string) => {
    setSelectedCarts(prev => {
      const next = new Set(prev);
      if (next.has(cartId)) {
        next.delete(cartId);
      } else {
        next.add(cartId);
      }
      return next;
    });
  };

  const selectAll = () => {
    if (selectedCarts.size === filteredCarts.length) {
      setSelectedCarts(new Set());
    } else {
      setSelectedCarts(new Set(filteredCarts.map(c => c.id)));
    }
  };

  const deleteSelected = async () => {
    for (const cartId of selectedCarts) {
      await deleteCart(cartId);
    }
    setSelectedCarts(new Set());
  };

  const getAgeLabel = (dateStr: string) => {
    const days = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`;
    return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''} ago`;
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h4 className="fw-bold mb-1">
            <i className="ti ti-shopping-cart-x text-primary me-2"></i>
            Abandoned Carts
          </h4>
          <p className="mb-0 text-muted">Recover your incomplete shopping sessions</p>
        </div>
        <button onClick={loadCarts} className="btn btn-outline-primary" disabled={loading}>
          {loading ? (
            <span className="spinner-border spinner-border-sm me-1"></span>
          ) : (
            <i className="ti ti-refresh me-1"></i>
          )}
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex align-items-center gap-3">
                <div className="avatar bg-label-warning rounded">
                  <i className="ti ti-shopping-cart ti-md"></i>
                </div>
                <div>
                  <h3 className="mb-0 fw-bold">{stats.totalCarts}</h3>
                  <small className="text-muted">Total Carts</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex align-items-center gap-3">
                <div className="avatar bg-label-success rounded">
                  <i className="ti ti-currency-dollar ti-md"></i>
                </div>
                <div>
                  <h3 className="mb-0 fw-bold">{formatCurrency(stats.totalValue)}</h3>
                  <small className="text-muted">Total Value</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex align-items-center gap-3">
                <div className="avatar bg-label-info rounded">
                  <i className="ti ti-package ti-md"></i>
                </div>
                <div>
                  <h3 className="mb-0 fw-bold">{stats.totalItems}</h3>
                  <small className="text-muted">Total Items</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="card h-100">
            <div className="card-body">
              <div className="d-flex align-items-center gap-3">
                <div className="avatar bg-label-primary rounded">
                  <i className="ti ti-clock ti-md"></i>
                </div>
                <div>
                  <h3 className="mb-0 fw-bold">{stats.thisWeek}</h3>
                  <small className="text-muted">This Week</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="card mb-4">
        <div className="card-body py-3">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
            {/* Time Filters */}
            <div className="btn-group">
              {[
                { key: 'all' as TimeFilter, label: 'All', count: carts.length },
                { key: 'week' as TimeFilter, label: 'This Week', count: stats.thisWeek },
                { key: 'month' as TimeFilter, label: 'This Month', count: stats.thisMonth },
                { key: 'older' as TimeFilter, label: 'Older', count: carts.length - stats.thisWeek - stats.thisMonth },
              ].map(filter => (
                <button
                  key={filter.key}
                  onClick={() => setTimeFilter(filter.key)}
                  className={`btn btn-sm ${timeFilter === filter.key ? 'btn-primary' : 'btn-outline-primary'}`}
                >
                  {filter.label}
                  <span className="badge bg-white text-primary ms-1">{filter.count}</span>
                </button>
              ))}
            </div>

            {/* Bulk Actions */}
            {selectedCarts.size > 0 && (
              <div className="d-flex gap-2">
                <span className="text-muted align-self-center">
                  {selectedCarts.size} selected
                </span>
                <button
                  onClick={deleteSelected}
                  className="btn btn-sm btn-outline-danger"
                >
                  <i className="ti ti-trash me-1"></i>
                  Delete Selected
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Carts List */}
      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
              <p className="mt-3 text-muted">Loading abandoned carts...</p>
            </div>
          ) : filteredCarts.length === 0 ? (
            <div className="text-center py-5">
              <div className="avatar avatar-xl bg-label-success rounded-circle mx-auto mb-3">
                <i className="ti ti-shopping-cart-check ti-xl"></i>
              </div>
              <h5>No abandoned carts</h5>
              <p className="text-muted mb-4">
                {timeFilter !== 'all' 
                  ? 'No abandoned carts in this time period.' 
                  : 'Great! You don\'t have any incomplete shopping sessions.'}
              </p>
              <Link href="/products" className="btn btn-primary">
                <i className="ti ti-shopping-bag me-1"></i>
                Browse Products
              </Link>
            </div>
          ) : (
            <>
              {/* Select All */}
              <div className="d-flex align-items-center gap-3 mb-3 pb-3 border-bottom">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={selectedCarts.size === filteredCarts.length && filteredCarts.length > 0}
                    onChange={selectAll}
                  />
                  <label className="form-check-label text-muted">
                    Select all ({filteredCarts.length})
                  </label>
                </div>
              </div>

              {/* Cart Items */}
              <div className="d-flex flex-column gap-3">
                {filteredCarts.map((cart) => (
                  <div 
                    key={cart.id} 
                    className={`card border ${selectedCarts.has(cart.id) ? 'border-primary' : ''}`}
                  >
                    <div className="card-body">
                      <div className="row align-items-center">
                        {/* Checkbox */}
                        <div className="col-auto">
                          <div className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={selectedCarts.has(cart.id)}
                              onChange={() => toggleCartSelection(cart.id)}
                            />
                          </div>
                        </div>

                        {/* Cart Info */}
                        <div className="col">
                          <div className="d-flex flex-wrap justify-content-between align-items-start gap-2">
                            <div>
                              <h6 className="mb-1">
                                <i className="ti ti-shopping-cart text-muted me-1"></i>
                                {cart.items?.length || 0} item{(cart.items?.length || 0) !== 1 ? 's' : ''}
                              </h6>
                              <p className="text-muted small mb-2">
                                {cart.items?.slice(0, 3).map((item: CartItem) => item.title || item.sku).join(', ')}
                                {(cart.items?.length || 0) > 3 && ` +${cart.items.length - 3} more`}
                              </p>
                              <div className="d-flex flex-wrap gap-2">
                                <span className="badge bg-label-secondary">
                                  <i className="ti ti-clock me-1"></i>
                                  {getAgeLabel(cart.updatedAt)}
                                </span>
                                <span className="badge bg-label-info">
                                  {formatDate(cart.updatedAt)}
                                </span>
                              </div>
                            </div>
                            <div className="text-end">
                              <h5 className="text-primary mb-1">
                                {formatCurrency(calculateTotal(cart))}
                              </h5>
                              <small className="text-muted">Total Value</small>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="col-auto">
                          <div className="d-flex gap-2">
                            <button
                              onClick={() => setExpandedCart(expandedCart === cart.id ? null : cart.id)}
                              className="btn btn-sm btn-outline-secondary"
                              title="View items"
                            >
                              <i className={`ti ti-chevron-${expandedCart === cart.id ? 'up' : 'down'}`}></i>
                            </button>
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
                                  <i className="ti ti-shopping-cart-plus me-1"></i>
                                  Restore
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => deleteCart(cart.id)}
                              className="btn btn-sm btn-outline-danger"
                              disabled={deleting === cart.id}
                              title="Remove cart"
                            >
                              {deleting === cart.id ? (
                                <span className="spinner-border spinner-border-sm"></span>
                              ) : (
                                <i className="ti ti-trash"></i>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Items */}
                      {expandedCart === cart.id && (
                        <div className="mt-3 pt-3 border-top">
                          <h6 className="mb-3">Cart Items</h6>
                          <div className="table-responsive">
                            <table className="table table-sm table-hover mb-0">
                              <thead className="bg-light">
                                <tr>
                                  <th>Product</th>
                                  <th className="text-center">Qty</th>
                                  <th className="text-end">Unit Price</th>
                                  <th className="text-end">Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {cart.items.map((item, i) => (
                                  <tr key={i}>
                                    <td>
                                      <div className="d-flex align-items-center gap-2">
                                        {item.image && (
                                          <img 
                                            src={item.image} 
                                            alt={item.title}
                                            className="rounded"
                                            style={{ width: 40, height: 40, objectFit: 'cover' }}
                                          />
                                        )}
                                        <div>
                                          <p className="mb-0 fw-medium">{item.title}</p>
                                          {item.sku && (
                                            <small className="text-muted">SKU: {item.sku}</small>
                                          )}
                                        </div>
                                      </div>
                                    </td>
                                    <td className="text-center align-middle">{item.quantity}</td>
                                    <td className="text-end align-middle">
                                      {formatCurrency(item.unitPrice || item.listPrice)}
                                    </td>
                                    <td className="text-end align-middle fw-semibold">
                                      {formatCurrency((item.unitPrice || item.listPrice) * item.quantity)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot className="border-top">
                                <tr>
                                  <td colSpan={3} className="text-end fw-bold">Cart Total:</td>
                                  <td className="text-end fw-bold text-primary">
                                    {formatCurrency(calculateTotal(cart))}
                                  </td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Recovery Tips */}
      {carts.length > 0 && (
        <div className="card mt-4">
          <div className="card-body">
            <div className="d-flex gap-3">
              <div className="avatar bg-label-info rounded flex-shrink-0">
                <i className="ti ti-bulb ti-md"></i>
              </div>
              <div>
                <h6 className="mb-1">Cart Recovery Tips</h6>
                <p className="text-muted small mb-0">
                  Restore your abandoned carts to complete your purchase. Items are saved for 30 days.
                  Click "Restore" to add all items back to your current cart.
                  {stats.totalValue > 0 && (
                    <> You have <strong>{formatCurrency(stats.totalValue)}</strong> worth of items waiting for you!</>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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

