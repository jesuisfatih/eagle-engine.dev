import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { OrdersHandler } from './handlers/orders.handler';
import { CustomersHandler } from './handlers/customers.handler';
import { ShopifyWebhookSyncService } from './shopify-webhook-sync.service';
import { ShopifyModule } from '../shopify/shopify.module';

@Module({
  imports: [ShopifyModule],
  controllers: [WebhooksController],
  providers: [OrdersHandler, CustomersHandler, ShopifyWebhookSyncService],
})
export class WebhooksModule {}




