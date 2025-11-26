import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ShopifyGraphqlService } from './shopify-graphql.service';
import { ShopifyCustomerSyncService } from './shopify-customer-sync.service';
import { ShopifySsoService } from './shopify-sso.service';
import { ShopifyService } from './shopify.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [
    ShopifyGraphqlService,
    ShopifyCustomerSyncService,
    ShopifySsoService,
    ShopifyService,
    PrismaService,
  ],
  exports: [
    ShopifyGraphqlService,
    ShopifyCustomerSyncService,
    ShopifySsoService,
    ShopifyService,
  ],
})
export class ShopifyModule {}
