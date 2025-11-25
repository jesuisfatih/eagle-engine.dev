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

@Processor('customers-sync')
export class CustomersSyncWorker {
  private readonly logger = new Logger(CustomersSyncWorker.name);

  constructor(
    private prisma: PrismaService,
    private shopifyService: ShopifyService,
    private shopifyGraphql: ShopifyGraphqlService,
  ) {}

  @Process('initial-sync')
  async handleInitialSync(job: Job<SyncJobData>) {
    const { merchantId, syncLogId } = job.data;
    this.logger.log(`Starting initial customers sync for merchant: ${merchantId}`);

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
        const result: any = await this.shopifyGraphql.getCustomers(
          merchant.shopDomain,
          merchant.accessToken,
          50,
          cursor,
        );

        const customers = result.customers.edges;

        for (const edge of customers) {
          const customer = edge.node;
          
          await this.prisma.shopifyCustomer.upsert({
            where: {
              merchantId_shopifyCustomerId: {
                merchantId,
                shopifyCustomerId: BigInt(customer.legacyResourceId),
              },
            },
            create: {
              merchantId,
              shopifyCustomerId: BigInt(customer.legacyResourceId),
              email: customer.email,
              firstName: customer.firstName,
              lastName: customer.lastName,
              phone: customer.phone,
              tags: customer.tags?.join(', '),
              note: customer.note,
              totalSpent: customer.totalSpent ? parseFloat(customer.totalSpent) : 0,
              ordersCount: customer.ordersCount || 0,
              addresses: customer.addresses || [],
              rawData: customer,
            },
            update: {
              email: customer.email,
              firstName: customer.firstName,
              lastName: customer.lastName,
              phone: customer.phone,
              tags: customer.tags?.join(', '),
              note: customer.note,
              totalSpent: customer.totalSpent ? parseFloat(customer.totalSpent) : 0,
              ordersCount: customer.ordersCount || 0,
              addresses: customer.addresses || [],
              rawData: customer,
              syncedAt: new Date(),
            },
          });

          processed++;
        }

        hasNextPage = result.customers.pageInfo.hasNextPage;
        cursor = result.customers.pageInfo.endCursor;

        await job.progress((processed / 1000) * 100); // Estimate progress
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

      this.logger.log(`Completed customers sync. Processed ${processed} customers.`);
      return { processed };
    } catch (error) {
      this.logger.error('Customers sync failed', error);
      
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
    // This runs periodically (e.g., every 20 seconds)
    return this.handleInitialSync(job);
  }
}



