import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class CompanyUsersService {
  constructor(private prisma: PrismaService) {}

  async findByCompany(companyId: string) {
    return this.prisma.companyUser.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
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
}



