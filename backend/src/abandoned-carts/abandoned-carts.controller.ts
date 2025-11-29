import { Controller, Get, Post, Body, Query, Param, UseGuards } from '@nestjs/common';
import { AbandonedCartsService } from './abandoned-carts.service';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('abandoned-carts')
export class AbandonedCartsController {
  constructor(private abandonedCartsService: AbandonedCartsService) {}

  @Public()
  @Get()
  async getAbandonedCarts(@Query('companyId') companyId?: string) {
    const merchantId = '6ecc682b-98ee-472d-977b-cffbbae081b8';
    return this.abandonedCartsService.getAbandonedCarts(merchantId, companyId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-carts')
  async getMyAbandonedCarts(@CurrentUser('companyId') companyId: string) {
    const merchantId = '6ecc682b-98ee-472d-977b-cffbbae081b8';
    return this.abandonedCartsService.getAbandonedCarts(merchantId, companyId);
  }

  @Public()
  @Post('sync')
  async syncCart(@Body() data: any) {
    return this.abandonedCartsService.syncShopifyCart(data);
  }

  @Public()
  @Post('track')
  async trackCart(@Body() data: any) {
    return this.abandonedCartsService.trackCart(data);
  }

  @Public()
  @Get('activity/:cartId')
  async getCartActivity(@Param('cartId') cartId: string) {
    return this.abandonedCartsService.getCartActivityLogs(cartId);
  }

  @Public()
  @Get('activity')
  async getAllCartActivity(@Query('limit') limit?: string) {
    const merchantId = '6ecc682b-98ee-472d-977b-cffbbae081b8';
    return this.abandonedCartsService.getAllCartActivityLogs(merchantId, limit ? parseInt(limit) : 100);
  }
}

