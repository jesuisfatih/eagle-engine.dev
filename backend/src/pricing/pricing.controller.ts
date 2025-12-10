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
  BadRequestException,
} from '@nestjs/common';
import { PricingService } from './pricing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('pricing')
@UseGuards(JwtAuthGuard)
export class PricingController {
  constructor(private pricingService: PricingService) {}

  // Calculate prices for variants
  @Post('calculate')
  async calculatePrices(
    @CurrentUser('merchantId') merchantId: string,
    @CurrentUser('companyId') companyId: string,
    @Body() body: { variantIds: string[]; quantities?: any; cartTotal?: number },
  ) {
    if (!merchantId) {
      throw new BadRequestException('Merchant ID required');
    }
    if (!companyId) {
      throw new BadRequestException('Company ID required');
    }
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
    @CurrentUser('merchantId') merchantId: string,
    @Query('isActive') isActive?: string,
    @Query('companyId') companyId?: string,
  ) {
    if (!merchantId) {
      throw new BadRequestException('Merchant ID required');
    }
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
  async getRule(
    @Param('id') id: string,
    @CurrentUser('merchantId') merchantId: string,
  ) {
    if (!merchantId) {
      throw new BadRequestException('Merchant ID required');
    }
    return this.pricingService.getRule(id, merchantId);
  }

  @Post('rules')
  async createRule(
    @CurrentUser('merchantId') merchantId: string,
    @Body() body: any,
  ) {
    if (!merchantId) {
      throw new BadRequestException('Merchant ID required');
    }
    return this.pricingService.createRule(merchantId, body);
  }

  @Put('rules/:id')
  async updateRule(
    @Param('id') id: string,
    @CurrentUser('merchantId') merchantId: string,
    @Body() body: any,
  ) {
    if (!merchantId) {
      throw new BadRequestException('Merchant ID required');
    }
    return this.pricingService.updateRule(id, merchantId, body);
  }

  @Delete('rules/:id')
  async deleteRule(
    @Param('id') id: string,
    @CurrentUser('merchantId') merchantId: string,
  ) {
    if (!merchantId) {
      throw new BadRequestException('Merchant ID required');
    }
    return this.pricingService.deleteRule(id, merchantId);
  }

  @Put('rules/:id/toggle')
  async toggleRule(
    @Param('id') id: string,
    @CurrentUser('merchantId') merchantId: string,
    @Body('isActive') isActive: boolean,
  ) {
    if (!merchantId) {
      throw new BadRequestException('Merchant ID required');
    }
    return this.pricingService.toggleRuleActive(id, merchantId, isActive);
  }
}




