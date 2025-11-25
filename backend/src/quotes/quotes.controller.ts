import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('quotes')
@UseGuards(JwtAuthGuard)
export class QuotesController {
  constructor(private quotesService: QuotesService) {}

  @Get()
  async findAll(@CurrentUser('companyId') companyId: string) {
    return this.quotesService.findAll(companyId);
  }

  @Post()
  async create(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('userId') userId: string,
    @Body() body: any,
  ) {
    return this.quotesService.create(companyId, userId, body);
  }

  @Post(':id/approve')
  async approve(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    return this.quotesService.approve(id, userId);
  }

  @Post(':id/reject')
  async reject(@Param('id') id: string) {
    return this.quotesService.reject(id);
  }
}

