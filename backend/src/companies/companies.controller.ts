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
import { Public } from '../auth/decorators/public.decorator';

@Controller('companies')
@Public()
export class CompaniesController {
  constructor(
    private companiesService: CompaniesService,
    private companyUsersService: CompanyUsersService,
  ) {}

  @Get()
  async findAll(
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    const merchantId = '6ecc682b-98ee-472d-977b-cffbbae081b8';
    return this.companiesService.findAll(merchantId, { status, search });
  }

  @Get('stats')
  async getStats() {
    const merchantId = '6ecc682b-98ee-472d-977b-cffbbae081b8';
    return this.companiesService.getStats(merchantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const merchantId = '6ecc682b-98ee-472d-977b-cffbbae081b8';
    return this.companiesService.findOne(id, merchantId);
  }

  @Post()
  async create(@Body() body: any) {
    const merchantId = '6ecc682b-98ee-472d-977b-cffbbae081b8';
    return this.companiesService.create(merchantId, body);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    const merchantId = '6ecc682b-98ee-472d-977b-cffbbae081b8';
    return this.companiesService.update(id, merchantId, body);
  }

  @Post(':id/approve')
  async approve(@Param('id') id: string) {
    const merchantId = '6ecc682b-98ee-472d-977b-cffbbae081b8';
    return this.companiesService.approve(id, merchantId);
  }

  @Post(':id/reject')
  async reject(@Param('id') id: string, @Body() body: { reason?: string }) {
    const merchantId = '6ecc682b-98ee-472d-977b-cffbbae081b8';
    return this.companiesService.reject(id, merchantId, body.reason);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const merchantId = '6ecc682b-98ee-472d-977b-cffbbae081b8';
    return this.companiesService.delete(id, merchantId);
  }

  // Company Users
  @Get(':id/users')
  async getCompanyUsers(@Param('id') companyId: string) {
    return this.companyUsersService.findByCompany(companyId);
  }

  @Post(':id/users')
  async inviteUser(@Param('id') companyId: string, @Body() body: any) {
    return this.companyUsersService.invite(companyId, body);
  }

  @Post('users/:userId/verify-email')
  async verifyUserEmail(@Param('userId') userId: string) {
    return this.companyUsersService.verifyEmail(userId);
  }
}




