import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
import { ShopifyRestService } from '../../shopify/shopify-rest.service';
import { ShopifyService } from '../../shopify/shopify.service';
import { SyncStateService } from '../sync-state.service';

interface SyncJobData {
  merchantId: string;
  syncLogId?: string;
  isInitial?: boolean;
}

@Processor('orders-sync')
export class OrdersSyncWorker {
  private readonly logger = new Logger(OrdersSyncWorker.name);

  constructor(
    private prisma: PrismaService,
    private shopifyService: ShopifyService,
    private shopifyRest: ShopifyRestService,
    private syncState: SyncStateService,
  ) {}

  @Process('sync')
  async handleSync(job: Job<SyncJobData>) {
    const { merchantId, syncLogId, isInitial } = job.data;
    this.logger.log(`Starting orders sync for merchant: ${merchantId} (initial: ${!!isInitial})`);

    // Acquire lock via DB
    const lockAcquired = await this.syncState.acquireLock(merchantId, 'orders');
    if (!lockAcquired) {
      this.logger.warn(`Could not acquire lock for orders sync (merchant: ${merchantId})`);
      return { skipped: true, reason: 'lock_not_acquired' };
    }

    try {
      const merchant = await this.prisma.merchant.findUnique({
        where: { id: merchantId },
      });

      if (!merchant) {
        throw new Error('Merchant not found');
      }

      // Get last synced order ID from DB state for incremental sync
      const state = await this.syncState.getState(merchantId, 'orders');
      const sinceId = isInitial ? undefined : state.lastSyncedId;

      // Build query params - use since_id for incremental sync
      let path = `/orders.json?limit=250&status=any`;
      if (sinceId) {
        path += `&since_id=${sinceId.toString()}`;
      }

      const result: any = await this.shopifyRest.get(
        merchant.shopDomain,
        merchant.accessToken,
        path,
      );

      const orders = result.orders || [];
      let processed = 0;
      let maxOrderId: bigint | null = null;

      for (const order of orders) {
        // Track the highest order ID for incremental sync
        const orderId = BigInt(order.id);
        if (!maxOrderId || orderId > maxOrderId) {
          maxOrderId = orderId;
        }

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

      // Save last synced order ID for incremental sync
      if (maxOrderId) {
        await this.syncState.updateCursor(merchantId, 'orders', null, maxOrderId);
      }

      // Sync completed successfully
      await this.syncState.updateMetrics(merchantId, 'orders', processed);
      await this.syncState.releaseLock(merchantId, 'orders', 'completed');
      await this.syncState.updateMerchantLastSync(merchantId);

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

      // Release lock with failure state in DB
      await this.syncState.releaseLock(merchantId, 'orders', 'failed', error.message);

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
}
