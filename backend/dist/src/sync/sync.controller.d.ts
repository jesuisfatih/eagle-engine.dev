import { SyncService } from './sync.service';
export declare class SyncController {
    private syncService;
    constructor(syncService: SyncService);
    triggerInitialSync(merchantId: string): Promise<{
        message: string;
        syncLogId: string;
    }>;
    triggerInitialSyncAuth(merchantId: string): Promise<{
        message: string;
        syncLogId: string;
    }>;
    triggerCustomersSync(merchantId?: string): Promise<{
        message: string;
    }>;
    triggerProductsSync(merchantId?: string): Promise<{
        message: string;
    }>;
    triggerOrdersSync(merchantId?: string): Promise<{
        message: string;
    }>;
    getSyncStatus(): Promise<{
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
