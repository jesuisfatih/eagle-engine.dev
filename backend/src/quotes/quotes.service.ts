import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuotesService {
  constructor(private prisma: PrismaService) {}

  async create(companyId: string, userId: string, data: any) {
    // Quote'lar cart'lar gibi çalışır ama status farklıdır
    return this.prisma.cart.create({
      data: {
        merchantId: data.merchantId,
        companyId,
        createdByUserId: userId,
        status: 'quote_requested',
        notes: data.notes,
        metadata: { type: 'quote', ...data.metadata },
      },
    });
  }

  async findAll(companyId: string) {
    return this.prisma.cart.findMany({
      where: {
        companyId,
        status: { in: ['quote_requested', 'quote_approved', 'quote_rejected'] },
      },
      include: {
        items: {
          include: {
            variant: {
              include: { product: true },
            },
          },
        },
        createdBy: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approve(quoteId: string, approvedByUserId: string) {
    return this.prisma.cart.update({
      where: { id: quoteId },
      data: {
        status: 'quote_approved',
        approvedByUserId,
        approvedAt: new Date(),
      },
    });
  }

  async reject(quoteId: string) {
    return this.prisma.cart.update({
      where: { id: quoteId },
      data: { status: 'quote_rejected' },
    });
  }
}

