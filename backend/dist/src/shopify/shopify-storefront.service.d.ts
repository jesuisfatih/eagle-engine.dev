import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
interface CartLineItem {
    merchandiseId: string;
    quantity: number;
}
interface DeliveryAddress {
    firstName?: string;
    lastName?: string;
    address1: string;
    address2?: string;
    city: string;
    province?: string;
    country: string;
    zip: string;
    phone?: string;
}
interface BuyerIdentity {
    email: string;
    phone?: string;
    countryCode?: string;
    deliveryAddressPreferences?: {
        deliveryAddress: DeliveryAddress;
    }[];
}
export declare class ShopifyStorefrontService {
    private httpService;
    private config;
    private readonly logger;
    private readonly apiVersion;
    constructor(httpService: HttpService, config: ConfigService);
    private buildStorefrontUrl;
    createCart(shop: string, storefrontAccessToken: string, lines: CartLineItem[], discountCodes?: string[], customerAccessToken?: string): Promise<{
        cartId: any;
        checkoutUrl: any;
        total: any;
    }>;
    createCustomerAccessToken(shop: string, storefrontAccessToken: string, email: string, password: string): Promise<string | null>;
    updateCartBuyerIdentity(shop: string, storefrontAccessToken: string, cartId: string, buyerIdentity: BuyerIdentity): Promise<{
        cartId: any;
        checkoutUrl: any;
        buyerIdentity: any;
    }>;
    createCheckoutWithBuyerIdentity(shop: string, storefrontAccessToken: string, lines: CartLineItem[], buyerIdentity: BuyerIdentity, discountCodes?: string[]): Promise<{
        cartId: string;
        checkoutUrl: string;
        email: string;
    }>;
    formatVariantId(variantId: string | number | bigint): string;
}
export {};
