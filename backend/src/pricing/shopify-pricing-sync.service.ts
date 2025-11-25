import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ShopifyAdminDiscountService } from '../shopify/shopify-admin-discount.service';

@Injectable()
export class ShopifyPricingSyncService {
  private readonly logger = new Logger(ShopifyPricingSyncService.name);

  constructor(
    private prisma: PrismaService,
    private shopifyDiscount: ShopifyAdminDiscountService,
  ) {}

  async syncPricingRuleToShopify(ruleId: string) {
    const rule = await this.prisma.pricingRule.findUnique({
      where: { id: ruleId },
      include: { targetCompany: true },
    });

    if (!rule || !rule.isActive) return;

    const merchant = await this.prisma.merchant.findUnique({
      where: { id: rule.merchantId },
    });

    if (!merchant) return;

    try {
      if (rule.discountType === 'percentage' && rule.discountPercentage) {
        const code = `EAGLE-${rule.name.replace(/\s+/g, '-').toUpperCase()}`;
        
        await this.shopifyDiscount.createPriceRule(
          merchant.shopDomain,
          merchant.accessToken,
          code,
          parseFloat(rule.discountPercentage.toString()),
          'percentage',
        );

        this.logger.log(`Pricing rule ${rule.name} synced to Shopify as ${code}`);
      }
    } catch (error) {
      this.logger.error('Pricing rule Shopify sync failed', error);
    }
  }
}

