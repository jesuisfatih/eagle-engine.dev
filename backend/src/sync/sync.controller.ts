import { Controller, Post, Get, Param, UseGuards, Body, BadRequestException } from '@nestjs/common';
import { SyncService } from './sync.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('sync')
@UseGuards(JwtAuthGuard)
export class SyncController {
  constructor(private syncService: SyncService) {}

  @Post('initial')
  async triggerInitialSync(@CurrentUser('merchantId') merchantId: string) {
    if (!merchantId) {
      throw new BadRequestException('Merchant ID required');
    }
    return this.syncService.triggerInitialSync(merchantId);
  }

  @Post('customers')
  async triggerCustomersSync(@CurrentUser('merchantId') merchantId: string) {
    if (!merchantId) {
      throw new BadRequestException('Merchant ID required');
    }
    return this.syncService.triggerCustomersSync(merchantId);
  }

  @Post('products')
  async triggerProductsSync(@CurrentUser('merchantId') merchantId: string) {
    if (!merchantId) {
      throw new BadRequestException('Merchant ID required');
    }
    return this.syncService.triggerProductsSync(merchantId);
  }

  @Post('orders')
  async triggerOrdersSync(@CurrentUser('merchantId') merchantId: string) {
    if (!merchantId) {
      throw new BadRequestException('Merchant ID required');
    }
    return this.syncService.triggerOrdersSync(merchantId);
  }

  @Get('status')
  async getSyncStatus(@CurrentUser('merchantId') merchantId: string) {
    if (!merchantId) {
      throw new BadRequestException('Merchant ID required');
    }
    return this.syncService.getSyncStatus(merchantId);
  }
}




