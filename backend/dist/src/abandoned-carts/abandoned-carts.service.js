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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbandonedCartsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AbandonedCartsService = class AbandonedCartsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAbandonedCarts(merchantId) {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        return this.prisma.cart.findMany({
            where: {
                merchantId,
                status: 'draft',
                updatedAt: { lt: oneHourAgo },
                convertedToOrderId: null,
            },
            include: {
                items: {
                    include: {
                        variant: {
                            include: {
                                product: true,
                            },
                        },
                    },
                },
                company: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                createdBy: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });
    }
    async syncShopifyCart(data) {
        const merchantId = '6ecc682b-98ee-472d-977b-cffbbae081b8';
        let cart = await this.prisma.cart.findFirst({
            where: {
                merchantId,
                shopifyCartId: data.cartToken,
            },
        });
        if (!cart) {
            const companyId = data.companyId || null;
            const userId = data.userId || null;
            cart = await this.prisma.cart.create({
                data: {
                    merchantId,
                    companyId,
                    createdByUserId: userId || merchantId,
                    shopifyCartId: data.cartToken,
                    status: 'draft',
                },
            });
        }
        await this.prisma.cartItem.deleteMany({
            where: { cartId: cart.id },
        });
        for (const item of data.items || []) {
            await this.prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    shopifyVariantId: BigInt(item.variant_id),
                    shopifyProductId: BigInt(item.product_id),
                    sku: item.sku,
                    title: item.title,
                    quantity: item.quantity,
                    listPrice: parseFloat(item.price) / 100,
                    unitPrice: parseFloat(item.price) / 100,
                },
            });
        }
        return cart;
    }
};
exports.AbandonedCartsService = AbandonedCartsService;
exports.AbandonedCartsService = AbandonedCartsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AbandonedCartsService);
//# sourceMappingURL=abandoned-carts.service.js.map