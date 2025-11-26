import { Controller, Post, Body, Get, Query, Res, HttpStatus, Delete, Param } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { SessionService } from './session.service';
import { TokenBlacklistService } from './token-blacklist.service';
import { ShopifySsoService } from '../shopify/shopify-sso.service';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private sessionService: SessionService,
    private tokenBlacklistService: TokenBlacklistService,
    private shopifySsoService: ShopifySsoService,
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

      // Generate Shopify SSO URL
      const shopifySsoUrl = this.shopifySsoService.generateSsoUrl({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        customerId: user.shopifyCustomerId,
        returnTo: '/account',
      });

      return res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          companyId: user.companyId,
        },
        shopifySsoUrl, // Frontend will redirect user to this URL
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
    try {
      const ssoUrl = this.shopifySsoService.generateSsoUrl({
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
        customerId: body.customerId,
        returnTo: body.returnTo,
      });

      return res.json({ ssoUrl });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'SSO URL generation failed',
      });
    }
  }

  @Public()
  @Get('sessions')
  async getSessions() {
    // Get all active sessions (admin only in production)
    const sessions = await this.sessionService.getAllSessions();
    return sessions;
  }

  @Public()
  @Delete('sessions/:sessionId')
  async deleteSession(@Param('sessionId') sessionId: string, @Res() res: Response) {
    try {
      await this.sessionService.deleteSession(sessionId);
      return res.json({ message: 'Session terminated' });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Failed to terminate session',
      });
    }
  }

  @Public()
  @Post('logout')
  async logout(@Body() body: { token: string }, @Res() res: Response) {
    try {
      // Add token to blacklist
      await this.tokenBlacklistService.addToBlacklist(body.token, 'user_logout');
      
      return res.json({ message: 'Logged out successfully' });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Logout failed',
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
