import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ShopifyWebhookSyncService } from '../shopify-webhook-sync.service';

@Injectable()
export class OrdersHandler {
  private readonly logger = new Logger(OrdersHandler.name);

  constructor(
    private prisma: PrismaService,
    private webhookSync: ShopifyWebhookSyncService,
  ) {}

  async handleOrderCreate(orderData: any, headers: any) {
    try {
      const shop = headers['x-shopify-shop-domain'];
      
      const merchant = await this.prisma.merchant.findUnique({
        where: { shopDomain: shop },
      });

      if (!merchant) {
        this.logger.warn(`Merchant not found for shop: ${shop}`);
        return { success: false };
      }

      // Find company user by Shopify customer ID
      let companyId: string | undefined;
      let companyUserId: string | undefined;

      if (orderData.customer?.id) {
        const user = await this.prisma.companyUser.findFirst({
          where: { shopifyCustomerId: BigInt(orderData.customer.id) },
        });
        if (user) {
          companyUserId = user.id;
          companyId = user.companyId;
        }
      }

      // Create order record
      await this.prisma.orderLocal.create({
        data: {
          merchantId: merchant.id,
          shopifyOrderId: BigInt(orderData.id),
          shopifyOrderNumber: orderData.order_number?.toString(),
          shopifyCustomerId: orderData.customer?.id ? BigInt(orderData.customer.id) : null,
          companyId,
          companyUserId,
          email: orderData.email,
          subtotal: parseFloat(orderData.subtotal_price || '0'),
          totalDiscounts: parseFloat(orderData.total_discounts || '0'),
          totalTax: parseFloat(orderData.total_tax || '0'),
          totalPrice: parseFloat(orderData.total_price || '0'),
          currency: orderData.currency,
          financialStatus: orderData.financial_status,
          fulfillmentStatus: orderData.fulfillment_status,
          lineItems: orderData.line_items || [],
          shippingAddress: orderData.shipping_address,
          billingAddress: orderData.billing_address,
          discountCodes: orderData.discount_codes || [],
          rawData: orderData,
        },
      });

      this.logger.log(`Order created: ${orderData.order_number} for ${shop}`);
      
      // Sync cart status
      await this.webhookSync.handleOrderCreate(orderData, shop);
      
      return { success: true };
    } catch (error) {
      this.logger.error('Failed to handle order create', error);
      return { success: false, error: error.message };
    }
  }

  async handleOrderPaid(orderData: any, headers: any) {
    try {
      const shop = headers['x-shopify-shop-domain'];
      
      const merchant = await this.prisma.merchant.findUnique({
        where: { shopDomain: shop },
      });

      if (!merchant) {
        return { success: false };
      }

      // Update order status
      await this.prisma.orderLocal.updateMany({
        where: {
          merchantId: merchant.id,
          shopifyOrderId: BigInt(orderData.id),
        },
        data: {
          financialStatus: orderData.financial_status,
          rawData: orderData,
        },
      });

      this.logger.log(`Order paid: ${orderData.order_number}`);
      return { success: true };
    } catch (error) {
      this.logger.error('Failed to handle order paid', error);
      return { success: false };
    }
  }
}




