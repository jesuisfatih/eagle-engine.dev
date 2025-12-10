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
var MailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let MailService = MailService_1 = class MailService {
    config;
    logger = new common_1.Logger(MailService_1.name);
    constructor(config) {
        this.config = config;
    }
    async sendInvitation(email, companyName, invitationUrl) {
        this.logger.log(`📧 Sending invitation to ${email} for ${companyName}`);
        this.logger.log(`Invitation URL: ${invitationUrl}`);
        return {
            success: true,
            message: 'Invitation email sent',
            invitationUrl,
        };
    }
    async sendOrderConfirmation(email, orderId) {
        this.logger.log(`📧 Order confirmation sent to ${email} for order ${orderId}`);
        return { success: true };
    }
    async sendPasswordReset(email, resetUrl) {
        this.logger.log(`📧 Password reset sent to ${email}`);
        return { success: true, resetUrl };
    }
    async sendVerificationCode(email, code) {
        this.logger.log(`📧 Verification code sent to ${email}: ${code}`);
        return {
            success: true,
            message: 'Verification code sent',
            code,
        };
    }
};
exports.MailService = MailService;
exports.MailService = MailService = MailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MailService);
//# sourceMappingURL=mail.service.js.map