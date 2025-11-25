import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getMerchantSettings(merchantId: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
      select: {
        settings: true,
        snippetEnabled: true,
        planName: true,
        lastSyncAt: true,
      },
    });
    return merchant;
  }

  async updateMerchantSettings(merchantId: string, settings: any) {
    return this.prisma.merchant.update({
      where: { id: merchantId },
      data: {
        settings: settings,
        updatedAt: new Date(),
      },
    });
  }

  async toggleSnippet(merchantId: string, enabled: boolean) {
    return this.prisma.merchant.update({
      where: { id: merchantId },
      data: { snippetEnabled: enabled },
    });
  }

  async getCompanySettings(companyId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: {
        settings: true,
        companyGroup: true,
        status: true,
      },
    });
    return company;
  }

  async updateCompanySettings(companyId: string, settings: any) {
    return this.prisma.company.update({
      where: { id: companyId },
      data: {
        settings: settings,
        updatedAt: new Date(),
      },
    });
  }
}

