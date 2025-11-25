import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ShopifyService } from './shopify.service';

@Injectable()
export class ShopifyRestService {
  private readonly logger = new Logger(ShopifyRestService.name);

  constructor(
    private httpService: HttpService,
    private shopifyService: ShopifyService,
  ) {}

  async get<T>(shop: string, accessToken: string, path: string): Promise<T> {
    const url = this.shopifyService.buildAdminApiUrl(shop, path);

    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            'X-Shopify-Access-Token': accessToken,
            'Content-Type': 'application/json',
          },
        }),
      );

      return response.data as T;
    } catch (error) {
      this.logger.error(`REST GET failed: ${url}`, error.response?.data);
      throw error;
    }
  }

  async post<T>(shop: string, accessToken: string, path: string, data: any): Promise<T> {
    const url = this.shopifyService.buildAdminApiUrl(shop, path);

    try {
      const response = await firstValueFrom(
        this.httpService.post(url, data, {
          headers: {
            'X-Shopify-Access-Token': accessToken,
            'Content-Type': 'application/json',
          },
        }),
      );

      return response.data as T;
    } catch (error) {
      this.logger.error(`REST POST failed: ${url}`, error.response?.data);
      throw error;
    }
  }

  async put<T>(shop: string, accessToken: string, path: string, data: any): Promise<T> {
    const url = this.shopifyService.buildAdminApiUrl(shop, path);

    try {
      const response = await firstValueFrom(
        this.httpService.put(url, data, {
          headers: {
            'X-Shopify-Access-Token': accessToken,
            'Content-Type': 'application/json',
          },
        }),
      );

      return response.data as T;
    } catch (error) {
      this.logger.error(`REST PUT failed: ${url}`, error.response?.data);
      throw error;
    }
  }

  async delete<T>(shop: string, accessToken: string, path: string): Promise<T> {
    const url = this.shopifyService.buildAdminApiUrl(shop, path);

    try {
      const response = await firstValueFrom(
        this.httpService.delete(url, {
          headers: {
            'X-Shopify-Access-Token': accessToken,
            'Content-Type': 'application/json',
          },
        }),
      );

      return response.data as T;
    } catch (error) {
      this.logger.error(`REST DELETE failed: ${url}`, error.response?.data);
      throw error;
    }
  }

  // Specific Shopify endpoints
  async getCustomers(shop: string, accessToken: string, limit = 250) {
    return this.get(shop, accessToken, `/customers.json?limit=${limit}`);
  }

  async getProducts(shop: string, accessToken: string, limit = 250) {
    return this.get(shop, accessToken, `/products.json?limit=${limit}`);
  }

  async getOrders(shop: string, accessToken: string, limit = 250) {
    return this.get(shop, accessToken, `/orders.json?limit=${limit}&status=any`);
  }

  async createDiscountCode(shop: string, accessToken: string, data: any) {
    return this.post(shop, accessToken, '/price_rules.json', data);
  }
}



