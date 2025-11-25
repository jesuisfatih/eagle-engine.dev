import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ShopifyCompanySyncService } from './shopify-company-sync.service';

@Injectable()
export class CompaniesService {
  constructor(
    private prisma: PrismaService,
    private shopifyCompanySync: ShopifyCompanySyncService,
  ) {}

  async findAll(merchantId: string, filters?: { status?: string; search?: string }) {
    const where: any = { merchantId };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.company.findMany({
      where,
      include: {
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            isActive: true,
          },
        },
        _count: {
          select: {
            users: true,
            orders: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, merchantId: string) {
    const company = await this.prisma.company.findFirst({
      where: { id, merchantId },
      include: {
        users: true,
        pricingRules: {
          where: { isActive: true },
        },
        orders: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  async create(merchantId: string, data: any) {
    const company = await this.prisma.company.create({
      data: {
        merchantId,
        name: data.name,
        legalName: data.legalName,
        taxId: data.taxId,
        email: data.email,
        phone: data.phone,
        website: data.website,
        billingAddress: data.billingAddress,
        shippingAddress: data.shippingAddress,
        companyGroup: data.companyGroup,
        status: 'pending',
      },
    });

    // Sync to Shopify after creation
    try {
      await this.shopifyCompanySync.syncCompanyToShopify(company.id);
    } catch (error) {
      console.error('Company Shopify sync failed:', error);
    }

    return company;
  }

  async update(id: string, merchantId: string, data: any) {
    await this.findOne(id, merchantId);

    const company = await this.prisma.company.update({
      where: { id },
      data: {
        name: data.name,
        legalName: data.legalName,
        taxId: data.taxId,
        email: data.email,
        phone: data.phone,
        website: data.website,
        billingAddress: data.billingAddress,
        shippingAddress: data.shippingAddress,
        companyGroup: data.companyGroup,
        status: data.status,
      },
    });

    // Sync updates to Shopify
    try {
      await this.shopifyCompanySync.updateCompanyInShopify(id);
    } catch (error) {
      console.error('Company Shopify update failed:', error);
    }

    return company;
  }

  async delete(id: string, merchantId: string) {
    await this.findOne(id, merchantId);
    return this.prisma.company.delete({ where: { id } });
  }

  async getStats(merchantId: string) {
    const [total, active, pending, suspended] = await Promise.all([
      this.prisma.company.count({ where: { merchantId } }),
      this.prisma.company.count({ where: { merchantId, status: 'active' } }),
      this.prisma.company.count({ where: { merchantId, status: 'pending' } }),
      this.prisma.company.count({ where: { merchantId, status: 'suspended' } }),
    ]);

    const totalUsers = await this.prisma.companyUser.count({
      where: { company: { merchantId } },
    });

    return {
      total,
      active,
      pending,
      suspended,
      totalUsers,
    };
  }
}




