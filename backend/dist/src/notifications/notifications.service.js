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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let NotificationsService = class NotificationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getNotifications(userId, companyId) {
        const recentActivity = await this.prisma.activityLog.findMany({
            where: {
                OR: [{ companyId }, { companyUserId: userId }],
            },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
        return recentActivity.map((activity) => ({
            id: activity.id,
            type: this.mapEventTypeToNotificationType(activity.eventType),
            title: this.generateTitle(activity.eventType),
            message: `Event: ${activity.eventType}`,
            isRead: false,
            createdAt: activity.createdAt,
        }));
    }
    mapEventTypeToNotificationType(eventType) {
        if (eventType.includes('order'))
            return 'order';
        if (eventType.includes('quote'))
            return 'quote';
        if (eventType.includes('approval'))
            return 'approval';
        return 'system';
    }
    generateTitle(eventType) {
        const titles = {
            product_view: 'Product Viewed',
            add_to_cart: 'Item Added to Cart',
            checkout_start: 'Checkout Started',
            order_created: 'New Order',
            quote_requested: 'Quote Requested',
        };
        return titles[eventType] || 'Activity';
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map