import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('catalog')
@Public()
export class CatalogController {
  constructor(private catalogService: CatalogService) {}

  @Get('products')
  async getProducts(
    @Query('search') search?: string,
    @Query('limit') limit?: string,
  ) {
    const merchantId = '6ecc682b-98ee-472d-977b-cffbbae081b8';
    return this.catalogService.getProducts(merchantId, {
      search,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get('products/:id')
  async getProduct(@Param('id') id: string) {
    return this.catalogService.getProduct(id);
  }

  @Get('variants/:id')
  async getVariant(@Param('id') id: string) {
    return this.catalogService.getVariant(id);
  }
}




