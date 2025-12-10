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
exports.AbandonedCartsController = void 0;
const common_1 = require("@nestjs/common");
const abandoned_carts_service_1 = require("./abandoned-carts.service");
const public_decorator_1 = require("../auth/decorators/public.decorator");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
let AbandonedCartsController = class AbandonedCartsController {
    abandonedCartsService;
    constructor(abandonedCartsService) {
        this.abandonedCartsService = abandonedCartsService;
    }
    async getAbandonedCarts(merchantId, companyId, includeRecent) {
        if (!merchantId) {
            throw new common_1.BadRequestException('Merchant ID required');
        }
        let includeRecentBool = false;
        if (includeRecent === 'true' || includeRecent === 'True' || includeRecent === 'TRUE' || includeRecent === true) {
            includeRecentBool = true;
        }
        return this.abandonedCartsService.getAbandonedCarts(merchantId, companyId, includeRecentBool);
    }
    async getMyAbandonedCarts(merchantId, companyId) {
        if (!merchantId || !companyId) {
            throw new common_1.BadRequestException('Merchant ID and Company ID required');
        }
        return this.abandonedCartsService.getAbandonedCarts(merchantId, companyId);
    }
    async syncCart(data) {
        return this.abandonedCartsService.syncShopifyCart(data);
    }
    async trackCart(data) {
        console.log('📦 Cart tracking received:', {
            cartToken: data.cartToken,
            itemCount: data.items?.length || 0,
            customerEmail: data.customerEmail,
        });
        try {
            const result = await this.abandonedCartsService.trackCart(data);
            console.log('✅ Cart tracked successfully:', result.id);
            return result;
        }
        catch (error) {
            console.error('❌ Cart tracking failed:', error.message);
            return {
                statusCode: 500,
                message: error.message || 'Internal server error',
                error: 'Cart tracking failed',
            };
        }
    }
    async getCartActivity(cartId) {
        return this.abandonedCartsService.getCartActivityLogs(cartId);
    }
    async getAllCartActivity(merchantId, limit) {
        if (!merchantId) {
            throw new common_1.BadRequestException('Merchant ID required');
        }
        return this.abandonedCartsService.getAllCartActivityLogs(merchantId, limit ? parseInt(limit) : 100);
    }
};
exports.AbandonedCartsController = AbandonedCartsController;
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)('merchantId')),
    __param(1, (0, common_1.Query)('companyId')),
    __param(2, (0, common_1.Query)('includeRecent')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AbandonedCartsController.prototype, "getAbandonedCarts", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('my-carts'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('merchantId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AbandonedCartsController.prototype, "getMyAbandonedCarts", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('sync'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AbandonedCartsController.prototype, "syncCart", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('track'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AbandonedCartsController.prototype, "trackCart", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('activity/:cartId'),
    __param(0, (0, common_1.Param)('cartId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AbandonedCartsController.prototype, "getCartActivity", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('activity'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('merchantId')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AbandonedCartsController.prototype, "getAllCartActivity", null);
exports.AbandonedCartsController = AbandonedCartsController = __decorate([
    (0, common_1.Controller)('abandoned-carts'),
    __metadata("design:paramtypes", [abandoned_carts_service_1.AbandonedCartsService])
], AbandonedCartsController);
//# sourceMappingURL=abandoned-carts.controller.js.map