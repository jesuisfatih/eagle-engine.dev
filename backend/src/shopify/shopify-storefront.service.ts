import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

interface CartLineItem {
  merchandiseId: string; // Shopify variant GID
  quantity: number;
}

interface DeliveryAddress {
  firstName?: string;
  lastName?: string;
  address1: string;
  address2?: string;
  city: string;
  province?: string;
  country: string;
  zip: string;
  phone?: string;
}

interface BuyerIdentity {
  email: string;
  phone?: string;
  countryCode?: string;
  deliveryAddressPreferences?: {
    deliveryAddress: DeliveryAddress;
  }[];
}

@Injectable()
export class ShopifyStorefrontService {
  private readonly logger = new Logger(ShopifyStorefrontService.name);
  private readonly apiVersion: string;

  constructor(
    private httpService: HttpService,
    private config: ConfigService,
  ) {
    this.apiVersion = this.config.get<string>('SHOPIFY_API_VERSION', '2024-10');
  }

  private buildStorefrontUrl(shop: string): string {
    return `https://${shop}/api/${this.apiVersion}/graphql.json`;
  }

  async createCart(
    shop: string,
    storefrontAccessToken: string,
    lines: CartLineItem[],
    discountCodes?: string[],
    customerAccessToken?: string, // For authenticated checkout
  ) {
    const url = this.buildStorefrontUrl(shop);

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
    const url = this.buildStorefrontUrl(shop);

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

  /**
   * ⭐ KRİTİK METOD: Sepete alıcı bilgisi ekle
   * Bu metod email ve adresi checkout'a taşır
   */
  async updateCartBuyerIdentity(
    shop: string,
    storefrontAccessToken: string,
    cartId: string,
    buyerIdentity: BuyerIdentity,
  ) {
    const url = this.buildStorefrontUrl(shop);

    const mutation = `
      mutation cartBuyerIdentityUpdate($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
        cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
          cart {
            id
            checkoutUrl
            buyerIdentity {
              email
              phone
              deliveryAddressPreferences {
                ... on MailingAddress {
                  address1
                  address2
                  city
                  province
                  country
                  zip
                }
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
      cartId,
      buyerIdentity: {
        email: buyerIdentity.email,
        phone: buyerIdentity.phone,
        countryCode: buyerIdentity.countryCode || 'US', // Changed from TR to US
        deliveryAddressPreferences: buyerIdentity.deliveryAddressPreferences,
      },
    };

    // Log for debugging
    this.logger.log('Updating buyer identity:', JSON.stringify(variables.buyerIdentity));

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          url,
          { query: mutation, variables },
          {
            headers: {
              'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      if (response.data.errors) {
        this.logger.error('Buyer identity update errors:', response.data.errors);
        throw new Error(`Storefront API Error: ${JSON.stringify(response.data.errors)}`);
      }

      const result = response.data.data.cartBuyerIdentityUpdate;
      
      if (result.userErrors?.length > 0) {
        throw new Error(`Buyer identity update failed: ${result.userErrors[0].message}`);
      }

      const cart = result.cart;
      this.logger.log(`Updated buyer identity for cart: ${cart.id}`, {
        email: buyerIdentity.email,
      });

      return {
        cartId: cart.id,
        checkoutUrl: cart.checkoutUrl,
        buyerIdentity: cart.buyerIdentity,
      };
    } catch (error) {
      this.logger.error('Failed to update cart buyer identity', error);
      throw error;
    }
  }

  /**
   * ⭐ ANA METOD: Sepet oluştur + Alıcı bilgisi ekle + Checkout URL döndür
   * Frontend bu metodu çağırmalı
   */
  async createCheckoutWithBuyerIdentity(
    shop: string,
    storefrontAccessToken: string,
    lines: CartLineItem[],
    buyerIdentity: BuyerIdentity,
    discountCodes?: string[],
  ): Promise<{
    cartId: string;
    checkoutUrl: string;
    email: string;
  }> {
    // 1. Sepet oluştur
    const cart = await this.createCart(
      shop,
      storefrontAccessToken,
      lines,
      discountCodes,
    );

    // 2. Alıcı bilgisi ekle
    const updatedCart = await this.updateCartBuyerIdentity(
      shop,
      storefrontAccessToken,
      cart.cartId,
      buyerIdentity,
    );

    this.logger.log(`Checkout ready with buyer identity`, {
      cartId: updatedCart.cartId,
      email: buyerIdentity.email,
      checkoutUrl: updatedCart.checkoutUrl,
    });

    return {
      cartId: updatedCart.cartId,
      checkoutUrl: updatedCart.checkoutUrl,
      email: buyerIdentity.email,
    };
  }

  /**
   * Variant ID'yi Storefront GID formatına çevir
   */
  formatVariantId(variantId: string | number | bigint): string {
    const id = variantId.toString();
    if (id.startsWith('gid://')) {
      return id;
    }
    return `gid://shopify/ProductVariant/${id}`;
  }
}




