import { HttpService } from '@nestjs/axios';
import { ShopifyService } from './shopify.service';
export declare class ShopifyAdminDiscountService {
    private httpService;
    private shopifyService;
    private readonly logger;
    constructor(httpService: HttpService, shopifyService: ShopifyService);
    createPriceRule(shop: string, accessToken: string, code: string, value: number, valueType: 'fixed_amount' | 'percentage'): Promise<{
        priceRuleId: any;
        discountCodeId: any;
        code: string;
    }>;
}
