import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
interface CartLineItem {
    merchandiseId: string;
    quantity: number;
}
export declare class ShopifyStorefrontService {
    private httpService;
    private config;
    private readonly logger;
    constructor(httpService: HttpService, config: ConfigService);
    createCart(shop: string, storefrontAccessToken: string, lines: CartLineItem[], discountCodes?: string[]): Promise<{
        cartId: any;
        checkoutUrl: any;
        total: any;
    }>;
}
export {};
