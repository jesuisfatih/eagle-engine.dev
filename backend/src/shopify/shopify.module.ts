import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ShopifyService } from './shopify.service';
import { ShopifyRestService } from './shopify-rest.service';
import { ShopifyGraphqlService } from './shopify-graphql.service';
import { ShopifyAdminDiscountService } from './shopify-admin-discount.service';
import { ShopifyStorefrontService } from './shopify-storefront.service';
import { ShopifyCustomerSyncService } from './shopify-customer-sync.service';

@Module({
  imports: [HttpModule],
  providers: [
    ShopifyService,
    ShopifyRestService,
    ShopifyGraphqlService,
    ShopifyAdminDiscountService,
    ShopifyStorefrontService,
    ShopifyCustomerSyncService,
  ],
  exports: [
    ShopifyService,
    ShopifyRestService,
    ShopifyGraphqlService,
    ShopifyAdminDiscountService,
    ShopifyStorefrontService,
    ShopifyCustomerSyncService,
  ],
})
export class ShopifyModule {}

