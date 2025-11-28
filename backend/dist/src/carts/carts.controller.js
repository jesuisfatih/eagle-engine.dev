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
exports.CartsController = void 0;
const common_1 = require("@nestjs/common");
const carts_service_1 = require("./carts.service");
const cart_items_service_1 = require("./cart-items.service");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const public_decorator_1 = require("../auth/decorators/public.decorator");
let CartsController = class CartsController {
    cartsService;
    cartItemsService;
    constructor(cartsService, cartItemsService) {
        this.cartsService = cartsService;
        this.cartItemsService = cartItemsService;
    }
    async getActiveCart(companyId, userId) {
        const cId = companyId || 'f0c2b2a5-4858-4d82-a542-5ce3bfe23a6d';
        const uId = userId || 'c67273cf-acea-41db-9ff5-8f6e3bbb5c38';
        return this.cartsService.findActiveCart(cId, uId);
    }
    async getCart(id) {
        return this.cartsService.findById(id);
    }
    async createCart(body) {
        const merchantId = body.merchantId || '6ecc682b-98ee-472d-977b-cffbbae081b8';
        const companyId = body.companyId || 'f0c2b2a5-4858-4d82-a542-5ce3bfe23a6d';
        const userId = body.createdByUserId || 'c67273cf-acea-41db-9ff5-8f6e3bbb5c38';
        return this.cartsService.create(companyId, userId, merchantId);
    }
    async addItem(cartId, body) {
        const item = await this.cartItemsService.addItem(cartId, body.variantId, BigInt(body.shopifyVariantId), body.quantity);
        await this.cartsService.recalculate(cartId);
        return item;
    }
    async updateItemQuantity(cartId, itemId, quantity) {
        const item = await this.cartItemsService.updateQuantity(itemId, quantity);
        await this.cartsService.recalculate(cartId);
        return item;
    }
    async removeItem(cartId, itemId) {
        await this.cartItemsService.removeItem(itemId);
        return this.cartsService.recalculate(cartId);
    }
    async submitForApproval(cartId) {
        return this.cartsService.submitForApproval(cartId);
    }
    async approve(cartId, userId) {
        return this.cartsService.approve(cartId, userId);
    }
    async reject(cartId) {
        return this.cartsService.reject(cartId);
    }
    async listCompanyCarts(companyId, status) {
        return this.cartsService.listCompanyCarts(companyId, status);
    }
};
exports.CartsController = CartsController;
__decorate([
    (0, common_1.Get)('active'),
    __param(0, (0, common_1.Query)('companyId')),
    __param(1, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CartsController.prototype, "getActiveCart", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CartsController.prototype, "getCart", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CartsController.prototype, "createCart", null);
__decorate([
    (0, common_1.Post)(':id/items'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CartsController.prototype, "addItem", null);
__decorate([
    (0, common_1.Put)(':id/items/:itemId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('itemId')),
    __param(2, (0, common_1.Body)('quantity')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number]),
    __metadata("design:returntype", Promise)
], CartsController.prototype, "updateItemQuantity", null);
__decorate([
    (0, common_1.Delete)(':id/items/:itemId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('itemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CartsController.prototype, "removeItem", null);
__decorate([
    (0, common_1.Post)(':id/submit'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CartsController.prototype, "submitForApproval", null);
__decorate([
    (0, common_1.Post)(':id/approve'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CartsController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)(':id/reject'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CartsController.prototype, "reject", null);
__decorate([
    (0, common_1.Get)('company/list'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('companyId')),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CartsController.prototype, "listCompanyCarts", null);
exports.CartsController = CartsController = __decorate([
    (0, common_1.Controller)('carts'),
    (0, public_decorator_1.Public)(),
    __metadata("design:paramtypes", [carts_service_1.CartsService,
        cart_items_service_1.CartItemsService])
], CartsController);
//# sourceMappingURL=carts.controller.js.map