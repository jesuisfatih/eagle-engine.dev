import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ShopifyCustomersService {
  constructor(private prisma: PrismaService) {}

  async findAll(merchantId: string, filters?: { search?: string }) {
    const where: any = { merchantId };

    if (filters?.search) {
      where.OR = [
        { email: { contains: filters.search, mode: 'insensitive' } },
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const customers = await this.prisma.shopifyCustomer.findMany({
      where,
      orderBy: { syncedAt: 'desc' },
      take: 100,
    });

    // Convert BigInt to string for JSON serialization
    return customers.map(c => ({
      ...c,
      shopifyCustomerId: c.shopifyCustomerId.toString(),
    }));
  }

  async findOne(id: string) {
    return this.prisma.shopifyCustomer.findUnique({
      where: { id },
    });
  }

  async convertToCompany(customerId: string, merchantId: string) {
    const customer = await this.prisma.shopifyCustomer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    // Check if already converted
    const existingCompany = await this.prisma.company.findFirst({
      where: {
        merchantId,
        createdByShopifyCustomerId: customer.shopifyCustomerId,
      },
    });

    if (existingCompany) {
      throw new Error('This customer is already converted to a B2B company');
    }

    // Create company
    const company = await this.prisma.company.create({
      data: {
        merchantId,
        name: `${customer.firstName} ${customer.lastName}`.trim() || customer.email || 'New Company',
        email: customer.email,
        phone: customer.phone,
        status: 'pending',
        createdByShopifyCustomerId: customer.shopifyCustomerId,
      },
    });

    // Create admin user for company
    const companyUser = await this.prisma.companyUser.create({
      data: {
        companyId: company.id,
        shopifyCustomerId: customer.shopifyCustomerId,
        email: customer.email || '',
        firstName: customer.firstName,
        lastName: customer.lastName,
        role: 'admin',
        isActive: false, // Will be activated on invitation accept
      },
    });

    return {
      company,
      companyUser,
    };
  }
}




