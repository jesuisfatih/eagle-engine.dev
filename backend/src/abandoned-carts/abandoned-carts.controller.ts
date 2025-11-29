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
  async getAbandonedCarts(
    @Query('companyId') companyId?: string,
    @Query('includeRecent') includeRecent?: string,
  ) {
    const merchantId = '6ecc682b-98ee-472d-977b-cffbbae081b8';
    return this.abandonedCartsService.getAbandonedCarts(merchantId, companyId, includeRecent === 'true');
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
    console.log('📦 Cart tracking received:', {
      cartToken: data.cartToken,
      itemCount: data.items?.length || 0,
      customerEmail: data.customerEmail,
      isAnonymous: !data.customerEmail,
      items: data.items?.map((i: any) => ({
        variantId: i.variant_id || i.variantId,
        productId: i.product_id || i.productId,
        price: i.price,
      })),
    });
    try {
      const result = await this.abandonedCartsService.trackCart(data);
      console.log('✅ Cart tracked successfully:', result.id);
      return result;
    } catch (error: any) {
      console.error('❌ Cart tracking failed:', {
        message: error.message,
        stack: error.stack,
        data: {
          cartToken: data.cartToken,
          itemCount: data.items?.length,
          firstItem: data.items?.[0],
        },
      });
      // Return proper error response
      return {
        statusCode: 500,
        message: error.message || 'Internal server error',
        error: 'Cart tracking failed',
      };
    }
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

