import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompanyUsersService } from './company-users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('companies')
@UseGuards(JwtAuthGuard)
export class CompaniesController {
  constructor(
    private companiesService: CompaniesService,
    private companyUsersService: CompanyUsersService,
  ) {}

  @Get()
  async findAll(
    @CurrentUser('merchantId') merchantId: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.companiesService.findAll(merchantId, { status, search });
  }

  @Get('stats')
  async getStats(@CurrentUser('merchantId') merchantId: string) {
    return this.companiesService.getStats(merchantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser('merchantId') merchantId: string) {
    return this.companiesService.findOne(id, merchantId);
  }

  @Post()
  async create(@CurrentUser('merchantId') merchantId: string, @Body() body: any) {
    return this.companiesService.create(merchantId, body);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @CurrentUser('merchantId') merchantId: string,
    @Body() body: any,
  ) {
    return this.companiesService.update(id, merchantId, body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser('merchantId') merchantId: string) {
    return this.companiesService.delete(id, merchantId);
  }

  // Company Users
  @Get(':id/users')
  async getCompanyUsers(
    @Param('id') companyId: string,
    @CurrentUser('merchantId') merchantId: string,
  ) {
    return this.companyUsersService.findByCompany(companyId);
  }

  @Post(':id/users')
  async inviteUser(
    @Param('id') companyId: string,
    @CurrentUser('merchantId') merchantId: string,
    @Body() body: any,
  ) {
    return this.companyUsersService.invite(companyId, body);
  }
}




