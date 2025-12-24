import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { 
  PaginationParams, 
  buildPrismaSkipTake, 
  buildPrismaOrderBy,
  createPaginatedResponse 
} from '../common/utils/pagination.util';

/**
 * Optimized select for product list (minimal data for grid/list view)
 */
const PRODUCT_LIST_SELECT = {
  id: true,
  shopifyProductId: true,
  title: true,
  vendor: true,
  productType: true,
  status: true,
  images: true, // Use images JSON field instead of featuredImageUrl
  tags: true,
  createdAt: true,
  updatedAt: true,
  variants: {
    take: 1, // Only first variant for price display
    select: {
      id: true,
      price: true,
      compareAtPrice: true,
      inventoryQuantity: true,
    },
  },
  _count: {
    select: {
      variants: true,
    },
  },
} as const;

/**
 * Optimized include for product detail
 */
const PRODUCT_DETAIL_SELECT = {
  id: true,
  shopifyProductId: true,
  title: true,
  description: true,
  vendor: true,
  productType: true,
  status: true,
  images: true, // JSON field containing all images
  tags: true,
  rawData: true, // Contains options and other Shopify data
  createdAt: true,
  updatedAt: true,
  variants: {
    select: {
      id: true,
      shopifyVariantId: true,
      title: true,
      sku: true,
      price: true,
      compareAtPrice: true,
      inventoryQuantity: true,
      option1: true,
      option2: true,
      option3: true,
      rawData: true, // Contains imageUrl and position
    },
  },
} as const;

@Injectable()
export class CatalogService {
  constructor(private prisma: PrismaService) {}

  async getProducts(merchantId: string, filters?: { 
    search?: string; 
    page?: number;
    limit?: number;
    status?: string;
    vendor?: string;
    productType?: string;
  }) {
    const pagination: PaginationParams = {
      page: filters?.page || 1,
      limit: Math.min(filters?.limit || 20, 100), // Max 100 per page
      sortBy: 'updatedAt',
      sortOrder: 'desc',
    };

    const where: any = { merchantId };

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { vendor: { contains: filters.search, mode: 'insensitive' } },
        { tags: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.vendor) {
      where.vendor = filters.vendor;
    }

    if (filters?.productType) {
      where.productType = filters.productType;
    }

    const [data, total] = await Promise.all([
      this.prisma.catalogProduct.findMany({
        where,
        select: PRODUCT_LIST_SELECT,
        orderBy: buildPrismaOrderBy(pagination, ['updatedAt', 'title', 'createdAt']),
        ...buildPrismaSkipTake(pagination),
      }),
      this.prisma.catalogProduct.count({ where }),
    ]);

    return createPaginatedResponse(data, total, pagination);
  }

  async getProduct(productId: string) {
    return this.prisma.catalogProduct.findUnique({
      where: { id: productId },
      select: PRODUCT_DETAIL_SELECT,
    });
  }

  async getVariant(variantId: string) {
    return this.prisma.catalogVariant.findUnique({
      where: { id: variantId },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            images: true,
            status: true,
          },
        },
      },
    });
  }

  /**
   * Get product filters for sidebar (vendors, types, etc.)
   */
  async getProductFilters(merchantId: string) {
    const [vendors, productTypes] = await Promise.all([
      this.prisma.catalogProduct.groupBy({
        by: ['vendor'],
        where: { merchantId, vendor: { not: null } },
        _count: { vendor: true },
        orderBy: { _count: { vendor: 'desc' } },
        take: 50,
      }),
      this.prisma.catalogProduct.groupBy({
        by: ['productType'],
        where: { merchantId, productType: { not: null } },
        _count: { productType: true },
        orderBy: { _count: { productType: 'desc' } },
        take: 50,
      }),
    ]);

    return {
      vendors: vendors.filter(v => v.vendor).map(v => ({ name: v.vendor, count: v._count.vendor })),
      productTypes: productTypes.filter(p => p.productType).map(p => ({ name: p.productType, count: p._count.productType })),
    };
  }
}




