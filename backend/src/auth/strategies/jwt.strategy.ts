import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    if (payload.type === 'company_user') {
      const user = await this.prisma.companyUser.findUnique({
        where: { id: payload.sub },
        include: { company: true },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or inactive');
      }

      return {
        userId: user.id,
        email: user.email,
        companyId: user.companyId,
        merchantId: user.company.merchantId,
        role: user.role,
        type: 'company_user',
      };
    } else if (payload.type === 'merchant') {
      const merchant = await this.prisma.merchant.findUnique({
        where: { id: payload.sub },
      });

      if (!merchant || merchant.status !== 'active') {
        throw new UnauthorizedException('Merchant not found or inactive');
      }

      return {
        userId: merchant.id,
        email: payload.email,
        merchantId: merchant.id,
        type: 'merchant',
      };
    }

    throw new UnauthorizedException('Invalid token type');
  }
}

