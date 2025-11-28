import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class PrismaService implements OnModuleInit, OnModuleDestroy {
    private config;
    private readonly logger;
    private prisma;
    private pool;
    constructor(config: ConfigService);
    $connect(): Promise<void>;
    $disconnect(): Promise<void>;
    get merchant(): import("@prisma/client").Prisma.MerchantDelegate<import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    get shopifyCustomer(): import("@prisma/client").Prisma.ShopifyCustomerDelegate<import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    get company(): import("@prisma/client").Prisma.CompanyDelegate<import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    get companyUser(): import("@prisma/client").Prisma.CompanyUserDelegate<import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    get catalogProduct(): import("@prisma/client").Prisma.CatalogProductDelegate<import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    get catalogVariant(): import("@prisma/client").Prisma.CatalogVariantDelegate<import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    get pricingRule(): import("@prisma/client").Prisma.PricingRuleDelegate<import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    get cart(): import("@prisma/client").Prisma.CartDelegate<import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    get cartItem(): import("@prisma/client").Prisma.CartItemDelegate<import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    get orderLocal(): import("@prisma/client").Prisma.OrderLocalDelegate<import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    get activityLog(): import("@prisma/client").Prisma.ActivityLogDelegate<import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    get discountCode(): import("@prisma/client").Prisma.DiscountCodeDelegate<import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    get syncLog(): import("@prisma/client").Prisma.SyncLogDelegate<import("@prisma/client/runtime/client").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    cleanDatabase(): Promise<any>;
}
