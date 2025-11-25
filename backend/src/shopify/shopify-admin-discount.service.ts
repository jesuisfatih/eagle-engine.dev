import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ShopifyService } from './shopify.service';

@Injectable()
export class ShopifyAdminDiscountService {
  private readonly logger = new Logger(ShopifyAdminDiscountService.name);

  constructor(
    private httpService: HttpService,
    private shopifyService: ShopifyService,
  ) {}

  async createPriceRule(
    shop: string,
    accessToken: string,
    code: string,
    value: number,
    valueType: 'fixed_amount' | 'percentage',
  ) {
    const url = this.shopifyService.buildAdminApiUrl(shop, '/price_rules.json');

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          url,
          {
            price_rule: {
              title: `Eagle B2B - ${code}`,
              target_type: 'line_item',
              target_selection: 'all',
              allocation_method: 'across',
              value_type: valueType,
              value: valueType === 'percentage' ? `-${value}` : `-${value}`,
              customer_selection: 'all',
              once_per_customer: false,
              usage_limit: 1,
              starts_at: new Date().toISOString(),
            },
          },
          {
            headers: {
              'X-Shopify-Access-Token': accessToken,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      const priceRuleId = response.data.price_rule.id;

      // Create discount code
      const codeUrl = this.shopifyService.buildAdminApiUrl(
        shop,
        `/price_rules/${priceRuleId}/discount_codes.json`,
      );

      const codeResponse = await firstValueFrom(
        this.httpService.post(
          codeUrl,
          {
            discount_code: {
              code: code,
            },
          },
          {
            headers: {
              'X-Shopify-Access-Token': accessToken,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      this.logger.log(`Created Shopify discount: ${code}`);

      return {
        priceRuleId,
        discountCodeId: codeResponse.data.discount_code.id,
        code,
      };
    } catch (error) {
      this.logger.error('Failed to create Shopify discount', error.response?.data);
      throw error;
    }
  }
}

