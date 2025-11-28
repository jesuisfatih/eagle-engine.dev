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
exports.SyncController = void 0;
const common_1 = require("@nestjs/common");
const sync_service_1 = require("./sync.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const public_decorator_1 = require("../auth/decorators/public.decorator");
let SyncController = class SyncController {
    syncService;
    constructor(syncService) {
        this.syncService = syncService;
    }
    async triggerInitialSync(merchantId) {
        return this.syncService.triggerInitialSync(merchantId);
    }
    async triggerInitialSyncAuth(merchantId) {
        return this.syncService.triggerInitialSync(merchantId);
    }
    async triggerCustomersSync(merchantId) {
        const id = merchantId || '6ecc682b-98ee-472d-977b-cffbbae081b8';
        return this.syncService.triggerCustomersSync(id);
    }
    async triggerProductsSync(merchantId) {
        const id = merchantId || '6ecc682b-98ee-472d-977b-cffbbae081b8';
        return this.syncService.triggerProductsSync(id);
    }
    async triggerOrdersSync(merchantId) {
        const id = merchantId || '6ecc682b-98ee-472d-977b-cffbbae081b8';
        return this.syncService.triggerOrdersSync(id);
    }
    async getSyncStatus() {
        const merchantId = '6ecc682b-98ee-472d-977b-cffbbae081b8';
        return this.syncService.getSyncStatus(merchantId);
    }
};
exports.SyncController = SyncController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('initial'),
    __param(0, (0, common_1.Body)('merchantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SyncController.prototype, "triggerInitialSync", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('initial-auth'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('merchantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SyncController.prototype, "triggerInitialSyncAuth", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('customers'),
    __param(0, (0, common_1.Body)('merchantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SyncController.prototype, "triggerCustomersSync", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('products'),
    __param(0, (0, common_1.Body)('merchantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SyncController.prototype, "triggerProductsSync", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('orders'),
    __param(0, (0, common_1.Body)('merchantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SyncController.prototype, "triggerOrdersSync", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SyncController.prototype, "getSyncStatus", null);
exports.SyncController = SyncController = __decorate([
    (0, common_1.Controller)('sync'),
    __metadata("design:paramtypes", [sync_service_1.SyncService])
], SyncController);
//# sourceMappingURL=sync.controller.js.map