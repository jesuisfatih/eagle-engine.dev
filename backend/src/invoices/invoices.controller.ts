import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { InvoiceService } from './invoices.service';

@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  async create(@Req() req: any, @Body() body: any) {
    return this.invoiceService.createInvoice(req.user.merchantId, body);
  }

  @Get()
  async findAll(@Req() req: any, @Query() query: any) {
    return this.invoiceService.findAll(req.user.merchantId, query);
  }

  @Get(':id')
  async findOne(@Req() req: any, @Param('id') id: string) {
    return this.invoiceService.findOne(id, req.user.merchantId);
  }

  @Patch(':id/status')
  async updateStatus(
    @Req() req: any,
    @Param('id') id: string,
    @Body('status') status: string,
    @Body('amountPaid') amountPaid?: number,
  ) {
    return this.invoiceService.updateStatus(id, req.user.merchantId, status, amountPaid);
  }
}
