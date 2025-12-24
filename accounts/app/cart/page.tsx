'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { accountsFetch } from '@/lib/api-client';
import { formatCurrency, calculateSavings } from '@/lib/utils';
import { CartSummary, CartItemRow } from '@/components/cart/CartSummary';
import { CartOptimizer } from '@/components/cart/QuantityBreakAlert';
import { PageLoading, EmptyState } from '@/components/ui';

// Cart item structure as returned by API
interface CartItemData {
  id: string;
  shopifyVariantId: string;
  quantity: number;
  unitPrice: number;
  listPrice?: number;
  product?: {
    title: string;
    imageUrl?: string;
  };
  variantTitle?: string;
  sku?: string;
  quantityBreaks?: { qty: number; price: number }[];
}

interface CartData {
  id: string;
  items: CartItemData[];
}

export default function CartPage() {
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    setLoading(true);
    try {
      const response = await accountsFetch('/api/v1/carts/active');
      
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

  // Types for checkout data
  interface UserData {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  }
  
  interface AddressData {
    id: string;
    firstName: string;
    lastName: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault?: boolean;
  }

  const checkout = async () => {
    if (!cart || !cart.id || !cart.items || cart.items.length === 0) {
      setCheckoutError('Cart is empty');
      return;
    }
    
    setCheckoutLoading(true);
    setCheckoutError(null);
    
    try {
      // Step 1: Fetch user profile and address information
      let userData: UserData | null = null;
      let addressData: AddressData | null = null;
      
      try {
        // Get user profile
        const userResponse = await accountsFetch('/api/v1/company-users/me');
        
        if (userResponse.ok) {
          userData = await userResponse.json();
        }
        
        // Get user addresses (try to get default or first address)
        try {
          const addressResponse = await accountsFetch('/api/v1/addresses');
          
          if (addressResponse.ok) {
            const addresses: AddressData[] = await addressResponse.json();
            // Get default address or first address
            addressData = addresses.find(addr => addr.isDefault) || addresses[0] || null;
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
      
      // Step 3: Get shop domain from company data
      const companyId = localStorage.getItem('eagle_companyId') || '';
      let shopDomain = '';
      
      try {
        const companyResponse = await accountsFetch(`/api/v1/companies/${companyId}`);
        if (companyResponse.ok) {
          const companyData = await companyResponse.json();
          shopDomain = companyData.merchant?.shopDomain || '';
        }
      } catch (e) {
        console.error('Failed to get shop domain:', e);
      }
      
      if (!shopDomain) {
        throw new Error('Shop domain not found');
      }
      
      const shopUrl = `https://${shopDomain}`;
      
      // Add all items to Shopify cart using /cart/add.js
      const addPromises = cart.items.map((item: CartItemData) => {
        const shopifyVarId = item.shopifyVariantId || item.variantId || item.id || '';
        return fetch(`${shopUrl}/cart/add.js`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: shopifyVarId.toString(),
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
        const checkoutResponse = await accountsFetch('/api/v1/checkout/create', {
          method: 'POST',
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
          const discountResponse = await accountsFetch('/api/v1/checkout/create', {
            method: 'POST',
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
      
      // Fallback: Use cart URL format - need to get shopDomain again
      const companyId = localStorage.getItem('eagle_companyId') || '';
      let fallbackShopDomain = '';
      try {
        const companyResponse = await accountsFetch(`/api/v1/companies/${companyId}`);
        if (companyResponse.ok) {
          const companyData = await companyResponse.json();
          fallbackShopDomain = companyData.merchant?.shopDomain || '';
        }
      } catch (e) {
        console.error('Fallback shop domain fetch failed:', e);
      }
      
      const cartItems = cart.items.map((item: CartItemData) => 
        `${item.shopifyVariantId}:${item.quantity}`
      ).join(',');
      
      if (cartItems && fallbackShopDomain) {
        window.location.href = `https://${fallbackShopDomain}/cart/${cartItems}`;
      } else {
        setCheckoutLoading(false);
        setCheckoutError('Failed to proceed to checkout. Please check your connection and try again.');
      }
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!cart) return;
    
    try {
      const response = await accountsFetch(`/api/v1/carts/${cart.id}/items/${itemId}`, {
        method: 'PUT',
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
      await accountsFetch(`/api/v1/carts/${cart.id}/items/${itemId}`, {
        method: 'DELETE',
      });
      loadCart();
    } catch (err) {
      console.error(err);
    }
  };

  const createCart = async () => {
    try {
      const merchantId = localStorage.getItem('eagle_merchantId') || '';
      const companyId = localStorage.getItem('eagle_companyId') || '';
      const userId = localStorage.getItem('eagle_userId') || '';
      
      if (!merchantId) {
        alert('Merchant not found. Please login again.');
        return;
      }
      
      const response = await accountsFetch('/api/v1/carts', {
        method: 'POST',
        body: JSON.stringify({ merchantId, companyId, createdByUserId: userId }),
      });
      
      if (response.ok) {
        loadCart();
      }
    } catch (err) {
      console.error('Create cart error:', err);
    }
  };

  const subtotal = cart?.items?.reduce((sum: number, item: CartItemData) => 
    sum + (item.unitPrice * item.quantity), 0) || 0;
  
  // Calculate list total (original prices before B2B discount)
  const listTotal = cart?.items?.reduce((sum: number, item: CartItemData) => 
    sum + ((item.listPrice || item.unitPrice) * item.quantity), 0) || 0;
  
  // Calculate savings
  const totalSavings = listTotal - subtotal;

  if (loading) {
    return <PageLoading text="Loading your cart..." />;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Shopping Cart</h4>
          {cart && cart.items?.length > 0 && (
            <p className="text-muted mb-0">
              {cart.items.length} item{cart.items.length !== 1 ? 's' : ''} in your cart
            </p>
          )}
        </div>
        <div className="d-flex gap-2">
          {!cart && (
            <button onClick={createCart} className="btn btn-primary btn-sm">
              <i className="ti ti-plus me-1"></i>Create Cart
            </button>
          )}
          <Link href="/products" className="btn btn-outline-primary btn-sm">
            <i className="ti ti-arrow-left me-1"></i>
            Continue Shopping
          </Link>
        </div>
      </div>

      {!cart || cart.items?.length === 0 ? (
        <EmptyState
          icon="ti-shopping-cart-off"
          title="Your cart is empty"
          description="Browse our products and add items to your cart"
          action={{
            label: 'Browse Products',
            onClick: () => window.location.href = '/products',
          }}
        />
      ) : (
        <div className="row">
          {/* Cart Items Column */}
          <div className="col-lg-8">
            {/* Savings Optimizer */}
            <CartOptimizer
              items={cart.items.map(item => ({
                id: item.id,
                title: item.product?.title || 'Product',
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                quantityBreaks: item.quantityBreaks,
              }))}
              onUpdateQuantity={(itemId, newQty) => updateQuantity(itemId, newQty)}
            />

            {/* Cart Items */}
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="card-title mb-0">Cart Items</h5>
              </div>
              <div className="card-body p-0">
                {cart.items?.map((item: CartItemData) => (
                  <div key={item.id} className="border-bottom p-3">
                    <div className="row align-items-center">
                      {/* Product Image */}
                      <div className="col-auto">
                        <img
                          src={item.product?.imageUrl || '/placeholder.png'}
                          alt={item.product?.title || 'Product'}
                          className="rounded"
                          style={{ width: 80, height: 80, objectFit: 'cover' }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80?text=No+Image';
                          }}
                        />
                      </div>

                      {/* Product Details */}
                      <div className="col">
                        <h6 className="mb-1">{item.product?.title || 'Product'}</h6>
                        {item.variantTitle && (
                          <small className="text-muted d-block">{item.variantTitle}</small>
                        )}
                        {item.sku && (
                          <small className="text-muted d-block">SKU: {item.sku}</small>
                        )}
                        
                        {/* Price Display */}
                        <div className="mt-2">
                          <span className="fw-bold text-success">
                            {formatCurrency(item.unitPrice)}
                          </span>
                          {item.listPrice && item.listPrice > item.unitPrice && (
                            <>
                              <span className="text-muted text-decoration-line-through ms-2 small">
                                {formatCurrency(item.listPrice)}
                              </span>
                              <span className="badge bg-success ms-2 small">
                                B2B Price
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="col-auto">
                        <div className="input-group" style={{ width: 130 }}>
                          <button
                            className="btn btn-outline-secondary"
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <i className="ti ti-minus"></i>
                          </button>
                          <input
                            type="text"
                            className="form-control text-center"
                            value={item.quantity}
                            readOnly
                            style={{ maxWidth: 50 }}
                          />
                          <button
                            className="btn btn-outline-secondary"
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <i className="ti ti-plus"></i>
                          </button>
                        </div>
                      </div>

                      {/* Item Total */}
                      <div className="col-auto text-end" style={{ minWidth: 100 }}>
                        <div className="fw-bold">
                          {formatCurrency(item.unitPrice * item.quantity)}
                        </div>
                        {item.listPrice && item.listPrice > item.unitPrice && (
                          <small className="text-success">
                            Save {formatCurrency((item.listPrice - item.unitPrice) * item.quantity)}
                          </small>
                        )}
                      </div>

                      {/* Remove Button */}
                      <div className="col-auto">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="btn btn-outline-danger btn-sm"
                          title="Remove item"
                        >
                          <i className="ti ti-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cart Summary Column */}
          <div className="col-lg-4">
            <CartSummary
              items={cart.items.map(item => ({
                id: item.id,
                title: item.product?.title || 'Product',
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                listPrice: item.listPrice,
              }))}
              subtotal={subtotal}
              listTotal={listTotal > subtotal ? listTotal : undefined}
              total={subtotal}
              savings={totalSavings}
              onCheckout={checkout}
              checkoutLoading={checkoutLoading}
              disabled={!cart || cart.items.length === 0}
            />            
            {/* Checkout Error Alert */}
            {checkoutError && (
              <div className="alert alert-danger alert-dismissible mt-3" role="alert">
                <i className="ti ti-alert-circle me-2"></i>
                {checkoutError}
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setCheckoutError(null)}
                  aria-label="Close"
                ></button>
              </div>
            )}
            {/* Trust Badges - Extra */}
            <div className="card mt-3">
              <div className="card-body text-center">
                <p className="small text-muted mb-2">
                  <i className="ti ti-lock me-1"></i>
                  Secure checkout powered by Shopify
                </p>
                <p className="small text-success mb-0">
                  <i className="ti ti-check me-1"></i>
                  Your B2B discount will be applied automatically
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
