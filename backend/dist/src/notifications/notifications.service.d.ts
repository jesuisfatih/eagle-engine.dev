import { PrismaService } from '../prisma/prisma.service';
export interface Notification {
    id: string;
    type: 'order' | 'quote' | 'approval' | 'system';
    title: string;
    message: string;
    isRead: boolean;
    createdAt: Date;
}
export declare class NotificationsService {
    private prisma;
    constructor(prisma: PrismaService);
    getNotifications(userId: string, companyId: string): Promise<Notification[]>;
    private mapEventTypeToNotificationType;
    private generateTitle;
}
