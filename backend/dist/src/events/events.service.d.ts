import type { Queue } from 'bull';
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
export declare class EventsService {
    private prisma;
    private eventsQueue;
    private readonly logger;
    constructor(prisma: PrismaService, eventsQueue: Queue);
    collectEvent(dto: CollectEventDto): Promise<{
        success: boolean;
    }>;
    getEventsByCompany(companyId: string, filters?: any): Promise<({
        companyUser: {
            email: string;
            firstName: string | null;
            lastName: string | null;
        } | null;
        product: {
            title: string | null;
            handle: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        merchantId: string;
        shopifyCustomerId: bigint | null;
        shopifyProductId: bigint | null;
        companyId: string | null;
        companyUserId: string | null;
        sessionId: string | null;
        eagleToken: string | null;
        eventType: string;
        productId: string | null;
        variantId: string | null;
        shopifyVariantId: bigint | null;
        payload: import("@prisma/client/runtime/client").JsonValue | null;
        ipAddress: string | null;
        userAgent: string | null;
        referrer: string | null;
    })[]>;
    getAnalytics(merchantId: string, dateRange?: {
        from: Date;
        to: Date;
    }): Promise<{
        totalEvents: number;
        productViews: number;
        addToCarts: number;
        uniqueSessions: number;
        conversionRate: string | number;
        topProducts: (import("@prisma/client").Prisma.PickEnumerable<import("@prisma/client").Prisma.ActivityLogGroupByOutputType, "shopifyProductId"[]> & {
            _count: {
                id: number;
            };
        })[];
    }>;
}
export {};
