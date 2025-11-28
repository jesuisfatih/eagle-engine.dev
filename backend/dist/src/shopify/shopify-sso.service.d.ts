import { ConfigService } from '@nestjs/config';
export declare class ShopifySsoService {
    private configService;
    private readonly logger;
    private readonly shopifyDomain;
    private readonly multipassSecret;
    constructor(configService: ConfigService);
    generateMultipassToken(customerData: {
        email: string;
        firstName?: string;
        lastName?: string;
        customerId?: string;
        returnTo?: string;
    }): string;
    generateSsoUrl(customerData: {
        email: string;
        firstName?: string;
        lastName?: string;
        customerId?: string;
        returnTo?: string;
    }): string;
    verifyShopifySession(shopifyCustomerId: string): Promise<boolean>;
}
