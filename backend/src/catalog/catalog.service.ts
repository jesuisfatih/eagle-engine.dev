import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CatalogService {
  constructor(private prisma: PrismaService) {}

  async getProducts(merchantId: string, filters?: { search?: string; limit?: number }) {
    const where: any = { merchantId };

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { vendor: { contains: filters.search, mode: 'insensitive' } },
        { tags: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.catalogProduct.findMany({
      where,
      include: {
        variants: {
          take: 10,
        },
      },
      take: filters?.limit || 50,
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getProduct(productId: string) {
    return this.prisma.catalogProduct.findUnique({
      where: { id: productId },
      include: {
        variants: true,
      },
    });
  }

  async getVariant(variantId: string) {
    return this.prisma.catalogVariant.findUnique({
      where: { id: variantId },
      include: {
        product: true,
      },
    });
  }
}



