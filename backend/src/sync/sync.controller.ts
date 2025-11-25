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

  @Public()
  @Post('customers')
  async triggerCustomersSync(@Body('merchantId') merchantId?: string) {
    const id = merchantId || '6ecc682b-98ee-472d-977b-cffbbae081b8';
    return this.syncService.triggerCustomersSync(id);
  }

  @Public()
  @Post('products')
  async triggerProductsSync(@Body('merchantId') merchantId?: string) {
    const id = merchantId || '6ecc682b-98ee-472d-977b-cffbbae081b8';
    return this.syncService.triggerProductsSync(id);
  }

  @Public()
  @Post('orders')
  async triggerOrdersSync(@Body('merchantId') merchantId?: string) {
    const id = merchantId || '6ecc682b-98ee-472d-977b-cffbbae081b8';
    return this.syncService.triggerOrdersSync(id);
  }

  @Public()
  @Get('status')
  async getSyncStatus() {
    const merchantId = '6ecc682b-98ee-472d-977b-cffbbae081b8';
    return this.syncService.getSyncStatus(merchantId);
  }
}




