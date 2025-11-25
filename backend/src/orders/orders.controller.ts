import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('orders')
@Public()
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Get()
  async findAll(
    @Query('companyId') companyId?: string,
    @Query('status') status?: string,
  ) {
    const merchantId = '6ecc682b-98ee-472d-977b-cffbbae081b8';
    return this.ordersService.findAll(merchantId, { companyId, status });
  }

  @Get('stats')
  async getStats() {
    const merchantId = '6ecc682b-98ee-472d-977b-cffbbae081b8';
    return this.ordersService.getStats(merchantId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const merchantId = '6ecc682b-98ee-472d-977b-cffbbae081b8';
    return this.ordersService.findOne(id, merchantId);
  }
}




