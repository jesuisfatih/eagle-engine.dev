import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    private prisma: PrismaService,
    @InjectQueue('customers-sync') private customersQueue: Queue,
    @InjectQueue('products-sync') private productsQueue: Queue,
    @InjectQueue('orders-sync') private ordersQueue: Queue,
  ) {}

  async triggerInitialSync(merchantId: string) {
    this.logger.log(`Triggering initial sync for merchant: ${merchantId}`);

    const syncLog = await this.prisma.syncLog.create({
      data: {
        merchantId,
        syncType: 'initial_sync',
        status: 'running',
      },
    });

    // Add jobs to queues
    await this.customersQueue.add('initial-sync', { merchantId, syncLogId: syncLog.id });
    await this.productsQueue.add('initial-sync', { merchantId, syncLogId: syncLog.id });
    await this.ordersQueue.add('initial-sync', { merchantId, syncLogId: syncLog.id });

    return { message: 'Initial sync started', syncLogId: syncLog.id };
  }

  async triggerCustomersSync(merchantId: string) {
    await this.customersQueue.add('sync', { merchantId });
    return { message: 'Customers sync queued' };
  }

  async triggerProductsSync(merchantId: string) {
    await this.productsQueue.add('sync', { merchantId });
    return { message: 'Products sync queued' };
  }

  async triggerOrdersSync(merchantId: string) {
    await this.ordersQueue.add('sync', { merchantId });
    return { message: 'Orders sync queued' };
  }

  async getSyncStatus(merchantId: string) {
    const recentSyncs = await this.prisma.syncLog.findMany({
      where: { merchantId },
      orderBy: { startedAt: 'desc' },
      take: 10,
    });

    return recentSyncs;
  }
}



