import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('settings')
@Public()
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get('merchant')
  async getMerchantSettings(@CurrentUser('merchantId') merchantId: string) {
    return this.settingsService.getMerchantSettings(merchantId);
  }

  @Put('merchant')
  async updateMerchantSettings(
    @CurrentUser('merchantId') merchantId: string,
    @Body() body: any,
  ) {
    return this.settingsService.updateMerchantSettings(merchantId, body);
  }

  @Put('snippet/toggle')
  async toggleSnippet(
    @CurrentUser('merchantId') merchantId: string,
    @Body('enabled') enabled: boolean,
  ) {
    return this.settingsService.toggleSnippet(merchantId, enabled);
  }

  @Get('company')
  async getCompanySettings(@CurrentUser('companyId') companyId: string) {
    return this.settingsService.getCompanySettings(companyId);
  }

  @Put('company')
  async updateCompanySettings(
    @CurrentUser('companyId') companyId: string,
    @Body() body: any,
  ) {
    return this.settingsService.updateCompanySettings(companyId, body);
  }

  @Get('sso')
  async getSsoSettings() {
    // Default merchant for now
    const merchantId = '6ecc682b-98ee-472d-977b-cffbbae081b8';
    return this.settingsService.getSsoSettings(merchantId);
  }

  @Put('sso')
  async updateSsoSettings(@Body() body: { mode: string; multipassSecret?: string; storefrontToken?: string }) {
    const merchantId = '6ecc682b-98ee-472d-977b-cffbbae081b8';
    return this.settingsService.updateSsoSettings(merchantId, body);
  }
}

