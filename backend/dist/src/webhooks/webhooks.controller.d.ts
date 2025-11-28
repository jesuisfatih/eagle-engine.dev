import { OrdersHandler } from './handlers/orders.handler';
import { CustomersHandler } from './handlers/customers.handler';
export declare class WebhooksController {
    private ordersHandler;
    private customersHandler;
    constructor(ordersHandler: OrdersHandler, customersHandler: CustomersHandler);
    orderCreate(body: any, headers: any): Promise<{
        success: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
    }>;
    orderPaid(body: any, headers: any): Promise<{
        success: boolean;
    }>;
    customerCreate(body: any, headers: any): Promise<{
        success: boolean;
    }>;
}
