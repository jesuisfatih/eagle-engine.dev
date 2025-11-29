import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ShopifyRestService } from '../shopify/shopify-rest.service';
import { ShopifyAdminDiscountService } from '../shopify/shopify-admin-discount.service';
import { ShopifyStorefrontService } from '../shopify/shopify-storefront.service';
import { DiscountEngineService } from './discount-engine.service';
import { PricingCalculatorService } from '../pricing/pricing-calculator.service';
import { ShopifySsoService } from '../shopify/shopify-sso.service';
import { ShopifyCustomerSyncService } from '../shopify/shopify-customer-sync.service';

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
    private shopifySso: ShopifySsoService,
    private shopifyCustomerSync: ShopifyCustomerSyncService,
  ) {}

  async createCheckout(cartId: string, userId?: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: {
            variant: true,
          },
        },
        company: {
          include: {
            users: userId ? {
              where: { id: userId },
            } : false,
          },
        },
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

    // Get user data for SSO and autofill
    let user: any = null;
    let shopifyCustomerAccessToken: string | undefined;
    let ssoUrl: string | undefined;

    if (userId) {
      user = await this.prisma.companyUser.findUnique({
        where: { id: userId },
        include: {
          company: true,
        },
      });

      if (user && user.email) {
        // Ensure user is synced to Shopify
        try {
          if (!user.shopifyCustomerId) {
            await this.shopifyCustomerSync.syncUserToShopify(userId);
            // Reload user to get Shopify ID
            user = await this.prisma.companyUser.findUnique({
              where: { id: userId },
            });
          }

          // Get SSO mode from merchant settings
          const settings = (merchant.settings as any) || {};
          const ssoMode = settings.ssoMode || 'alternative';

          if (ssoMode === 'multipass' && settings.multipassSecret) {
            // Generate Multipass SSO URL
            ssoUrl = this.shopifySso.generateSsoUrl({
              email: user.email,
              firstName: user.firstName || '',
              lastName: user.lastName || '',
              customerId: user.shopifyCustomerId?.toString(),
              returnTo: '/checkout', // Will be updated with actual checkout URL
            });
          } else {
            // Alternative SSO: Use Storefront API customerAccessToken
            // First, we need to get/create customer access token
            // This requires Storefront API customerAccessTokenCreate mutation
            // For now, we'll use cookie-based approach via snippet
          }
        } catch (ssoErr) {
          this.logger.warn('SSO setup failed, continuing without SSO', ssoErr);
        }
      }
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
    
    // Get storefront token from merchant settings
    const settings = (merchant.settings as any) || {};
    const storefrontToken = settings.storefrontToken || '';
    
    // Try Storefront API if token exists
    if (storefrontToken) {
      try {
        const result = await this.shopifyStorefront.createCart(
          merchant.shopDomain,
          storefrontToken,
          lines,
          discountCode ? [discountCode] : undefined,
          shopifyCustomerAccessToken, // Pass customer token for authenticated checkout
        );

        checkoutUrl = result.checkoutUrl;
        this.logger.log(`Checkout URL created via Storefront API: ${checkoutUrl}`);
        
        // If SSO URL exists, append it to checkout URL
        if (ssoUrl) {
          // Extract return_to and update checkout URL
          const ssoReturnTo = new URL(ssoUrl).searchParams.get('return_to') || checkoutUrl;
          checkoutUrl = ssoUrl.replace(/return_to=[^&]*/, `return_to=${encodeURIComponent(checkoutUrl)}`);
        }
      } catch (error) {
        this.logger.warn('Storefront API failed, using fallback cart URL', error);
        // Fallback to cart URL
        checkoutUrl = this.buildCartUrl(merchant.shopDomain, cart.items, discountCode);
      }
    } else {
      // No storefront token - use cart URL directly
      this.logger.log('No storefront token, using cart URL');
      checkoutUrl = this.buildCartUrl(merchant.shopDomain, cart.items, discountCode);
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
      ssoUrl, // Return SSO URL if available
      userData: user ? {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
      } : null,
    };
  }

  private buildCartUrl(shopDomain: string, items: any[], discountCode?: string): string {
    const cartItems = items.map(i => `${i.shopifyVariantId}:${i.quantity}`).join(',');
    const baseUrl = `https://${shopDomain}/cart/${cartItems}`;
    return discountCode ? `${baseUrl}?discount=${discountCode}` : baseUrl;
  }
}

