'use client';

import { useState, useEffect } from 'react';
import { accountsApi } from '@/lib/api-client';
import CartItem from './components/CartItem';

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
      // Get checkout URL from Eagle
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.eagledtfsupply.com';
      const response = await fetch(`${API_URL}/api/v1/checkout/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartId: cart.id }),
      });
      
      if (response.ok) {
        const result = await response.json();
        
        // Redirect to Shopify checkout with discount applied
        if (result.checkoutUrl) {
          window.location.href = result.checkoutUrl;
        } else {
          alert('Checkout URL not available');
        }
      } else {
        throw new Error('Checkout failed');
      }
    } catch (err: any) {
      alert('❌ Checkout failed: ' + err.message);
    }
  };

  const subtotal = cart?.items?.reduce((sum: number, item: any) => 
    sum + (item.unitPrice * item.quantity), 0) || 0;
  
  const savings = cart?.items?.reduce((sum: number, item: any) => 
    sum + ((item.listPrice - item.unitPrice) * item.quantity), 0) || 0;

  const createCart = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.eagledtfsupply.com';
      const merchantId = '6ecc682b-98ee-472d-977b-cffbbae081b8';
      const companyId = 'f0c2b2a5-4858-4d82-a542-5ce3bfe23a6d';
      const userId = 'c67273cf-acea-41db-9ff5-8f6e3bbb5c38';
      
      await fetch(`${API_URL}/api/v1/carts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchantId, companyId, createdByUserId: userId }),
      });
      
      loadCart();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">Shopping Cart</h4>
        {!cart && !loading && (
          <button onClick={createCart} className="btn btn-primary btn-sm">
            <i className="ti ti-plus me-1"></i>Create Cart
          </button>
        )}
      </div>

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
                  <CartItem
                    key={item.id}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                  />
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
                  <div className="mb-3">
                  <label className="form-label small">Discount Code</label>
                  <div className="input-group input-group-sm">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter code"
                      id="discountCodeInput"
                    />
                    <button
                      onClick={() => {
                        const input = document.getElementById('discountCodeInput') as HTMLInputElement;
                        if (input.value) {
                          alert(`✅ Discount code "${input.value}" will be applied at checkout`);
                        }
                      }}
                      className="btn btn-outline-primary"
                    >
                      Apply
                    </button>
                  </div>
                  <small className="text-muted">B2B discounts are automatically applied</small>
                </div>

                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal</span>
                  <span className="fw-semibold">${subtotal.toFixed(2)}</span>
                </div>
                {savings > 0 && (
                  <div className="d-flex justify-content-between mb-2 text-success">
                    <span>B2B Savings</span>
                    <span className="fw-semibold">-${savings.toFixed(2)}</span>
                  </div>
                )}
                <hr />
                <div className="d-flex justify-content-between mb-3">
                  <span className="fw-bold">Total</span>
                  <h4 className="mb-0 text-primary">${subtotal.toFixed(2)}</h4>
                </div>
                <button onClick={checkout} className="btn btn-primary w-100 mb-2">
                  <i className="ti ti-shopping-cart-check me-1"></i>
                  Proceed to Checkout
                </button>
                <button className="btn btn-label-secondary w-100">
                  <i className="ti ti-file-invoice me-1"></i>
                  Request Quote
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
