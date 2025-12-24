import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { RedisService } from './redis/redis.service';
export declare class AppController {
    private readonly appService;
    private readonly prisma;
    private readonly redis;
    constructor(appService: AppService, prisma: PrismaService, redis: RedisService);
    getHello(): string;
    getHealth(): Promise<any>;
}
