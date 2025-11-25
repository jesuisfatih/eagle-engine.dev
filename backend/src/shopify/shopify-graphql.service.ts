import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ShopifyService } from './shopify.service';

@Injectable()
export class ShopifyGraphqlService {
  private readonly logger = new Logger(ShopifyGraphqlService.name);

  constructor(
    private httpService: HttpService,
    private shopifyService: ShopifyService,
  ) {}

  async query<T>(shop: string, accessToken: string, query: string, variables?: any): Promise<T> {
    const url = `https://${shop}/admin/api/${this.shopifyService.getApiVersion()}/graphql.json`;

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          url,
          {
            query,
            variables,
          },
          {
            headers: {
              'X-Shopify-Access-Token': accessToken,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      if (response.data.errors) {
        this.logger.error('GraphQL errors:', response.data.errors);
        throw new Error(JSON.stringify(response.data.errors));
      }

      return response.data.data as T;
    } catch (error) {
      this.logger.error('GraphQL query failed', error);
      throw error;
    }
  }

  // Common GraphQL queries
  async getProductsWithVariants(shop: string, accessToken: string, first = 50, cursor?: string) {
    const query = `
      query GetProducts($first: Int!, $after: String) {
        products(first: $first, after: $after) {
          edges {
            cursor
            node {
              id
              legacyResourceId
              title
              handle
              description
              vendor
              productType
              tags
              status
              images(first: 10) {
                edges {
                  node {
                    url
                    altText
                  }
                }
              }
              variants(first: 100) {
                edges {
                  node {
                    id
                    legacyResourceId
                    sku
                    title
                    price
                    compareAtPrice
                    inventoryQuantity
                    weight
                    weightUnit
                    selectedOptions {
                      name
                      value
                    }
                  }
                }
              }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `;

    return this.query(shop, accessToken, query, { first, after: cursor });
  }

  async getCustomers(shop: string, accessToken: string, first = 50, cursor?: string) {
    const query = `
      query GetCustomers($first: Int!, $after: String) {
        customers(first: $first, after: $after) {
          edges {
            cursor
            node {
              id
              legacyResourceId
              email
              firstName
              lastName
              phone
              tags
              note
              ordersCount
              totalSpent
              addresses {
                address1
                address2
                city
                province
                country
                zip
              }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `;

    return this.query(shop, accessToken, query, { first, after: cursor });
  }
}



