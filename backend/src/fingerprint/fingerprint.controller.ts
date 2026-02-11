import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CollectFingerprintDto } from './dto/collect-fingerprint.dto';
import { FingerprintService } from './fingerprint.service';

@Controller('fingerprint')
export class FingerprintController {
  constructor(private readonly fingerprintService: FingerprintService) {}

  /**
   * PUBLIC endpoint — called by the Shopify snippet to collect fingerprint data.
   * No auth required (snippet runs on Shopify storefront).
   */
  @Public()
  @SkipThrottle()
  @Post('collect')
  async collectFingerprint(@Body() dto: CollectFingerprintDto, @Req() req: any) {
    const ipAddress =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.headers['x-real-ip'] ||
      req.connection?.remoteAddress;

    return this.fingerprintService.collectFingerprint(dto, ipAddress);
  }

  /**
   * ADMIN endpoint — fingerprint intelligence dashboard
   */
  @UseGuards(JwtAuthGuard)
  @Get('dashboard')
  async getDashboard(@CurrentUser('merchantId') merchantId: string) {
    return this.fingerprintService.getDashboard(merchantId);
  }

  /**
   * ADMIN endpoint — hot leads (high intent, no order yet)
   */
  @UseGuards(JwtAuthGuard)
  @Get('hot-leads')
  async getHotLeads(@CurrentUser('merchantId') merchantId: string) {
    return this.fingerprintService.getHotLeads(merchantId);
  }
}
