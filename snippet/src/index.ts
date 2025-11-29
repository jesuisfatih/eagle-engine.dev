/**
 * Eagle B2B Commerce Engine - Shopify Snippet
 * Real-time cart tracking and customer sync
 */

interface EagleConfig {
  apiUrl: string;
  shop: string;
  token?: string;
}

// Type declarations for Shopify globals
interface Window {
  Shopify?: any;
  ShopifyAnalytics?: any;
}

class EagleSnippet {
  private config: EagleConfig;
  private sessionId: string;
  private customerId: string | null = null;
  private cartToken: string | null = null;

  constructor(config: EagleConfig) {
    this.config = config;
    this.sessionId = this.generateSessionId();
    this.init();
  }

  private init() {
    console.log('🦅 Eagle B2B Engine initialized');
    this.loadToken();
    this.detectCustomer();
    this.trackPageView();
    this.setupEventListeners();
    this.setupCartTracking();
    this.setupCustomerSync();
    this.setupCheckoutAutofill();
  }

  private detectCustomer() {
    // Shopify customer detection
    if (window.ShopifyAnalytics?.meta?.page?.customerId) {
      this.customerId = window.ShopifyAnalytics.meta.page.customerId;
      this.syncCustomerToEagle();
    }
  }

  private async syncCustomerToEagle() {
    if (!this.customerId) return;

    try {
      await fetch(`${this.config.apiUrl}/api/v1/events/collect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop: this.config.shop,
          sessionId: this.sessionId,
          eagleToken: this.config.token,
          shopifyCustomerId: this.customerId,
          eventType: 'customer_session',
          payload: { timestamp: new Date().toISOString() },
        }),
      });
    } catch (err) {
      console.error('Eagle: Customer sync failed', err);
    }
  }

  private setupCartTracking() {
    // Listen to Shopify cart changes
    if (typeof window !== 'undefined') {
      // Intercept fetch for cart updates
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        const response = await originalFetch(...args);
        
        const url = args[0]?.toString() || '';
        if (url.includes('/cart/') || url.includes('/cart.js')) {
          this.syncCartToEagle();
        }
        
        return response;
      };

      // Track cart on page load
      this.syncCartToEagle();
      
      // Periodic cart sync
      setInterval(() => this.syncCartToEagle(), 30000); // 30 seconds
    }
  }

  private async syncCartToEagle() {
    try {
      const cartResponse = await fetch('/cart.js');
      const cart = await cartResponse.json();
      
      if (!cart.items || cart.items.length === 0) {
        return; // Empty cart, don't sync
      }
      
      this.cartToken = cart.token;
      
      // Get customer email if available
      let customerEmail = null;
      if (window.Shopify?.customer?.email) {
        customerEmail = window.Shopify.customer.email;
      }
      
      // Send to abandoned carts tracking endpoint
      const payload = {
        cartToken: this.cartToken,
        shopifyCartId: this.cartToken,
        customerEmail: customerEmail,
        shopifyCustomerId: this.customerId,
        customerId: this.customerId,
        items: cart.items.map((item: any) => ({
          variant_id: item.variant_id,
          variantId: item.variant_id,
          product_id: item.product_id,
          productId: item.product_id,
          sku: item.sku,
          title: item.title,
          quantity: item.quantity,
          price: item.price,
        })),
        totalPrice: cart.total_price,
        currency: cart.currency,
      };
      
      console.log('🦅 Eagle: Sending cart to backend', {
        url: `${this.config.apiUrl}/api/v1/abandoned-carts/track`,
        payload: payload,
      });
      
      const response = await fetch(`${this.config.apiUrl}/api/v1/abandoned-carts/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Eagle: Cart sync failed', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        });
        throw new Error(`Cart sync failed: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('✅ Eagle: Cart synced successfully', {
        cartToken: this.cartToken,
        itemCount: cart.items.length,
        customerEmail,
        result: result,
      });
    } catch (err) {
      console.error('Eagle: Cart sync failed', err);
    }
  }

  private setupCustomerSync() {
    // Check for customer login
    const checkCustomerLogin = () => {
      if (window.Shopify?.customer) {
        this.customerId = window.Shopify.customer.id?.toString();
        if (this.config.token) {
          // User logged in both Shopify and Eagle - link them
          this.linkCustomerAccounts();
        }
      }
    };

    checkCustomerLogin();
    
    // Watch for customer changes
    setInterval(checkCustomerLogin, 5000);
  }

  private async linkCustomerAccounts() {
    if (!this.customerId || !this.config.token) return;

    try {
      await fetch(`${this.config.apiUrl}/api/v1/events/collect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop: this.config.shop,
          sessionId: this.sessionId,
          eagleToken: this.config.token,
          shopifyCustomerId: this.customerId,
          eventType: 'customer_link',
          payload: {
            timestamp: new Date().toISOString(),
            action: 'link_accounts',
          },
        }),
      });
    } catch (err) {
      console.error('Eagle: Account linking failed', err);
    }
  }

  private generateSessionId(): string {
    return `eagle-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  private loadToken() {
    const token = localStorage.getItem('eagle_token');
    if (token) {
      this.config.token = token;
    }
  }

  private async trackEvent(eventType: string, payload: any) {
    try {
      await fetch(`${this.config.apiUrl}/api/v1/events/collect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shop: this.config.shop,
          sessionId: this.sessionId,
          eagleToken: this.config.token,
          eventType,
          payload,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (error) {
      console.error('Eagle: Failed to track event', error);
    }
  }

  private trackPageView() {
    this.trackEvent('page_view', {
      url: window.location.href,
      path: window.location.pathname,
      referrer: document.referrer,
    });
  }

  private setupEventListeners() {
    // Product view tracking
    if (window.location.pathname.includes('/products/')) {
      this.trackProductView();
    }

    // Add to cart tracking (Shopify theme specific)
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.closest('[name="add"]') || target.closest('.product-form__submit')) {
        this.trackAddToCart();
      }
    });
  }

  private trackProductView() {
    // Extract product info from Shopify meta tags or JSON-LD
    const productMeta = document.querySelector('meta[property="og:product_id"]');
    if (productMeta) {
      const productId = productMeta.getAttribute('content');
      this.trackEvent('product_view', {
        productId,
        url: window.location.href,
      });
    }
  }

  private trackAddToCart() {
    this.trackEvent('add_to_cart', {
      url: window.location.href,
    });
  }

  public setToken(token: string) {
    this.config.token = token;
    localStorage.setItem('eagle_token', token);
  }

  public clearToken() {
    this.config.token = undefined;
    localStorage.removeItem('eagle_token');
  }

  private setupCheckoutAutofill() {
    // Only run on checkout pages
    if (!window.location.href.includes('/checkout') && !window.location.href.includes('/checkouts')) {
      return;
    }

    console.log('🦅 Eagle: Checkout autofill enabled');

    const fillCheckoutForm = () => {
      try {
        // Get user data from localStorage or sessionStorage
        const data = localStorage.getItem('eagle_checkout_autofill') || 
                     sessionStorage.getItem('eagle_checkout_autofill');
        
        if (!data) {
          return false;
        }
        
        const userInfo = JSON.parse(data);
        
        // Check if data is expired (5 minutes)
        if (Date.now() - userInfo.timestamp > 300000) {
          localStorage.removeItem('eagle_checkout_autofill');
          sessionStorage.removeItem('eagle_checkout_autofill');
          return false;
        }
        
        console.log('🦅 Eagle: Filling checkout form', userInfo);
        
        let filledCount = 0;
        
        // Helper function to fill input
        const fillInput = (selector: string, value: string) => {
          const element = document.querySelector(selector);
          if (element && value && !(element as HTMLInputElement).value) {
            (element as HTMLInputElement).value = value;
            element.dispatchEvent(new Event('input', { bubbles: true }));
            element.dispatchEvent(new Event('change', { bubbles: true }));
            filledCount++;
            return true;
          }
          return false;
        };
        
        // Helper function to fill select
        const fillSelect = (selector: string, value: string) => {
          const element = document.querySelector(selector) as HTMLSelectElement;
          if (element && value) {
            const option = Array.from(element.options).find((opt) => 
              opt.value === value || 
              opt.textContent?.trim() === value ||
              opt.textContent?.includes(value)
            );
            if (option && element.value !== option.value) {
              element.value = option.value;
              element.dispatchEvent(new Event('change', { bubbles: true }));
              filledCount++;
              return true;
            }
          }
          return false;
        };
        
        // Fill email (multiple selectors for compatibility)
        fillInput('#email', userInfo.email);
        fillInput('input[name="email"]', userInfo.email);
        fillInput('input[autocomplete="shipping email"]', userInfo.email);
        fillInput('input[autocomplete="email"]', userInfo.email);
        
        // Fill first name
        fillInput('#TextField3225', userInfo.firstName);
        fillInput('input[name="firstName"]', userInfo.firstName);
        fillInput('input[autocomplete="shipping given-name"]', userInfo.firstName);
        fillInput('input[autocomplete="given-name"]', userInfo.firstName);
        
        // Fill last name
        fillInput('#TextField3226', userInfo.lastName);
        fillInput('input[name="lastName"]', userInfo.lastName);
        fillInput('input[autocomplete="shipping family-name"]', userInfo.lastName);
        fillInput('input[autocomplete="family-name"]', userInfo.lastName);
        
        // Fill address
        fillInput('#shipping-address1', userInfo.address1);
        fillInput('input[name="address1"]', userInfo.address1);
        fillInput('input[autocomplete="shipping address-line1"]', userInfo.address1);
        fillInput('input[autocomplete="address-line1"]', userInfo.address1);
        
        // Fill address 2
        if (userInfo.address2) {
          fillInput('#TextField3227', userInfo.address2);
          fillInput('input[name="address2"]', userInfo.address2);
          fillInput('input[autocomplete="shipping address-line2"]', userInfo.address2);
          fillInput('input[autocomplete="address-line2"]', userInfo.address2);
        }
        
        // Fill city
        fillInput('#TextField3228', userInfo.city);
        fillInput('input[name="city"]', userInfo.city);
        fillInput('input[autocomplete="shipping address-level2"]', userInfo.city);
        fillInput('input[autocomplete="address-level2"]', userInfo.city);
        
        // Fill state
        fillSelect('#Select613', userInfo.state);
        fillSelect('select[name="zone"]', userInfo.state);
        fillSelect('select[autocomplete="shipping address-level1"]', userInfo.state);
        fillSelect('select[autocomplete="address-level1"]', userInfo.state);
        
        // Fill ZIP
        fillInput('#TextField3229', userInfo.zip);
        fillInput('input[name="postalCode"]', userInfo.zip);
        fillInput('input[autocomplete="shipping postal-code"]', userInfo.zip);
        fillInput('input[autocomplete="postal-code"]', userInfo.zip);
        
        // Fill country
        if (userInfo.country) {
          fillSelect('#Select612', userInfo.country);
          fillSelect('select[name="countryCode"]', userInfo.country);
          fillSelect('select[autocomplete="shipping country-name"]', userInfo.country);
          fillSelect('select[autocomplete="country"]', userInfo.country);
        }
        
        console.log(`🦅 Eagle: Filled ${filledCount} checkout fields`);
        
        // Clean up after successful fill
        if (filledCount > 0) {
          setTimeout(() => {
            localStorage.removeItem('eagle_checkout_autofill');
            sessionStorage.removeItem('eagle_checkout_autofill');
            console.log('🦅 Eagle: Cleaned up autofill data');
          }, 10000);
        }
        
        return filledCount > 0;
      } catch (e) {
        console.error('🦅 Eagle: Autofill error', e);
        return false;
      }
    };
    
    // Try to fill immediately
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(fillCheckoutForm, 500);
        setTimeout(fillCheckoutForm, 2000);
        setTimeout(fillCheckoutForm, 5000);
      });
    } else {
      fillCheckoutForm();
      setTimeout(fillCheckoutForm, 500);
      setTimeout(fillCheckoutForm, 2000);
      setTimeout(fillCheckoutForm, 5000);
    }
    
    // Also listen for dynamic form updates
    const observer = new MutationObserver(() => {
      fillCheckoutForm();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
    
    // Clean up observer after 30 seconds
    setTimeout(() => {
      observer.disconnect();
    }, 30000);
  }
}

// Initialize Eagle when DOM is ready
(function () {
  const scriptTag = document.currentScript as HTMLScriptElement;
  const apiUrl = scriptTag?.getAttribute('data-api-url') || 'https://api.eagledtfsupply.com';
  const shop = scriptTag?.getAttribute('data-shop') || '';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      (window as any).Eagle = new EagleSnippet({ apiUrl, shop });
    });
  } else {
    (window as any).Eagle = new EagleSnippet({ apiUrl, shop });
  }
})();




