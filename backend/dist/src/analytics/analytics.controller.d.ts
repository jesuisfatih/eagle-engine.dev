import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private analyticsService;
    constructor(analyticsService: AnalyticsService);
    getDashboard(): Promise<{
        totalCompanies: number;
        totalUsers: number;
        totalOrders: number;
        totalEvents: number;
        totalRevenue: number | import("@prisma/client-runtime-utils").Decimal;
    }>;
    getFunnel(): Promise<{
        steps: {
            name: string;
            count: number;
        }[];
        conversionRate: string | number;
    }>;
    getTopProducts(limit?: string): Promise<(import("@prisma/client").Prisma.PickEnumerable<import("@prisma/client").Prisma.ActivityLogGroupByOutputType, "shopifyProductId"[]> & {
        _count: {
            id: number;
        };
    })[]>;
    getTopCompanies(limit?: string): Promise<{
        id: string;
        name: string;
        orderCount: number;
        totalSpent: number;
    }[]>;
}
