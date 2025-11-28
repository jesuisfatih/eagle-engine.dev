import { PrismaService } from '../prisma/prisma.service';
export declare class CatalogService {
    private prisma;
    constructor(prisma: PrismaService);
    getProducts(merchantId: string, filters?: {
        search?: string;
        limit?: number;
    }): Promise<({
        variants: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            rawData: import("@prisma/client/runtime/client").JsonValue | null;
            syncedAt: Date;
            title: string | null;
            productId: string;
            shopifyVariantId: bigint;
            sku: string | null;
            price: import("@prisma/client-runtime-utils").Decimal | null;
            compareAtPrice: import("@prisma/client-runtime-utils").Decimal | null;
            inventoryQuantity: number | null;
            weight: import("@prisma/client-runtime-utils").Decimal | null;
            weightUnit: string | null;
            option1: string | null;
            option2: string | null;
            option3: string | null;
        }[];
    } & {
        id: string;
        status: string | null;
        createdAt: Date;
        updatedAt: Date;
        merchantId: string;
        tags: string | null;
        rawData: import("@prisma/client/runtime/client").JsonValue | null;
        syncedAt: Date;
        shopifyProductId: bigint;
        title: string | null;
        handle: string | null;
        description: string | null;
        vendor: string | null;
        productType: string | null;
        images: import("@prisma/client/runtime/client").JsonValue | null;
        collections: import("@prisma/client/runtime/client").JsonValue | null;
    })[]>;
    getProduct(productId: string): Promise<({
        variants: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            rawData: import("@prisma/client/runtime/client").JsonValue | null;
            syncedAt: Date;
            title: string | null;
            productId: string;
            shopifyVariantId: bigint;
            sku: string | null;
            price: import("@prisma/client-runtime-utils").Decimal | null;
            compareAtPrice: import("@prisma/client-runtime-utils").Decimal | null;
            inventoryQuantity: number | null;
            weight: import("@prisma/client-runtime-utils").Decimal | null;
            weightUnit: string | null;
            option1: string | null;
            option2: string | null;
            option3: string | null;
        }[];
    } & {
        id: string;
        status: string | null;
        createdAt: Date;
        updatedAt: Date;
        merchantId: string;
        tags: string | null;
        rawData: import("@prisma/client/runtime/client").JsonValue | null;
        syncedAt: Date;
        shopifyProductId: bigint;
        title: string | null;
        handle: string | null;
        description: string | null;
        vendor: string | null;
        productType: string | null;
        images: import("@prisma/client/runtime/client").JsonValue | null;
        collections: import("@prisma/client/runtime/client").JsonValue | null;
    }) | null>;
    getVariant(variantId: string): Promise<({
        product: {
            id: string;
            status: string | null;
            createdAt: Date;
            updatedAt: Date;
            merchantId: string;
            tags: string | null;
            rawData: import("@prisma/client/runtime/client").JsonValue | null;
            syncedAt: Date;
            shopifyProductId: bigint;
            title: string | null;
            handle: string | null;
            description: string | null;
            vendor: string | null;
            productType: string | null;
            images: import("@prisma/client/runtime/client").JsonValue | null;
            collections: import("@prisma/client/runtime/client").JsonValue | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        rawData: import("@prisma/client/runtime/client").JsonValue | null;
        syncedAt: Date;
        title: string | null;
        productId: string;
        shopifyVariantId: bigint;
        sku: string | null;
        price: import("@prisma/client-runtime-utils").Decimal | null;
        compareAtPrice: import("@prisma/client-runtime-utils").Decimal | null;
        inventoryQuantity: number | null;
        weight: import("@prisma/client-runtime-utils").Decimal | null;
        weightUnit: string | null;
        option1: string | null;
        option2: string | null;
        option3: string | null;
    }) | null>;
}
