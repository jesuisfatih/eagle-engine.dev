import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Map OrderLocal to frontend-compatible format
   */
  private mapOrder(order: any) {
    return {
      id: order.id,
      orderNumber: order.shopifyOrderNumber || order.shopifyOrderId?.toString() || order.id,
      shopifyOrderId: order.shopifyOrderId ? Number(order.shopifyOrderId) : null,
      status: this.mapFinancialToStatus(order.financialStatus),
      paymentStatus: this.mapPaymentStatus(order.financialStatus),
      fulfillmentStatus: order.fulfillmentStatus || 'unfulfilled',
      totalPrice: order.totalPrice,
      subtotalPrice: order.subtotal,
      taxTotal: order.totalTax,
      discountTotal: order.totalDiscounts,
      currency: order.currency || 'USD',
      email: order.email,
      lineItems: order.lineItems,
      shippingAddress: order.shippingAddress,
      billingAddress: order.billingAddress,
      discountCodes: order.discountCodes,
      company: order.company,
      companyUser: order.companyUser,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  private mapFinancialToStatus(financialStatus: string): string {
    const statusMap: Record<string, string> = {
      pending: 'pending',
      authorized: 'confirmed',
      partially_paid: 'processing',
      paid: 'confirmed',
      partially_refunded: 'confirmed',
      refunded: 'cancelled',
      voided: 'cancelled',
    };
    return statusMap[financialStatus] || 'pending';
  }

  private mapPaymentStatus(financialStatus: string): string {
    const statusMap: Record<string, string> = {
      pending: 'pending',
      authorized: 'pending',
      partially_paid: 'pending',
      paid: 'paid',
      partially_refunded: 'refunded',
      refunded: 'refunded',
      voided: 'failed',
    };
    return statusMap[financialStatus] || 'pending';
  }

  async findAll(merchantId: string, filters?: { companyId?: string; status?: string }) {
    const where: any = { merchantId };

    if (filters?.companyId) {
      where.companyId = filters.companyId;
    }

    if (filters?.status) {
      where.financialStatus = filters.status;
    }

    const orders = await this.prisma.orderLocal.findMany({
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

    return orders.map(order => this.mapOrder(order));
  }

  async findOne(id: string, merchantId: string, companyId?: string) {
    const where: any = { id, merchantId };
    
    // If companyId provided, enforce it (for company users)
    if (companyId) {
      where.companyId = companyId;
    }
    
    const order = await this.prisma.orderLocal.findFirst({
      where,
      include: {
        company: true,
        companyUser: true,
      },
    });

    return order ? this.mapOrder(order) : null;
  }

  async getStats(merchantId: string, companyId?: string) {
    const where: any = { merchantId };
    
    if (companyId) {
      where.companyId = companyId;
    }
    
    const [total, totalRevenue] = await Promise.all([
      this.prisma.orderLocal.count({ where }),
      this.prisma.orderLocal.aggregate({
        where,
        _sum: { totalPrice: true },
      }),
    ]);

    return {
      total,
      totalRevenue: totalRevenue._sum.totalPrice || 0,
    };
  }
}




