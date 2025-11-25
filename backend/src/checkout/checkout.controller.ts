import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('checkout')
@UseGuards(JwtAuthGuard)
export class CheckoutController {
  constructor(private checkoutService: CheckoutService) {}

  @Post('create')
  async createCheckout(@Body('cartId') cartId: string) {
    return this.checkoutService.createCheckout(cartId);
  }
}




