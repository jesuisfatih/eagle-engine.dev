import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
import { ShopifyService } from '../../shopify/shopify.service';
import { ShopifyRestService } from '../../shopify/shopify-rest.service';

interface SyncJobData {
  merchantId: string;
  syncLogId?: string;
}

@Processor('orders-sync')
export class OrdersSyncWorker {
  private readonly logger = new Logger(OrdersSyncWorker.name);

  constructor(
    private prisma: PrismaService,
    private shopifyService: ShopifyService,
    private shopifyRest: ShopifyRestService,
  ) {}

  @Process('initial-sync')
  async handleInitialSync(job: Job<SyncJobData>) {
    const { merchantId, syncLogId } = job.data;
    this.logger.log(`Starting initial orders sync for merchant: ${merchantId}`);

    try {
      const merchant = await this.prisma.merchant.findUnique({
        where: { id: merchantId },
      });

      if (!merchant) {
        throw new Error('Merchant not found');
      }

      const result: any = await this.shopifyRest.getOrders(
        merchant.shopDomain,
        merchant.accessToken,
        250,
      );

      const orders = result.orders || [];
      let processed = 0;

      for (const order of orders) {
        // Try to find associated company user
        let companyId: string | undefined;
        let companyUserId: string | undefined;

        if (order.customer?.id) {
          const companyUser = await this.prisma.companyUser.findFirst({
            where: {
              shopifyCustomerId: BigInt(order.customer.id),
            },
          });

          if (companyUser) {
            companyUserId = companyUser.id;
            companyId = companyUser.companyId;
          }
        }

        await this.prisma.orderLocal.upsert({
          where: {
            merchantId_shopifyOrderId: {
              merchantId,
              shopifyOrderId: BigInt(order.id),
            },
          },
          create: {
            merchantId,
            shopifyOrderId: BigInt(order.id),
            shopifyOrderNumber: order.order_number?.toString(),
            shopifyCustomerId: order.customer?.id ? BigInt(order.customer.id) : null,
            companyId,
            companyUserId,
            email: order.email,
            subtotal: order.subtotal_price ? parseFloat(order.subtotal_price) : 0,
            totalDiscounts: order.total_discounts ? parseFloat(order.total_discounts) : 0,
            totalTax: order.total_tax ? parseFloat(order.total_tax) : 0,
            totalPrice: order.total_price ? parseFloat(order.total_price) : 0,
            currency: order.currency,
            financialStatus: order.financial_status,
            fulfillmentStatus: order.fulfillment_status,
            lineItems: order.line_items || [],
            shippingAddress: order.shipping_address,
            billingAddress: order.billing_address,
            discountCodes: order.discount_codes || [],
            rawData: order,
          },
          update: {
            shopifyOrderNumber: order.order_number?.toString(),
            shopifyCustomerId: order.customer?.id ? BigInt(order.customer.id) : null,
            companyId,
            companyUserId,
            email: order.email,
            subtotal: order.subtotal_price ? parseFloat(order.subtotal_price) : 0,
            totalDiscounts: order.total_discounts ? parseFloat(order.total_discounts) : 0,
            totalTax: order.total_tax ? parseFloat(order.total_tax) : 0,
            totalPrice: order.total_price ? parseFloat(order.total_price) : 0,
            currency: order.currency,
            financialStatus: order.financial_status,
            fulfillmentStatus: order.fulfillment_status,
            lineItems: order.line_items || [],
            shippingAddress: order.shipping_address,
            billingAddress: order.billing_address,
            discountCodes: order.discount_codes || [],
            rawData: order,
            syncedAt: new Date(),
          },
        });

        processed++;
      }

      if (syncLogId) {
        await this.prisma.syncLog.update({
          where: { id: syncLogId },
          data: {
            status: 'completed',
            recordsProcessed: processed,
            completedAt: new Date(),
          },
        });
      }

      this.logger.log(`Completed orders sync. Processed ${processed} orders.`);
      return { processed };
    } catch (error) {
      this.logger.error('Orders sync failed', error);
      
      if (syncLogId) {
        await this.prisma.syncLog.update({
          where: { id: syncLogId },
          data: {
            status: 'failed',
            errorMessage: error.message,
            completedAt: new Date(),
          },
        });
      }

      throw error;
    }
  }

  @Process('sync')
  async handleContinuousSync(job: Job<SyncJobData>) {
    return this.handleInitialSync(job);
  }
}



