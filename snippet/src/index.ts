/**
 * Eagle B2B Commerce Engine - Shopify Snippet
 * This script integrates with Shopify storefronts to provide B2B functionality
 */

interface EagleConfig {
  apiUrl: string;
  shop: string;
  token?: string;
}

class EagleSnippet {
  private config: EagleConfig;
  private sessionId: string;

  constructor(config: EagleConfig) {
    this.config = config;
    this.sessionId = this.generateSessionId();
    this.init();
  }

  private init() {
    console.log('🦅 Eagle B2B Engine initialized');
    this.loadToken();
    this.trackPageView();
    this.setupEventListeners();
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

