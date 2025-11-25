import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { EventsProcessorWorker } from './workers/events-processor.worker';
import { ShopifyModule } from '../shopify/shopify.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'events-raw-queue',
    }),
    ShopifyModule,
  ],
  controllers: [EventsController],
  providers: [EventsService, EventsProcessorWorker],
  exports: [EventsService],
})
export class EventsModule {}




