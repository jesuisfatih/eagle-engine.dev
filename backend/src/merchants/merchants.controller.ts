import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { MerchantsService } from './merchants.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('merchants')
export class MerchantsController {
  constructor(private merchantsService: MerchantsService) {}

  @Public()
  @Get('me')
  async getMe() {
    const merchantId = '6ecc682b-98ee-472d-977b-cffbbae081b8';
    return this.merchantsService.findById(merchantId);
  }

  @Public()
  @Get('stats')
  async getStats() {
    const merchantId = '6ecc682b-98ee-472d-977b-cffbbae081b8';
    return this.merchantsService.getStats(merchantId);
  }

  @Public()
  @Put('settings')
  async updateSettings(@Body() settings: any) {
    const merchantId = '6ecc682b-98ee-472d-977b-cffbbae081b8';
    return this.merchantsService.updateSettings(merchantId, settings);
  }

  @Public()
  @Put('snippet/toggle')
  async toggleSnippet(@Body('enabled') enabled: boolean) {
    const merchantId = '6ecc682b-98ee-472d-977b-cffbbae081b8';
    return this.merchantsService.toggleSnippet(merchantId, enabled);
  }
}




