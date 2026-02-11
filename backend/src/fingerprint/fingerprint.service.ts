import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CollectFingerprintDto } from './dto/collect-fingerprint.dto';

@Injectable()
export class FingerprintService {
  private readonly logger = new Logger(FingerprintService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Collect and resolve a browser fingerprint.
   * This is the core identity resolution engine:
   * 1. Upsert fingerprint record
   * 2. Resolve identity (link to Shopify customer / Eagle user)
   * 3. Update behavioral profile
   */
  async collectFingerprint(dto: CollectFingerprintDto, ipAddress?: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { shopDomain: dto.shop },
    });

    if (!merchant) {
      this.logger.warn(`Unknown shop: ${dto.shop}`);
      return { success: false, error: 'Unknown shop' };
    }

    const merchantId = merchant.id;

    // === 1. Bot Detection ===
    const botScore = this.calculateBotScore(dto);
    const isBot = botScore > 0.7;

    if (isBot) {
      this.logger.debug(`Bot detected: ${dto.fingerprintHash} (score: ${botScore})`);
      // Still store but flag as bot
    }

    // === 2. Upsert Fingerprint ===
    const fingerprint = await this.prisma.visitorFingerprint.upsert({
      where: {
        merchantId_fingerprintHash: {
          merchantId,
          fingerprintHash: dto.fingerprintHash,
        },
      },
      create: {
        merchantId,
        fingerprintHash: dto.fingerprintHash,
        canvasHash: dto.canvasHash,
        webglHash: dto.webglHash,
        audioHash: dto.audioHash,
        userAgent: dto.userAgent,
        platform: dto.platform,
        language: dto.language,
        languages: dto.languages,
        timezone: dto.timezone,
        timezoneOffset: dto.timezoneOffset,
        screenWidth: dto.screenWidth,
        screenHeight: dto.screenHeight,
        colorDepth: dto.colorDepth,
        pixelRatio: dto.pixelRatio,
        touchSupport: dto.touchSupport,
        hardwareConcurrency: dto.hardwareConcurrency,
        deviceMemory: dto.deviceMemory,
        maxTouchPoints: dto.maxTouchPoints,
        gpuVendor: dto.gpuVendor,
        gpuRenderer: dto.gpuRenderer,
        cookiesEnabled: dto.cookiesEnabled,
        doNotTrack: dto.doNotTrack,
        adBlockDetected: dto.adBlockDetected,
        pluginCount: dto.pluginCount,
        fontCount: dto.fontCount,
        connectionType: dto.connectionType,
        ipAddress,
        isBot,
        botScore,
        signalCount: dto.signalCount || 0,
        confidence: this.calculateConfidence(dto),
      },
      update: {
        lastSeenAt: new Date(),
        visitCount: { increment: 1 },
        ipAddress,
        // Update signals if more detailed data is available
        ...(dto.gpuVendor && { gpuVendor: dto.gpuVendor }),
        ...(dto.gpuRenderer && { gpuRenderer: dto.gpuRenderer }),
        ...(dto.connectionType && { connectionType: dto.connectionType }),
        ...(dto.signalCount && { signalCount: dto.signalCount }),
      },
    });

    // === 3. Identity Resolution ===
    await this.resolveIdentity(merchantId, fingerprint.id, dto, ipAddress);

    return {
      success: true,
      fingerprintId: fingerprint.id,
      isReturning: fingerprint.visitCount > 1,
      visitCount: fingerprint.visitCount,
      isBot,
    };
  }

  /**
   * Identity Resolution Engine
   * Tries multiple strategies to link a fingerprint to a known customer:
   * 1. Direct login (Eagle token)
   * 2. Shopify customer ID
   * 3. Email match
   * 4. Fingerprint match (returning visitor)
   */
  private async resolveIdentity(
    merchantId: string,
    fingerprintId: string,
    dto: CollectFingerprintDto,
    ipAddress?: string,
  ) {
    const matchType = this.determineMatchType(dto);
    const matchConfidence = this.calculateMatchConfidence(matchType, dto);

    // Find linked company user by various signals
    let companyUserId: string | null = null;
    let companyId: string | null = null;
    let shopifyCustomerIdBigInt: bigint | null = null;

    // Strategy 1: Eagle Token → CompanyUser
    if (dto.eagleToken) {
      // Eagle token contains user info - look up the session
      const existingIdentity = await this.prisma.visitorIdentity.findFirst({
        where: { merchantId, eagleToken: dto.eagleToken },
        select: { companyUserId: true, companyId: true },
      });
      if (existingIdentity) {
        companyUserId = existingIdentity.companyUserId;
        companyId = existingIdentity.companyId;
      }
    }

    // Strategy 2: Email → CompanyUser
    if (!companyUserId && dto.email) {
      const user = await this.prisma.companyUser.findUnique({
        where: { email: dto.email },
        select: { id: true, companyId: true, shopifyCustomerId: true },
      });
      if (user) {
        companyUserId = user.id;
        companyId = user.companyId;
        shopifyCustomerIdBigInt = user.shopifyCustomerId;
      }
    }

    // Strategy 3: Shopify Customer ID
    if (dto.shopifyCustomerId) {
      try {
        shopifyCustomerIdBigInt = BigInt(dto.shopifyCustomerId);
        if (!companyUserId) {
          const user = await this.prisma.companyUser.findFirst({
            where: { shopifyCustomerId: shopifyCustomerIdBigInt, company: { merchantId } },
            select: { id: true, companyId: true },
          });
          if (user) {
            companyUserId = user.id;
            companyId = user.companyId;
          }
        }
      } catch {
        // Invalid shopifyCustomerId
      }
    }

    // Strategy 4: Check if this fingerprint was previously linked
    if (!companyUserId) {
      const previousIdentity = await this.prisma.visitorIdentity.findFirst({
        where: {
          fingerprintId,
          companyUserId: { not: null },
        },
        orderBy: { matchConfidence: 'desc' },
        select: { companyUserId: true, companyId: true, shopifyCustomerId: true, email: true },
      });
      if (previousIdentity) {
        companyUserId = previousIdentity.companyUserId;
        companyId = previousIdentity.companyId;
        shopifyCustomerIdBigInt = previousIdentity.shopifyCustomerId;
      }
    }

    // Upsert identity record
    await this.prisma.visitorIdentity.upsert({
      where: {
        merchantId_fingerprintId_matchType: {
          merchantId,
          fingerprintId,
          matchType,
        },
      },
      create: {
        merchantId,
        fingerprintId,
        shopifyCustomerId: shopifyCustomerIdBigInt,
        companyUserId,
        companyId,
        email: dto.email,
        sessionId: dto.sessionId,
        eagleToken: dto.eagleToken,
        matchType,
        matchConfidence,
        buyerIntent: 'cold',
      },
      update: {
        ...(companyUserId && { companyUserId }),
        ...(companyId && { companyId }),
        ...(shopifyCustomerIdBigInt && { shopifyCustomerId: shopifyCustomerIdBigInt }),
        ...(dto.email && { email: dto.email }),
        ...(dto.sessionId && { sessionId: dto.sessionId }),
        matchConfidence: Math.max(matchConfidence),
      },
    });
  }

  /**
   * Update behavioral profile after an event (called from events queue processor)
   */
  async updateBehavior(
    merchantId: string,
    fingerprintHash: string,
    eventType: string,
    payload?: any,
  ) {
    const fingerprint = await this.prisma.visitorFingerprint.findUnique({
      where: { merchantId_fingerprintHash: { merchantId, fingerprintHash } },
    });

    if (!fingerprint) return;

    const updateData: any = {};
    switch (eventType) {
      case 'page_view':
        updateData.totalPageViews = { increment: 1 };
        if (payload?.url) updateData.lastPageUrl = payload.url;
        break;
      case 'product_view':
        updateData.totalProductViews = { increment: 1 };
        if (payload?.productId) updateData.lastProductViewed = payload.productId;
        break;
      case 'add_to_cart':
        updateData.totalAddToCarts = { increment: 1 };
        break;
    }

    if (Object.keys(updateData).length > 0) {
      await this.prisma.visitorIdentity.updateMany({
        where: { fingerprintId: fingerprint.id },
        data: updateData,
      });

      // Recalculate engagement score
      await this.recalculateEngagement(fingerprint.id);
    }
  }

  /**
   * Recalculate engagement score and buyer intent
   */
  private async recalculateEngagement(fingerprintId: string) {
    const identities = await this.prisma.visitorIdentity.findMany({
      where: { fingerprintId },
    });

    for (const identity of identities) {
      // Engagement Score Formula:
      // pageViews * 1 + productViews * 3 + addToCarts * 10 + orders * 25
      const score = Math.min(100,
        identity.totalPageViews * 1 +
        identity.totalProductViews * 3 +
        identity.totalAddToCarts * 10 +
        identity.totalOrders * 25
      );

      // Buyer Intent Classification
      let buyerIntent = 'cold';
      if (identity.totalOrders > 0) buyerIntent = 'converting';
      else if (identity.totalAddToCarts > 0) buyerIntent = 'hot';
      else if (identity.totalProductViews >= 3) buyerIntent = 'warm';

      // Segment Assignment
      let segment = 'new_visitor';
      if (identity.totalOrders > 5) segment = 'VIP';
      else if (identity.totalOrders > 0) segment = 'customer';
      else if (identity.totalAddToCarts > 0) segment = 'abandoned_cart';
      else if (identity.totalProductViews > 0) segment = 'browser';

      await this.prisma.visitorIdentity.update({
        where: { id: identity.id },
        data: { engagementScore: score, buyerIntent, segment },
      });
    }
  }

  // ============================
  // Admin API Methods
  // ============================

  /**
   * Get fingerprint intelligence dashboard data
   */
  async getDashboard(merchantId: string) {
    const [
      totalVisitors,
      returningVisitors,
      identifiedVisitors,
      botCount,
      intentDistribution,
      segmentDistribution,
      recentVisitors,
      topEngaged,
    ] = await Promise.all([
      this.prisma.visitorFingerprint.count({ where: { merchantId } }),
      this.prisma.visitorFingerprint.count({ where: { merchantId, visitCount: { gt: 1 } } }),
      this.prisma.visitorIdentity.count({ where: { merchantId, companyUserId: { not: null } } }),
      this.prisma.visitorFingerprint.count({ where: { merchantId, isBot: true } }),

      // Intent distribution
      this.prisma.visitorIdentity.groupBy({
        by: ['buyerIntent'],
        where: { merchantId },
        _count: { id: true },
      }),

      // Segment distribution
      this.prisma.visitorIdentity.groupBy({
        by: ['segment'],
        where: { merchantId, segment: { not: null } },
        _count: { id: true },
      }),

      // Recent visitors
      this.prisma.visitorFingerprint.findMany({
        where: { merchantId, isBot: false },
        include: {
          identities: {
            include: {
              companyUser: { select: { email: true, firstName: true, lastName: true } },
              company: { select: { name: true } },
            },
            take: 1,
            orderBy: { matchConfidence: 'desc' },
          },
        },
        orderBy: { lastSeenAt: 'desc' },
        take: 20,
      }),

      // Top engaged
      this.prisma.visitorIdentity.findMany({
        where: { merchantId, engagementScore: { gt: 0 } },
        include: {
          fingerprint: { select: { platform: true, lastSeenAt: true, visitCount: true } },
          companyUser: { select: { email: true, firstName: true, lastName: true } },
          company: { select: { name: true } },
        },
        orderBy: { engagementScore: 'desc' },
        take: 20,
      }),
    ]);

    const identificationRate = totalVisitors > 0
      ? ((identifiedVisitors / totalVisitors) * 100).toFixed(1)
      : 0;

    return {
      stats: {
        totalVisitors,
        returningVisitors,
        identifiedVisitors,
        botCount,
        identificationRate,
      },
      intentDistribution: intentDistribution.map(d => ({
        intent: d.buyerIntent,
        count: d._count.id,
      })),
      segmentDistribution: segmentDistribution.map(d => ({
        segment: d.segment,
        count: d._count.id,
      })),
      recentVisitors: recentVisitors.map(v => ({
        id: v.id,
        fingerprintHash: v.fingerprintHash.substring(0, 12) + '...',
        platform: v.platform,
        visitCount: v.visitCount,
        lastSeenAt: v.lastSeenAt,
        firstSeenAt: v.firstSeenAt,
        isIdentified: v.identities.length > 0 && v.identities[0].companyUserId !== null,
        identity: v.identities[0] ? {
          email: v.identities[0].companyUser?.email,
          name: v.identities[0].companyUser
            ? `${v.identities[0].companyUser.firstName || ''} ${v.identities[0].companyUser.lastName || ''}`.trim()
            : null,
          company: v.identities[0].company?.name,
          buyerIntent: v.identities[0].buyerIntent,
          engagementScore: v.identities[0].engagementScore,
        } : null,
      })),
      topEngaged: topEngaged.map(e => ({
        id: e.id,
        email: e.companyUser?.email || e.email,
        name: e.companyUser
          ? `${e.companyUser.firstName || ''} ${e.companyUser.lastName || ''}`.trim()
          : null,
        company: e.company?.name,
        buyerIntent: e.buyerIntent,
        segment: e.segment,
        engagementScore: e.engagementScore,
        totalPageViews: e.totalPageViews,
        totalProductViews: e.totalProductViews,
        totalAddToCarts: e.totalAddToCarts,
        totalOrders: e.totalOrders,
        totalRevenue: Number(e.totalRevenue),
        platform: e.fingerprint?.platform,
        visitCount: e.fingerprint?.visitCount,
        lastSeenAt: e.fingerprint?.lastSeenAt,
      })),
    };
  }

  /**
   * Get hot leads (visitors with high intent but no orders yet)
   */
  async getHotLeads(merchantId: string) {
    const leads = await this.prisma.visitorIdentity.findMany({
      where: {
        merchantId,
        buyerIntent: { in: ['hot', 'warm'] },
        totalOrders: 0,
      },
      include: {
        fingerprint: {
          select: { platform: true, lastSeenAt: true, visitCount: true, timezone: true },
        },
        companyUser: { select: { email: true, firstName: true, lastName: true } },
        company: { select: { name: true } },
      },
      orderBy: { engagementScore: 'desc' },
      take: 50,
    });

    return {
      leads: leads.map(l => ({
        id: l.id,
        email: l.companyUser?.email || l.email,
        name: l.companyUser
          ? `${l.companyUser.firstName || ''} ${l.companyUser.lastName || ''}`.trim()
          : null,
        company: l.company?.name,
        buyerIntent: l.buyerIntent,
        engagementScore: l.engagementScore,
        totalProductViews: l.totalProductViews,
        totalAddToCarts: l.totalAddToCarts,
        lastProductViewed: l.lastProductViewed,
        platform: l.fingerprint?.platform,
        timezone: l.fingerprint?.timezone,
        visitCount: l.fingerprint?.visitCount,
        lastSeenAt: l.fingerprint?.lastSeenAt,
      })),
      total: leads.length,
    };
  }

  // ============================
  // Scoring Helpers
  // ============================

  private calculateBotScore(dto: CollectFingerprintDto): number {
    let score = 0;
    let signals = 0;

    // Missing critical signals → likely bot
    if (!dto.canvasHash) { score += 0.3; signals++; }
    if (!dto.webglHash) { score += 0.2; signals++; }
    if (!dto.audioHash) { score += 0.1; signals++; }
    if (!dto.timezone) { score += 0.1; signals++; }
    if (dto.hardwareConcurrency === 0) { score += 0.2; signals++; }

    // Headless browser markers
    if (dto.userAgent?.includes('HeadlessChrome')) { score += 0.8; signals++; }
    if (dto.userAgent?.includes('PhantomJS')) { score += 0.9; signals++; }
    if (dto.platform === '' || !dto.platform) { score += 0.2; signals++; }

    // Suspicious screen dimensions
    if (dto.screenWidth === 0 || dto.screenHeight === 0) { score += 0.3; signals++; }

    return signals > 0 ? Math.min(1, score / signals) : 0;
  }

  private calculateConfidence(dto: CollectFingerprintDto): number {
    let score = 0;
    if (dto.canvasHash) score += 0.25;
    if (dto.webglHash) score += 0.20;
    if (dto.audioHash) score += 0.15;
    if (dto.timezone) score += 0.10;
    if (dto.gpuVendor) score += 0.10;
    if (dto.hardwareConcurrency) score += 0.05;
    if (dto.deviceMemory) score += 0.05;
    if (dto.language) score += 0.05;
    if (dto.platform) score += 0.05;
    return Math.min(1, score);
  }

  private determineMatchType(dto: CollectFingerprintDto): string {
    if (dto.eagleToken) return 'login';
    if (dto.email) return 'email';
    if (dto.shopifyCustomerId) return 'shopify_session';
    return 'fingerprint';
  }

  private calculateMatchConfidence(matchType: string, dto: CollectFingerprintDto): number {
    switch (matchType) {
      case 'login': return 1.0;
      case 'email': return 0.95;
      case 'shopify_session': return 0.90;
      case 'fingerprint': return dto.canvasHash && dto.webglHash ? 0.75 : 0.50;
      default: return 0.30;
    }
  }
}
