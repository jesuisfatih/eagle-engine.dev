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
  BadRequestException,
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
    if (!merchantId) {
      throw new BadRequestException('Merchant ID required');
    }
    return this.companiesService.findAll(merchantId, { status, search });
  }

  @Get('stats')
  async getStats(@CurrentUser('merchantId') merchantId: string) {
    if (!merchantId) {
      throw new BadRequestException('Merchant ID required');
    }
    return this.companiesService.getStats(merchantId);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser('merchantId') merchantId: string,
  ) {
    if (!merchantId) {
      throw new BadRequestException('Merchant ID required');
    }
    return this.companiesService.findOne(id, merchantId);
  }

  @Post()
  async create(
    @CurrentUser('merchantId') merchantId: string,
    @Body() body: any,
  ) {
    if (!merchantId) {
      throw new BadRequestException('Merchant ID required');
    }
    return this.companiesService.create(merchantId, body);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @CurrentUser('merchantId') merchantId: string,
    @Body() body: any,
  ) {
    if (!merchantId) {
      throw new BadRequestException('Merchant ID required');
    }
    return this.companiesService.update(id, merchantId, body);
  }

  @Post(':id/approve')
  async approve(
    @Param('id') id: string,
    @CurrentUser('merchantId') merchantId: string,
  ) {
    if (!merchantId) {
      throw new BadRequestException('Merchant ID required');
    }
    return this.companiesService.approve(id, merchantId);
  }

  @Post(':id/reject')
  async reject(
    @Param('id') id: string,
    @CurrentUser('merchantId') merchantId: string,
    @Body() body: { reason?: string },
  ) {
    if (!merchantId) {
      throw new BadRequestException('Merchant ID required');
    }
    return this.companiesService.reject(id, merchantId, body.reason);
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @CurrentUser('merchantId') merchantId: string,
  ) {
    if (!merchantId) {
      throw new BadRequestException('Merchant ID required');
    }
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




