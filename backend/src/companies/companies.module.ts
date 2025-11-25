import { Module } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { CompanyUsersService } from './company-users.service';
import { ShopifyModule } from '../shopify/shopify.module';

@Module({
  imports: [ShopifyModule],
  controllers: [CompaniesController],
  providers: [CompaniesService, CompanyUsersService],
  exports: [CompaniesService, CompanyUsersService],
})
export class CompaniesModule {}




