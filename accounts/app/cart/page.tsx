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
    if (!cart || !cart.id || !cart.items || cart.items.length === 0) {
      alert('Cart is empty');
      return;
    }
    
    try {
      // Step 1: Fetch user profile and address information
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.eagledtfsupply.com';
      const token = localStorage.getItem('eagle_token') || '';
      
      let userData: any = null;
      let addressData: any = null;
      
      try {
        // Get user profile
        const userResponse = await fetch(`${API_URL}/api/v1/company-users/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (userResponse.ok) {
          userData = await userResponse.json();
        }
        
        // Get user addresses (try to get default or first address)
        try {
          const addressResponse = await fetch(`${API_URL}/api/v1/addresses`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (addressResponse.ok) {
            const addresses = await addressResponse.json();
            // Get default address or first address
            addressData = addresses.find((addr: any) => addr.isDefault) || addresses[0] || null;
          }
        } catch (addrErr) {
          console.warn('Address fetch failed:', addrErr);
        }
      } catch (userErr) {
        console.warn('User data fetch failed:', userErr);
      }
      
      // Step 2: Store user data in localStorage for checkout autofill
      if (userData || addressData) {
        const checkoutData = {
          email: userData?.email || localStorage.getItem('eagle_userEmail') || '',
          firstName: userData?.firstName || '',
          lastName: userData?.lastName || '',
          phone: userData?.phone || '',
          address1: addressData?.address1 || addressData?.street || '',
          address2: addressData?.address2 || '',
          city: addressData?.city || '',
          state: addressData?.state || addressData?.province || '',
          zip: addressData?.postalCode || addressData?.zip || '',
          country: addressData?.country || 'US',
          timestamp: Date.now(), // For cleanup
        };
        
        // Store in localStorage with a unique key
        localStorage.setItem('eagle_checkout_autofill', JSON.stringify(checkoutData));
        
        // Also store in sessionStorage as backup
        sessionStorage.setItem('eagle_checkout_autofill', JSON.stringify(checkoutData));
      }
      
      // Step 3: Use Shopify's cart/add endpoint to add items to browser's cart cookie
      const shopDomain = 'eagle-dtf-supply0.myshopify.com';
      const shopUrl = `https://${shopDomain}`;
      
      // Add all items to Shopify cart using /cart/add.js
      const addPromises = cart.items.map((item: any) => {
        return fetch(`${shopUrl}/cart/add.js`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: item.shopifyVariantId.toString(),
            quantity: item.quantity,
          }),
        });
      });
      
      // Wait for all items to be added
      await Promise.all(addPromises);
      
      // Step 4: Get checkout URL with SSO and discount from backend
      let checkoutUrl = '';
      let ssoUrl: string | null = null;
      
      try {
        const userId = localStorage.getItem('eagle_userId') || '';
        const checkoutResponse = await fetch(`${API_URL}/api/v1/checkout/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ 
            cartId: cart.id,
            userId: userId || undefined,
          }),
        });
        
        if (checkoutResponse.ok) {
          const checkoutData = await checkoutResponse.json();
          checkoutUrl = checkoutData.checkoutUrl || '';
          
          // If SSO URL is provided, use it first
          if (checkoutData.ssoUrl) {
            ssoUrl = checkoutData.ssoUrl;
          }
          
          // Add discount to URL if available
          if (checkoutData.discountCode && checkoutUrl) {
            const urlObj = new URL(checkoutUrl);
            urlObj.searchParams.set('discount', checkoutData.discountCode);
            checkoutUrl = urlObj.toString();
          }
        }
      } catch (checkoutErr) {
        console.warn('Checkout creation failed:', checkoutErr);
      }
      
      // Step 5: If no checkout URL from backend, build fallback
      if (!checkoutUrl) {
        // Get discount code from backend if available
        let discountParam = '';
        try {
          const discountResponse = await fetch(`${API_URL}/api/v1/checkout/create`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ cartId: cart.id }),
          });
          
          if (discountResponse.ok) {
            const discountData = await discountResponse.json();
            if (discountData.discountCode) {
              discountParam = `?discount=${discountData.discountCode}`;
            }
          }
        } catch (discountErr) {
          console.warn('Discount code fetch failed:', discountErr);
        }
        
        checkoutUrl = `${shopUrl}/checkout${discountParam}`;
      }
      
      // Step 6: Set cookies for autofill (Shopify reads these)
      // Shopify checkout reads certain cookies for autofill
      if (userData || addressData) {
        const domain = '.eagledtfsupply.com'; // Cross-subdomain cookie
        
        // Set customer email cookie (Shopify reads this)
        if (userData?.email) {
          document.cookie = `customer_email=${encodeURIComponent(userData.email)}; domain=${domain}; path=/; max-age=3600; SameSite=Lax`;
        }
        
        // Set customer info in localStorage for snippet autofill
        const checkoutData = {
          email: userData?.email || localStorage.getItem('eagle_userEmail') || '',
          firstName: userData?.firstName || '',
          lastName: userData?.lastName || '',
          phone: userData?.phone || '',
          address1: addressData?.address1 || addressData?.street || '',
          address2: addressData?.address2 || '',
          city: addressData?.city || '',
          state: addressData?.state || addressData?.province || '',
          zip: addressData?.postalCode || addressData?.zip || '',
          country: addressData?.country || 'US',
          timestamp: Date.now(),
        };
        
        localStorage.setItem('eagle_checkout_autofill', JSON.stringify(checkoutData));
        sessionStorage.setItem('eagle_checkout_autofill', JSON.stringify(checkoutData));
      }
      
      // Step 7: Redirect to SSO first (if available), then checkout
      if (ssoUrl) {
        // Update SSO return_to with checkout URL
        const ssoUrlObj = new URL(ssoUrl);
        ssoUrlObj.searchParams.set('return_to', checkoutUrl);
        
        console.log('🦅 Redirecting to SSO first, then checkout');
        window.location.href = ssoUrlObj.toString();
      } else {
        // Direct checkout redirect
        console.log('🦅 Redirecting to checkout');
        window.location.href = checkoutUrl;
      }
      
    } catch (err) {
      console.error('Checkout error:', err);
      
      // Fallback: Use cart URL format
      const cartItems = cart.items.map((item: any) => 
        `${item.shopifyVariantId}:${item.quantity}`
      ).join(',');
      
      if (cartItems) {
        window.location.href = `https://eagle-dtf-supply0.myshopify.com/cart/${cartItems}`;
      } else {
        alert('Failed to proceed to checkout. Please try again.');
      }
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
