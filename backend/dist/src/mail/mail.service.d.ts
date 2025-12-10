import { ConfigService } from '@nestjs/config';
export declare class MailService {
    private config;
    private readonly logger;
    constructor(config: ConfigService);
    sendInvitation(email: string, companyName: string, invitationUrl: string): Promise<{
        success: boolean;
        message: string;
        invitationUrl: string;
    }>;
    sendOrderConfirmation(email: string, orderId: string): Promise<{
        success: boolean;
    }>;
    sendPasswordReset(email: string, resetUrl: string): Promise<{
        success: boolean;
        resetUrl: string;
    }>;
    sendVerificationCode(email: string, code: string): Promise<{
        success: boolean;
        message: string;
        code: string;
    }>;
}
