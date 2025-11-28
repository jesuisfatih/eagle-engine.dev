import { Controller, Post, Body, Get, Query, Res, HttpStatus, Delete, Param, Headers } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { SessionSyncService } from './session-sync.service';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private sessionSyncService: SessionSyncService,
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
  @Post('accept-invitation')
  async acceptInvitation(@Body() body: any) {
    return this.authService.acceptInvitation(body);
  }

  @Public()
  @Post('shopify-customer-sync')
  async shopifyCustomerSync(@Body() body: {
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

  @Public()
  @Post('shopify-sso')
  async getShopifySsoUrl(@Body() body: any, @Res() res: Response) {
    // SSO handled by frontend/snippet - endpoint kept for compatibility
    return res.json({ ssoUrl: null, message: 'SSO handled client-side' });
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
