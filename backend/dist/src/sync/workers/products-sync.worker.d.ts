import type { Job } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
import { ShopifyService } from '../../shopify/shopify.service';
import { ShopifyGraphqlService } from '../../shopify/shopify-graphql.service';
interface SyncJobData {
    merchantId: string;
    syncLogId?: string;
}
export declare class ProductsSyncWorker {
    private prisma;
    private shopifyService;
    private shopifyGraphql;
    private readonly logger;
    constructor(prisma: PrismaService, shopifyService: ShopifyService, shopifyGraphql: ShopifyGraphqlService);
    handleInitialSync(job: Job<SyncJobData>): Promise<{
        processed: number;
    }>;
    handleContinuousSync(job: Job<SyncJobData>): Promise<{
        processed: number;
    }>;
}
export {};
