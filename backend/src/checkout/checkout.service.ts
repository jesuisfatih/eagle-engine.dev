import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ShopifyRestService } from '../shopify/shopify-rest.service';
import { ShopifyAdminDiscountService } from '../shopify/shopify-admin-discount.service';
import { ShopifyStorefrontService } from '../shopify/shopify-storefront.service';
import { DiscountEngineService } from './discount-engine.service';
import { PricingCalculatorService } from '../pricing/pricing-calculator.service';

@Injectable()
export class CheckoutService {
  private readonly logger = new Logger(CheckoutService.name);

  constructor(
    private prisma: PrismaService,
    private shopifyRest: ShopifyRestService,
    private shopifyAdminDiscount: ShopifyAdminDiscountService,
    private shopifyStorefront: ShopifyStorefrontService,
    private discountEngine: DiscountEngineService,
    private pricingCalculator: PricingCalculatorService,
  ) {}

  async createCheckout(cartId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: {
            variant: true,
          },
        },
        company: true,
      },
    });

    if (!cart) {
      throw new Error('Cart not found');
    }

    const merchant = await this.prisma.merchant.findUnique({
      where: { id: cart.merchantId },
    });

    if (!merchant) {
      throw new Error('Merchant not found');
    }

    // Recalculate cart pricing
    const pricing = await this.pricingCalculator.calculateCartPricing(cartId);

    // Calculate Shopify standard total
    let shopifyTotal = 0;
    for (const item of cart.items) {
      if (item.variant) {
        shopifyTotal += parseFloat(item.variant.price?.toString() || '0') * item.quantity;
      }
    }

    const discountAmount = shopifyTotal - pricing.subtotal;

    // Generate discount code if needed
    let discountCode: string | undefined;
    if (discountAmount > 0) {
      discountCode = await this.discountEngine.generateDiscountCode(
        merchant.id,
        cart.companyId,
        cartId,
        discountAmount,
      );

      // Create discount in Shopify Admin API (SYNC)
      try {
        const shopifyDiscount = await this.shopifyAdminDiscount.createPriceRule(
          merchant.shopDomain,
          merchant.accessToken,
          discountCode,
          discountAmount,
          'fixed_amount',
        );
        
        this.logger.log(`Shopify discount created: ${discountCode} (ID: ${shopifyDiscount.priceRuleId})`);
        
        // Update discount code with Shopify ID
        await this.prisma.discountCode.updateMany({
          where: { code: discountCode },
          data: { shopifyDiscountId: BigInt(shopifyDiscount.priceRuleId) },
        });
      } catch (error) {
        this.logger.error('Failed to create Shopify discount', error);
        // Continue anyway - discount will be in URL
      }
    }

    // Create Shopify cart via Storefront API
    const lines = cart.items.map((item) => ({
      merchandiseId: `gid://shopify/ProductVariant/${item.shopifyVariantId}`,
      quantity: item.quantity,
    }));

    let checkoutUrl: string;
    try {
      // Note: storefrontAccessToken should be stored in merchant settings
      const storefrontToken = 'YOUR_STOREFRONT_ACCESS_TOKEN'; // TODO: Get from merchant settings
      
      const result = await this.shopifyStorefront.createCart(
        merchant.shopDomain,
        storefrontToken,
        lines,
        discountCode ? [discountCode] : undefined,
      );

      checkoutUrl = result.checkoutUrl;
    } catch (error) {
      this.logger.error('Storefront API failed, using fallback URL', error);
      // Fallback: Direct cart URL with discount
      checkoutUrl = `https://${merchant.shopDomain}/cart/${cart.items.map(i => `${i.shopifyVariantId}:${i.quantity}`).join(',')}${discountCode ? `?discount=${discountCode}` : ''}`;
    }

    // Update cart
    await this.prisma.cart.update({
      where: { id: cartId },
      data: {
        shopifyCheckoutUrl: checkoutUrl,
        status: 'approved',
      },
    });

    return {
      checkoutUrl,
      discountCode,
      total: pricing.subtotal,
      savings: discountAmount,
    };
  }
}

