import { Controller, Get, Post, Body, Query, Param, UseGuards, BadRequestException } from '@nestjs/common';
import { AbandonedCartsService } from './abandoned-carts.service';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('abandoned-carts')
export class AbandonedCartsController {
  constructor(private abandonedCartsService: AbandonedCartsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAbandonedCarts(
    @CurrentUser('merchantId') merchantId: string,
    @Query('companyId') companyId?: string,
    @Query('includeRecent') includeRecent?: string | boolean,
  ) {
    if (!merchantId) {
      throw new BadRequestException('Merchant ID required');
    }
    
    // Convert string to boolean
    let includeRecentBool = false;
    if (includeRecent === 'true' || includeRecent === 'True' || includeRecent === 'TRUE' || includeRecent === true) {
      includeRecentBool = true;
    }
    
    return this.abandonedCartsService.getAbandonedCarts(merchantId, companyId, includeRecentBool);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-carts')
  async getMyAbandonedCarts(
    @CurrentUser('merchantId') merchantId: string,
    @CurrentUser('companyId') companyId: string,
  ) {
    if (!merchantId || !companyId) {
      throw new BadRequestException('Merchant ID and Company ID required');
    }
    return this.abandonedCartsService.getAbandonedCarts(merchantId, companyId);
  }

  // Public endpoints for snippet tracking
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
    });
    try {
      const result = await this.abandonedCartsService.trackCart(data);
      console.log('✅ Cart tracked successfully:', result.id);
      return result;
    } catch (error: any) {
      console.error('❌ Cart tracking failed:', error.message);
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

  @UseGuards(JwtAuthGuard)
  @Get('activity')
  async getAllCartActivity(
    @CurrentUser('merchantId') merchantId: string,
    @Query('limit') limit?: string,
  ) {
    if (!merchantId) {
      throw new BadRequestException('Merchant ID required');
    }
    return this.abandonedCartsService.getAllCartActivityLogs(merchantId, limit ? parseInt(limit) : 100);
  }
}

