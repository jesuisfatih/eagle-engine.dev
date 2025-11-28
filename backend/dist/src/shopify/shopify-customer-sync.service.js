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
var ShopifyCustomerSyncService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopifyCustomerSyncService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const shopify_service_1 = require("./shopify.service");
const prisma_service_1 = require("../prisma/prisma.service");
let ShopifyCustomerSyncService = ShopifyCustomerSyncService_1 = class ShopifyCustomerSyncService {
    httpService;
    shopifyService;
    prisma;
    logger = new common_1.Logger(ShopifyCustomerSyncService_1.name);
    constructor(httpService, shopifyService, prisma) {
        this.httpService = httpService;
        this.shopifyService = shopifyService;
        this.prisma = prisma;
    }
    async syncUserToShopify(userId) {
        const user = await this.prisma.companyUser.findUnique({
            where: { id: userId },
            include: { company: true },
        });
        if (!user)
            return;
        const merchant = await this.prisma.merchant.findUnique({
            where: { id: user.company.merchantId },
        });
        if (!merchant)
            return;
        try {
            const customerData = {
                customer: {
                    email: user.email,
                    first_name: user.firstName,
                    last_name: user.lastName,
                    phone: user.company.phone,
                    addresses: user.company.billingAddress ? [user.company.billingAddress] : [],
                    tags: [`eagle-b2b-user`, `company-${user.companyId}`],
                },
            };
            const url = this.shopifyService.buildAdminApiUrl(merchant.shopDomain, '/customers.json');
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(url, customerData, {
                headers: {
                    'X-Shopify-Access-Token': merchant.accessToken,
                    'Content-Type': 'application/json',
                },
            }));
            await this.prisma.companyUser.update({
                where: { id: userId },
                data: {
                    shopifyCustomerId: BigInt(response.data.customer.id),
                },
            });
            this.logger.log(`User ${user.email} synced to Shopify`);
            return response.data.customer;
        }
        catch (error) {
            this.logger.error('Failed to sync user to Shopify', error);
            throw error;
        }
    }
    async updateShopifyCustomer(userId) {
        const user = await this.prisma.companyUser.findUnique({
            where: { id: userId },
            include: { company: true },
        });
        if (!user || !user.shopifyCustomerId)
            return;
        const merchant = await this.prisma.merchant.findUnique({
            where: { id: user.company.merchantId },
        });
        if (!merchant)
            return;
        try {
            const url = this.shopifyService.buildAdminApiUrl(merchant.shopDomain, `/customers/${user.shopifyCustomerId}.json`);
            const customerData = {
                customer: {
                    email: user.email,
                    first_name: user.firstName,
                    last_name: user.lastName,
                    phone: user.company.phone,
                },
            };
            await (0, rxjs_1.firstValueFrom)(this.httpService.put(url, customerData, {
                headers: {
                    'X-Shopify-Access-Token': merchant.accessToken,
                    'Content-Type': 'application/json',
                },
            }));
            this.logger.log(`Shopify customer updated for ${user.email}`);
        }
        catch (error) {
            this.logger.error('Failed to update Shopify customer', error);
        }
    }
};
exports.ShopifyCustomerSyncService = ShopifyCustomerSyncService;
exports.ShopifyCustomerSyncService = ShopifyCustomerSyncService = ShopifyCustomerSyncService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        shopify_service_1.ShopifyService,
        prisma_service_1.PrismaService])
], ShopifyCustomerSyncService);
//# sourceMappingURL=shopify-customer-sync.service.js.map