import { CheckoutService } from './checkout.service';
export declare class CheckoutController {
    private checkoutService;
    constructor(checkoutService: CheckoutService);
    createCheckout(cartId: string): Promise<{
        checkoutUrl: string;
        discountCode: string | undefined;
        total: number;
        savings: number;
    }>;
}
