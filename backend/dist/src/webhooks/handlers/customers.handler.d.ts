import { PrismaService } from '../../prisma/prisma.service';
export declare class CustomersHandler {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    handleCustomerCreate(customerData: any, headers: any): Promise<{
        success: boolean;
    }>;
}
