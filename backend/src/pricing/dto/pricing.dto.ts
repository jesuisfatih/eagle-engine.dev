import { IsString, IsNumber, IsBoolean, IsOptional, IsArray, IsEnum, Min, Max, ValidateNested, IsDateString } from 'class-validator';
import { Transform, Type } from 'class-transformer';

/**
 * Discount Type Enum
 */
export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed',
  TIERED = 'tiered',
}

/**
 * Rule Scope Enum
 */
export enum RuleScope {
  GLOBAL = 'global',
  COMPANY = 'company',
  PRODUCT = 'product',
  CATEGORY = 'category',
}

/**
 * Calculate Prices DTO
 */
export class CalculatePricesDto {
  @IsArray()
  @IsString({ each: true })
  variantIds: string[];

  @IsOptional()
  quantities?: Record<string, number>;

  @IsNumber()
  @IsOptional()
  @Min(0)
  cartTotal?: number;
}

/**
 * Pricing Rule DTO
 */
export class CreatePricingRuleDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(DiscountType)
  discountType: DiscountType;

  @IsNumber()
  @Min(0)
  @Max(100)
  discountValue: number;

  @IsEnum(RuleScope)
  @IsOptional()
  scope?: RuleScope;

  @IsString()
  @IsOptional()
  companyId?: string;

  @IsString()
  @IsOptional()
  productId?: string;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  minQuantity?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  minOrderValue?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @IsOptional()
  priority?: number;

  @IsDateString()
  @IsOptional()
  startsAt?: string;

  @IsDateString()
  @IsOptional()
  endsAt?: string;
}

/**
 * Update Pricing Rule DTO
 */
export class UpdatePricingRuleDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(DiscountType)
  @IsOptional()
  discountType?: DiscountType;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  discountValue?: number;

  @IsEnum(RuleScope)
  @IsOptional()
  scope?: RuleScope;

  @IsString()
  @IsOptional()
  companyId?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  minQuantity?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  minOrderValue?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @IsOptional()
  priority?: number;

  @IsDateString()
  @IsOptional()
  startsAt?: string;

  @IsDateString()
  @IsOptional()
  endsAt?: string;
}

/**
 * Toggle Rule DTO
 */
export class ToggleRuleDto {
  @IsBoolean()
  isActive: boolean;
}

/**
 * Get Rules Query DTO
 */
export class GetRulesQueryDto {
  @IsString()
  @IsOptional()
  isActive?: string;

  @IsString()
  @IsOptional()
  companyId?: string;

  @IsString()
  @IsOptional()
  scope?: string;
}
