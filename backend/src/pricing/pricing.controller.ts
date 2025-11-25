import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PricingService } from './pricing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('pricing')
@Public()
export class PricingController {
  constructor(private pricingService: PricingService) {}

  // Calculate prices for variants
  @Post('calculate')
  async calculatePrices(
    @Body() body: { variantIds: string[]; companyId?: string; quantities?: any; cartTotal?: number },
  ) {
    const merchantId = '6ecc682b-98ee-472d-977b-cffbbae081b8';
    const companyId = body.companyId || 'f0c2b2a5-4858-4d82-a542-5ce3bfe23a6d';
    const variantIds = body.variantIds.map((id) => BigInt(id));

    return this.pricingService.calculatePrices({
      merchantId,
      companyId,
      variantIds,
      quantities: body.quantities,
      cartTotal: body.cartTotal,
    });
  }

  // Pricing Rules Management
  @Get('rules')
  async getRules(
    @Query('isActive') isActive?: string,
    @Query('companyId') companyId?: string,
  ) {
    const merchantId = '6ecc682b-98ee-472d-977b-cffbbae081b8';
    const filters: any = {};
    if (isActive !== undefined) {
      filters.isActive = isActive === 'true';
    }
    if (companyId) {
      filters.companyId = companyId;
    }

    return this.pricingService.getRules(merchantId, filters);
  }

  @Get('rules/:id')
  async getRule(@Param('id') id: string) {
    const merchantId = '6ecc682b-98ee-472d-977b-cffbbae081b8';
    return this.pricingService.getRule(id, merchantId);
  }

  @Post('rules')
  async createRule(@Body() body: any) {
    const merchantId = '6ecc682b-98ee-472d-977b-cffbbae081b8';
    return this.pricingService.createRule(merchantId, body);
  }

  @Put('rules/:id')
  async updateRule(@Param('id') id: string, @Body() body: any) {
    const merchantId = '6ecc682b-98ee-472d-977b-cffbbae081b8';
    return this.pricingService.updateRule(id, merchantId, body);
  }

  @Delete('rules/:id')
  async deleteRule(@Param('id') id: string) {
    const merchantId = '6ecc682b-98ee-472d-977b-cffbbae081b8';
    return this.pricingService.deleteRule(id, merchantId);
  }

  @Put('rules/:id/toggle')
  async toggleRule(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    const merchantId = '6ecc682b-98ee-472d-977b-cffbbae081b8';
    return this.pricingService.toggleRuleActive(id, merchantId, isActive);
  }
}




