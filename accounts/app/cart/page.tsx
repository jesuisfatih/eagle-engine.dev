'use client';

import { useState, useEffect } from 'react';
import { accountsApi } from '@/lib/api-client';

export default function CartPage() {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const data = await accountsApi.getActiveCart();
      setCart(data);
    } catch (err) {
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!cart) return;
    try {
      await accountsApi.updateCartItem(cart.id, itemId, quantity);
      loadCart();
    } catch (err) {
      console.error(err);
    }
  };

  const removeItem = async (itemId: string) => {
    if (!cart) return;
    try {
      await accountsApi.removeCartItem(cart.id, itemId);
      loadCart();
    } catch (err) {
      console.error(err);
    }
  };

  const checkout = async () => {
    if (!cart) return;
    try {
      const result = await accountsApi.createCheckout(cart.id);
      window.location.href = result.checkoutUrl;
    } catch (err) {
      alert('Checkout failed');
    }
  };

  const subtotal = cart?.items?.reduce((sum: number, item: any) => 
    sum + (item.unitPrice * item.quantity), 0) || 0;
  
  const savings = cart?.items?.reduce((sum: number, item: any) => 
    sum + ((item.listPrice - item.unitPrice) * item.quantity), 0) || 0;

  return (
    <div>
      <h4 className="fw-bold mb-4">Shopping Cart</h4>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary"></div>
        </div>
      ) : !cart || cart.items?.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <i className="ti ti-shopping-cart-off ti-3x text-muted mb-3"></i>
            <h5>Your cart is empty</h5>
            <p className="text-muted">Start adding products to your cart</p>
            <a href="/products" className="btn btn-primary mt-2">Browse Products</a>
          </div>
        </div>
      ) : (
        <div className="row">
          <div className="col-lg-8">
            <div className="card mb-4">
              <div className="card-body">
                {cart.items.map((item: any) => (
                  <div key={item.id} className="row mb-3 pb-3 border-bottom">
                    <div className="col-md-7">
                      <h6 className="fw-semibold mb-1">{item.title}</h6>
                      <p className="text-muted small mb-2">{item.variantTitle}</p>
                      <div>
                        <span className="text-primary fw-bold">${item.unitPrice}</span>
                        {item.listPrice > item.unitPrice && (
                          <>
                            <span className="text-muted small text-decoration-line-through ms-2">${item.listPrice}</span>
                            <span className="badge bg-label-success ms-2">
                              Save ${(item.listPrice - item.unitPrice).toFixed(2)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="input-group input-group-sm">
                        <button
                          className="btn btn-outline-secondary"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >-</button>
                        <input
                          type="text"
                          className="form-control text-center"
                          value={item.quantity}
                          readOnly
                        />
                        <button
                          className="btn btn-outline-secondary"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >+</button>
                      </div>
                    </div>
                    <div className="col-md-2 text-end">
                      <p className="fw-bold mb-2">${(item.unitPrice * item.quantity).toFixed(2)}</p>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="btn btn-sm btn-text-danger"
                      >
                        <i className="ti ti-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Order Summary</h5>
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal</span>
                  <span className="fw-semibold">${subtotal.toFixed(2)}</span>
                </div>
                {savings > 0 && (
                  <div className="d-flex justify-content-between mb-2 text-success">
                    <span>Total Savings</span>
                    <span className="fw-semibold">-${savings.toFixed(2)}</span>
                  </div>
                )}
                <hr />
                <div className="d-flex justify-content-between mb-3">
                  <span className="fw-bold">Total</span>
                  <h4 className="mb-0 text-primary">${subtotal.toFixed(2)}</h4>
                </div>
                <button onClick={checkout} className="btn btn-primary w-100">
                  <i className="ti ti-shopping-cart-check me-1"></i>
                  Proceed to Checkout
                </button>
                <p className="text-center small text-muted mt-2">Taxes calculated at checkout</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
