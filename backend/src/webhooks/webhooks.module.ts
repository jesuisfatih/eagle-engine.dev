import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { OrdersHandler } from './handlers/orders.handler';
import { CustomersHandler } from './handlers/customers.handler';

@Module({
  controllers: [WebhooksController],
  providers: [OrdersHandler, CustomersHandler],
})
export class WebhooksModule {}



