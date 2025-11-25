import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
import { ShopifyService } from '../../shopify/shopify.service';

@Processor('events-raw-queue')
export class EventsProcessorWorker {
  private readonly logger = new Logger(EventsProcessorWorker.name);

  constructor(
    private prisma: PrismaService,
    private shopifyService: ShopifyService,
  ) {}

  @Process('process-event')
  async processEvent(job: Job) {
    const event = job.data;

    try {
      // Get merchant by shop domain
      const merchant = await this.shopifyService.getMerchantByShopDomain(event.shop);
      if (!merchant) {
        this.logger.warn(`Merchant not found for shop: ${event.shop}`);
        return;
      }

      // Try to match company and user
      let companyId: string | undefined;
      let companyUserId: string | undefined;

      if (event.eagleToken) {
        // User is logged in to accounts panel
        const user = await this.prisma.companyUser.findFirst({
          where: { email: event.eagleToken }, // Simplified - should decode JWT
        });
        if (user) {
          companyUserId = user.id;
          companyId = user.companyId;
        }
      } else if (event.shopifyCustomerId) {
        // Try to match with Shopify customer
        const user = await this.prisma.companyUser.findFirst({
          where: { shopifyCustomerId: BigInt(event.shopifyCustomerId) },
        });
        if (user) {
          companyUserId = user.id;
          companyId = user.companyId;
        }
      }

      // Extract product/variant IDs from payload
      let productId: string | undefined;
      let variantId: string | undefined;
      let shopifyProductId: bigint | undefined;
      let shopifyVariantId: bigint | undefined;

      if (event.payload?.productId) {
        shopifyProductId = BigInt(event.payload.productId);
        const product = await this.prisma.catalogProduct.findFirst({
          where: { shopifyProductId },
        });
        if (product) {
          productId = product.id;
        }
      }

      if (event.payload?.variantId) {
        shopifyVariantId = BigInt(event.payload.variantId);
        const variant = await this.prisma.catalogVariant.findFirst({
          where: { shopifyVariantId },
        });
        if (variant) {
          variantId = variant.id;
          if (!productId) {
            productId = variant.productId;
          }
        }
      }

      // Store event
      await this.prisma.activityLog.create({
        data: {
          merchantId: merchant.id,
          companyId,
          companyUserId,
          shopifyCustomerId: event.shopifyCustomerId ? BigInt(event.shopifyCustomerId) : null,
          sessionId: event.sessionId,
          eagleToken: event.eagleToken,
          eventType: event.eventType,
          productId,
          variantId,
          shopifyProductId,
          shopifyVariantId,
          payload: event.payload,
          ipAddress: event.ipAddress,
          userAgent: event.userAgent,
          referrer: event.referrer,
        },
      });

      this.logger.log(`Event processed: ${event.eventType} for shop ${event.shop}`);
    } catch (error) {
      this.logger.error('Failed to process event', error);
      throw error;
    }
  }
}



