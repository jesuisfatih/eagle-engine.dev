import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('quotes')
@Public()
export class QuotesController {
  constructor(private quotesService: QuotesService) {}

  @Get()
  async findAll() {
    // Return all quotes for demo
    return [];
  }

  @Post()
  async create(@Body() body: any) {
    const companyId = body.companyId || '6ecc682b-98ee-472d-977b-cffbbae081b8';
    const userId = body.userId || '6ecc682b-98ee-472d-977b-cffbbae081b8';
    return this.quotesService.create(companyId, userId, body);
  }

  @Post(':id/approve')
  async approve(@Param('id') id: string) {
    const userId = '6ecc682b-98ee-472d-977b-cffbbae081b8';
    return this.quotesService.approve(id, userId);
  }

  @Post(':id/reject')
  async reject(@Param('id') id: string) {
    return this.quotesService.reject(id);
  }
}

