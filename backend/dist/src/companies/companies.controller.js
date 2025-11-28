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
exports.CompaniesController = void 0;
const common_1 = require("@nestjs/common");
const companies_service_1 = require("./companies.service");
const company_users_service_1 = require("./company-users.service");
const public_decorator_1 = require("../auth/decorators/public.decorator");
let CompaniesController = class CompaniesController {
    companiesService;
    companyUsersService;
    constructor(companiesService, companyUsersService) {
        this.companiesService = companiesService;
        this.companyUsersService = companyUsersService;
    }
    async findAll(status, search) {
        const merchantId = '6ecc682b-98ee-472d-977b-cffbbae081b8';
        return this.companiesService.findAll(merchantId, { status, search });
    }
    async getStats() {
        const merchantId = '6ecc682b-98ee-472d-977b-cffbbae081b8';
        return this.companiesService.getStats(merchantId);
    }
    async findOne(id) {
        const merchantId = '6ecc682b-98ee-472d-977b-cffbbae081b8';
        return this.companiesService.findOne(id, merchantId);
    }
    async create(body) {
        const merchantId = '6ecc682b-98ee-472d-977b-cffbbae081b8';
        return this.companiesService.create(merchantId, body);
    }
    async update(id, body) {
        const merchantId = '6ecc682b-98ee-472d-977b-cffbbae081b8';
        return this.companiesService.update(id, merchantId, body);
    }
    async delete(id) {
        const merchantId = '6ecc682b-98ee-472d-977b-cffbbae081b8';
        return this.companiesService.delete(id, merchantId);
    }
    async getCompanyUsers(companyId) {
        return this.companyUsersService.findByCompany(companyId);
    }
    async inviteUser(companyId, body) {
        return this.companyUsersService.invite(companyId, body);
    }
};
exports.CompaniesController = CompaniesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CompaniesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CompaniesController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CompaniesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CompaniesController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CompaniesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CompaniesController.prototype, "delete", null);
__decorate([
    (0, common_1.Get)(':id/users'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CompaniesController.prototype, "getCompanyUsers", null);
__decorate([
    (0, common_1.Post)(':id/users'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CompaniesController.prototype, "inviteUser", null);
exports.CompaniesController = CompaniesController = __decorate([
    (0, common_1.Controller)('companies'),
    (0, public_decorator_1.Public)(),
    __metadata("design:paramtypes", [companies_service_1.CompaniesService,
        company_users_service_1.CompanyUsersService])
], CompaniesController);
//# sourceMappingURL=companies.controller.js.map