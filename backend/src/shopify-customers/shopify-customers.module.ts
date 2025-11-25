import { Module } from '@nestjs/common';
import { ShopifyCustomersService } from './shopify-customers.service';
import { ShopifyCustomersController } from './shopify-customers.controller';

@Module({
  controllers: [ShopifyCustomersController],
  providers: [ShopifyCustomersService],
  exports: [ShopifyCustomersService],
})
export class ShopifyCustomersModule {}



