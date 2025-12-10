import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToWishlistDto } from './dto/add-to-wishlist.dto';
import { v4 as uuidv4 } from 'uuid';

export interface WishlistItem {
  id: string;
  userId: string;
  companyId: string;
  productId: string;
  variantId?: string;
  productTitle?: string;
  productImage?: string;
  price?: number;
  addedAt: Date;
}

@Injectable()
export class WishlistService {
  private wishlistItems: Map<string, WishlistItem> = new Map();

  constructor(private prisma: PrismaService) {}

  async getWishlist(userId: string): Promise<WishlistItem[]> {
    return Array.from(this.wishlistItems.values())
      .filter(item => item.userId === userId)
      .sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime());
  }

  async addToWishlist(
    userId: string,
    companyId: string,
    dto: AddToWishlistDto,
  ): Promise<WishlistItem> {
    // Aynı ürün zaten wishlist'te var mı kontrol et
    const existing = Array.from(this.wishlistItems.values()).find(
      item => item.userId === userId && item.productId === dto.productId,
    );

    if (existing) {
      throw new ConflictException('Product already in wishlist');
    }

    const item: WishlistItem = {
      id: uuidv4(),
      userId,
      companyId,
      productId: dto.productId,
      variantId: dto.variantId,
      productTitle: dto.productTitle,
      productImage: dto.productImage,
      price: dto.price,
      addedAt: new Date(),
    };

    this.wishlistItems.set(item.id, item);
    return item;
  }

  async removeFromWishlist(userId: string, productId: string): Promise<void> {
    const item = Array.from(this.wishlistItems.values()).find(
      i => i.userId === userId && i.productId === productId,
    );

    if (!item) {
      throw new NotFoundException('Product not found in wishlist');
    }

    this.wishlistItems.delete(item.id);
  }

  async clearWishlist(userId: string): Promise<void> {
    const userItems = Array.from(this.wishlistItems.entries()).filter(
      ([, item]) => item.userId === userId,
    );

    for (const [id] of userItems) {
      this.wishlistItems.delete(id);
    }
  }

  async isInWishlist(userId: string, productId: string): Promise<boolean> {
    return Array.from(this.wishlistItems.values()).some(
      item => item.userId === userId && item.productId === productId,
    );
  }

  async getWishlistCount(userId: string): Promise<number> {
    return Array.from(this.wishlistItems.values()).filter(
      item => item.userId === userId,
    ).length;
  }
}
