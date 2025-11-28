import type { Job } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
import { ShopifyService } from '../../shopify/shopify.service';
export declare class EventsProcessorWorker {
    private prisma;
    private shopifyService;
    private readonly logger;
    constructor(prisma: PrismaService, shopifyService: ShopifyService);
    processEvent(job: Job): Promise<void>;
}
