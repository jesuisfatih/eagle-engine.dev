import { Controller, Get, Post, Param, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { ShopifyCustomersService } from './shopify-customers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('shopify-customers')
@UseGuards(JwtAuthGuard)
export class ShopifyCustomersController {
  constructor(private shopifyCustomersService: ShopifyCustomersService) {}

  @Get()
  async findAll(
    @CurrentUser('merchantId') merchantId: string,
    @Query('search') search?: string,
  ) {
    if (!merchantId) {
      throw new BadRequestException('Merchant ID required');
    }
    return this.shopifyCustomersService.findAll(merchantId, { search });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.shopifyCustomersService.findOne(id);
  }

  @Post(':id/convert-to-company')
  async convertToCompany(
    @Param('id') customerId: string,
    @CurrentUser('merchantId') merchantId: string,
  ) {
    if (!merchantId) {
      throw new BadRequestException('Merchant ID required');
    }
    return this.shopifyCustomersService.convertToCompany(customerId, merchantId);
  }
}




