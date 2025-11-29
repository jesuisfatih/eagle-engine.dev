import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ShopifyService } from './shopify.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ShopifyCustomerSyncService {
  private readonly logger = new Logger(ShopifyCustomerSyncService.name);

  constructor(
    private httpService: HttpService,
    private shopifyService: ShopifyService,
    private prisma: PrismaService,
  ) {}

  async syncUserToShopify(userId: string) {
    const user = await this.prisma.companyUser.findUnique({
      where: { id: userId },
      include: { company: true },
    });

    if (!user) return;

    const merchant = await this.prisma.merchant.findUnique({
      where: { id: user.company.merchantId },
    });

    if (!merchant) return;

    try {
      // Check if email is verified
      const permissions = (user.permissions as any) || {};
      const emailVerified = permissions.emailVerified || false;

      const customerData = {
        customer: {
          email: user.email,
          first_name: user.firstName,
          last_name: user.lastName,
          phone: user.company.phone,
          addresses: user.company.billingAddress ? [user.company.billingAddress] : [],
          tags: [`eagle-b2b-user`, `company-${user.companyId}`],
          accepts_marketing: emailVerified, // Subscribe if email verified
        },
      };

      const url = this.shopifyService.buildAdminApiUrl(
        merchant.shopDomain,
        '/customers.json'
      );

      const response = await firstValueFrom(
        this.httpService.post(url, customerData, {
          headers: {
            'X-Shopify-Access-Token': merchant.accessToken,
            'Content-Type': 'application/json',
          },
        })
      );

      // Update user with Shopify customer ID
      await this.prisma.companyUser.update({
        where: { id: userId },
        data: {
          shopifyCustomerId: BigInt(response.data.customer.id),
        },
      });

      this.logger.log(`User ${user.email} synced to Shopify`);
      return response.data.customer;
    } catch (error) {
      this.logger.error('Failed to sync user to Shopify', error);
      throw error;
    }
  }

  async updateShopifyCustomer(userId: string) {
    const user = await this.prisma.companyUser.findUnique({
      where: { id: userId },
      include: { company: true },
    });

    if (!user || !user.shopifyCustomerId) return;

    const merchant = await this.prisma.merchant.findUnique({
      where: { id: user.company.merchantId },
    });

    if (!merchant) return;

    try {
      const url = this.shopifyService.buildAdminApiUrl(
        merchant.shopDomain,
        `/customers/${user.shopifyCustomerId}.json`
      );

      // Check if email is verified
      const permissions = (user.permissions as any) || {};
      const emailVerified = permissions.emailVerified || false;

      const customerData = {
        customer: {
          email: user.email,
          first_name: user.firstName,
          last_name: user.lastName,
          phone: user.company.phone,
          accepts_marketing: emailVerified, // Subscribe if email verified
        },
      };

      await firstValueFrom(
        this.httpService.put(url, customerData, {
          headers: {
            'X-Shopify-Access-Token': merchant.accessToken,
            'Content-Type': 'application/json',
          },
        })
      );

      this.logger.log(`Shopify customer updated for ${user.email}`);
    } catch (error) {
      this.logger.error('Failed to update Shopify customer', error);
    }
  }
}

