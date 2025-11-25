import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';

@Controller('checkout')
@Public()
export class CheckoutController {
  constructor(private checkoutService: CheckoutService) {}

  @Post('create')
  async createCheckout(@Body('cartId') cartId: string) {
    return this.checkoutService.createCheckout(cartId);
  }
}




