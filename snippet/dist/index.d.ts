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
declare class EagleSnippet {
    private config;
    private sessionId;
    private customerId;
    private cartToken;
    constructor(config: EagleConfig);
    private init;
    private detectCustomer;
    private syncCustomerToEagle;
    private setupCartTracking;
    private syncCartToEagle;
    private setupCustomerSync;
    private linkCustomerAccounts;
    private generateSessionId;
    private loadToken;
    private trackEvent;
    private trackPageView;
    private setupEventListeners;
    private trackProductView;
    private trackAddToCart;
    setToken(token: string): void;
    clearToken(): void;
    private setupCheckoutAutofill;
}
//# sourceMappingURL=index.d.ts.map