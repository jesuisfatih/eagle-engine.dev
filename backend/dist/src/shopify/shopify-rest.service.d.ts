import { HttpService } from '@nestjs/axios';
import { ShopifyService } from './shopify.service';
export declare class ShopifyRestService {
    private httpService;
    private shopifyService;
    private readonly logger;
    constructor(httpService: HttpService, shopifyService: ShopifyService);
    get<T>(shop: string, accessToken: string, path: string): Promise<T>;
    post<T>(shop: string, accessToken: string, path: string, data: any): Promise<T>;
    put<T>(shop: string, accessToken: string, path: string, data: any): Promise<T>;
    delete<T>(shop: string, accessToken: string, path: string): Promise<T>;
    getCustomers(shop: string, accessToken: string, limit?: number): Promise<unknown>;
    getProducts(shop: string, accessToken: string, limit?: number): Promise<unknown>;
    getOrders(shop: string, accessToken: string, limit?: number): Promise<unknown>;
    createDiscountCode(shop: string, accessToken: string, data: any): Promise<unknown>;
}
