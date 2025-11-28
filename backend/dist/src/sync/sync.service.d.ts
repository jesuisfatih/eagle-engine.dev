import type { Queue } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
export declare class SyncService {
    private prisma;
    private customersQueue;
    private productsQueue;
    private ordersQueue;
    private readonly logger;
    constructor(prisma: PrismaService, customersQueue: Queue, productsQueue: Queue, ordersQueue: Queue);
    triggerInitialSync(merchantId: string): Promise<{
        message: string;
        syncLogId: string;
    }>;
    triggerCustomersSync(merchantId: string): Promise<{
        message: string;
    }>;
    triggerProductsSync(merchantId: string): Promise<{
        message: string;
    }>;
    triggerOrdersSync(merchantId: string): Promise<{
        message: string;
    }>;
    getSyncStatus(merchantId: string): Promise<{
        id: string;
        status: string;
        merchantId: string;
        metadata: import("@prisma/client/runtime/client").JsonValue | null;
        syncType: string;
        recordsProcessed: number;
        recordsFailed: number;
        startedAt: Date;
        completedAt: Date | null;
        errorMessage: string | null;
    }[]>;
}
