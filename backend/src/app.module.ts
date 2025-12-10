import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bull';
// ThrottlerModule removed - not installed
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { ShopifyModule } from './shopify/shopify.module';
import { SyncModule } from './sync/sync.module';
import { PricingModule } from './pricing/pricing.module';
import { CartsModule } from './carts/carts.module';
import { EventsModule } from './events/events.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { CompaniesModule } from './companies/companies.module';
import { CatalogModule } from './catalog/catalog.module';
import { OrdersModule } from './orders/orders.module';
import { CheckoutModule } from './checkout/checkout.module';
import { MerchantsModule } from './merchants/merchants.module';
import { MailModule } from './mail/mail.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { ShopifyCustomersModule } from './shopify-customers/shopify-customers.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { QuotesModule } from './quotes/quotes.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SettingsModule } from './settings/settings.module';
import { UploadsModule } from './uploads/uploads.module';
import { AbandonedCartsModule } from './abandoned-carts/abandoned-carts.module';
import { SupportTicketsModule } from './support-tickets/support-tickets.module';
import { WishlistModule } from './wishlist/wishlist.module';
import { AddressesModule } from './addresses/addresses.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // ThrottlerModule removed
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get<string>('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
          password: config.get<string>('REDIS_PASSWORD'),
        },
      }),
      inject: [ConfigService],
    }),
    PrismaModule,
    RedisModule,
    AuthModule,
    ShopifyModule,
    SyncModule,
    PricingModule,
    CartsModule,
    EventsModule,
    WebhooksModule,
    CompaniesModule,
    CatalogModule,
    OrdersModule,
    CheckoutModule,
    MerchantsModule,
    MailModule,
    SchedulerModule,
    ShopifyCustomersModule,
    AnalyticsModule,
    QuotesModule,
    NotificationsModule,
    SettingsModule,
    UploadsModule,
    AbandonedCartsModule,
    SupportTicketsModule,
    WishlistModule,
    AddressesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
