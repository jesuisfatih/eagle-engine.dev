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
exports.CatalogService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CatalogService = class CatalogService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProducts(merchantId, filters) {
        const where = { merchantId };
        if (filters?.search) {
            where.OR = [
                { title: { contains: filters.search, mode: 'insensitive' } },
                { vendor: { contains: filters.search, mode: 'insensitive' } },
                { tags: { contains: filters.search, mode: 'insensitive' } },
            ];
        }
        return this.prisma.catalogProduct.findMany({
            where,
            include: {
                variants: {
                    take: 10,
                },
            },
            take: filters?.limit || 50,
            orderBy: { updatedAt: 'desc' },
        });
    }
    async getProduct(productId) {
        return this.prisma.catalogProduct.findUnique({
            where: { id: productId },
            include: {
                variants: true,
            },
        });
    }
    async getVariant(variantId) {
        return this.prisma.catalogVariant.findUnique({
            where: { id: variantId },
            include: {
                product: true,
            },
        });
    }
};
exports.CatalogService = CatalogService;
exports.CatalogService = CatalogService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CatalogService);
//# sourceMappingURL=catalog.service.js.map