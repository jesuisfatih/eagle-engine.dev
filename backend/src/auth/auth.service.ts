import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { ShopifyCustomerSyncService } from '../shopify/shopify-customer-sync.service';
import { ShopifyRestService } from '../shopify/shopify-rest.service';
import * as bcrypt from 'bcrypt';

export interface JwtPayload {
  sub: string;
  email: string;
  type: 'merchant' | 'company_user';
  merchantId?: string;
  companyId?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
    private shopifyCustomerSync: ShopifyCustomerSyncService,
    private shopifyRest: ShopifyRestService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  async comparePasswords(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async generateToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.sign(payload as any);
  }

  async generateRefreshToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.sign(payload as any, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES_IN', '30d'),
    } as any);
  }

  async verifyToken(token: string): Promise<JwtPayload> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async validateCompanyUser(email: string, password: string) {
    const user = await this.prisma.companyUser.findUnique({
      where: { email },
      include: { company: true },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.comparePasswords(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    // Update last login
    await this.prisma.companyUser.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return user;
  }

  async loginCompanyUser(email: string, password: string) {
    const user = await this.validateCompanyUser(email, password);

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      type: 'company_user',
      companyId: user.companyId,
      merchantId: user.company.merchantId,
    };

    const accessToken = await this.generateToken(payload);
    const refreshToken = await this.generateRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        companyId: user.companyId,
      },
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.companyUser.findUnique({
      where: { email },
      include: { company: true },
    });

    if (user && password) {
      return user;
    }

    return null;
  }

  async findUserByEmail(email: string): Promise<any> {
    return this.prisma.companyUser.findUnique({
      where: { email },
      include: { company: true },
    });
  }

  async createUserFromShopify(data: { email: string; shopifyCustomerId: string }): Promise<any> {
    return this.prisma.companyUser.create({
      data: {
        email: data.email,
        shopifyCustomerId: BigInt(data.shopifyCustomerId),
        firstName: '',
        lastName: '',
        role: 'buyer',
        companyId: 'f0c2b2a5-4858-4d82-a542-5ce3bfe23a6d', // Default company
        isActive: true,
      },
      include: { company: true },
    });
  }

  async refreshToken(oldToken: string): Promise<string | null> {
    try {
      const decoded: any = this.jwtService.verify(oldToken);
      const user = await this.prisma.companyUser.findUnique({
        where: { id: decoded.sub },
        include: { company: true },
      });

      if (!user) return null;

      const payload = {
        sub: user.id,
        email: user.email,
        type: 'access',
      };

      return this.jwtService.sign(payload);
    } catch (error) {
      return null;
    }
  }

  async validateToken(token: string): Promise<any> {
    try {
      const decoded = this.jwtService.verify(token);
      const user = await this.prisma.companyUser.findUnique({
        where: { id: decoded.sub },
        include: { company: true },
      });

      return user;
    } catch (error) {
      return null;
    }
  }

  async acceptInvitation(body: any) {
    const token = body.token;
    const password = body.password;
    const user = await this.prisma.companyUser.findFirst({
      where: { invitationToken: token },
      include: { company: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid invitation token');
    }

    if (user.invitationAcceptedAt) {
      throw new UnauthorizedException('Invitation already accepted');
    }

    const passwordHash = await this.hashPassword(password);

    // Update user
    const updatedUser = await this.prisma.companyUser.update({
      where: { id: user.id },
      data: {
        passwordHash,
        firstName: body.firstName || user.firstName,
        lastName: body.lastName || user.lastName,
        invitationAcceptedAt: new Date(),
        invitationToken: null,
        isActive: true,
      },
      include: { company: true },
    });

    // Update company if info provided
    let updatedCompany = user.company;
    if (body.companyInfo) {
      updatedCompany = await this.prisma.company.update({
        where: { id: user.companyId },
        data: {
          name: body.companyInfo.name || user.company.name,
          taxId: body.companyInfo.taxId,
          phone: body.companyInfo.phone,
          billingAddress: body.companyInfo.billingAddress,
          status: 'active',
        },
        include: { merchant: true },
      });
    }

    // Sync user to Shopify after registration
    try {
      this.logger.log(`Syncing user ${updatedUser.email} to Shopify after registration`);
      
      // Sync user to Shopify
      const shopifyCustomer = await this.shopifyCustomerSync.syncUserToShopify(updatedUser.id);
      
      // Reload user to get Shopify customer ID
      const userWithShopify = await this.prisma.companyUser.findUnique({
        where: { id: updatedUser.id },
      });

      // Update Shopify customer with B2B metafields if company info provided
      if (updatedCompany?.merchant && body.companyInfo && userWithShopify?.shopifyCustomerId) {
        try {
          const metafields = [
            {
              namespace: 'eagle_b2b',
              key: 'company_name',
              value: body.companyInfo.name || '',
              type: 'single_line_text_field',
            },
            {
              namespace: 'eagle_b2b',
              key: 'tax_id',
              value: body.companyInfo.taxId || '',
              type: 'single_line_text_field',
            },
            {
              namespace: 'eagle_b2b',
              key: 'company_id',
              value: updatedUser.companyId,
              type: 'single_line_text_field',
            },
          ];

          // Add address metafields if provided
          if (body.companyInfo.billingAddress) {
            const address = body.companyInfo.billingAddress;
            metafields.push(
              {
                namespace: 'eagle_b2b',
                key: 'billing_address1',
                value: address.address1 || '',
                type: 'single_line_text_field',
              },
              {
                namespace: 'eagle_b2b',
                key: 'billing_address2',
                value: address.address2 || '',
                type: 'single_line_text_field',
              },
              {
                namespace: 'eagle_b2b',
                key: 'billing_city',
                value: address.city || '',
                type: 'single_line_text_field',
              },
              {
                namespace: 'eagle_b2b',
                key: 'billing_state',
                value: address.state || '',
                type: 'single_line_text_field',
              },
              {
                namespace: 'eagle_b2b',
                key: 'billing_postal_code',
                value: address.postalCode || '',
                type: 'single_line_text_field',
              },
              {
                namespace: 'eagle_b2b',
                key: 'billing_country',
                value: address.country || '',
                type: 'single_line_text_field',
              },
            );
          }

          await this.shopifyRest.updateCustomerMetafields(
            updatedCompany.merchant.shopDomain,
            updatedCompany.merchant.accessToken,
            userWithShopify.shopifyCustomerId.toString(),
            metafields,
          );

          this.logger.log(`B2B metafields updated for customer ${userWithShopify.shopifyCustomerId}`);
        } catch (metafieldError: any) {
          this.logger.warn('Failed to update Shopify metafields', metafieldError);
          // Continue anyway - customer is created
        }
      }

      this.logger.log(`User ${updatedUser.email} successfully synced to Shopify`);
    } catch (shopifyError: any) {
      this.logger.error('Failed to sync user to Shopify after registration', shopifyError);
      // Continue anyway - user is registered in Eagle
    }

    const payload: JwtPayload = {
      sub: updatedUser.id,
      email: updatedUser.email,
      type: 'company_user',
      companyId: updatedUser.companyId,
      merchantId: user.company.merchantId,
    };

    const accessToken = await this.generateToken(payload);
    const refreshToken = await this.generateRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        role: updatedUser.role,
        companyId: updatedUser.companyId,
      },
    };
  }
}



