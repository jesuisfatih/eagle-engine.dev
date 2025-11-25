import { Module } from '@nestjs/common';
import { PricingService } from './pricing.service';
import { PricingRulesService } from './pricing-rules.service';
import { PricingCalculatorService } from './pricing-calculator.service';
import { PricingController } from './pricing.controller';

@Module({
  controllers: [PricingController],
  providers: [PricingService, PricingRulesService, PricingCalculatorService],
  exports: [PricingService, PricingCalculatorService],
})
export class PricingModule {}




