import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface Notification {
  id: string;
  type: 'order' | 'quote' | 'approval' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async getNotifications(userId: string, companyId: string): Promise<Notification[]> {
    // Activity log'dan notification'lar oluştur
    const recentActivity = await this.prisma.activityLog.findMany({
      where: {
        OR: [{ companyId }, { companyUserId: userId }],
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return recentActivity.map((activity) => ({
      id: activity.id,
      type: this.mapEventTypeToNotificationType(activity.eventType),
      title: this.generateTitle(activity.eventType),
      message: `Event: ${activity.eventType}`,
      isRead: false,
      createdAt: activity.createdAt,
    }));
  }

  private mapEventTypeToNotificationType(eventType: string): 'order' | 'quote' | 'approval' | 'system' {
    if (eventType.includes('order')) return 'order';
    if (eventType.includes('quote')) return 'quote';
    if (eventType.includes('approval')) return 'approval';
    return 'system';
  }

  private generateTitle(eventType: string): string {
    const titles: Record<string, string> = {
      product_view: 'Product Viewed',
      add_to_cart: 'Item Added to Cart',
      checkout_start: 'Checkout Started',
      order_created: 'New Order',
      quote_requested: 'Quote Requested',
    };
    return titles[eventType] || 'Activity';
  }
}

