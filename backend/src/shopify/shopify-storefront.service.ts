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
    customerAccessToken?: string, // For authenticated checkout
  ) {
    const url = `https://${shop}/api/2024-10/graphql.json`;

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
            buyerIdentity {
              email
              customer {
                id
                email
                firstName
                lastName
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

    const variables: any = {
      input: {
        lines,
        discountCodes,
      },
    };

    // Add buyer identity if customer token provided
    if (customerAccessToken) {
      variables.input.buyerIdentity = {
        customerAccessToken,
      };
    }

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

  /**
   * Create customer access token for authenticated checkout
   * This allows checkout to be pre-filled with customer data
   */
  async createCustomerAccessToken(
    shop: string,
    storefrontAccessToken: string,
    email: string,
    password: string,
  ): Promise<string | null> {
    const url = `https://${shop}/api/2024-10/graphql.json`;

    const mutation = `
      mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
        customerAccessTokenCreate(input: $input) {
          customerAccessToken {
            accessToken
            expiresAt
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
        email,
        password,
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
        this.logger.error('Customer access token creation errors:', response.data.errors);
        return null;
      }

      const result = response.data.data.customerAccessTokenCreate;
      
      if (result.userErrors && result.userErrors.length > 0) {
        this.logger.error('Customer access token user errors:', result.userErrors);
        return null;
      }

      if (result.customerAccessToken) {
        this.logger.log('Customer access token created successfully');
        return result.customerAccessToken.accessToken;
      }

      return null;
    } catch (error) {
      this.logger.error('Failed to create customer access token', error);
      return null;
    }
  }
}




