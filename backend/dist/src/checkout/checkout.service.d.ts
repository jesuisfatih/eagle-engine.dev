import { PrismaService } from '../prisma/prisma.service';
import { ShopifyRestService } from '../shopify/shopify-rest.service';
import { ShopifyAdminDiscountService } from '../shopify/shopify-admin-discount.service';
import { ShopifyStorefrontService } from '../shopify/shopify-storefront.service';
import { DiscountEngineService } from './discount-engine.service';
import { PricingCalculatorService } from '../pricing/pricing-calculator.service';
export declare class CheckoutService {
    private prisma;
    private shopifyRest;
    private shopifyAdminDiscount;
    private shopifyStorefront;
    private discountEngine;
    private pricingCalculator;
    private readonly logger;
    constructor(prisma: PrismaService, shopifyRest: ShopifyRestService, shopifyAdminDiscount: ShopifyAdminDiscountService, shopifyStorefront: ShopifyStorefrontService, discountEngine: DiscountEngineService, pricingCalculator: PricingCalculatorService);
    createCheckout(cartId: string): Promise<{
        checkoutUrl: string;
        discountCode: string | undefined;
        total: number;
        savings: number;
    }>;
    private buildCartUrl;
}
