import { Processor, Process } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
import { ShopifyService } from '../../shopify/shopify.service';
import { ShopifyGraphqlService } from '../../shopify/shopify-graphql.service';

interface SyncJobData {
  merchantId: string;
  syncLogId?: string;
}

@Processor('products-sync')
export class ProductsSyncWorker {
  private readonly logger = new Logger(ProductsSyncWorker.name);

  constructor(
    private prisma: PrismaService,
    private shopifyService: ShopifyService,
    private shopifyGraphql: ShopifyGraphqlService,
  ) {}

  @Process('initial-sync')
  async handleInitialSync(job: Job<SyncJobData>) {
    const { merchantId, syncLogId } = job.data;
    this.logger.log(`Starting initial products sync for merchant: ${merchantId}`);

    try {
      const merchant = await this.prisma.merchant.findUnique({
        where: { id: merchantId },
      });

      if (!merchant) {
        throw new Error('Merchant not found');
      }

      let cursor: string | undefined;
      let hasNextPage = true;
      let processed = 0;

      while (hasNextPage) {
        const result: any = await this.shopifyGraphql.getProductsWithVariants(
          merchant.shopDomain,
          merchant.accessToken,
          50,
          cursor,
        );

        const products = result.products.edges;

        for (const edge of products) {
          const product = edge.node;
          
          const catalogProduct = await this.prisma.catalogProduct.upsert({
            where: {
              merchantId_shopifyProductId: {
                merchantId,
                shopifyProductId: BigInt(product.legacyResourceId),
              },
            },
            create: {
              merchantId,
              shopifyProductId: BigInt(product.legacyResourceId),
              title: product.title,
              handle: product.handle,
              description: product.description,
              vendor: product.vendor,
              productType: product.productType,
              tags: product.tags?.join(', '),
              status: product.status,
              images: product.images?.edges?.map((e: any) => e.node) || [],
              rawData: product,
            },
            update: {
              title: product.title,
              handle: product.handle,
              description: product.description,
              vendor: product.vendor,
              productType: product.productType,
              tags: product.tags?.join(', '),
              status: product.status,
              images: product.images?.edges?.map((e: any) => e.node) || [],
              rawData: product,
              syncedAt: new Date(),
            },
          });

          // Sync variants
          if (product.variants?.edges) {
            for (const variantEdge of product.variants.edges) {
              const variant = variantEdge.node;
              
              await this.prisma.catalogVariant.upsert({
                where: {
                  shopifyVariantId: BigInt(variant.legacyResourceId),
                },
                create: {
                  productId: catalogProduct.id,
                  shopifyVariantId: BigInt(variant.legacyResourceId),
                  sku: variant.sku,
                  title: variant.title,
                  price: variant.price ? parseFloat(variant.price) : 0,
                  compareAtPrice: variant.compareAtPrice ? parseFloat(variant.compareAtPrice) : null,
                  inventoryQuantity: variant.inventoryQuantity || 0,
                  weight: variant.weight ? parseFloat(variant.weight) : null,
                  weightUnit: variant.weightUnit,
                  option1: variant.selectedOptions?.[0]?.value,
                  option2: variant.selectedOptions?.[1]?.value,
                  option3: variant.selectedOptions?.[2]?.value,
                  rawData: variant,
                },
                update: {
                  sku: variant.sku,
                  title: variant.title,
                  price: variant.price ? parseFloat(variant.price) : 0,
                  compareAtPrice: variant.compareAtPrice ? parseFloat(variant.compareAtPrice) : null,
                  inventoryQuantity: variant.inventoryQuantity || 0,
                  weight: variant.weight ? parseFloat(variant.weight) : null,
                  weightUnit: variant.weightUnit,
                  option1: variant.selectedOptions?.[0]?.value,
                  option2: variant.selectedOptions?.[1]?.value,
                  option3: variant.selectedOptions?.[2]?.value,
                  rawData: variant,
                  syncedAt: new Date(),
                },
              });
            }
          }

          processed++;
        }

        hasNextPage = result.products.pageInfo.hasNextPage;
        cursor = result.products.pageInfo.endCursor;

        await job.progress((processed / 100) * 100);
      }

      if (syncLogId) {
        await this.prisma.syncLog.update({
          where: { id: syncLogId },
          data: {
            status: 'completed',
            recordsProcessed: processed,
            completedAt: new Date(),
          },
        });
      }

      this.logger.log(`Completed products sync. Processed ${processed} products.`);
      return { processed };
    } catch (error) {
      this.logger.error('Products sync failed', error);
      
      if (syncLogId) {
        await this.prisma.syncLog.update({
          where: { id: syncLogId },
          data: {
            status: 'failed',
            errorMessage: error.message,
            completedAt: new Date(),
          },
        });
      }

      throw error;
    }
  }

  @Process('sync')
  async handleContinuousSync(job: Job<SyncJobData>) {
    return this.handleInitialSync(job);
  }
}

