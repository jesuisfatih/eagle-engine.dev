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
var PrismaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
const config_1 = require("@nestjs/config");
let PrismaService = PrismaService_1 = class PrismaService {
    config;
    logger = new common_1.Logger(PrismaService_1.name);
    prisma;
    pool;
    constructor(config) {
        this.config = config;
        const dbUrl = this.config.get('DATABASE_URL') || process.env.DATABASE_URL;
        this.pool = new pg_1.Pool({ connectionString: dbUrl });
        const adapter = new adapter_pg_1.PrismaPg(this.pool);
        this.prisma = new client_1.PrismaClient({ adapter });
    }
    async $connect() {
        return this.prisma.$connect();
    }
    async $disconnect() {
        return this.prisma.$disconnect();
    }
    get merchant() {
        return this.prisma.merchant;
    }
    get shopifyCustomer() {
        return this.prisma.shopifyCustomer;
    }
    get company() {
        return this.prisma.company;
    }
    get companyUser() {
        return this.prisma.companyUser;
    }
    get catalogProduct() {
        return this.prisma.catalogProduct;
    }
    get catalogVariant() {
        return this.prisma.catalogVariant;
    }
    get pricingRule() {
        return this.prisma.pricingRule;
    }
    get cart() {
        return this.prisma.cart;
    }
    get cartItem() {
        return this.prisma.cartItem;
    }
    get orderLocal() {
        return this.prisma.orderLocal;
    }
    get activityLog() {
        return this.prisma.activityLog;
    }
    get discountCode() {
        return this.prisma.discountCode;
    }
    get syncLog() {
        return this.prisma.syncLog;
    }
    async onModuleInit() {
        try {
            await this.$connect();
            this.logger.log('✅ Database connected successfully');
        }
        catch (error) {
            this.logger.error('❌ Failed to connect to database', error);
            throw error;
        }
    }
    async onModuleDestroy() {
        await this.$disconnect();
        this.logger.log('Database disconnected');
    }
    async cleanDatabase() {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('Cannot clean database in production');
        }
        const models = Object.keys(this)
            .filter((key) => !key.startsWith('_') && !key.startsWith('$'))
            .filter((key) => typeof this[key] === 'object');
        return Promise.all(models.map((modelKey) => this[modelKey].deleteMany()));
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = PrismaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], PrismaService);
//# sourceMappingURL=prisma.service.js.map