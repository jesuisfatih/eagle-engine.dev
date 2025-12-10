import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ShopifyRestService } from '../shopify/shopify-rest.service';
import * as crypto from 'crypto';

@Injectable()
export class CompanyUsersService {
  private readonly logger = new Logger(CompanyUsersService.name);

  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => ShopifyRestService))
    private shopifyRest: ShopifyRestService,
  ) {}

  async findByCompany(companyId: string) {
    return this.prisma.companyUser.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(userId: string) {
    return this.prisma.companyUser.findUnique({
      where: { id: userId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            merchant: {
              select: {
                shopDomain: true,
              },
            },
          },
        },
      },
    });
  }

  async invite(companyId: string, data: { email: string; role?: string }) {
    const invitationToken = crypto.randomBytes(32).toString('hex');

    return this.prisma.companyUser.create({
      data: {
        companyId,
        email: data.email,
        role: data.role || 'buyer',
        invitationToken,
        invitationSentAt: new Date(),
        isActive: false,
      },
    });
  }

  async update(userId: string, data: any) {
    return this.prisma.companyUser.update({
      where: { id: userId },
      data,
    });
  }

  async delete(userId: string) {
    return this.prisma.companyUser.delete({
      where: { id: userId },
    });
  }

  async verifyEmail(userId: string) {
    const user = await this.prisma.companyUser.findUnique({
      where: { id: userId },
      include: { company: { include: { merchant: true } } },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const permissions = (user.permissions as any) || {};
    permissions.emailVerified = true;

    const updatedUser = await this.prisma.companyUser.update({
      where: { id: userId },
      data: {
        permissions,
      },
    });

    // Update Shopify subscription if customer exists
    if (user.shopifyCustomerId && user.company.merchant) {
      try {
        await this.shopifyRest.updateCustomerSubscription(
          user.company.merchant.shopDomain,
          user.company.merchant.accessToken,
          user.shopifyCustomerId.toString(),
          true, // Subscribe to marketing
        );
        this.logger.log(`Customer ${user.email} subscribed to marketing after email verification`);
      } catch (error: any) {
        this.logger.error(`Failed to update Shopify subscription for ${user.email}`, error);
        // Continue anyway - email is verified
      }
    }

    return updatedUser;
  }
}




