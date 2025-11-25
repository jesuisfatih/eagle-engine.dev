import { Controller, Post, Body, HttpCode, HttpStatus, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ShopifyOauthService } from './shopify-oauth.service';
import { Public } from './decorators/public.decorator';

class LoginDto {
  email: string;
  password: string;
}

class AcceptInvitationDto {
  token: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private shopifyOauth: ShopifyOauthService,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.loginCompanyUser(dto.email, dto.password);
  }

  @Public()
  @Post('accept-invitation')
  @HttpCode(HttpStatus.OK)
  async acceptInvitation(@Body() dto: AcceptInvitationDto) {
    return this.authService.acceptInvitation(dto.token, dto.password);
  }

  @Public()
  @Get('shopify/install')
  async shopifyInstall(@Query('shop') shop: string) {
    if (!shop) {
      return { error: 'Missing shop parameter' };
    }
    
    const installUrl = this.shopifyOauth.getInstallUrl(shop);
    return { installUrl };
  }

  @Public()
  @Get('shopify/callback')
  async shopifyCallback(
    @Query('shop') shop: string,
    @Query('code') code: string,
    @Query('hmac') hmac: string,
    @Query('timestamp') timestamp: string,
    @Query('state') state: string,
  ) {
    try {
      const result = await this.shopifyOauth.handleCallback({
        shop,
        code,
        hmac,
        timestamp,
        state,
      });

      // Redirect to admin panel with token
      return {
        success: true,
        redirectUrl: `${process.env.ADMIN_URL}/auth/callback?token=${result.accessToken}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}




