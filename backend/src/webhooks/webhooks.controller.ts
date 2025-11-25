import { Controller, Post, Body, Headers, HttpCode } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { OrdersHandler } from './handlers/orders.handler';
import { CustomersHandler } from './handlers/customers.handler';

@Controller('webhooks')
export class WebhooksController {
  constructor(
    private ordersHandler: OrdersHandler,
    private customersHandler: CustomersHandler,
  ) {}

  @Public()
  @Post('orders/create')
  @HttpCode(200)
  async orderCreate(@Body() body: any, @Headers() headers: any) {
    return this.ordersHandler.handleOrderCreate(body, headers);
  }

  @Public()
  @Post('orders/paid')
  @HttpCode(200)
  async orderPaid(@Body() body: any, @Headers() headers: any) {
    return this.ordersHandler.handleOrderPaid(body, headers);
  }

  @Public()
  @Post('customers/create')
  @HttpCode(200)
  async customerCreate(@Body() body: any, @Headers() headers: any) {
    return this.customersHandler.handleCustomerCreate(body, headers);
  }
}

