import { Controller, Post, Body, Get, Query, Res, HttpStatus, Delete, Param, Headers, UseGuards, Logger } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { SessionSyncService } from './session-sync.service';
import { Public } from './decorators/public.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { ShopifySsoService } from '../shopify/shopify-sso.service';
import { ShopifyCustomerSyncService } from '../shopify/shopify-customer-sync.service';
import { ShopifyRestService } from '../shopify/shopify-rest.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private authService: AuthService,
    private sessionSyncService: SessionSyncService,
    private shopifySso: ShopifySsoService,
    private shopifyCustomerSync: ShopifyCustomerSyncService,
    private shopifyRest: ShopifyRestService,
    private prisma: PrismaService,
  ) {}

  @Public()
  @Post('login')
  async login(
    @Body() body: { email: string; password: string },
    @Res() res: Response,
  ) {
    try {
      const user = await this.authService.validateUser(body.email, body.password);
      
      if (!user) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'Invalid credentials',
        });
      }

      const token = await this.authService.generateToken(user);

      return res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          companyId: user.companyId,
        },
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Login failed',
        error: error.message,
      });
    }
  }

  @Public()
  @Get('shopify-callback')
  async shopifyCallback(
    @Query('customer_id') shopifyCustomerId: string,
    @Query('email') email: string,
    @Res() res: Response,
  ) {
    try {
      // When user logs in Shopify, Shopify redirects back here
      // We log them in Eagle automatically
      
      const user = await this.authService.findUserByEmail(email);
      
      if (!user) {
        // Create new user from Shopify customer
        const newUser = await this.authService.createUserFromShopify({
          email,
          shopifyCustomerId,
        });
        
        const token = await this.authService.generateToken(newUser);
        
        return res.redirect(
          `https://accounts.eagledtfsupply.com/login?token=${token}&auto=true`
        );
      }

      const token = await this.authService.generateToken(user);
      
      return res.redirect(
        `https://accounts.eagledtfsupply.com/login?token=${token}&auto=true`
      );
    } catch (error) {
      return res.redirect('https://accounts.eagledtfsupply.com/login?error=shopify_auth_failed');
    }
  }

  @Public()
  @Get('validate-invitation')
  async validateInvitation(@Query('token') token: string, @Res() res: Response) {
    try {
      const user = await this.prisma.companyUser.findFirst({
        where: { invitationToken: token },
        include: { company: true },
      });

      if (!user) {
        return res.status(HttpStatus.NOT_FOUND).json({
          error: 'Invalid invitation token',
        });
      }

      if (user.invitationAcceptedAt) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          error: 'Invitation already accepted',
        });
      }

      return res.json({
        email: user.email,
        companyName: user.company.name,
        valid: true,
      });
    } catch (error: any) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Failed to validate invitation',
      });
    }
  }

  @Public()
  @Post('send-verification-code')
  async sendVerificationCode(@Body() body: { email: string }, @Res() res: Response) {
    try {
      const result = await this.authService.sendVerificationCode(body.email);
      return res.json(result);
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        error: error.message || 'Failed to send verification code',
      });
    }
  }

  @Public()
  @Post('verify-email-code')
  async verifyEmailCode(@Body() body: { email: string; code: string }, @Res() res: Response) {
    try {
      const isValid = await this.authService.verifyEmailCode(body.email, body.code);
      return res.json({ valid: isValid });
    } catch (error: any) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        error: error.message || 'Failed to verify code',
      });
    }
  }

  @Public()
  @Post('register')
  async register(@Body() body: any, @Res() res: Response) {
    try {
      this.logger.log(`📝 [REGISTER] Registration request received for email: ${body.email}`);
      const result = await this.authService.register(body);
      this.logger.log(`✅ [REGISTER] Registration successful for email: ${body.email}`);
      return res.json(result);
    } catch (error: any) {
      this.logger.error(`❌ [REGISTER] Registration failed for email: ${body.email}`, {
        error: error.message,
        stack: error.stack,
      });
      return res.status(HttpStatus.BAD_REQUEST).json({
        error: error.message || 'Registration failed',
      });
    }
  }

  @Public()
  @Post('accept-invitation')
  async acceptInvitation(@Body() body: any) {
    try {
      this.logger.log(`📝 [ACCEPT_INVITATION] Invitation acceptance request received for token: ${body.token?.substring(0, 10)}...`);
      const result = await this.authService.acceptInvitation(body);
      this.logger.log(`✅ [ACCEPT_INVITATION] Invitation accepted successfully`);
      return result;
    } catch (error: any) {
      this.logger.error(`❌ [ACCEPT_INVITATION] Invitation acceptance failed`, {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }

  @Public()
  @Post('shopify-customer-sync')
  async syncShopifyCustomer(@Body() body: {
    shopifyCustomerId: string;
    email: string;
    fingerprint?: string;
  }) {
    return this.sessionSyncService.syncFromShopify(
      body.shopifyCustomerId,
      body.email,
      body.fingerprint
    );
  }

  @Public()
  @Get('resolve')
  async resolveContext(@Headers('authorization') auth: string) {
    const token = auth?.replace('Bearer ', '');
    if (!token) {
      return { error: 'No token provided' };
    }

    try {
      const decoded: any = this.authService['jwtService'].verify(token);
      return this.sessionSyncService.resolveContext(decoded.sub);
    } catch (error) {
      return { error: 'Invalid token' };
    }
  }

  @Public()
  @Post('refresh')
  async refreshToken(@Body() body: { token: string }, @Res() res: Response) {
    try {
      const newToken = await this.authService.refreshToken(body.token);
      
      if (!newToken) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'Invalid or expired token',
        });
      }

      return res.json({ token: newToken });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Token refresh failed',
      });
    }
  }

  @Public()
  @Get('ping')
  async ping(@Res() res: Response) {
    return res.json({ status: 'ok', timestamp: new Date().toISOString() });
  }

  @Public()
  @Post('validate')
  async validateToken(@Body() body: { token: string }, @Res() res: Response) {
    try {
      const user = await this.authService.validateToken(body.token);
      
      if (!user) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          valid: false,
        });
      }

      return res.json({ valid: true, user });
    } catch (error) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        valid: false,
      });
    }
  }

  /**
   * Generate Shopify SSO URL for logged-in user
   * Used when user logs in at accounts.eagledtfsupply.com and wants to go to Shopify
   * 
   * Usage:
   * POST /api/v1/auth/shopify-sso
   * Headers: Authorization: Bearer {token}
   * Body: { returnTo?: string }
   */
  @UseGuards(JwtAuthGuard)
  @Post('shopify-sso')
  async getShopifySsoUrl(
    @CurrentUser() user: any,
    @Body() body: { returnTo?: string },
    @Res() res: Response,
  ) {
    try {
      // 1. Ensure user is synced to Shopify
      if (!user.shopifyCustomerId) {
        await this.shopifyCustomerSync.syncUserToShopify(user.id);
        // Reload user
        const updatedUser = await this.prisma.companyUser.findUnique({
          where: { id: user.id },
        });
        if (updatedUser) {
          user.shopifyCustomerId = updatedUser.shopifyCustomerId;
        }
      }

      // 2. Get merchant settings for SSO mode
      const company = await this.prisma.company.findUnique({
        where: { id: user.companyId },
        include: { merchant: true },
      });

      if (!company?.merchant) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          error: 'Merchant not found',
        });
      }

      const settings = (company.merchant.settings as any) || {};
      const ssoMode = settings.ssoMode || 'alternative';
      const returnTo = body.returnTo || '/checkout';

      // 3. Generate SSO URL based on mode
      if (ssoMode === 'multipass' && settings.multipassSecret) {
        // Multipass SSO (Shopify Plus)
        const ssoUrl = this.shopifySso.generateSsoUrl({
          email: user.email,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          customerId: user.shopifyCustomerId?.toString(),
          returnTo,
        });

        return res.json({
          ssoUrl,
          mode: 'multipass',
        });
      } else {
        // Alternative: Customer Account API invite token
        try {
          if (!user.shopifyCustomerId) {
            throw new Error('Customer not synced to Shopify');
          }

          // Create customer invite token
          const inviteResponse = await this.shopifyRest.createCustomerInvite(
            company.merchant.shopDomain,
            company.merchant.accessToken,
            user.shopifyCustomerId.toString(),
          );

          // Extract invite token from URL
          const inviteUrl = inviteResponse.customer_invite?.invite_url || '';
          const tokenMatch = inviteUrl.match(/token=([^&]+)/);
          const inviteToken = tokenMatch ? tokenMatch[1] : null;

          if (inviteToken) {
            // Use invite token in login URL
            const shopDomain = company.merchant.shopDomain;
            const loginUrl = `https://${shopDomain}/account/login?email=${encodeURIComponent(user.email)}&token=${inviteToken}&return_to=${encodeURIComponent(returnTo)}`;

            return res.json({
              ssoUrl: loginUrl,
              mode: 'customer_account_api',
              message: 'Customer invite token created. User will be logged in automatically.',
            });
          } else {
            // Fallback: Just email
            const shopDomain = company.merchant.shopDomain;
            const loginUrl = `https://${shopDomain}/account/login?email=${encodeURIComponent(user.email)}&return_to=${encodeURIComponent(returnTo)}`;

            return res.json({
              ssoUrl: loginUrl,
              mode: 'email_only',
              message: 'Email pre-filled. Customer must enter password.',
            });
          }
        } catch (inviteError: any) {
          this.logger.warn('Customer invite failed, using email-only login', inviteError);
          // Fallback: Just email
          const shopDomain = company.merchant.shopDomain;
          const loginUrl = `https://${shopDomain}/account/login?email=${encodeURIComponent(user.email)}&return_to=${encodeURIComponent(returnTo)}`;

          return res.json({
            ssoUrl: loginUrl,
            mode: 'email_only',
            message: 'Email pre-filled. Customer must enter password.',
          });
        }
      }
    } catch (error: any) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: `SSO generation failed: ${error.message}`,
      });
    }
  }


  @Public()
  @Get('user')
  async getCurrentUser(@Query('token') token: string, @Res() res: Response) {
    try {
      const user = await this.authService.validateToken(token);
      
      if (!user) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'Invalid token',
        });
      }

      return res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        companyId: user.companyId,
        shopifyCustomerId: user.shopifyCustomerId?.toString(),
      });
    } catch (error) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'Invalid token',
      });
    }
  }
}
