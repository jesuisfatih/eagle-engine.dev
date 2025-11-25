import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { MerchantsService } from './merchants.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('merchants')
@UseGuards(JwtAuthGuard)
export class MerchantsController {
  constructor(private merchantsService: MerchantsService) {}

  @Get('me')
  async getMe(@CurrentUser('merchantId') merchantId: string) {
    return this.merchantsService.findById(merchantId);
  }

  @Get('stats')
  async getStats(@CurrentUser('merchantId') merchantId: string) {
    return this.merchantsService.getStats(merchantId);
  }

  @Put('settings')
  async updateSettings(
    @CurrentUser('merchantId') merchantId: string,
    @Body() settings: any,
  ) {
    return this.merchantsService.updateSettings(merchantId, settings);
  }

  @Put('snippet/toggle')
  async toggleSnippet(
    @CurrentUser('merchantId') merchantId: string,
    @Body('enabled') enabled: boolean,
  ) {
    return this.merchantsService.toggleSnippet(merchantId, enabled);
  }
}



