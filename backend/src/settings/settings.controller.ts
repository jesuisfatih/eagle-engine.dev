import { Controller, Get, Put, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private settingsService: SettingsService) {}

  @Get('merchant')
  async getMerchantSettings(@CurrentUser('merchantId') merchantId: string) {
    if (!merchantId) {
      throw new BadRequestException('Merchant ID required');
    }
    return this.settingsService.getMerchantSettings(merchantId);
  }

  @Put('merchant')
  async updateMerchantSettings(
    @CurrentUser('merchantId') merchantId: string,
    @Body() body: any,
  ) {
    if (!merchantId) {
      throw new BadRequestException('Merchant ID required');
    }
    return this.settingsService.updateMerchantSettings(merchantId, body);
  }

  @Put('snippet/toggle')
  async toggleSnippet(
    @CurrentUser('merchantId') merchantId: string,
    @Body('enabled') enabled: boolean,
  ) {
    if (!merchantId) {
      throw new BadRequestException('Merchant ID required');
    }
    return this.settingsService.toggleSnippet(merchantId, enabled);
  }

  @Get('company')
  async getCompanySettings(@CurrentUser('companyId') companyId: string) {
    if (!companyId) {
      throw new BadRequestException('Company ID required');
    }
    return this.settingsService.getCompanySettings(companyId);
  }

  @Put('company')
  async updateCompanySettings(
    @CurrentUser('companyId') companyId: string,
    @Body() body: any,
  ) {
    if (!companyId) {
      throw new BadRequestException('Company ID required');
    }
    return this.settingsService.updateCompanySettings(companyId, body);
  }

  @Get('sso')
  async getSsoSettings(@CurrentUser('merchantId') merchantId: string) {
    if (!merchantId) {
      throw new BadRequestException('Merchant ID required');
    }
    return this.settingsService.getSsoSettings(merchantId);
  }

  @Put('sso')
  async updateSsoSettings(
    @CurrentUser('merchantId') merchantId: string,
    @Body() body: { mode: string; multipassSecret?: string; storefrontToken?: string },
  ) {
    if (!merchantId) {
      throw new BadRequestException('Merchant ID required');
    }
    return this.settingsService.updateSsoSettings(merchantId, body);
  }
}

