import { Module } from '@nestjs/common';
import { ShopifyGraphqlService } from './shopify-graphql.service';
import { ShopifyCustomerSyncService } from './shopify-customer-sync.service';
import { ShopifySsoService } from './shopify-sso.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [
    ShopifyGraphqlService,
    ShopifyCustomerSyncService,
    ShopifySsoService,
    PrismaService,
    ConfigService,
  ],
  exports: [
    ShopifyGraphqlService,
    ShopifyCustomerSyncService,
    ShopifySsoService,
  ],
})
export class ShopifyModule {}
