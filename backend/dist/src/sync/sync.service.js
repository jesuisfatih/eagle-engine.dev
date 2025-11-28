"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var SyncService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncService = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const prisma_service_1 = require("../prisma/prisma.service");
let SyncService = SyncService_1 = class SyncService {
    prisma;
    customersQueue;
    productsQueue;
    ordersQueue;
    logger = new common_1.Logger(SyncService_1.name);
    constructor(prisma, customersQueue, productsQueue, ordersQueue) {
        this.prisma = prisma;
        this.customersQueue = customersQueue;
        this.productsQueue = productsQueue;
        this.ordersQueue = ordersQueue;
    }
    async triggerInitialSync(merchantId) {
        this.logger.log(`Triggering initial sync for merchant: ${merchantId}`);
        const syncLog = await this.prisma.syncLog.create({
            data: {
                merchantId,
                syncType: 'initial_sync',
                status: 'running',
            },
        });
        await this.customersQueue.add('initial-sync', { merchantId, syncLogId: syncLog.id });
        await this.productsQueue.add('initial-sync', { merchantId, syncLogId: syncLog.id });
        await this.ordersQueue.add('initial-sync', { merchantId, syncLogId: syncLog.id });
        return { message: 'Initial sync started', syncLogId: syncLog.id };
    }
    async triggerCustomersSync(merchantId) {
        await this.customersQueue.add('sync', { merchantId });
        return { message: 'Customers sync queued' };
    }
    async triggerProductsSync(merchantId) {
        await this.productsQueue.add('sync', { merchantId });
        return { message: 'Products sync queued' };
    }
    async triggerOrdersSync(merchantId) {
        await this.ordersQueue.add('sync', { merchantId });
        return { message: 'Orders sync queued' };
    }
    async getSyncStatus(merchantId) {
        const recentSyncs = await this.prisma.syncLog.findMany({
            where: { merchantId },
            orderBy: { startedAt: 'desc' },
            take: 10,
        });
        return recentSyncs;
    }
};
exports.SyncService = SyncService;
exports.SyncService = SyncService = SyncService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, bull_1.InjectQueue)('customers-sync')),
    __param(2, (0, bull_1.InjectQueue)('products-sync')),
    __param(3, (0, bull_1.InjectQueue)('orders-sync')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Object, Object, Object])
], SyncService);
//# sourceMappingURL=sync.service.js.map