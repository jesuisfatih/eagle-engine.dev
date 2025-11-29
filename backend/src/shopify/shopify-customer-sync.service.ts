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
    this.logger.log(`🔄 syncUserToShopify called for userId: ${userId}`);
    
    const user = await this.prisma.companyUser.findUnique({
      where: { id: userId },
      include: { company: true },
    });

    if (!user) {
      this.logger.warn(`⚠️ syncUserToShopify: User not found (ID: ${userId})`);
      throw new Error(`User not found: ${userId}`);
    }

    const merchant = await this.prisma.merchant.findUnique({
      where: { id: user.company.merchantId },
    });

    if (!merchant) {
      this.logger.warn(`⚠️ syncUserToShopify: Merchant not found for user ${user.email} (merchantId: ${user.company.merchantId})`);
      throw new Error(`Merchant not found for user ${user.email}`);
    }
    
    this.logger.log(`🔄 syncUserToShopify: Starting sync for user ${user.email}`, {
      userId,
      merchantId: merchant.id,
      shopDomain: merchant.shopDomain,
    });

    try {
      // Check if user already has Shopify customer ID
      if (user.shopifyCustomerId) {
        this.logger.log(`User ${user.email} already has Shopify customer ID: ${user.shopifyCustomerId}`);
        // Update existing customer instead
        return await this.updateShopifyCustomer(userId);
      }

      // Check if email is verified
      const permissions = (user.permissions as any) || {};
      const emailVerified = permissions.emailVerified || false;

      const customerData = {
        customer: {
          email: user.email,
          first_name: user.firstName || '',
          last_name: user.lastName || '',
          phone: user.company.phone || '',
          addresses: user.company.billingAddress ? [user.company.billingAddress] : [],
          tags: [`eagle-b2b-user`, `company-${user.companyId}`],
          accepts_marketing: emailVerified, // Subscribe if email verified
        },
      };

      const url = this.shopifyService.buildAdminApiUrl(
        merchant.shopDomain,
        '/customers.json'
      );

      this.logger.log(`Creating Shopify customer for ${user.email}`, {
        email: user.email,
        emailVerified,
        shopDomain: merchant.shopDomain,
      });

      let response;
      try {
        response = await firstValueFrom(
          this.httpService.post(url, customerData, {
            headers: {
              'X-Shopify-Access-Token': merchant.accessToken,
              'Content-Type': 'application/json',
            },
          })
        );
      } catch (createError: any) {
        // If customer already exists (email conflict), try to find and update
        if (createError.response?.status === 422 || createError.response?.data?.errors?.email) {
          this.logger.warn(`Customer ${user.email} already exists in Shopify, searching...`);
          
          // Search for existing customer by email
          const searchUrl = this.shopifyService.buildAdminApiUrl(
            merchant.shopDomain,
            `/customers/search.json?query=email:${encodeURIComponent(user.email)}`
          );
          
          const searchResponse = await firstValueFrom(
            this.httpService.get(searchUrl, {
              headers: {
                'X-Shopify-Access-Token': merchant.accessToken,
              },
            })
          );
          
          if (searchResponse.data.customers && searchResponse.data.customers.length > 0) {
            const existingCustomer = searchResponse.data.customers[0];
            this.logger.log(`Found existing Shopify customer: ${existingCustomer.id}`);
            
            // Update user with existing Shopify customer ID
            await this.prisma.companyUser.update({
              where: { id: userId },
              data: {
                shopifyCustomerId: BigInt(existingCustomer.id),
              },
            });
            
            // Update the customer
            return await this.updateShopifyCustomer(userId);
          } else {
            throw createError; // Re-throw if we can't find the customer
          }
        } else {
          throw createError; // Re-throw other errors
        }
      }

      // Update user with Shopify customer ID
      await this.prisma.companyUser.update({
        where: { id: userId },
        data: {
          shopifyCustomerId: BigInt(response.data.customer.id),
        },
      });

      this.logger.log(`✅ User ${user.email} synced to Shopify successfully`, {
        shopifyCustomerId: response.data.customer.id,
        email: user.email,
      });
      return response.data.customer;
    } catch (error: any) {
      this.logger.error(`❌ Failed to sync user ${user.email} to Shopify`, {
        error: error.message,
        stack: error.stack,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
      });
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

