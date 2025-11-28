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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const session_sync_service_1 = require("./session-sync.service");
const public_decorator_1 = require("./decorators/public.decorator");
let AuthController = class AuthController {
    authService;
    sessionSyncService;
    constructor(authService, sessionSyncService) {
        this.authService = authService;
        this.sessionSyncService = sessionSyncService;
    }
    async login(body, res) {
        try {
            const user = await this.authService.validateUser(body.email, body.password);
            if (!user) {
                return res.status(common_1.HttpStatus.UNAUTHORIZED).json({
                    message: 'Invalid credentials',
                });
            }
            const token = await this.authService.generateToken(user);
            return res.json({
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    companyId: user.companyId,
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
    async acceptInvitation(body) {
        return this.authService.acceptInvitation(body);
    }
    async shopifyCustomerSync(body) {
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
    async getShopifySsoUrl(body, res) {
        return res.json({ ssoUrl: null, message: 'SSO handled client-side' });
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
], AuthController.prototype, "shopifyCustomerSync", null);
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
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('shopify-sso'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
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
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        session_sync_service_1.SessionSyncService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map