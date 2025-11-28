import { EventsService } from './events.service';
export declare class EventsController {
    private eventsService;
    constructor(eventsService: EventsService);
    collectEvent(body: any): Promise<{
        success: boolean;
    }>;
    getCompanyEvents(companyId: string, eventType?: string, limit?: string): Promise<({
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
    getAnalytics(merchantId: string, from?: string, to?: string): Promise<{
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
