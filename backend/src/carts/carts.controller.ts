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
import { CartsService } from './carts.service';
import { CartItemsService } from './cart-items.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('carts')
@Public()
export class CartsController {
  constructor(
    private cartsService: CartsService,
    private cartItemsService: CartItemsService,
  ) {}

  @Get('active')
  async getActiveCart(
    @Query('companyId') companyId?: string,
    @Query('userId') userId?: string,
  ) {
    const cId = companyId || 'f0c2b2a5-4858-4d82-a542-5ce3bfe23a6d';
    const uId = userId || 'c67273cf-acea-41db-9ff5-8f6e3bbb5c38';
    return this.cartsService.findActiveCart(cId, uId);
  }

  @Get(':id')
  async getCart(@Param('id') id: string) {
    return this.cartsService.findById(id);
  }

  @Post()
  async createCart(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('merchantId') merchantId: string,
  ) {
    return this.cartsService.create(companyId, userId, merchantId);
  }

  @Post(':id/items')
  async addItem(
    @Param('id') cartId: string,
    @Body() body: { variantId: string; shopifyVariantId: string; quantity: number },
  ) {
    const item = await this.cartItemsService.addItem(
      cartId,
      body.variantId,
      BigInt(body.shopifyVariantId),
      body.quantity,
    );

    // Recalculate cart pricing
    await this.cartsService.recalculate(cartId);

    return item;
  }

  @Put(':id/items/:itemId')
  async updateItemQuantity(
    @Param('id') cartId: string,
    @Param('itemId') itemId: string,
    @Body('quantity') quantity: number,
  ) {
    const item = await this.cartItemsService.updateQuantity(itemId, quantity);

    // Recalculate cart pricing
    await this.cartsService.recalculate(cartId);

    return item;
  }

  @Delete(':id/items/:itemId')
  async removeItem(@Param('id') cartId: string, @Param('itemId') itemId: string) {
    await this.cartItemsService.removeItem(itemId);

    // Recalculate cart pricing
    return this.cartsService.recalculate(cartId);
  }

  @Post(':id/submit')
  async submitForApproval(@Param('id') cartId: string) {
    return this.cartsService.submitForApproval(cartId);
  }

  @Post(':id/approve')
  async approve(@Param('id') cartId: string, @CurrentUser('userId') userId: string) {
    return this.cartsService.approve(cartId, userId);
  }

  @Post(':id/reject')
  async reject(@Param('id') cartId: string) {
    return this.cartsService.reject(cartId);
  }

  @Get('company/list')
  async listCompanyCarts(
    @CurrentUser('companyId') companyId: string,
    @Query('status') status?: string,
  ) {
    return this.cartsService.listCompanyCarts(companyId, status);
  }
}




