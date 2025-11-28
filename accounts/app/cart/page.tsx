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
    setLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.eagledtfsupply.com';
      const companyId = localStorage.getItem('eagle_companyId') || '';
      const userId = localStorage.getItem('eagle_userId') || '';
      
      const response = await fetch(`${API_URL}/api/v1/carts/active?companyId=${companyId}&userId=${userId}`);
      
      if (response.ok && response.status !== 204) {
        try {
          const data = await response.json();
          setCart(data && data.id ? data : null);
        } catch (parseErr) {
          setCart(null);
        }
      } else {
        setCart(null);
      }
    } catch (err) {
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  const checkout = async () => {
    if (!cart) return;
    
    try {
      // Get user info
      const email = localStorage.getItem('eagle_userEmail') || '';
      const firstName = localStorage.getItem('eagle_userFirstName') || '';
      const lastName = localStorage.getItem('eagle_userLastName') || '';
      
      // Shopify checkout with autofill parameters
      const checkoutParams = new URLSearchParams({
        'checkout[email]': email,
        'checkout[shipping_address][first_name]': firstName,
        'checkout[shipping_address][last_name]': lastName,
      });
      
      window.location.href = `https://eagle-dtf-supply0.myshopify.com/checkout?${checkoutParams}`;
    } catch (err) {
      console.error('Checkout error:', err);
      window.location.href = 'https://eagle-dtf-supply0.myshopify.com/checkout';
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!cart) return;
    
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.eagledtfsupply.com';
      const response = await fetch(`${API_URL}/api/v1/carts/${cart.id}/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      });
      
      if (response.ok) {
        loadCart();
      }
    } catch (err) {
      console.error('Update quantity error:', err);
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

  const createCart = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.eagledtfsupply.com';
      const merchantId = localStorage.getItem('eagle_merchantId') || '6ecc682b-98ee-472d-977b-cffbbae081b8';
      const companyId = localStorage.getItem('eagle_companyId') || '';
      const userId = localStorage.getItem('eagle_userId') || '';
      
      const response = await fetch(`${API_URL}/api/v1/carts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchantId, companyId, createdByUserId: userId }),
      });
      
      if (response.ok) {
        loadCart();
      }
    } catch (err) {
      console.error('Create cart error:', err);
    }
  };

  const subtotal = cart?.items?.reduce((sum: number, item: any) => 
    sum + (item.unitPrice * item.quantity), 0) || 0;

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
        <>
          <div className="card mb-4">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Total</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.items?.map((item: any) => (
                      <tr key={item.id}>
                        <td>{item.product?.title || 'Product'}</td>
                        <td>${item.unitPrice}</td>
                        <td>
                          <div className="d-flex align-items-center gap-2" style={{width: '120px'}}>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="btn btn-sm btn-icon btn-label-secondary"
                            >-</button>
                            <span className="fw-semibold">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="btn btn-sm btn-icon btn-label-secondary"
                            >+</button>
                          </div>
                        </td>
                        <td className="fw-semibold">${(item.unitPrice * item.quantity).toFixed(2)}</td>
                        <td>
                          <button 
                            onClick={() => removeItem(item.id)}
                            className="btn btn-sm btn-danger"
                          >
                            <i className="ti ti-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-8"></div>
            <div className="col-md-4">
              <div className="card">
                <div className="card-body">
                  <div className="d-flex justify-content-between mb-3">
                    <span className="fw-bold">Subtotal</span>
                    <h4 className="mb-0 text-primary">${subtotal.toFixed(2)}</h4>
                  </div>
                  <button onClick={checkout} className="btn btn-success w-100 mb-2">
                    <i className="ti ti-credit-card me-1"></i>
                    Proceed to Checkout
                  </button>
                  <p className="small text-muted text-center mb-0">
                    ✅ Your info will be auto-filled at checkout
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
