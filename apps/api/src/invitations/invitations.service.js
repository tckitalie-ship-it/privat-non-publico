"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvitationsService = void 0;
var common_1 = require("@nestjs/common");
var crypto_1 = require("crypto");
var InvitationsService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var InvitationsService = _classThis = /** @class */ (function () {
        function InvitationsService_1(prisma, jwtService) {
            this.prisma = prisma;
            this.jwtService = jwtService;
        }
        InvitationsService_1.prototype.create = function (currentUser, dto) {
            return __awaiter(this, void 0, void 0, function () {
                var email, existingMembership, existingInvite, expiresAt;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!currentUser.associationId) {
                                throw new common_1.ForbiddenException('No active association selected');
                            }
                            if (!['OWNER', 'ADMIN'].includes(currentUser.role)) {
                                throw new common_1.ForbiddenException('Only OWNER or ADMIN can invite members');
                            }
                            email = dto.email.trim().toLowerCase();
                            return [4 /*yield*/, this.prisma.membership.findFirst({
                                    where: {
                                        associationId: currentUser.associationId,
                                        user: {
                                            email: email,
                                        },
                                    },
                                })];
                        case 1:
                            existingMembership = _a.sent();
                            if (existingMembership) {
                                throw new common_1.BadRequestException('User is already a member');
                            }
                            return [4 /*yield*/, this.prisma.invite.findFirst({
                                    where: {
                                        email: email,
                                        associationId: currentUser.associationId,
                                        status: 'PENDING',
                                    },
                                })];
                        case 2:
                            existingInvite = _a.sent();
                            if (existingInvite) {
                                throw new common_1.BadRequestException('Pending invite already exists');
                            }
                            expiresAt = new Date();
                            expiresAt.setDate(expiresAt.getDate() + 7);
                            return [2 /*return*/, this.prisma.invite.create({
                                    data: {
                                        email: email,
                                        role: dto.role,
                                        token: (0, crypto_1.randomBytes)(32).toString('hex'),
                                        associationId: currentUser.associationId,
                                        expiresAt: expiresAt,
                                    },
                                })];
                    }
                });
            });
        };
        InvitationsService_1.prototype.findAll = function (currentUser) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    if (!currentUser.associationId) {
                        throw new common_1.ForbiddenException('No active association selected');
                    }
                    return [2 /*return*/, this.prisma.invite.findMany({
                            where: {
                                associationId: currentUser.associationId,
                            },
                            orderBy: {
                                createdAt: 'desc',
                            },
                        })];
                });
            });
        };
        InvitationsService_1.prototype.accept = function (currentUser, token) {
            return __awaiter(this, void 0, void 0, function () {
                var invite, existingMembership, membership, accessToken;
                var _this = this;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!token) {
                                throw new common_1.BadRequestException('Token is required');
                            }
                            return [4 /*yield*/, this.prisma.invite.findUnique({
                                    where: {
                                        token: token,
                                    },
                                })];
                        case 1:
                            invite = _a.sent();
                            if (!invite) {
                                throw new common_1.NotFoundException('Invite not found');
                            }
                            if (invite.status !== 'PENDING') {
                                throw new common_1.BadRequestException('Invite already used');
                            }
                            if (invite.expiresAt < new Date()) {
                                throw new common_1.BadRequestException('Invite expired');
                            }
                            if (invite.email.toLowerCase() !== currentUser.email.toLowerCase()) {
                                throw new common_1.ForbiddenException('Invite email mismatch');
                            }
                            return [4 /*yield*/, this.prisma.membership.findFirst({
                                    where: {
                                        userId: currentUser.id,
                                        associationId: invite.associationId,
                                    },
                                })];
                        case 2:
                            existingMembership = _a.sent();
                            if (existingMembership) {
                                throw new common_1.BadRequestException('User is already a member');
                            }
                            return [4 /*yield*/, this.prisma.$transaction(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                                    var createdMembership;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, tx.membership.create({
                                                    data: {
                                                        userId: currentUser.id,
                                                        associationId: invite.associationId,
                                                        role: invite.role,
                                                    },
                                                })];
                                            case 1:
                                                createdMembership = _a.sent();
                                                return [4 /*yield*/, tx.invite.update({
                                                        where: {
                                                            id: invite.id,
                                                        },
                                                        data: {
                                                            status: 'ACCEPTED',
                                                        },
                                                    })];
                                            case 2:
                                                _a.sent();
                                                return [2 /*return*/, createdMembership];
                                        }
                                    });
                                }); })];
                        case 3:
                            membership = _a.sent();
                            accessToken = this.jwtService.sign({
                                sub: currentUser.id,
                                email: currentUser.email,
                                associationId: invite.associationId,
                                role: invite.role,
                            });
                            return [2 /*return*/, {
                                    success: true,
                                    access_token: accessToken,
                                    associationId: invite.associationId,
                                    role: invite.role,
                                    membership: membership,
                                }];
                    }
                });
            });
        };
        return InvitationsService_1;
    }());
    __setFunctionName(_classThis, "InvitationsService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        InvitationsService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return InvitationsService = _classThis;
}();
exports.InvitationsService = InvitationsService;
