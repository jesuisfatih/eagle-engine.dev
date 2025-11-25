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
    this.apiVersion = this.config.get<string>('SHOPIFY_API_VERSION', '2025-01');
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
    return this.prisma.merchant.findUnique({
      where: { shopDomain },
    });
  }

  getApiVersion(): string {
    return this.apiVersion;
  }

  buildAdminApiUrl(shop: string, path: string): string {
    return `https://${shop}/admin/api/${this.apiVersion}${path}`;
  }
}



