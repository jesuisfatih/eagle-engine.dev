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

  /**
   * Create a basic discount code using Shopify Admin GraphQL API
   * Uses discountCodeBasicCreate mutation (replaces deprecated REST Price Rules)
   */
  async createDiscountCode(
    shop: string,
    accessToken: string,
    code: string,
    value: number,
    valueType: 'fixed_amount' | 'percentage',
  ) {
    const url = this.shopifyService.buildAdminGraphQLUrl(shop);

    // Build the discount value based on type
    const customerGets = valueType === 'percentage' 
      ? {
          value: {
            percentage: value / 100, // Shopify expects decimal (0.1 for 10%)
          },
          items: {
            all: true,
          },
        }
      : {
          value: {
            discountAmount: {
              amount: value.toString(),
              appliesOnEachItem: false,
            },
          },
          items: {
            all: true,
          },
        };

    const mutation = `
      mutation discountCodeBasicCreate($basicCodeDiscount: DiscountCodeBasicInput!) {
        discountCodeBasicCreate(basicCodeDiscount: $basicCodeDiscount) {
          codeDiscountNode {
            id
            codeDiscount {
              ... on DiscountCodeBasic {
                title
                codes(first: 1) {
                  nodes {
                    code
                    id
                  }
                }
              }
            }
          }
          userErrors {
            field
            code
            message
          }
        }
      }
    `;

    const variables = {
      basicCodeDiscount: {
        title: `Eagle B2B - ${code}`,
        code: code,
        startsAt: new Date().toISOString(),
        endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        usageLimit: 1,
        appliesOncePerCustomer: false,
        customerSelection: {
          all: true,
        },
        customerGets,
        combinesWith: {
          orderDiscounts: false,
          productDiscounts: false,
          shippingDiscounts: true,
        },
      },
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          url,
          { query: mutation, variables },
          {
            headers: {
              'X-Shopify-Access-Token': accessToken,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      const result = response.data.data?.discountCodeBasicCreate;

      if (result?.userErrors?.length > 0) {
        this.logger.error('Shopify discount creation failed', result.userErrors);
        throw new Error(`Discount creation failed: ${result.userErrors[0].message}`);
      }

      const discountNode = result?.codeDiscountNode;
      this.logger.log(`Created Shopify discount: ${code}`);

      return {
        discountId: discountNode?.id,
        discountCodeId: discountNode?.codeDiscount?.codes?.nodes?.[0]?.id,
        code,
      };
    } catch (error) {
      this.logger.error('Failed to create Shopify discount', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Delete a discount code (cleanup after use)
   */
  async deleteDiscountCode(
    shop: string,
    accessToken: string,
    discountId: string,
  ) {
    const url = this.shopifyService.buildAdminGraphQLUrl(shop);

    const mutation = `
      mutation discountCodeDelete($id: ID!) {
        discountCodeDelete(id: $id) {
          deletedCodeDiscountId
          userErrors {
            field
            code
            message
          }
        }
      }
    `;

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          url,
          { query: mutation, variables: { id: discountId } },
          {
            headers: {
              'X-Shopify-Access-Token': accessToken,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      const result = response.data.data?.discountCodeDelete;

      if (result?.userErrors?.length > 0) {
        this.logger.warn('Discount deletion had errors', result.userErrors);
      }

      this.logger.log(`Deleted Shopify discount: ${discountId}`);
      return result?.deletedCodeDiscountId;
    } catch (error) {
      this.logger.error('Failed to delete Shopify discount', error.response?.data || error.message);
      throw error;
    }
  }

  // Legacy method name for backward compatibility
  async createPriceRule(
    shop: string,
    accessToken: string,
    code: string,
    value: number,
    valueType: 'fixed_amount' | 'percentage',
  ) {
    return this.createDiscountCode(shop, accessToken, code, value, valueType);
  }
}




