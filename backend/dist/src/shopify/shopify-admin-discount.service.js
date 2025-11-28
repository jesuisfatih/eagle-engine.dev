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
var ShopifyAdminDiscountService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopifyAdminDiscountService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const shopify_service_1 = require("./shopify.service");
let ShopifyAdminDiscountService = ShopifyAdminDiscountService_1 = class ShopifyAdminDiscountService {
    httpService;
    shopifyService;
    logger = new common_1.Logger(ShopifyAdminDiscountService_1.name);
    constructor(httpService, shopifyService) {
        this.httpService = httpService;
        this.shopifyService = shopifyService;
    }
    async createPriceRule(shop, accessToken, code, value, valueType) {
        const url = this.shopifyService.buildAdminApiUrl(shop, '/price_rules.json');
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(url, {
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
            }, {
                headers: {
                    'X-Shopify-Access-Token': accessToken,
                    'Content-Type': 'application/json',
                },
            }));
            const priceRuleId = response.data.price_rule.id;
            const codeUrl = this.shopifyService.buildAdminApiUrl(shop, `/price_rules/${priceRuleId}/discount_codes.json`);
            const codeResponse = await (0, rxjs_1.firstValueFrom)(this.httpService.post(codeUrl, {
                discount_code: {
                    code: code,
                },
            }, {
                headers: {
                    'X-Shopify-Access-Token': accessToken,
                    'Content-Type': 'application/json',
                },
            }));
            this.logger.log(`Created Shopify discount: ${code}`);
            return {
                priceRuleId,
                discountCodeId: codeResponse.data.discount_code.id,
                code,
            };
        }
        catch (error) {
            this.logger.error('Failed to create Shopify discount', error.response?.data);
            throw error;
        }
    }
};
exports.ShopifyAdminDiscountService = ShopifyAdminDiscountService;
exports.ShopifyAdminDiscountService = ShopifyAdminDiscountService = ShopifyAdminDiscountService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        shopify_service_1.ShopifyService])
], ShopifyAdminDiscountService);
//# sourceMappingURL=shopify-admin-discount.service.js.map