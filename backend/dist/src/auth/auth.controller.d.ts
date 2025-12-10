import type { Response } from 'express';
import { AuthService } from './auth.service';
import { SessionSyncService } from './session-sync.service';
import { ShopifySsoService } from '../shopify/shopify-sso.service';
import { ShopifyCustomerSyncService } from '../shopify/shopify-customer-sync.service';
import { ShopifyRestService } from '../shopify/shopify-rest.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuthController {
    private authService;
    private sessionSyncService;
    private shopifySso;
    private shopifyCustomerSync;
    private shopifyRest;
    private prisma;
    private readonly logger;
    constructor(authService: AuthService, sessionSyncService: SessionSyncService, shopifySso: ShopifySsoService, shopifyCustomerSync: ShopifyCustomerSyncService, shopifyRest: ShopifyRestService, prisma: PrismaService);
    login(body: {
        email: string;
        password: string;
    }, res: Response): Promise<Response<any, Record<string, any>>>;
    shopifyCallback(shopifyCustomerId: string, email: string, res: Response): Promise<void>;
    validateInvitation(token: string, res: Response): Promise<Response<any, Record<string, any>>>;
    sendVerificationCode(body: {
        email: string;
    }, res: Response): Promise<Response<any, Record<string, any>>>;
    verifyEmailCode(body: {
        email: string;
        code: string;
    }, res: Response): Promise<Response<any, Record<string, any>>>;
    register(body: any, res: Response): Promise<Response<any, Record<string, any>>>;
    acceptInvitation(body: any): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
            role: string;
            companyId: string;
        };
    }>;
    syncShopifyCustomer(body: {
        shopifyCustomerId: string;
        email: string;
        fingerprint?: string;
    }): Promise<{
        token: string;
        user: {
            id: string;
            email: string;
            companyId: string;
        };
    }>;
    resolveContext(auth: string): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string | null;
            lastName: string | null;
            role: string;
        };
        company: {
            id: string;
            name: string;
            status: string;
        };
        pricing: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            merchantId: string;
            description: string | null;
            targetType: string;
            targetCompanyId: string | null;
            targetCompanyGroup: string | null;
            scopeType: string;
            scopeProductIds: bigint[];
            scopeCollectionIds: bigint[];
            scopeTags: string | null;
            scopeVariantIds: bigint[];
            discountType: string;
            discountValue: import("@prisma/client-runtime-utils").Decimal | null;
            discountPercentage: import("@prisma/client-runtime-utils").Decimal | null;
            qtyBreaks: import("@prisma/client/runtime/client").JsonValue | null;
            minCartAmount: import("@prisma/client-runtime-utils").Decimal | null;
            priority: number;
            isActive: boolean;
            validFrom: Date | null;
            validUntil: Date | null;
        }[];
        shopifyCustomerId: string | undefined;
    } | {
        error: string;
    }>;
    refreshToken(body: {
        token: string;
    }, res: Response): Promise<Response<any, Record<string, any>>>;
    ping(res: Response): Promise<Response<any, Record<string, any>>>;
    validateToken(body: {
        token: string;
    }, res: Response): Promise<Response<any, Record<string, any>>>;
    getShopifySsoUrl(user: any, body: {
        returnTo?: string;
    }, res: Response): Promise<Response<any, Record<string, any>>>;
    getCurrentUser(token: string, res: Response): Promise<Response<any, Record<string, any>>>;
}
