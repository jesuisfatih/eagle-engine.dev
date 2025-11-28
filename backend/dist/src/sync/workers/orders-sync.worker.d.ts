import type { Job } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
import { ShopifyService } from '../../shopify/shopify.service';
import { ShopifyRestService } from '../../shopify/shopify-rest.service';
interface SyncJobData {
    merchantId: string;
    syncLogId?: string;
}
export declare class OrdersSyncWorker {
    private prisma;
    private shopifyService;
    private shopifyRest;
    private readonly logger;
    constructor(prisma: PrismaService, shopifyService: ShopifyService, shopifyRest: ShopifyRestService);
    handleInitialSync(job: Job<SyncJobData>): Promise<{
        processed: number;
    }>;
    handleContinuousSync(job: Job<SyncJobData>): Promise<{
        processed: number;
    }>;
}
export {};
