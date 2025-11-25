import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private config: ConfigService) {}

  async sendInvitation(email: string, companyName: string, invitationUrl: string) {
    // TODO: Implement with nodemailer or SendGrid
    this.logger.log(`📧 Sending invitation to ${email} for ${companyName}`);
    this.logger.log(`Invitation URL: ${invitationUrl}`);
    
    // For now, just log (production'da email servisi eklenecek)
    return {
      success: true,
      message: 'Invitation email sent',
      invitationUrl, // Development için URL'i döndür
    };
  }

  async sendOrderConfirmation(email: string, orderId: string) {
    this.logger.log(`📧 Order confirmation sent to ${email} for order ${orderId}`);
    return { success: true };
  }

  async sendPasswordReset(email: string, resetUrl: string) {
    this.logger.log(`📧 Password reset sent to ${email}`);
    return { success: true, resetUrl };
  }
}



