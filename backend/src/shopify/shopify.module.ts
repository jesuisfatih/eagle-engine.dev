import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ShopifyGraphqlService } from './shopify-graphql.service';
import { ShopifyCustomerSyncService } from './shopify-customer-sync.service';
import { ShopifySsoService } from './shopify-sso.service';
import { ShopifyService } from './shopify.service';
import { ShopifyRestService } from './shopify-rest.service';
import { ShopifyAdminDiscountService } from './shopify-admin-discount.service';
import { ShopifyStorefrontService } from './shopify-storefront.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [
    ShopifyGraphqlService,
    ShopifyCustomerSyncService,
    ShopifySsoService,
    ShopifyService,
    ShopifyRestService,
    ShopifyAdminDiscountService,
    ShopifyStorefrontService,
    PrismaService,
  ],
  exports: [
    ShopifyGraphqlService,
    ShopifyCustomerSyncService,
    ShopifySsoService,
    ShopifyService,
    ShopifyRestService,
    ShopifyAdminDiscountService,
    ShopifyStorefrontService,
  ],
})
export class ShopifyModule {}
