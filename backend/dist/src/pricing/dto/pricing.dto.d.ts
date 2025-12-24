export declare enum DiscountType {
    PERCENTAGE = "percentage",
    FIXED = "fixed",
    TIERED = "tiered"
}
export declare enum RuleScope {
    GLOBAL = "global",
    COMPANY = "company",
    PRODUCT = "product",
    CATEGORY = "category"
}
export declare class CalculatePricesDto {
    variantIds: string[];
    quantities?: Record<string, number>;
    cartTotal?: number;
}
export declare class CreatePricingRuleDto {
    name: string;
    description?: string;
    discountType: DiscountType;
    discountValue: number;
    scope?: RuleScope;
    companyId?: string;
    productId?: string;
    categoryId?: string;
    minQuantity?: number;
    minOrderValue?: number;
    isActive?: boolean;
    priority?: number;
    startsAt?: string;
    endsAt?: string;
}
export declare class UpdatePricingRuleDto {
    name?: string;
    description?: string;
    discountType?: DiscountType;
    discountValue?: number;
    scope?: RuleScope;
    companyId?: string;
    minQuantity?: number;
    minOrderValue?: number;
    isActive?: boolean;
    priority?: number;
    startsAt?: string;
    endsAt?: string;
}
export declare class ToggleRuleDto {
    isActive: boolean;
}
export declare class GetRulesQueryDto {
    isActive?: string;
    companyId?: string;
    scope?: string;
}
