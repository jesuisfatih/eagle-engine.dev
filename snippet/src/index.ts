/**
 * Eagle B2B Commerce Engine - Shopify Snippet
 * Real-time cart tracking and customer sync
 */

interface EagleConfig {
  apiUrl: string;
  shop: string;
  token?: string;
}

declare global {
  interface Window {
    Shopify: any;
    ShopifyAnalytics: any;
  }
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
      
      this.cartToken = cart.token;
      
      await fetch(`${this.config.apiUrl}/api/v1/events/collect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop: this.config.shop,
          sessionId: this.sessionId,
          eagleToken: this.config.token,
          shopifyCustomerId: this.customerId,
          eventType: 'cart_update',
          payload: {
            cartToken: this.cartToken,
            items: cart.items,
            itemCount: cart.item_count,
            totalPrice: cart.total_price,
            currency: cart.currency,
          },
        }),
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
}

// Initialize Eagle when DOM is ready
(function () {
  const scriptTag = document.currentScript as HTMLScriptElement;
  const apiUrl = scriptTag?.getAttribute('data-api-url') || 'http://localhost:4000';
  const shop = scriptTag?.getAttribute('data-shop') || '';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      (window as any).Eagle = new EagleSnippet({ apiUrl, shop });
    });
  } else {
    (window as any).Eagle = new EagleSnippet({ apiUrl, shop });
  }
})();




