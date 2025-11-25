import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { ShopifyCustomersService } from './shopify-customers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('shopify-customers')
@Public()
export class ShopifyCustomersController {
  constructor(private shopifyCustomersService: ShopifyCustomersService) {}

  @Get()
  async findAll(@Query('search') search?: string) {
    const merchantId = '6ecc682b-98ee-472d-977b-cffbbae081b8';
    return this.shopifyCustomersService.findAll(merchantId, { search });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.shopifyCustomersService.findOne(id);
  }

  @Post(':id/convert-to-company')
  async convertToCompany(@Param('id') customerId: string) {
    const merchantId = '6ecc682b-98ee-472d-977b-cffbbae081b8';
    return this.shopifyCustomersService.convertToCompany(customerId, merchantId);
  }
}




