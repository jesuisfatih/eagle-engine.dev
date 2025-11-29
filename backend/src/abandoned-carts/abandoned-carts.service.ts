import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AbandonedCartsService {
  constructor(private prisma: PrismaService) {}

  async getAbandonedCarts(merchantId: string, companyId?: string) {
    // Get carts older than 1 hour that aren't converted
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const where: any = {
      merchantId,
      status: 'draft',
      updatedAt: { lt: oneHourAgo },
      convertedToOrderId: null,
    };

    // If companyId provided, filter by company, otherwise show all (including anonymous)
    if (companyId) {
      where.companyId = companyId;
    }
    
    return this.prisma.cart.findMany({
      where,
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async syncShopifyCart(data: any) {
    const merchantId = '6ecc682b-98ee-472d-977b-cffbbae081b8';
    
    // Try to find user by email or shopifyCustomerId
    let companyId = data.companyId || null;
    let userId = data.userId || null;

    if (data.customerEmail && !userId) {
      // Try to find user by email
      const user = await this.prisma.companyUser.findUnique({
        where: { email: data.customerEmail },
        include: { company: true },
      });
      if (user) {
        userId = user.id;
        companyId = user.companyId;
      }
    }

    if (data.shopifyCustomerId && !userId) {
      // Try to find user by Shopify customer ID
      const user = await this.prisma.companyUser.findFirst({
        where: { shopifyCustomerId: BigInt(data.shopifyCustomerId) },
        include: { company: true },
      });
      if (user) {
        userId = user.id;
        companyId = user.companyId;
      }
    }
    
    // Find or create cart by shopifyCartId or cartToken
    let cart = await this.prisma.cart.findFirst({
      where: {
        merchantId,
        OR: [
          { shopifyCartId: data.cartToken || data.shopifyCartId },
          ...(data.cartToken ? [{ shopifyCartId: data.cartToken }] : []),
        ],
      },
    });

    if (!cart) {
      // Create new cart (can be anonymous if no userId)
      cart = await this.prisma.cart.create({
        data: {
          merchantId,
          companyId,
          createdByUserId: userId || merchantId, // Use merchantId as fallback for anonymous
          shopifyCartId: data.cartToken || data.shopifyCartId,
          status: 'draft',
        },
      });
    } else {
      // Update existing cart
      await this.prisma.cart.update({
        where: { id: cart.id },
        data: {
          companyId: companyId || cart.companyId,
          createdByUserId: userId || cart.createdByUserId,
          updatedAt: new Date(),
        },
      });
    }

    // Update cart items
    // Clear existing items
    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    // Add new items
    for (const item of data.items || []) {
      const variantId = item.variant_id || item.variantId;
      const productId = item.product_id || item.productId;
      const price = item.price || (item.price ? parseFloat(item.price) : 0);
      
      if (variantId && productId) {
        // Try to find variant in catalog
        const variant = await this.prisma.catalogVariant.findUnique({
          where: { shopifyVariantId: BigInt(variantId) },
          include: { product: true },
        });

        await this.prisma.cartItem.create({
          data: {
            cartId: cart.id,
            variantId: variant?.id,
            shopifyVariantId: BigInt(variantId),
            shopifyProductId: BigInt(productId),
            sku: item.sku || variant?.sku || '',
            title: item.title || variant?.title || '',
            quantity: item.quantity || 1,
            listPrice: price > 1000 ? price / 100 : price, // Handle cents
            unitPrice: price > 1000 ? price / 100 : price,
          },
        });
      }
    }

    return cart;
  }

  async trackCart(data: any) {
    // This is called from snippet - same as sync but with different data structure
    return this.syncShopifyCart({
      cartToken: data.cartToken,
      shopifyCartId: data.cartToken,
      customerEmail: data.customerEmail,
      shopifyCustomerId: data.shopifyCustomerId || data.customerId,
      items: data.items,
    });
  }
}

