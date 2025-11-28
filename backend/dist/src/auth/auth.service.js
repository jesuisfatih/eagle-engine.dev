"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
let AuthService = AuthService_1 = class AuthService {
    prisma;
    jwtService;
    config;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(prisma, jwtService, config) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.config = config;
    }
    async hashPassword(password) {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(password, salt);
    }
    async comparePasswords(password, hash) {
        return bcrypt.compare(password, hash);
    }
    async generateToken(payload) {
        return this.jwtService.sign(payload);
    }
    async generateRefreshToken(payload) {
        return this.jwtService.sign(payload, {
            secret: this.config.get('JWT_REFRESH_SECRET'),
            expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '30d'),
        });
    }
    async verifyToken(token) {
        try {
            return this.jwtService.verify(token);
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid token');
        }
    }
    async validateCompanyUser(email, password) {
        const user = await this.prisma.companyUser.findUnique({
            where: { email },
            include: { company: true },
        });
        if (!user || !user.passwordHash) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await this.comparePasswords(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('Account is inactive');
        }
        await this.prisma.companyUser.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });
        return user;
    }
    async loginCompanyUser(email, password) {
        const user = await this.validateCompanyUser(email, password);
        const payload = {
            sub: user.id,
            email: user.email,
            type: 'company_user',
            companyId: user.companyId,
            merchantId: user.company.merchantId,
        };
        const accessToken = await this.generateToken(payload);
        const refreshToken = await this.generateRefreshToken(payload);
        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                companyId: user.companyId,
            },
        };
    }
    async validateUser(email, password) {
        const user = await this.prisma.companyUser.findUnique({
            where: { email },
            include: { company: true },
        });
        if (user && password) {
            return user;
        }
        return null;
    }
    async findUserByEmail(email) {
        return this.prisma.companyUser.findUnique({
            where: { email },
            include: { company: true },
        });
    }
    async createUserFromShopify(data) {
        return this.prisma.companyUser.create({
            data: {
                email: data.email,
                shopifyCustomerId: BigInt(data.shopifyCustomerId),
                firstName: '',
                lastName: '',
                role: 'buyer',
                companyId: 'f0c2b2a5-4858-4d82-a542-5ce3bfe23a6d',
                isActive: true,
            },
            include: { company: true },
        });
    }
    async refreshToken(oldToken) {
        try {
            const decoded = this.jwtService.verify(oldToken);
            const user = await this.prisma.companyUser.findUnique({
                where: { id: decoded.sub },
                include: { company: true },
            });
            if (!user)
                return null;
            const payload = {
                sub: user.id,
                email: user.email,
                type: 'access',
            };
            return this.jwtService.sign(payload);
        }
        catch (error) {
            return null;
        }
    }
    async validateToken(token) {
        try {
            const decoded = this.jwtService.verify(token);
            const user = await this.prisma.companyUser.findUnique({
                where: { id: decoded.sub },
                include: { company: true },
            });
            return user;
        }
        catch (error) {
            return null;
        }
    }
    async acceptInvitation(body) {
        const token = body.token;
        const password = body.password;
        const user = await this.prisma.companyUser.findFirst({
            where: { invitationToken: token },
            include: { company: true },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid invitation token');
        }
        if (user.invitationAcceptedAt) {
            throw new common_1.UnauthorizedException('Invitation already accepted');
        }
        const passwordHash = await this.hashPassword(password);
        const updatedUser = await this.prisma.companyUser.update({
            where: { id: user.id },
            data: {
                passwordHash,
                firstName: body.firstName || user.firstName,
                lastName: body.lastName || user.lastName,
                invitationAcceptedAt: new Date(),
                invitationToken: null,
                isActive: true,
            },
            include: { company: true },
        });
        if (body.companyInfo) {
            await this.prisma.company.update({
                where: { id: user.companyId },
                data: {
                    name: body.companyInfo.name || user.company.name,
                    taxId: body.companyInfo.taxId,
                    phone: body.companyInfo.phone,
                    billingAddress: body.companyInfo.billingAddress,
                    status: 'active',
                },
            });
        }
        const payload = {
            sub: updatedUser.id,
            email: updatedUser.email,
            type: 'company_user',
            companyId: updatedUser.companyId,
            merchantId: user.company.merchantId,
        };
        const accessToken = await this.generateToken(payload);
        const refreshToken = await this.generateRefreshToken(payload);
        return {
            accessToken,
            refreshToken,
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                role: updatedUser.role,
                companyId: updatedUser.companyId,
            },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map