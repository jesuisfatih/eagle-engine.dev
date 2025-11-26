import { Module } from '@nestjs/common';
import { ShopifyGraphqlService } from './shopify-graphql.service';
import { ShopifyCustomerSyncService } from './shopify-customer-sync.service';
import { ShopifyPricingSyncService } from './shopify-pricing-sync.service';
import { ShopifySsoService } from './shopify-sso.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [
    ShopifyGraphqlService,
    ShopifyCustomerSyncService,
    ShopifyPricingSyncService,
    ShopifySsoService,
    PrismaService,
    ConfigService,
  ],
  exports: [
    ShopifyGraphqlService,
    ShopifyCustomerSyncService,
    ShopifyPricingSyncService,
    ShopifySsoService,
  ],
})
export class ShopifyModule {}
