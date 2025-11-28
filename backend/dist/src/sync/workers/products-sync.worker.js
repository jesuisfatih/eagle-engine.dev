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
var ProductsSyncWorker_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsSyncWorker = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const shopify_service_1 = require("../../shopify/shopify.service");
const shopify_graphql_service_1 = require("../../shopify/shopify-graphql.service");
let ProductsSyncWorker = ProductsSyncWorker_1 = class ProductsSyncWorker {
    prisma;
    shopifyService;
    shopifyGraphql;
    logger = new common_1.Logger(ProductsSyncWorker_1.name);
    constructor(prisma, shopifyService, shopifyGraphql) {
        this.prisma = prisma;
        this.shopifyService = shopifyService;
        this.shopifyGraphql = shopifyGraphql;
    }
    async handleInitialSync(job) {
        const { merchantId, syncLogId } = job.data;
        this.logger.log(`Starting initial products sync for merchant: ${merchantId}`);
        try {
            const merchant = await this.prisma.merchant.findUnique({
                where: { id: merchantId },
            });
            if (!merchant) {
                throw new Error('Merchant not found');
            }
            let cursor;
            let hasNextPage = true;
            let processed = 0;
            while (hasNextPage) {
                const result = await this.shopifyGraphql.getProductsWithVariants(merchant.shopDomain, merchant.accessToken, 50, cursor);
                const products = result.products.edges;
                for (const edge of products) {
                    const product = edge.node;
                    const catalogProduct = await this.prisma.catalogProduct.upsert({
                        where: {
                            merchantId_shopifyProductId: {
                                merchantId,
                                shopifyProductId: BigInt(product.legacyResourceId),
                            },
                        },
                        create: {
                            merchantId,
                            shopifyProductId: BigInt(product.legacyResourceId),
                            title: product.title,
                            handle: product.handle,
                            description: product.description,
                            vendor: product.vendor,
                            productType: product.productType,
                            tags: product.tags?.join(', '),
                            status: product.status,
                            images: product.images?.edges?.map((e) => e.node) || [],
                            rawData: product,
                        },
                        update: {
                            title: product.title,
                            handle: product.handle,
                            description: product.description,
                            vendor: product.vendor,
                            productType: product.productType,
                            tags: product.tags?.join(', '),
                            status: product.status,
                            images: product.images?.edges?.map((e) => e.node) || [],
                            rawData: product,
                            syncedAt: new Date(),
                        },
                    });
                    if (product.variants?.edges) {
                        for (const variantEdge of product.variants.edges) {
                            const variant = variantEdge.node;
                            await this.prisma.catalogVariant.upsert({
                                where: {
                                    shopifyVariantId: BigInt(variant.legacyResourceId),
                                },
                                create: {
                                    productId: catalogProduct.id,
                                    shopifyVariantId: BigInt(variant.legacyResourceId),
                                    sku: variant.sku,
                                    title: variant.title,
                                    price: variant.price ? parseFloat(variant.price) : 0,
                                    compareAtPrice: variant.compareAtPrice ? parseFloat(variant.compareAtPrice) : null,
                                    inventoryQuantity: variant.inventoryQuantity || 0,
                                    weight: null,
                                    weightUnit: null,
                                    option1: variant.selectedOptions?.[0]?.value,
                                    option2: variant.selectedOptions?.[1]?.value,
                                    option3: variant.selectedOptions?.[2]?.value,
                                    rawData: variant,
                                },
                                update: {
                                    sku: variant.sku,
                                    title: variant.title,
                                    price: variant.price ? parseFloat(variant.price) : 0,
                                    compareAtPrice: variant.compareAtPrice ? parseFloat(variant.compareAtPrice) : null,
                                    inventoryQuantity: variant.inventoryQuantity || 0,
                                    weight: null,
                                    weightUnit: null,
                                    option1: variant.selectedOptions?.[0]?.value,
                                    option2: variant.selectedOptions?.[1]?.value,
                                    option3: variant.selectedOptions?.[2]?.value,
                                    rawData: variant,
                                    syncedAt: new Date(),
                                },
                            });
                        }
                    }
                    processed++;
                }
                hasNextPage = result.products.pageInfo.hasNextPage;
                cursor = result.products.pageInfo.endCursor;
                await job.progress((processed / 100) * 100);
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
            this.logger.log(`Completed products sync. Processed ${processed} products.`);
            return { processed };
        }
        catch (error) {
            this.logger.error('Products sync failed', error);
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
exports.ProductsSyncWorker = ProductsSyncWorker;
__decorate([
    (0, bull_1.Process)('initial-sync'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductsSyncWorker.prototype, "handleInitialSync", null);
__decorate([
    (0, bull_1.Process)('sync'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProductsSyncWorker.prototype, "handleContinuousSync", null);
exports.ProductsSyncWorker = ProductsSyncWorker = ProductsSyncWorker_1 = __decorate([
    (0, bull_1.Processor)('products-sync'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        shopify_service_1.ShopifyService,
        shopify_graphql_service_1.ShopifyGraphqlService])
], ProductsSyncWorker);
//# sourceMappingURL=products-sync.worker.js.map