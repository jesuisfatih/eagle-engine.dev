import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SyncScheduler } from './sync.scheduler';
import { SyncModule } from '../sync/sync.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    SyncModule,
  ],
  providers: [SyncScheduler],
})
export class SchedulerModule {}



