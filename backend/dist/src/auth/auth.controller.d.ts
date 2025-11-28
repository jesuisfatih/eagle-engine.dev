import type { Response } from 'express';
import { AuthService } from './auth.service';
import { SessionSyncService } from './session-sync.service';
export declare class AuthController {
    private authService;
    private sessionSyncService;
    constructor(authService: AuthService, sessionSyncService: SessionSyncService);
    login(body: {
        email: string;
        password: string;
    }, res: Response): Promise<Response<any, Record<string, any>>>;
    shopifyCallback(shopifyCustomerId: string, email: string, res: Response): Promise<void>;
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
    shopifyCustomerSync(body: {
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
    getShopifySsoUrl(body: any, res: Response): Promise<Response<any, Record<string, any>>>;
    getCurrentUser(token: string, res: Response): Promise<Response<any, Record<string, any>>>;
}
