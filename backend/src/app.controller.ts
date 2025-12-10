import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { RedisService } from './redis/redis.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  async getHealth() {
    const checks: any = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };

    // Check database
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      checks.database = { status: 'ok' };
    } catch (error) {
      checks.database = { status: 'error', message: error.message };
      checks.status = 'degraded';
    }

    // Check Redis
    try {
      const client = this.redis.getClient();
      await client.ping();
      checks.redis = { status: 'ok' };
    } catch (error) {
      checks.redis = { status: 'error', message: error.message };
      checks.status = 'degraded';
    }

    return checks;
  }
}
