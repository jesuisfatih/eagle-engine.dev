"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ShopifyStorefrontService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopifyStorefrontService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
let ShopifyStorefrontService = ShopifyStorefrontService_1 = class ShopifyStorefrontService {
    httpService;
    config;
    logger = new common_1.Logger(ShopifyStorefrontService_1.name);
    apiVersion;
    constructor(httpService, config) {
        this.httpService = httpService;
        this.config = config;
        this.apiVersion = this.config.get('SHOPIFY_API_VERSION', '2024-10');
    }
    buildStorefrontUrl(shop) {
        return `https://${shop}/api/${this.apiVersion}/graphql.json`;
    }
    async createCart(shop, storefrontAccessToken, lines, discountCodes, customerAccessToken) {
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
        const variables = {
            input: {
                lines,
                discountCodes,
            },
        };
        if (customerAccessToken) {
            variables.input.buyerIdentity = {
                customerAccessToken,
            };
        }
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(url, {
                query: mutation,
                variables,
            }, {
                headers: {
                    'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
                    'Content-Type': 'application/json',
                },
            }));
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
        }
        catch (error) {
            this.logger.error('Failed to create Shopify cart', error);
            throw error;
        }
    }
    async createCustomerAccessToken(shop, storefrontAccessToken, email, password) {
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
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(url, {
                query: mutation,
                variables,
            }, {
                headers: {
                    'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
                    'Content-Type': 'application/json',
                },
            }));
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
        }
        catch (error) {
            this.logger.error('Failed to create customer access token', error);
            return null;
        }
    }
    async updateCartBuyerIdentity(shop, storefrontAccessToken, cartId, buyerIdentity) {
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
                countryCode: buyerIdentity.countryCode || 'TR',
                deliveryAddressPreferences: buyerIdentity.deliveryAddressPreferences,
            },
        };
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(url, { query: mutation, variables }, {
                headers: {
                    'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
                    'Content-Type': 'application/json',
                },
            }));
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
        }
        catch (error) {
            this.logger.error('Failed to update cart buyer identity', error);
            throw error;
        }
    }
    async createCheckoutWithBuyerIdentity(shop, storefrontAccessToken, lines, buyerIdentity, discountCodes) {
        const cart = await this.createCart(shop, storefrontAccessToken, lines, discountCodes);
        const updatedCart = await this.updateCartBuyerIdentity(shop, storefrontAccessToken, cart.cartId, buyerIdentity);
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
    formatVariantId(variantId) {
        const id = variantId.toString();
        if (id.startsWith('gid://')) {
            return id;
        }
        return `gid://shopify/ProductVariant/${id}`;
    }
};
exports.ShopifyStorefrontService = ShopifyStorefrontService;
exports.ShopifyStorefrontService = ShopifyStorefrontService = ShopifyStorefrontService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService])
], ShopifyStorefrontService);
//# sourceMappingURL=shopify-storefront.service.js.map