import { Controller, Get, Param, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Get()
  async findAll(
    @CurrentUser('merchantId') merchantId: string,
    @Query('companyId') companyId?: string,
    @Query('status') status?: string,
  ) {
    if (!merchantId) {
      throw new BadRequestException('Merchant ID required');
    }
    return this.ordersService.findAll(merchantId, { companyId, status });
  }

  @Get('stats')
  async getStats(@CurrentUser('merchantId') merchantId: string) {
    if (!merchantId) {
      throw new BadRequestException('Merchant ID required');
    }
    return this.ordersService.getStats(merchantId);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser('merchantId') merchantId: string,
  ) {
    if (!merchantId) {
      throw new BadRequestException('Merchant ID required');
    }
    return this.ordersService.findOne(id, merchantId);
  }
}




