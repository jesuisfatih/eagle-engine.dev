import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../prisma/prisma.service';

interface CollectEventDto {
  shop: string;
  sessionId: string;
  shopifyCustomerId?: string;
  eagleToken?: string;
  eventType: string;
  payload: any;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
}

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    private prisma: PrismaService,
    @InjectQueue('events-raw-queue') private eventsQueue: Queue,
  ) {}

  async collectEvent(dto: CollectEventDto) {
    // Add to queue for async processing
    await this.eventsQueue.add('process-event', dto);
    return { success: true };
  }

  async getEventsByCompany(companyId: string, filters?: any) {
    return this.prisma.activityLog.findMany({
      where: {
        companyId,
        eventType: filters?.eventType,
      },
      include: {
        product: {
          select: {
            title: true,
            handle: true,
          },
        },
        companyUser: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: filters?.limit || 100,
    });
  }

  async getAnalytics(merchantId: string, dateRange?: { from: Date; to: Date }) {
    const where: any = { merchantId };
    
    if (dateRange) {
      where.createdAt = {
        gte: dateRange.from,
        lte: dateRange.to,
      };
    }

    const [
      totalEvents,
      productViews,
      addToCarts,
      uniqueSessions,
      topProducts,
    ] = await Promise.all([
      this.prisma.activityLog.count({ where }),
      this.prisma.activityLog.count({ where: { ...where, eventType: 'product_view' } }),
      this.prisma.activityLog.count({ where: { ...where, eventType: 'add_to_cart' } }),
      this.prisma.activityLog.findMany({
        where,
        select: { sessionId: true },
        distinct: ['sessionId'],
      }),
      this.prisma.activityLog.groupBy({
        by: ['shopifyProductId'],
        where: { ...where, eventType: 'product_view' },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
    ]);

    return {
      totalEvents,
      productViews,
      addToCarts,
      uniqueSessions: uniqueSessions.length,
      conversionRate: productViews > 0 ? ((addToCarts / productViews) * 100).toFixed(2) : 0,
      topProducts,
    };
  }
}

