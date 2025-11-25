import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ShopifyService } from './shopify.service';
import { ShopifyRestService } from './shopify-rest.service';
import { ShopifyGraphqlService } from './shopify-graphql.service';

@Module({
  imports: [HttpModule],
  providers: [ShopifyService, ShopifyRestService, ShopifyGraphqlService],
  exports: [ShopifyService, ShopifyRestService, ShopifyGraphqlService],
})
export class ShopifyModule {}

