import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
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
        firstName: userInfo?.firstName || user.firstName,
        lastName: userInfo?.lastName || user.lastName,
        invitationAcceptedAt: new Date(),
        invitationToken: null,
        isActive: true,
      },
    });

    // Update company if info provided
    if (userInfo?.companyInfo) {
      await this.prisma.company.update({
        where: { id: user.companyId },
        data: {
          name: userInfo.companyInfo.name || user.company.name,
          taxId: userInfo.companyInfo.taxId,
          phone: userInfo.companyInfo.phone,
          billingAddress: userInfo.companyInfo.billingAddress,
          status: 'active',
        },
      });
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



