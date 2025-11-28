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
var OrdersSyncWorker_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersSyncWorker = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const shopify_service_1 = require("../../shopify/shopify.service");
const shopify_rest_service_1 = require("../../shopify/shopify-rest.service");
let OrdersSyncWorker = OrdersSyncWorker_1 = class OrdersSyncWorker {
    prisma;
    shopifyService;
    shopifyRest;
    logger = new common_1.Logger(OrdersSyncWorker_1.name);
    constructor(prisma, shopifyService, shopifyRest) {
        this.prisma = prisma;
        this.shopifyService = shopifyService;
        this.shopifyRest = shopifyRest;
    }
    async handleInitialSync(job) {
        const { merchantId, syncLogId } = job.data;
        this.logger.log(`Starting initial orders sync for merchant: ${merchantId}`);
        try {
            const merchant = await this.prisma.merchant.findUnique({
                where: { id: merchantId },
            });
            if (!merchant) {
                throw new Error('Merchant not found');
            }
            const result = await this.shopifyRest.getOrders(merchant.shopDomain, merchant.accessToken, 250);
            const orders = result.orders || [];
            let processed = 0;
            for (const order of orders) {
                let companyId;
                let companyUserId;
                if (order.customer?.id) {
                    const companyUser = await this.prisma.companyUser.findFirst({
                        where: {
                            shopifyCustomerId: BigInt(order.customer.id),
                        },
                    });
                    if (companyUser) {
                        companyUserId = companyUser.id;
                        companyId = companyUser.companyId;
                    }
                }
                await this.prisma.orderLocal.upsert({
                    where: {
                        merchantId_shopifyOrderId: {
                            merchantId,
                            shopifyOrderId: BigInt(order.id),
                        },
                    },
                    create: {
                        merchantId,
                        shopifyOrderId: BigInt(order.id),
                        shopifyOrderNumber: order.order_number?.toString(),
                        shopifyCustomerId: order.customer?.id ? BigInt(order.customer.id) : null,
                        companyId,
                        companyUserId,
                        email: order.email,
                        subtotal: order.subtotal_price ? parseFloat(order.subtotal_price) : 0,
                        totalDiscounts: order.total_discounts ? parseFloat(order.total_discounts) : 0,
                        totalTax: order.total_tax ? parseFloat(order.total_tax) : 0,
                        totalPrice: order.total_price ? parseFloat(order.total_price) : 0,
                        currency: order.currency,
                        financialStatus: order.financial_status,
                        fulfillmentStatus: order.fulfillment_status,
                        lineItems: order.line_items || [],
                        shippingAddress: order.shipping_address,
                        billingAddress: order.billing_address,
                        discountCodes: order.discount_codes || [],
                        rawData: order,
                    },
                    update: {
                        shopifyOrderNumber: order.order_number?.toString(),
                        shopifyCustomerId: order.customer?.id ? BigInt(order.customer.id) : null,
                        companyId,
                        companyUserId,
                        email: order.email,
                        subtotal: order.subtotal_price ? parseFloat(order.subtotal_price) : 0,
                        totalDiscounts: order.total_discounts ? parseFloat(order.total_discounts) : 0,
                        totalTax: order.total_tax ? parseFloat(order.total_tax) : 0,
                        totalPrice: order.total_price ? parseFloat(order.total_price) : 0,
                        currency: order.currency,
                        financialStatus: order.financial_status,
                        fulfillmentStatus: order.fulfillment_status,
                        lineItems: order.line_items || [],
                        shippingAddress: order.shipping_address,
                        billingAddress: order.billing_address,
                        discountCodes: order.discount_codes || [],
                        rawData: order,
                        syncedAt: new Date(),
                    },
                });
                processed++;
            }
            if (syncLogId) {
                await this.prisma.syncLog.update({
                    where: { id: syncLogId },
                    data: {
                        status: 'completed',
                        recordsProcessed: processed,
                        completedAt: new Date(),
                    },
                });
            }
            this.logger.log(`Completed orders sync. Processed ${processed} orders.`);
            return { processed };
        }
        catch (error) {
            this.logger.error('Orders sync failed', error);
            if (syncLogId) {
                await this.prisma.syncLog.update({
                    where: { id: syncLogId },
                    data: {
                        status: 'failed',
                        errorMessage: error.message,
                        completedAt: new Date(),
                    },
                });
            }
            throw error;
        }
    }
    async handleContinuousSync(job) {
        return this.handleInitialSync(job);
    }
};
exports.OrdersSyncWorker = OrdersSyncWorker;
__decorate([
    (0, bull_1.Process)('initial-sync'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrdersSyncWorker.prototype, "handleInitialSync", null);
__decorate([
    (0, bull_1.Process)('sync'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrdersSyncWorker.prototype, "handleContinuousSync", null);
exports.OrdersSyncWorker = OrdersSyncWorker = OrdersSyncWorker_1 = __decorate([
    (0, bull_1.Processor)('orders-sync'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        shopify_service_1.ShopifyService,
        shopify_rest_service_1.ShopifyRestService])
], OrdersSyncWorker);
//# sourceMappingURL=orders-sync.worker.js.map