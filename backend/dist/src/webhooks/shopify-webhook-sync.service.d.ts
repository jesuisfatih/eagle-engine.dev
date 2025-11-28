import { PrismaService } from '../prisma/prisma.service';
import { ShopifyCustomerSyncService } from '../shopify/shopify-customer-sync.service';
export declare class ShopifyWebhookSyncService {
    private prisma;
    private shopifyCustomerSync;
    private readonly logger;
    constructor(prisma: PrismaService, shopifyCustomerSync: ShopifyCustomerSyncService);
    handleOrderCreate(orderData: any, shop: string): Promise<void>;
}
