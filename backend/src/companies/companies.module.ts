import { Module } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { CompanyUsersService } from './company-users.service';

@Module({
  controllers: [CompaniesController],
  providers: [CompaniesService, CompanyUsersService],
  exports: [CompaniesService, CompanyUsersService],
})
export class CompaniesModule {}



