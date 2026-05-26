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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinancesService = void 0;
var common_1 = require("@nestjs/common");
var ExcelJS = require("exceljs");
var FinancesService = function () {
    var _classDecorators = [(0, common_1.Injectable)()];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var FinancesService = _classThis = /** @class */ (function () {
        function FinancesService_1(prisma) {
            this.prisma = prisma;
        }
        FinancesService_1.prototype.createTransaction = function (currentUser, dto) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    if (!currentUser.associationId) {
                        throw new common_1.ForbiddenException('No active association selected');
                    }
                    return [2 /*return*/, this.prisma.transaction.create({
                            data: {
                                associationId: currentUser.associationId,
                                type: dto.type,
                                amountCents: dto.amountCents,
                                category: dto.category,
                                description: dto.description,
                                date: dto.date ? new Date(dto.date) : new Date(),
                            },
                        })];
                });
            });
        };
        FinancesService_1.prototype.findTransactions = function (currentUser) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    if (!currentUser.associationId) {
                        throw new common_1.ForbiddenException('No active association selected');
                    }
                    return [2 /*return*/, this.prisma.transaction.findMany({
                            where: {
                                associationId: currentUser.associationId,
                            },
                            orderBy: {
                                date: 'desc',
                            },
                        })];
                });
            });
        };
        FinancesService_1.prototype.getSummary = function (currentUser) {
            return __awaiter(this, void 0, void 0, function () {
                var transactions, incomeCents, expenseCents;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!currentUser.associationId) {
                                throw new common_1.ForbiddenException('No active association selected');
                            }
                            return [4 /*yield*/, this.prisma.transaction.findMany({
                                    where: {
                                        associationId: currentUser.associationId,
                                    },
                                })];
                        case 1:
                            transactions = _a.sent();
                            incomeCents = transactions
                                .filter(function (transaction) { return transaction.type === 'INCOME'; })
                                .reduce(function (sum, transaction) { return sum + transaction.amountCents; }, 0);
                            expenseCents = transactions
                                .filter(function (transaction) { return transaction.type === 'EXPENSE'; })
                                .reduce(function (sum, transaction) { return sum + transaction.amountCents; }, 0);
                            return [2 /*return*/, {
                                    incomeCents: incomeCents,
                                    expenseCents: expenseCents,
                                    balanceCents: incomeCents - expenseCents,
                                    transactionsCount: transactions.length,
                                }];
                    }
                });
            });
        };
        FinancesService_1.prototype.exportCsv = function (currentUser) {
            return __awaiter(this, void 0, void 0, function () {
                var transactions, header, escapeCsv, rows;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!currentUser.associationId) {
                                throw new common_1.ForbiddenException('No active association selected');
                            }
                            return [4 /*yield*/, this.prisma.transaction.findMany({
                                    where: {
                                        associationId: currentUser.associationId,
                                    },
                                    orderBy: {
                                        date: 'desc',
                                    },
                                })];
                        case 1:
                            transactions = _a.sent();
                            header = [
                                'id',
                                'type',
                                'category',
                                'description',
                                'amountCents',
                                'amount',
                                'date',
                                'createdAt',
                            ];
                            escapeCsv = function (value) {
                                if (value === null || value === undefined) {
                                    return '';
                                }
                                var stringValue = String(value).replace(/"/g, '""');
                                return "\"".concat(stringValue, "\"");
                            };
                            rows = transactions.map(function (transaction) {
                                var _a, _b;
                                return [
                                    transaction.id,
                                    transaction.type,
                                    (_a = transaction.category) !== null && _a !== void 0 ? _a : '',
                                    (_b = transaction.description) !== null && _b !== void 0 ? _b : '',
                                    transaction.amountCents,
                                    (transaction.amountCents / 100).toFixed(2),
                                    transaction.date.toISOString(),
                                    transaction.createdAt.toISOString(),
                                ];
                            });
                            return [2 /*return*/, __spreadArray([
                                    header.map(escapeCsv).join(',')
                                ], rows.map(function (row) { return row.map(escapeCsv).join(','); }), true).join('\n')];
                    }
                });
            });
        };
        FinancesService_1.prototype.exportXlsx = function (currentUser) {
            return __awaiter(this, void 0, void 0, function () {
                var transactions, workbook, sheet, buffer;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!currentUser.associationId) {
                                throw new common_1.ForbiddenException('No active association selected');
                            }
                            return [4 /*yield*/, this.prisma.transaction.findMany({
                                    where: {
                                        associationId: currentUser.associationId,
                                    },
                                    orderBy: {
                                        date: 'desc',
                                    },
                                })];
                        case 1:
                            transactions = _a.sent();
                            workbook = new ExcelJS.Workbook();
                            sheet = workbook.addWorksheet('Transactions');
                            sheet.columns = [
                                { header: 'Type', key: 'type', width: 15 },
                                { header: 'Category', key: 'category', width: 25 },
                                { header: 'Description', key: 'description', width: 30 },
                                { header: 'Amount', key: 'amount', width: 15 },
                                { header: 'Date', key: 'date', width: 25 },
                            ];
                            transactions.forEach(function (transaction) {
                                var _a, _b;
                                sheet.addRow({
                                    type: transaction.type,
                                    category: (_a = transaction.category) !== null && _a !== void 0 ? _a : '',
                                    description: (_b = transaction.description) !== null && _b !== void 0 ? _b : '',
                                    amount: transaction.amountCents / 100,
                                    date: transaction.date.toISOString(),
                                });
                            });
                            return [4 /*yield*/, workbook.xlsx.writeBuffer()];
                        case 2:
                            buffer = _a.sent();
                            return [2 /*return*/, Buffer.from(buffer)];
                    }
                });
            });
        };
        return FinancesService_1;
    }());
    __setFunctionName(_classThis, "FinancesService");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        FinancesService = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return FinancesService = _classThis;
}();
exports.FinancesService = FinancesService;
