import { Controller, Post, Get, Param, UseGuards, Body } from '@nestjs/common';
import { SyncService } from './sync.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('sync')
export class SyncController {
  constructor(private syncService: SyncService) {}

  @Public()
  @Post('initial')
  async triggerInitialSync(@Body('merchantId') merchantId: string) {
    return this.syncService.triggerInitialSync(merchantId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('initial-auth')
  async triggerInitialSyncAuth(@CurrentUser('merchantId') merchantId: string) {
    return this.syncService.triggerInitialSync(merchantId);
  }

  @Post('customers')
  async triggerCustomersSync(@CurrentUser('merchantId') merchantId: string) {
    return this.syncService.triggerCustomersSync(merchantId);
  }

  @Post('products')
  async triggerProductsSync(@CurrentUser('merchantId') merchantId: string) {
    return this.syncService.triggerProductsSync(merchantId);
  }

  @Post('orders')
  async triggerOrdersSync(@CurrentUser('merchantId') merchantId: string) {
    return this.syncService.triggerOrdersSync(merchantId);
  }

  @Get('status')
  async getSyncStatus(@CurrentUser('merchantId') merchantId: string) {
    return this.syncService.getSyncStatus(merchantId);
  }
}




