import { Module } from '@nestjs/common';
import { PricingService } from './pricing.service';
import { PricingRulesService } from './pricing-rules.service';
import { PricingCalculatorService } from './pricing-calculator.service';
import { ShopifyPricingSyncService } from './shopify-pricing-sync.service';
import { PricingController } from './pricing.controller';
import { ShopifyModule } from '../shopify/shopify.module';

@Module({
  imports: [ShopifyModule],
  controllers: [PricingController],
  providers: [PricingService, PricingRulesService, PricingCalculatorService, ShopifyPricingSyncService],
  exports: [PricingService, PricingCalculatorService],
})
export class PricingModule {}




