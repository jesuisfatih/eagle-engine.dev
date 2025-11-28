import { OrdersService } from './orders.service';
export declare class OrdersController {
    private ordersService;
    constructor(ordersService: OrdersService);
    findAll(companyId?: string, status?: string): Promise<({
        company: {
            name: string;
            id: string;
        } | null;
        companyUser: {
            id: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        merchantId: string;
        shopifyCustomerId: bigint | null;
        email: string | null;
        rawData: import("@prisma/client/runtime/client").JsonValue | null;
        syncedAt: Date;
        billingAddress: import("@prisma/client/runtime/client").JsonValue | null;
        shippingAddress: import("@prisma/client/runtime/client").JsonValue | null;
        companyId: string | null;
        companyUserId: string | null;
        cartId: string | null;
        shopifyOrderId: bigint;
        shopifyOrderNumber: string | null;
        subtotal: import("@prisma/client-runtime-utils").Decimal | null;
        totalDiscounts: import("@prisma/client-runtime-utils").Decimal | null;
        totalTax: import("@prisma/client-runtime-utils").Decimal | null;
        totalPrice: import("@prisma/client-runtime-utils").Decimal | null;
        currency: string | null;
        financialStatus: string | null;
        fulfillmentStatus: string | null;
        lineItems: import("@prisma/client/runtime/client").JsonValue | null;
        discountCodes: import("@prisma/client/runtime/client").JsonValue | null;
    })[]>;
    getStats(): Promise<{
        total: number;
        totalRevenue: number | import("@prisma/client-runtime-utils").Decimal;
    }>;
    findOne(id: string): Promise<({
        company: {
            name: string;
            id: string;
            status: string;
            settings: import("@prisma/client/runtime/client").JsonValue;
            createdAt: Date;
            updatedAt: Date;
            merchantId: string;
            email: string | null;
            phone: string | null;
            legalName: string | null;
            taxId: string | null;
            website: string | null;
            billingAddress: import("@prisma/client/runtime/client").JsonValue | null;
            shippingAddress: import("@prisma/client/runtime/client").JsonValue | null;
            companyGroup: string | null;
            createdByShopifyCustomerId: bigint | null;
        } | null;
        companyUser: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            shopifyCustomerId: bigint | null;
            email: string;
            firstName: string | null;
            lastName: string | null;
            companyId: string;
            isActive: boolean;
            passwordHash: string | null;
            role: string;
            permissions: import("@prisma/client/runtime/client").JsonValue;
            lastLoginAt: Date | null;
            invitationToken: string | null;
            invitationSentAt: Date | null;
            invitationAcceptedAt: Date | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        merchantId: string;
        shopifyCustomerId: bigint | null;
        email: string | null;
        rawData: import("@prisma/client/runtime/client").JsonValue | null;
        syncedAt: Date;
        billingAddress: import("@prisma/client/runtime/client").JsonValue | null;
        shippingAddress: import("@prisma/client/runtime/client").JsonValue | null;
        companyId: string | null;
        companyUserId: string | null;
        cartId: string | null;
        shopifyOrderId: bigint;
        shopifyOrderNumber: string | null;
        subtotal: import("@prisma/client-runtime-utils").Decimal | null;
        totalDiscounts: import("@prisma/client-runtime-utils").Decimal | null;
        totalTax: import("@prisma/client-runtime-utils").Decimal | null;
        totalPrice: import("@prisma/client-runtime-utils").Decimal | null;
        currency: string | null;
        financialStatus: string | null;
        fulfillmentStatus: string | null;
        lineItems: import("@prisma/client/runtime/client").JsonValue | null;
        discountCodes: import("@prisma/client/runtime/client").JsonValue | null;
    }) | null>;
}
