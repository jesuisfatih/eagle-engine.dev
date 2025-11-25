import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { HttpModule } from '@nestjs/axios';
import { SyncService } from './sync.service';
import { SyncController } from './sync.controller';
import { CustomersSyncWorker } from './workers/customers-sync.worker';
import { ProductsSyncWorker } from './workers/products-sync.worker';
import { OrdersSyncWorker } from './workers/orders-sync.worker';
import { ShopifyModule } from '../shopify/shopify.module';

@Module({
  imports: [
    HttpModule,
    ShopifyModule,
    BullModule.registerQueue(
      {
        name: 'customers-sync',
      },
      {
        name: 'products-sync',
      },
      {
        name: 'orders-sync',
      },
    ),
  ],
  controllers: [SyncController],
  providers: [SyncService, CustomersSyncWorker, ProductsSyncWorker, OrdersSyncWorker],
  exports: [SyncService],
})
export class SyncModule {}

