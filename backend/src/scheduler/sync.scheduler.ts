import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { SyncService } from '../sync/sync.service';

@Injectable()
export class SyncScheduler {
  private readonly logger = new Logger(SyncScheduler.name);

  constructor(
    private prisma: PrismaService,
    private syncService: SyncService,
  ) {}

  // 20 saniyede bir sync (senaryoda belirtildiği gibi)
  @Cron('*/20 * * * * *')
  async handleCustomersSync() {
    this.logger.debug('Running scheduled customers sync...');

    // Get all active merchants
    const merchants = await this.prisma.merchant.findMany({
      where: { status: 'active' },
    });

    for (const merchant of merchants) {
      try {
        await this.syncService.triggerCustomersSync(merchant.id);
      } catch (error) {
        this.logger.error(`Failed to sync customers for merchant ${merchant.shopDomain}`, error);
      }
    }
  }

  // Her 5 dakikada bir products sync
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleProductsSync() {
    this.logger.debug('Running scheduled products sync...');

    const merchants = await this.prisma.merchant.findMany({
      where: { status: 'active' },
    });

    for (const merchant of merchants) {
      try {
        await this.syncService.triggerProductsSync(merchant.id);
      } catch (error) {
        this.logger.error(`Failed to sync products for merchant ${merchant.shopDomain}`, error);
      }
    }
  }

  // Her 10 dakikada bir orders sync
  @Cron(CronExpression.EVERY_10_MINUTES)
  async handleOrdersSync() {
    this.logger.debug('Running scheduled orders sync...');

    const merchants = await this.prisma.merchant.findMany({
      where: { status: 'active' },
    });

    for (const merchant of merchants) {
      try {
        await this.syncService.triggerOrdersSync(merchant.id);
      } catch (error) {
        this.logger.error(`Failed to sync orders for merchant ${merchant.shopDomain}`, error);
      }
    }
  }
}




