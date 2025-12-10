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
    constructor(httpService, config) {
        this.httpService = httpService;
        this.config = config;
    }
    async createCart(shop, storefrontAccessToken, lines, discountCodes, customerAccessToken) {
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
};
exports.ShopifyStorefrontService = ShopifyStorefrontService;
exports.ShopifyStorefrontService = ShopifyStorefrontService = ShopifyStorefrontService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService])
], ShopifyStorefrontService);
//# sourceMappingURL=shopify-storefront.service.js.map