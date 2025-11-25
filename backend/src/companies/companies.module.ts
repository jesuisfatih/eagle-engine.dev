import { Module } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { CompanyUsersService } from './company-users.service';
import { ShopifyCompanySyncService } from './shopify-company-sync.service';
import { ShopifyModule } from '../shopify/shopify.module';

@Module({
  imports: [ShopifyModule],
  controllers: [CompaniesController],
  providers: [CompaniesService, CompanyUsersService, ShopifyCompanySyncService],
  exports: [CompaniesService, CompanyUsersService],
})
export class CompaniesModule {}




