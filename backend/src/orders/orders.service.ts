import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async findAll(merchantId: string, filters?: { companyId?: string; status?: string }) {
    const where: any = { merchantId };

    if (filters?.companyId) {
      where.companyId = filters.companyId;
    }

    if (filters?.status) {
      where.financialStatus = filters.status;
    }

    return this.prisma.orderLocal.findMany({
      where,
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
        companyUser: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async findOne(id: string, merchantId: string) {
    return this.prisma.orderLocal.findFirst({
      where: { id, merchantId },
      include: {
        company: true,
        companyUser: true,
      },
    });
  }

  async getStats(merchantId: string) {
    const [total, totalRevenue] = await Promise.all([
      this.prisma.orderLocal.count({ where: { merchantId } }),
      this.prisma.orderLocal.aggregate({
        where: { merchantId },
        _sum: { totalPrice: true },
      }),
    ]);

    return {
      total,
      totalRevenue: totalRevenue._sum.totalPrice || 0,
    };
  }
}




