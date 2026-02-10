import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import type { Queue } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { CollectEventDto } from './dto/event.dto';

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

  /**
   * Admin activity feed - returns recent activity logs formatted for the admin UI
   */
  async getAdminActivityFeed(merchantId: string, limit: number = 50) {
    const logs = await this.prisma.activityLog.findMany({
      where: { merchantId },
      include: {
        companyUser: {
          select: { email: true, firstName: true, lastName: true },
        },
        company: {
          select: { name: true },
        },
        product: {
          select: { title: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const activities = logs.map(log => {
      const userName = log.companyUser
        ? `${log.companyUser.firstName || ''} ${log.companyUser.lastName || ''}`.trim() || log.companyUser.email
        : 'System';
      const companyName = log.company?.name || '';
      const productTitle = log.product?.title || '';

      let description = log.eventType;
      switch (log.eventType) {
        case 'product_view':
          description = `Viewed product: ${productTitle}`;
          break;
        case 'add_to_cart':
          description = `Added to cart: ${productTitle}`;
          break;
        case 'page_view':
          description = 'Viewed a page';
          break;
        case 'login':
          description = `User logged in`;
          break;
        case 'checkout_started':
          description = 'Started checkout';
          break;
        default:
          description = log.eventType.replace(/_/g, ' ');
      }

      return {
        id: log.id,
        type: log.eventType.split('_')[0] || 'system',
        description,
        user: userName,
        company: companyName,
        createdAt: log.createdAt,
      };
    });

    return { activities, total: activities.length };
  }
}
