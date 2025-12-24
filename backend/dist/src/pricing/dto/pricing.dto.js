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
exports.GetRulesQueryDto = exports.ToggleRuleDto = exports.UpdatePricingRuleDto = exports.CreatePricingRuleDto = exports.CalculatePricesDto = exports.RuleScope = exports.DiscountType = void 0;
const class_validator_1 = require("class-validator");
var DiscountType;
(function (DiscountType) {
    DiscountType["PERCENTAGE"] = "percentage";
    DiscountType["FIXED"] = "fixed";
    DiscountType["TIERED"] = "tiered";
})(DiscountType || (exports.DiscountType = DiscountType = {}));
var RuleScope;
(function (RuleScope) {
    RuleScope["GLOBAL"] = "global";
    RuleScope["COMPANY"] = "company";
    RuleScope["PRODUCT"] = "product";
    RuleScope["CATEGORY"] = "category";
})(RuleScope || (exports.RuleScope = RuleScope = {}));
class CalculatePricesDto {
    variantIds;
    quantities;
    cartTotal;
}
exports.CalculatePricesDto = CalculatePricesDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CalculatePricesDto.prototype, "variantIds", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CalculatePricesDto.prototype, "quantities", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CalculatePricesDto.prototype, "cartTotal", void 0);
class CreatePricingRuleDto {
    name;
    description;
    discountType;
    discountValue;
    scope;
    companyId;
    productId;
    categoryId;
    minQuantity;
    minOrderValue;
    isActive;
    priority;
    startsAt;
    endsAt;
}
exports.CreatePricingRuleDto = CreatePricingRuleDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePricingRuleDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePricingRuleDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(DiscountType),
    __metadata("design:type", String)
], CreatePricingRuleDto.prototype, "discountType", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], CreatePricingRuleDto.prototype, "discountValue", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(RuleScope),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePricingRuleDto.prototype, "scope", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePricingRuleDto.prototype, "companyId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePricingRuleDto.prototype, "productId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePricingRuleDto.prototype, "categoryId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreatePricingRuleDto.prototype, "minQuantity", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreatePricingRuleDto.prototype, "minOrderValue", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], CreatePricingRuleDto.prototype, "isActive", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreatePricingRuleDto.prototype, "priority", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePricingRuleDto.prototype, "startsAt", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePricingRuleDto.prototype, "endsAt", void 0);
class UpdatePricingRuleDto {
    name;
    description;
    discountType;
    discountValue;
    scope;
    companyId;
    minQuantity;
    minOrderValue;
    isActive;
    priority;
    startsAt;
    endsAt;
}
exports.UpdatePricingRuleDto = UpdatePricingRuleDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdatePricingRuleDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdatePricingRuleDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(DiscountType),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdatePricingRuleDto.prototype, "discountType", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], UpdatePricingRuleDto.prototype, "discountValue", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(RuleScope),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdatePricingRuleDto.prototype, "scope", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdatePricingRuleDto.prototype, "companyId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdatePricingRuleDto.prototype, "minQuantity", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], UpdatePricingRuleDto.prototype, "minOrderValue", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UpdatePricingRuleDto.prototype, "isActive", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdatePricingRuleDto.prototype, "priority", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdatePricingRuleDto.prototype, "startsAt", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdatePricingRuleDto.prototype, "endsAt", void 0);
class ToggleRuleDto {
    isActive;
}
exports.ToggleRuleDto = ToggleRuleDto;
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ToggleRuleDto.prototype, "isActive", void 0);
class GetRulesQueryDto {
    isActive;
    companyId;
    scope;
}
exports.GetRulesQueryDto = GetRulesQueryDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GetRulesQueryDto.prototype, "isActive", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GetRulesQueryDto.prototype, "companyId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], GetRulesQueryDto.prototype, "scope", void 0);
//# sourceMappingURL=pricing.dto.js.map