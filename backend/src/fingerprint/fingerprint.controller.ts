import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
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
  @Public()
  @Throttle({ short: { limit: 30, ttl: 1000 }, medium: { limit: 100, ttl: 10000 } })
  async collect(@Body() dto: CollectFingerprintDto, @Req() req: any) {
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
    return this.fingerprintService.collectFingerprint(dto, ip);
  }

  /**
   * Track event — called by snippet (public, no auth)
   */
  @Post('event')
  @Public()
  @Throttle({ short: { limit: 50, ttl: 1000 }, medium: { limit: 200, ttl: 10000 } })
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

  /**
   * Heartbeat — real-time presence tracking from snippet
   */
  @Post('heartbeat')
  @Public()
  @SkipThrottle()
  async heartbeat(@Body() body: any) {
    if (!body.shop || !body.sessionId) {
      return { success: false };
    }

    const merchant = await this.prisma.merchant.findUnique({
      where: { shopDomain: body.shop },
    });
    if (!merchant) return { success: false };

    await this.fingerprintService.processHeartbeat(merchant.id, {
      sessionId: body.sessionId,
      fingerprintHash: body.fingerprintHash,
      eagleToken: body.eagleToken,
      status: body.status || 'online',
      timestamp: body.timestamp,
      page: body.page,
      viewport: body.viewport,
    });

    return { success: true };
  }

  /**
   * Mouse tracking data — Clarity-like session replay data
   */
  @Post('mouse')
  @Public()
  @SkipThrottle()
  async mouseTracking(@Body() body: any) {
    console.log(`[rrweb-ctrl] mouseTracking called. body keys: ${Object.keys(body || {}).join(',')}, shop: ${body?.shop}, sessionId: ${body?.sessionId}, eventsLen: ${body?.events?.length}, bodyType: ${typeof body}`);

    if (!body.shop || !body.sessionId || !body.events?.length) {
      console.log('[rrweb-ctrl] mouseTracking rejected — missing fields');
      return { success: false };
    }

    const merchant = await this.prisma.merchant.findUnique({
      where: { shopDomain: body.shop },
    });
    if (!merchant) {
      console.log(`[rrweb-ctrl] mouseTracking — merchant not found for shop: ${body.shop}`);
      return { success: false };
    }

    console.log(`[rrweb-ctrl] mouseTracking — calling processMouseData merchantId=${merchant.id} sessionId=${body.sessionId}`);

    await this.fingerprintService.processMouseData(merchant.id, {
      sessionId: body.sessionId,
      fingerprintHash: body.fingerprintHash,
      viewport: body.viewport,
      pageUrl: body.pageUrl,
      events: body.events,
    });

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

  /**
   * Get currently active visitors (real-time)
   */
  @Get('active-visitors')
  @UseGuards(JwtAuthGuard)
  async getActiveVisitors(@CurrentUser('merchantId') merchantId: string) {
    return this.fingerprintService.getActiveVisitors(merchantId);
  }

  /**
   * Get mouse replay data for a session
   */
  @Get('replay')
  @UseGuards(JwtAuthGuard)
  async getSessionReplay(
    @CurrentUser('merchantId') merchantId: string,
    @Query('sessionId') sessionId: string,
  ) {
    return this.fingerprintService.getSessionReplay(merchantId, sessionId);
  }
}
