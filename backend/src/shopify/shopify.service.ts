import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ShopifyService {
  private readonly logger = new Logger(ShopifyService.name);
  private readonly apiVersion: string;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    this.apiVersion = this.config.get<string>('SHOPIFY_API_VERSION', '2024-10');
  }

  async getMerchantAccessToken(merchantId: string): Promise<string> {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
    });

    if (!merchant) {
      throw new Error('Merchant not found');
    }

    return merchant.accessToken;
  }

  async getMerchantByShopDomain(shopDomain: string) {
    if (!shopDomain) {
      this.logger.warn('getMerchantByShopDomain called with empty shopDomain');
      return null;
    }
    
    // Try exact match first
    let merchant = await this.prisma.merchant.findFirst({
      where: { shopDomain },
    });
    
    // Try partial match if exact doesn't work
    if (!merchant && shopDomain.includes('.myshopify.com')) {
      const shopName = shopDomain.replace('.myshopify.com', '');
      merchant = await this.prisma.merchant.findFirst({
        where: { 
          shopDomain: { contains: shopName },
        },
      });
    }
    
    return merchant;
  }

  getApiVersion(): string {
    return this.apiVersion;
  }

  buildAdminApiUrl(shop: string, path: string): string {
    return `https://${shop}/admin/api/${this.apiVersion}${path}`;
  }
}




