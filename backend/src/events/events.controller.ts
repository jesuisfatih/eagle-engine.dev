import { Controller, Post, Get, Body, Query, UseGuards } from '@nestjs/common';
import { EventsService } from './events.service';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Public()
  @Post('collect')
  async collectEvent(@Body() body: any) {
    return this.eventsService.collectEvent(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('company')
  async getCompanyEvents(
    @CurrentUser('companyId') companyId: string,
    @Query('eventType') eventType?: string,
    @Query('limit') limit?: string,
  ) {
    return this.eventsService.getEventsByCompany(companyId, {
      eventType,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('analytics')
  async getAnalytics(
    @CurrentUser('merchantId') merchantId: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    const dateRange = from && to ? {
      from: new Date(from),
      to: new Date(to),
    } : undefined;

    return this.eventsService.getAnalytics(merchantId, dateRange);
  }
}



