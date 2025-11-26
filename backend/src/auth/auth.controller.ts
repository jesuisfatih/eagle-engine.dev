import { Controller, Post, Body, Get, Query, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { ShopifySsoService } from '../shopify/shopify-sso.service';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
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
}
