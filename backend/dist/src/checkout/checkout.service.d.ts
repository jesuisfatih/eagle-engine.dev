import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { ShopifyRestService } from '../shopify/shopify-rest.service';
import { ShopifyAdminDiscountService } from '../shopify/shopify-admin-discount.service';
import { ShopifyStorefrontService } from '../shopify/shopify-storefront.service';
import { DiscountEngineService } from './discount-engine.service';
import { PricingCalculatorService } from '../pricing/pricing-calculator.service';
import { ShopifySsoService } from '../shopify/shopify-sso.service';
import { ShopifyCustomerSyncService } from '../shopify/shopify-customer-sync.service';
export declare class CheckoutService {
    private config;
    private prisma;
    private shopifyRest;
    private shopifyAdminDiscount;
    private shopifyStorefront;
    private discountEngine;
    private pricingCalculator;
    private shopifySso;
    private shopifyCustomerSync;
    private readonly logger;
    private readonly storefrontToken;
    constructor(config: ConfigService, prisma: PrismaService, shopifyRest: ShopifyRestService, shopifyAdminDiscount: ShopifyAdminDiscountService, shopifyStorefront: ShopifyStorefrontService, discountEngine: DiscountEngineService, pricingCalculator: PricingCalculatorService, shopifySso: ShopifySsoService, shopifyCustomerSync: ShopifyCustomerSyncService);
    createCheckout(cartId: string, userId?: string): Promise<{
        checkoutUrl: string;
        discountCode: string | undefined;
        total: number;
        savings: number;
        ssoUrl: string | undefined;
        userData: {
            email: any;
            firstName: any;
            lastName: any;
            phone: any;
        } | null;
    }>;
    private buildCartUrl;
    private getShippingAddress;
}
