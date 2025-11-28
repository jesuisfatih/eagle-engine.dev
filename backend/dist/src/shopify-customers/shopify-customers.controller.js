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
exports.ShopifyCustomersController = void 0;
const common_1 = require("@nestjs/common");
const shopify_customers_service_1 = require("./shopify-customers.service");
const public_decorator_1 = require("../auth/decorators/public.decorator");
let ShopifyCustomersController = class ShopifyCustomersController {
    shopifyCustomersService;
    constructor(shopifyCustomersService) {
        this.shopifyCustomersService = shopifyCustomersService;
    }
    async findAll(search) {
        const merchantId = '6ecc682b-98ee-472d-977b-cffbbae081b8';
        return this.shopifyCustomersService.findAll(merchantId, { search });
    }
    async findOne(id) {
        return this.shopifyCustomersService.findOne(id);
    }
    async convertToCompany(customerId) {
        const merchantId = '6ecc682b-98ee-472d-977b-cffbbae081b8';
        return this.shopifyCustomersService.convertToCompany(customerId, merchantId);
    }
};
exports.ShopifyCustomersController = ShopifyCustomersController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ShopifyCustomersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ShopifyCustomersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/convert-to-company'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ShopifyCustomersController.prototype, "convertToCompany", null);
exports.ShopifyCustomersController = ShopifyCustomersController = __decorate([
    (0, common_1.Controller)('shopify-customers'),
    (0, public_decorator_1.Public)(),
    __metadata("design:paramtypes", [shopify_customers_service_1.ShopifyCustomersService])
], ShopifyCustomersController);
//# sourceMappingURL=shopify-customers.controller.js.map