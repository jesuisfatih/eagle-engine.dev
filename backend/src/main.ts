import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// BigInt serialization fix
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  const config = app.get(ConfigService);

  // CORS handled by Caddy - removed duplicate headers to prevent '*, *' error

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // API prefix — exclude root so Shopify embedded app can load at /
  app.setGlobalPrefix('api/v1', {
    exclude: ['/'],
  });

  const port = config.get<number>('PORT', 4000);
  await app.listen(port);

  logger.log(`Eagle API is running on: http://localhost:${port}/api/v1`);
}

bootstrap();
