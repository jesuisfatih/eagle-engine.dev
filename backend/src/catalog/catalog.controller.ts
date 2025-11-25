import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('catalog')
@UseGuards(JwtAuthGuard)
export class CatalogController {
  constructor(private catalogService: CatalogService) {}

  @Get('products')
  async getProducts(
    @CurrentUser('merchantId') merchantId: string,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
  ) {
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



