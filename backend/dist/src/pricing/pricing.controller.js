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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PricingController = void 0;
const common_1 = require("@nestjs/common");
const pricing_service_1 = require("./pricing.service");
const public_decorator_1 = require("../auth/decorators/public.decorator");
let PricingController = class PricingController {
    pricingService;
    constructor(pricingService) {
        this.pricingService = pricingService;
    }
    async calculatePrices(body) {
        const merchantId = '6ecc682b-98ee-472d-977b-cffbbae081b8';
        const companyId = body.companyId || 'f0c2b2a5-4858-4d82-a542-5ce3bfe23a6d';
        const variantIds = body.variantIds.map((id) => BigInt(id));
        return this.pricingService.calculatePrices({
            merchantId,
            companyId,
            variantIds,
            quantities: body.quantities,
            cartTotal: body.cartTotal,
        });
    }
    async getRules(isActive, companyId) {
        const merchantId = '6ecc682b-98ee-472d-977b-cffbbae081b8';
        const filters = {};
        if (isActive !== undefined) {
            filters.isActive = isActive === 'true';
        }
        if (companyId) {
            filters.companyId = companyId;
        }
        return this.pricingService.getRules(merchantId, filters);
    }
    async getRule(id) {
        const merchantId = '6ecc682b-98ee-472d-977b-cffbbae081b8';
        return this.pricingService.getRule(id, merchantId);
    }
    async createRule(body) {
        const merchantId = '6ecc682b-98ee-472d-977b-cffbbae081b8';
        return this.pricingService.createRule(merchantId, body);
    }
    async updateRule(id, body) {
        const merchantId = '6ecc682b-98ee-472d-977b-cffbbae081b8';
        return this.pricingService.updateRule(id, merchantId, body);
    }
    async deleteRule(id) {
        const merchantId = '6ecc682b-98ee-472d-977b-cffbbae081b8';
        return this.pricingService.deleteRule(id, merchantId);
    }
    async toggleRule(id, isActive) {
        const merchantId = '6ecc682b-98ee-472d-977b-cffbbae081b8';
        return this.pricingService.toggleRuleActive(id, merchantId, isActive);
    }
};
exports.PricingController = PricingController;
__decorate([
    (0, common_1.Post)('calculate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PricingController.prototype, "calculatePrices", null);
__decorate([
    (0, common_1.Get)('rules'),
    __param(0, (0, common_1.Query)('isActive')),
    __param(1, (0, common_1.Query)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PricingController.prototype, "getRules", null);
__decorate([
    (0, common_1.Get)('rules/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PricingController.prototype, "getRule", null);
__decorate([
    (0, common_1.Post)('rules'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PricingController.prototype, "createRule", null);
__decorate([
    (0, common_1.Put)('rules/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PricingController.prototype, "updateRule", null);
__decorate([
    (0, common_1.Delete)('rules/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PricingController.prototype, "deleteRule", null);
__decorate([
    (0, common_1.Put)('rules/:id/toggle'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('isActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Boolean]),
    __metadata("design:returntype", Promise)
], PricingController.prototype, "toggleRule", null);
exports.PricingController = PricingController = __decorate([
    (0, common_1.Controller)('pricing'),
    (0, public_decorator_1.Public)(),
    __metadata("design:paramtypes", [pricing_service_1.PricingService])
], PricingController);
//# sourceMappingURL=pricing.controller.js.map