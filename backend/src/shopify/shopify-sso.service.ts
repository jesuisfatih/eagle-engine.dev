import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class ShopifySsoService {
  private readonly logger = new Logger(ShopifySsoService.name);
  private readonly shopifyDomain: string;
  private readonly multipassSecret: string;

  constructor(private configService: ConfigService) {
    this.shopifyDomain = this.configService.get('SHOPIFY_STORE_DOMAIN');
    // Multipass secret from Shopify Admin -> Settings -> Customer accounts -> Multipass
    this.multipassSecret = this.configService.get('SHOPIFY_MULTIPASS_SECRET');
  }

  /**
   * Generate Shopify Multipass token for SSO
   * User logs in Eagle → Automatically logged in Shopify
   */
  generateMultipassToken(customerData: {
    email: string;
    firstName?: string;
    lastName?: string;
    customerId?: string;
    returnTo?: string;
  }): string {
    try {
      const multipassData = {
        email: customerData.email,
        created_at: new Date().toISOString(),
        first_name: customerData.firstName || '',
        last_name: customerData.lastName || '',
        identifier: customerData.customerId || customerData.email,
        return_to: customerData.returnTo || '/',
      };

      // Step 1: JSON encode
      const jsonData = JSON.stringify(multipassData);

      // Step 2: Encrypt with AES-256-CBC
      const encryptionKey = crypto
        .createHash('sha256')
        .update(this.multipassSecret)
        .digest()
        .slice(0, 32);

      const signingKey = crypto
        .createHash('sha256')
        .update(this.multipassSecret)
        .digest();

      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);
      
      let encrypted = cipher.update(jsonData, 'utf8', 'binary');
      encrypted += cipher.final('binary');

      // Step 3: Add signature (HMAC-SHA256)
      const ciphertext = Buffer.concat([
        iv,
        Buffer.from(encrypted, 'binary'),
      ]);

      const hmac = crypto.createHmac('sha256', signingKey);
      hmac.update(ciphertext);
      const signature = hmac.digest();

      // Step 4: Combine and encode
      const token = Buffer.concat([ciphertext, signature]).toString('base64');

      // Step 5: URL encode
      return encodeURIComponent(token);
    } catch (error) {
      this.logger.error('Multipass token generation failed', error);
      throw error;
    }
  }

  /**
   * Generate Shopify SSO URL
   */
  generateSsoUrl(customerData: {
    email: string;
    firstName?: string;
    lastName?: string;
    customerId?: string;
    returnTo?: string;
  }): string {
    const token = this.generateMultipassToken(customerData);
    return `https://${this.shopifyDomain}/account/login/multipass/${token}`;
  }

  /**
   * Verify Shopify customer is logged in
   * Check if customer has valid Shopify session
   */
  async verifyShopifySession(shopifyCustomerId: string): Promise<boolean> {
    try {
      // Check if customer exists in Shopify
      const response = await fetch(
        `https://${this.shopifyDomain}/admin/api/2024-01/customers/${shopifyCustomerId}.json`,
        {
          headers: {
            'X-Shopify-Access-Token': this.configService.get('SHOPIFY_ACCESS_TOKEN'),
          },
        }
      );

      return response.ok;
    } catch (error) {
      this.logger.error('Shopify session verification failed', error);
      return false;
    }
  }
}

