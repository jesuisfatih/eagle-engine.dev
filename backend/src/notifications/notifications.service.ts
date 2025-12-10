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
  // In-memory read status tracking (in production, use DB)
  private readNotifications: Set<string> = new Set();

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
      isRead: this.readNotifications.has(activity.id),
      createdAt: activity.createdAt,
    }));
  }

  async markAsRead(id: string, userId: string): Promise<{ success: boolean }> {
    this.readNotifications.add(id);
    return { success: true };
  }

  async markAllAsRead(userId: string, companyId: string): Promise<{ success: boolean; count: number }> {
    const notifications = await this.getNotifications(userId, companyId);
    let count = 0;
    
    for (const notification of notifications) {
      if (!this.readNotifications.has(notification.id)) {
        this.readNotifications.add(notification.id);
        count++;
      }
    }
    
    return { success: true, count };
  }

  async getUnreadCount(userId: string, companyId: string): Promise<number> {
    const notifications = await this.getNotifications(userId, companyId);
    return notifications.filter((n) => !n.isRead).length;
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

