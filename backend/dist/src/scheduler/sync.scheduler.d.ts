import { PrismaService } from '../prisma/prisma.service';
import { SyncService } from '../sync/sync.service';
export declare class SyncScheduler {
    private prisma;
    private syncService;
    private readonly logger;
    constructor(prisma: PrismaService, syncService: SyncService);
    handleCustomersSync(): Promise<void>;
    handleProductsSync(): Promise<void>;
    handleOrdersSync(): Promise<void>;
}
