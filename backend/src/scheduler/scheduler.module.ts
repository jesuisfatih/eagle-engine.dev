import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ShopifyCustomersModule } from '../shopify-customers/shopify-customers.module';
import { SyncModule } from '../sync/sync.module';
import { SyncScheduler } from './sync.scheduler';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    SyncModule,
    ShopifyCustomersModule,
  ],
  providers: [SyncScheduler],
})
export class SchedulerModule {}
