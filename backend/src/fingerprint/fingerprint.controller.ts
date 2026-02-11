import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { CollectFingerprintDto } from './dto/collect-fingerprint.dto';
import { FingerprintService } from './fingerprint.service';

@Controller('fingerprint')
export class FingerprintController {
  constructor(
    private readonly fingerprintService: FingerprintService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Public endpoint — called by the storefront snippet
   */
  @Post('collect')
  @SkipThrottle()
  async collect(@Body() dto: CollectFingerprintDto, @Req() req: any) {
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
    return this.fingerprintService.collectFingerprint(dto, ip);
  }

  /**
   * Track event — called by snippet (public, no auth)
   */
  @Post('event')
  @SkipThrottle()
  async trackEvent(@Body() body: any) {
    if (!body.shop || !body.sessionId || !body.eventType) {
      return { success: false, error: 'Missing required fields' };
    }

    const merchant = await this.prisma.merchant.findUnique({
      where: { shopDomain: body.shop },
    });
    if (!merchant) return { success: false, error: 'Unknown shop' };

    await this.fingerprintService.trackEvent(
      merchant.id,
      body.sessionId,
      body.payload?.fingerprintHash || body.fingerprintHash || '',
      body.eventType,
      body.payload || {},
    );

    return { success: true };
  }

  // ─── Admin Endpoints ───

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  async getDashboard(@CurrentUser('merchantId') merchantId: string) {
    return this.fingerprintService.getDashboard(merchantId);
  }

  @Get('hot-leads')
  @UseGuards(JwtAuthGuard)
  async getHotLeads(@CurrentUser('merchantId') merchantId: string) {
    return this.fingerprintService.getHotLeads(merchantId);
  }

  @Get('company-intelligence')
  @UseGuards(JwtAuthGuard)
  async getCompanyIntelligence(
    @CurrentUser('merchantId') merchantId: string,
    @Query('companyId') companyId?: string,
  ) {
    return this.fingerprintService.getCompanyIntelligence(merchantId, companyId);
  }

  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  async getSessionHistory(
    @CurrentUser('merchantId') merchantId: string,
    @Query('companyId') companyId?: string,
    @Query('companyUserId') companyUserId?: string,
    @Query('fingerprintId') fingerprintId?: string,
    @Query('limit') limit?: string,
  ) {
    return this.fingerprintService.getSessionHistory(merchantId, {
      companyId,
      companyUserId,
      fingerprintId,
      limit: limit ? parseInt(limit) : undefined,
    });
  }
}
