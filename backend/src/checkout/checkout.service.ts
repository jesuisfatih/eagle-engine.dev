import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ShopifyRestService } from '../shopify/shopify-rest.service';
import { DiscountEngineService } from './discount-engine.service';
import { PricingCalculatorService } from '../pricing/pricing-calculator.service';

@Injectable()
export class CheckoutService {
  private readonly logger = new Logger(CheckoutService.name);

  constructor(
    private prisma: PrismaService,
    private shopifyRest: ShopifyRestService,
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
    }

    // Create Shopify checkout via Storefront API
    const checkoutData = {
      lineItems: cart.items.map((item) => ({
        variantId: item.shopifyVariantId?.toString(),
        quantity: item.quantity,
      })),
      discountCode,
    };

    // For now, return checkout URL (full Storefront API integration needed)
    const checkoutUrl = `https://${merchant.shopDomain}/cart?discount=${discountCode || ''}`;

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

