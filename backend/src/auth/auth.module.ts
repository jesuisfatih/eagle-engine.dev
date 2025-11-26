import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SessionSyncService } from './session-sync.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ShopifyOauthService } from './shopify-oauth.service';
import { ShopifyModule } from '../shopify/shopify.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ShopifyModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') || 'default-secret',
        signOptions: {
          expiresIn: '7d' as any,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, SessionSyncService, JwtStrategy, ShopifyOauthService],
  exports: [AuthService, SessionSyncService, JwtModule],
})
export class AuthModule {}



