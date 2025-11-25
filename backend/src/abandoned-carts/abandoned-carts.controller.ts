import { Controller, Get, Post, Body } from '@nestjs/common';
import { AbandonedCartsService } from './abandoned-carts.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('abandoned-carts')
@Public()
export class AbandonedCartsController {
  constructor(private abandonedCartsService: AbandonedCartsService) {}

  @Get()
  async getAbandonedCarts() {
    const merchantId = '6ecc682b-98ee-472d-977b-cffbbae081b8';
    return this.abandonedCartsService.getAbandonedCarts(merchantId);
  }

  @Post('sync')
  async syncCart(@Body() data: any) {
    return this.abandonedCartsService.syncShopifyCart(data);
  }
}

