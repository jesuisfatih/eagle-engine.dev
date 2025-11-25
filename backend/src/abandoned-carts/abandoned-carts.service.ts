import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AbandonedCartsService {
  constructor(private prisma: PrismaService) {}

  async getAbandonedCarts(merchantId: string) {
    // Get carts older than 1 hour that aren't converted
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    return this.prisma.cart.findMany({
      where: {
        merchantId,
        status: 'draft',
        updatedAt: { lt: oneHourAgo },
        convertedToOrderId: null,
      },
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
    
    // Find or create cart
    let cart = await this.prisma.cart.findFirst({
      where: {
        merchantId,
        shopifyCartId: data.cartToken,
      },
    });

    if (!cart) {
      // Create new cart
      const companyId = data.companyId || null;
      const userId = data.userId || null;

      cart = await this.prisma.cart.create({
        data: {
          merchantId,
          companyId,
          createdByUserId: userId || merchantId,
          shopifyCartId: data.cartToken,
          status: 'draft',
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
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          shopifyVariantId: BigInt(item.variant_id),
          shopifyProductId: BigInt(item.product_id),
          sku: item.sku,
          title: item.title,
          quantity: item.quantity,
          listPrice: parseFloat(item.price) / 100,
          unitPrice: parseFloat(item.price) / 100,
        },
      });
    }

    return cart;
  }
}

