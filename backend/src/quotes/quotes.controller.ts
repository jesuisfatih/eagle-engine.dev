import { Controller, Get, Post, Param, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('quotes')
@UseGuards(JwtAuthGuard)
export class QuotesController {
  constructor(private quotesService: QuotesService) {}

  @Get()
  async findAll(@CurrentUser('companyId') companyId: string) {
    if (!companyId) {
      throw new BadRequestException('Company ID required');
    }
    return this.quotesService.findAll(companyId);
  }

  @Post()
  async create(
    @CurrentUser('companyId') companyId: string,
    @CurrentUser('sub') userId: string,
    @Body() body: any,
  ) {
    if (!companyId || !userId) {
      throw new BadRequestException('Company ID and User ID required');
    }
    return this.quotesService.create(companyId, userId, body);
  }

  @Post(':id/approve')
  async approve(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    if (!userId) {
      throw new BadRequestException('User ID required');
    }
    return this.quotesService.approve(id, userId);
  }

  @Post(':id/reject')
  async reject(@Param('id') id: string) {
    return this.quotesService.reject(id);
  }
}

