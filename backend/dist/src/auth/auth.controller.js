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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AuthController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const session_sync_service_1 = require("./session-sync.service");
const public_decorator_1 = require("./decorators/public.decorator");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const current_user_decorator_1 = require("./decorators/current-user.decorator");
const shopify_sso_service_1 = require("../shopify/shopify-sso.service");
const shopify_customer_sync_service_1 = require("../shopify/shopify-customer-sync.service");
const shopify_rest_service_1 = require("../shopify/shopify-rest.service");
const prisma_service_1 = require("../prisma/prisma.service");
let AuthController = AuthController_1 = class AuthController {
    authService;
    sessionSyncService;
    shopifySso;
    shopifyCustomerSync;
    shopifyRest;
    prisma;
    logger = new common_1.Logger(AuthController_1.name);
    constructor(authService, sessionSyncService, shopifySso, shopifyCustomerSync, shopifyRest, prisma) {
        this.authService = authService;
        this.sessionSyncService = sessionSyncService;
        this.shopifySso = shopifySso;
        this.shopifyCustomerSync = shopifyCustomerSync;
        this.shopifyRest = shopifyRest;
        this.prisma = prisma;
    }
    async login(body, res) {
        try {
            const user = await this.authService.validateUser(body.email, body.password);
            if (!user) {
                return res.status(common_1.HttpStatus.UNAUTHORIZED).json({
                    message: 'Invalid credentials',
                });
            }
            const payload = {
                sub: user.id,
                email: user.email,
                type: 'company_user',
                companyId: user.companyId,
                merchantId: user.company?.merchantId,
            };
            const token = await this.authService.generateToken(payload);
            return res.json({
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    companyId: user.companyId,
                    merchantId: user.company?.merchantId,
                },
            });
        }
        catch (error) {
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Login failed',
                error: error.message,
            });
        }
    }
    async shopifyCallback(shopifyCustomerId, email, res) {
        try {
            const user = await this.authService.findUserByEmail(email);
            if (!user) {
                const newUser = await this.authService.createUserFromShopify({
                    email,
                    shopifyCustomerId,
                });
                const token = await this.authService.generateToken(newUser);
                return res.redirect(`https://accounts.eagledtfsupply.com/login?token=${token}&auto=true`);
            }
            const token = await this.authService.generateToken(user);
            return res.redirect(`https://accounts.eagledtfsupply.com/login?token=${token}&auto=true`);
        }
        catch (error) {
            return res.redirect('https://accounts.eagledtfsupply.com/login?error=shopify_auth_failed');
        }
    }
    async validateInvitation(token, res) {
        try {
            const user = await this.prisma.companyUser.findFirst({
                where: { invitationToken: token },
                include: { company: true },
            });
            if (!user) {
                return res.status(common_1.HttpStatus.NOT_FOUND).json({
                    error: 'Invalid invitation token',
                });
            }
            if (user.invitationAcceptedAt) {
                return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                    error: 'Invitation already accepted',
                });
            }
            return res.json({
                email: user.email,
                companyName: user.company.name,
                valid: true,
            });
        }
        catch (error) {
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                error: 'Failed to validate invitation',
            });
        }
    }
    async sendVerificationCode(body, res) {
        try {
            const result = await this.authService.sendVerificationCode(body.email);
            return res.json(result);
        }
        catch (error) {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                error: error.message || 'Failed to send verification code',
            });
        }
    }
    async verifyEmailCode(body, res) {
        try {
            const isValid = await this.authService.verifyEmailCode(body.email, body.code);
            return res.json({ valid: isValid });
        }
        catch (error) {
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                error: error.message || 'Failed to verify code',
            });
        }
    }
    async register(body, res) {
        try {
            this.logger.log(`📝 [REGISTER] Registration request received for email: ${body.email}`);
            const result = await this.authService.register(body);
            this.logger.log(`✅ [REGISTER] Registration successful for email: ${body.email}`);
            return res.json(result);
        }
        catch (error) {
            this.logger.error(`❌ [REGISTER] Registration failed for email: ${body.email}`, {
                error: error.message,
                stack: error.stack,
            });
            return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                error: error.message || 'Registration failed',
            });
        }
    }
    async acceptInvitation(body) {
        try {
            this.logger.log(`📝 [ACCEPT_INVITATION] Invitation acceptance request received for token: ${body.token?.substring(0, 10)}...`);
            const result = await this.authService.acceptInvitation(body);
            this.logger.log(`✅ [ACCEPT_INVITATION] Invitation accepted successfully`);
            return result;
        }
        catch (error) {
            this.logger.error(`❌ [ACCEPT_INVITATION] Invitation acceptance failed`, {
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }
    async syncShopifyCustomer(body) {
        return this.sessionSyncService.syncFromShopify(body.shopifyCustomerId, body.email, body.fingerprint);
    }
    async resolveContext(auth) {
        const token = auth?.replace('Bearer ', '');
        if (!token) {
            return { error: 'No token provided' };
        }
        try {
            const decoded = this.authService['jwtService'].verify(token);
            return this.sessionSyncService.resolveContext(decoded.sub);
        }
        catch (error) {
            return { error: 'Invalid token' };
        }
    }
    async refreshToken(body, res) {
        try {
            const newToken = await this.authService.refreshToken(body.token);
            if (!newToken) {
                return res.status(common_1.HttpStatus.UNAUTHORIZED).json({
                    message: 'Invalid or expired token',
                });
            }
            return res.json({ token: newToken });
        }
        catch (error) {
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                message: 'Token refresh failed',
            });
        }
    }
    async ping(res) {
        return res.json({ status: 'ok', timestamp: new Date().toISOString() });
    }
    async validateToken(body, res) {
        try {
            const user = await this.authService.validateToken(body.token);
            if (!user) {
                return res.status(common_1.HttpStatus.UNAUTHORIZED).json({
                    valid: false,
                });
            }
            return res.json({ valid: true, user });
        }
        catch (error) {
            return res.status(common_1.HttpStatus.UNAUTHORIZED).json({
                valid: false,
            });
        }
    }
    async getShopifySsoUrl(user, body, res) {
        try {
            if (!user.shopifyCustomerId) {
                await this.shopifyCustomerSync.syncUserToShopify(user.id);
                const updatedUser = await this.prisma.companyUser.findUnique({
                    where: { id: user.id },
                });
                if (updatedUser) {
                    user.shopifyCustomerId = updatedUser.shopifyCustomerId;
                }
            }
            const company = await this.prisma.company.findUnique({
                where: { id: user.companyId },
                include: { merchant: true },
            });
            if (!company?.merchant) {
                return res.status(common_1.HttpStatus.BAD_REQUEST).json({
                    error: 'Merchant not found',
                });
            }
            const settings = company.merchant.settings || {};
            const ssoMode = settings.ssoMode || 'alternative';
            const returnTo = body.returnTo || '/checkout';
            if (ssoMode === 'multipass' && settings.multipassSecret) {
                const ssoUrl = this.shopifySso.generateSsoUrl(company.merchant.shopDomain, settings.multipassSecret, {
                    email: user.email,
                    firstName: user.firstName || '',
                    lastName: user.lastName || '',
                    customerId: user.shopifyCustomerId?.toString(),
                    returnTo,
                });
                return res.json({
                    ssoUrl,
                    mode: 'multipass',
                });
            }
            else {
                try {
                    if (!user.shopifyCustomerId) {
                        throw new Error('Customer not synced to Shopify');
                    }
                    const inviteResponse = await this.shopifyRest.createCustomerInvite(company.merchant.shopDomain, company.merchant.accessToken, user.shopifyCustomerId.toString());
                    const inviteUrl = inviteResponse.customer_invite?.invite_url || '';
                    const tokenMatch = inviteUrl.match(/token=([^&]+)/);
                    const inviteToken = tokenMatch ? tokenMatch[1] : null;
                    if (inviteToken) {
                        const shopDomain = company.merchant.shopDomain;
                        const loginUrl = `https://${shopDomain}/account/login?email=${encodeURIComponent(user.email)}&token=${inviteToken}&return_to=${encodeURIComponent(returnTo)}`;
                        return res.json({
                            ssoUrl: loginUrl,
                            mode: 'customer_account_api',
                            message: 'Customer invite token created. User will be logged in automatically.',
                        });
                    }
                    else {
                        const shopDomain = company.merchant.shopDomain;
                        const loginUrl = `https://${shopDomain}/account/login?email=${encodeURIComponent(user.email)}&return_to=${encodeURIComponent(returnTo)}`;
                        return res.json({
                            ssoUrl: loginUrl,
                            mode: 'email_only',
                            message: 'Email pre-filled. Customer must enter password.',
                        });
                    }
                }
                catch (inviteError) {
                    this.logger.warn('Customer invite failed, using email-only login', inviteError);
                    const shopDomain = company.merchant.shopDomain;
                    const loginUrl = `https://${shopDomain}/account/login?email=${encodeURIComponent(user.email)}&return_to=${encodeURIComponent(returnTo)}`;
                    return res.json({
                        ssoUrl: loginUrl,
                        mode: 'email_only',
                        message: 'Email pre-filled. Customer must enter password.',
                    });
                }
            }
        }
        catch (error) {
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                error: `SSO generation failed: ${error.message}`,
            });
        }
    }
    async getCurrentUser(token, res) {
        try {
            const user = await this.authService.validateToken(token);
            if (!user) {
                return res.status(common_1.HttpStatus.UNAUTHORIZED).json({
                    message: 'Invalid token',
                });
            }
            return res.json({
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                companyId: user.companyId,
                shopifyCustomerId: user.shopifyCustomerId?.toString(),
            });
        }
        catch (error) {
            return res.status(common_1.HttpStatus.UNAUTHORIZED).json({
                message: 'Invalid token',
            });
        }
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('shopify-callback'),
    __param(0, (0, common_1.Query)('customer_id')),
    __param(1, (0, common_1.Query)('email')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "shopifyCallback", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('validate-invitation'),
    __param(0, (0, common_1.Query)('token')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "validateInvitation", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('send-verification-code'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "sendVerificationCode", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('verify-email-code'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyEmailCode", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('accept-invitation'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "acceptInvitation", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('shopify-customer-sync'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "syncShopifyCustomer", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('resolve'),
    __param(0, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resolveContext", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('refresh'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshToken", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('ping'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "ping", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('validate'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "validateToken", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('shopify-sso'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getShopifySsoUrl", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('user'),
    __param(0, (0, common_1.Query)('token')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getCurrentUser", null);
exports.AuthController = AuthController = AuthController_1 = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        session_sync_service_1.SessionSyncService,
        shopify_sso_service_1.ShopifySsoService,
        shopify_customer_sync_service_1.ShopifyCustomerSyncService,
        shopify_rest_service_1.ShopifyRestService,
        prisma_service_1.PrismaService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map