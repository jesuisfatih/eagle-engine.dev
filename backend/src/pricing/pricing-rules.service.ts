import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreatePricingRuleDto {
  name: string;
  description?: string;
  targetType: 'all' | 'company' | 'company_group';
  targetCompanyId?: string;
  targetCompanyGroup?: string;
  scopeType: 'all' | 'products' | 'collections' | 'tags' | 'variants';
  scopeProductIds?: bigint[];
  scopeCollectionIds?: bigint[];
  scopeTags?: string;
  scopeVariantIds?: bigint[];
  discountType: 'percentage' | 'fixed_amount' | 'fixed_price' | 'qty_break';
  discountValue?: number;
  discountPercentage?: number;
  qtyBreaks?: any[];
  minCartAmount?: number;
  priority?: number;
  isActive?: boolean;
  validFrom?: Date;
  validUntil?: Date;
}

@Injectable()
export class PricingRulesService {
  private readonly logger = new Logger(PricingRulesService.name);

  constructor(private prisma: PrismaService) {}

  async create(merchantId: string, dto: CreatePricingRuleDto) {
    return this.prisma.pricingRule.create({
      data: {
        merchantId,
        name: dto.name,
        description: dto.description,
        targetType: dto.targetType,
        targetCompanyId: dto.targetCompanyId,
        targetCompanyGroup: dto.targetCompanyGroup,
        scopeType: dto.scopeType,
        scopeProductIds: dto.scopeProductIds || [],
        scopeCollectionIds: dto.scopeCollectionIds || [],
        scopeTags: dto.scopeTags,
        scopeVariantIds: dto.scopeVariantIds || [],
        discountType: dto.discountType,
        discountValue: dto.discountValue,
        discountPercentage: dto.discountPercentage,
        qtyBreaks: dto.qtyBreaks,
        minCartAmount: dto.minCartAmount,
        priority: dto.priority || 0,
        isActive: dto.isActive !== false,
        validFrom: dto.validFrom,
        validUntil: dto.validUntil,
      },
    });
  }

  async findAll(merchantId: string, filters?: { isActive?: boolean; companyId?: string }) {
    const where: any = { merchantId };

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters?.companyId) {
      where.OR = [
        { targetType: 'all' },
        { targetType: 'company', targetCompanyId: filters.companyId },
      ];
    }

    return this.prisma.pricingRule.findMany({
      where,
      include: {
        targetCompany: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(id: string, merchantId: string) {
    const rule = await this.prisma.pricingRule.findFirst({
      where: { id, merchantId },
      include: {
        targetCompany: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!rule) {
      throw new NotFoundException('Pricing rule not found');
    }

    return rule;
  }

  async update(id: string, merchantId: string, dto: Partial<CreatePricingRuleDto>) {
    await this.findOne(id, merchantId); // Check exists

    return this.prisma.pricingRule.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        targetType: dto.targetType,
        targetCompanyId: dto.targetCompanyId,
        targetCompanyGroup: dto.targetCompanyGroup,
        scopeType: dto.scopeType,
        scopeProductIds: dto.scopeProductIds,
        scopeCollectionIds: dto.scopeCollectionIds,
        scopeTags: dto.scopeTags,
        scopeVariantIds: dto.scopeVariantIds,
        discountType: dto.discountType,
        discountValue: dto.discountValue,
        discountPercentage: dto.discountPercentage,
        qtyBreaks: dto.qtyBreaks,
        minCartAmount: dto.minCartAmount,
        priority: dto.priority,
        isActive: dto.isActive,
        validFrom: dto.validFrom,
        validUntil: dto.validUntil,
      },
    });
  }

  async delete(id: string, merchantId: string) {
    await this.findOne(id, merchantId); // Check exists

    return this.prisma.pricingRule.delete({
      where: { id },
    });
  }

  async toggleActive(id: string, merchantId: string, isActive: boolean) {
    await this.findOne(id, merchantId);

    return this.prisma.pricingRule.update({
      where: { id },
      data: { isActive },
    });
  }
}

