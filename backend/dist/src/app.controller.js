"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const app_service_1 = require("./app.service");
const prisma_service_1 = require("./prisma/prisma.service");
const redis_service_1 = require("./redis/redis.service");
const public_decorator_1 = require("./auth/decorators/public.decorator");
let AppController = class AppController {
    appService;
    prisma;
    redis;
    constructor(appService, prisma, redis) {
        this.appService = appService;
        this.prisma = prisma;
        this.redis = redis;
    }
    getHello() {
        return this.appService.getHello();
    }
    async getHealth() {
        const checks = {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
        };
        try {
            await this.prisma.$queryRaw `SELECT 1`;
            checks.database = { status: 'ok' };
        }
        catch (error) {
            checks.database = { status: 'error', message: error.message };
            checks.status = 'degraded';
        }
        try {
            const client = this.redis.getClient();
            await client.ping();
            checks.redis = { status: 'ok' };
        }
        catch (error) {
            checks.redis = { status: 'error', message: error.message };
            checks.status = 'degraded';
        }
        return checks;
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)(),
    (0, public_decorator_1.Public)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], AppController.prototype, "getHello", null);
__decorate([
    (0, common_1.Get)('health'),
    (0, public_decorator_1.Public)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getHealth", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [app_service_1.AppService,
        prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], AppController);
//# sourceMappingURL=app.controller.js.map