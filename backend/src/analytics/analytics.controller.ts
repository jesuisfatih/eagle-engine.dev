import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('analytics')
@Public()
export class AnalyticsController {
  constructor(private analyticsService: AnalyticsService) {}

  @Get('dashboard')
  async getDashboard() {
    const merchantId = '6ecc682b-98ee-472d-977b-cffbbae081b8';
    return this.analyticsService.getDashboardStats(merchantId);
  }

  @Get('funnel')
  async getFunnel() {
    const merchantId = '6ecc682b-98ee-472d-977b-cffbbae081b8';
    return this.analyticsService.getConversionFunnel(merchantId);
  }

  @Get('top-products')
  async getTopProducts(@Query('limit') limit?: string) {
    const merchantId = '6ecc682b-98ee-472d-977b-cffbbae081b8';
    return this.analyticsService.getTopProducts(merchantId, limit ? parseInt(limit) : 10);
  }

  @Get('top-companies')
  async getTopCompanies(@Query('limit') limit?: string) {
    const merchantId = '6ecc682b-98ee-472d-977b-cffbbae081b8';
    return this.analyticsService.getTopCompanies(merchantId, limit ? parseInt(limit) : 10);
  }
}

