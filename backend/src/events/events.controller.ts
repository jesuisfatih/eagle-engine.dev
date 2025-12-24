import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { EventsService } from './events.service';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CollectEventDto, GetEventsQueryDto, AnalyticsQueryDto } from './dto/event.dto';

@Controller('events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  // Public endpoint - STRICT RATE LIMITING + DTO VALIDATION to prevent abuse
  @Public()
  @Throttle({ short: { limit: 50, ttl: 1000 }, medium: { limit: 200, ttl: 10000 } })
  @Post('collect')
  async collectEvent(@Body() dto: CollectEventDto) {
    return this.eventsService.collectEvent(dto);
  }

  @SkipThrottle()
  @UseGuards(JwtAuthGuard)
  @Get('company')
  async getCompanyEvents(
    @CurrentUser('companyId') companyId: string,
    @Query() query: GetEventsQueryDto,
  ) {
    return this.eventsService.getEventsByCompany(companyId, {
      eventType: query.eventType,
      limit: query.limit,
    });
  }

  @SkipThrottle()
  @UseGuards(JwtAuthGuard)
  @Get('analytics')
  async getAnalytics(
    @CurrentUser('merchantId') merchantId: string,
    @Query() query: AnalyticsQueryDto,
  ) {
    const dateRange = query.from && query.to ? {
      from: new Date(query.from),
      to: new Date(query.to),
    } : undefined;

    return this.eventsService.getAnalytics(merchantId, dateRange);
  }
}




