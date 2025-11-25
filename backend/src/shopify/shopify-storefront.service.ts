import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

interface CartLineItem {
  merchandiseId: string; // Shopify variant GID
  quantity: number;
}

@Injectable()
export class ShopifyStorefrontService {
  private readonly logger = new Logger(ShopifyStorefrontService.name);

  constructor(
    private httpService: HttpService,
    private config: ConfigService,
  ) {}

  async createCart(
    shop: string,
    storefrontAccessToken: string,
    lines: CartLineItem[],
    discountCodes?: string[],
  ) {
    const url = `https://${shop}/api/2025-01/graphql.json`;

    const mutation = `
      mutation cartCreate($input: CartInput!) {
        cartCreate(input: $input) {
          cart {
            id
            checkoutUrl
            lines(first: 100) {
              edges {
                node {
                  id
                  quantity
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                      price {
                        amount
                      }
                    }
                  }
                }
              }
            }
            cost {
              totalAmount {
                amount
                currencyCode
              }
              subtotalAmount {
                amount
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const variables = {
      input: {
        lines,
        discountCodes,
      },
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          url,
          {
            query: mutation,
            variables,
          },
          {
            headers: {
              'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      if (response.data.errors) {
        this.logger.error('Storefront API errors:', response.data.errors);
        throw new Error('Failed to create cart');
      }

      const cart = response.data.data.cartCreate.cart;
      this.logger.log(`Created Shopify cart: ${cart.id}`);

      return {
        cartId: cart.id,
        checkoutUrl: cart.checkoutUrl,
        total: cart.cost.totalAmount.amount,
      };
    } catch (error) {
      this.logger.error('Failed to create Shopify cart', error);
      throw error;
    }
  }
}




