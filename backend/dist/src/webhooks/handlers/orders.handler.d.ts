import { PrismaService } from '../../prisma/prisma.service';
import { ShopifyWebhookSyncService } from '../shopify-webhook-sync.service';
export declare class OrdersHandler {
    private prisma;
    private webhookSync;
    private readonly logger;
    constructor(prisma: PrismaService, webhookSync: ShopifyWebhookSyncService);
    handleOrderCreate(orderData: any, headers: any): Promise<{
        success: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
    }>;
    handleOrderPaid(orderData: any, headers: any): Promise<{
        success: boolean;
    }>;
}
