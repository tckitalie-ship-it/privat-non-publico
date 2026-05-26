"use strict";
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
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
var __setFunctionName = (this && this.__setFunctionName) || function (f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinancesController = void 0;
var common_1 = require("@nestjs/common");
var jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
var association_active_guard_1 = require("../auth/association-active.guard");
var roles_decorator_1 = require("../auth/roles.decorator");
var roles_guard_1 = require("../auth/roles.guard");
var FinancesController = function () {
    var _classDecorators = [(0, common_1.Controller)('finances'), (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, association_active_guard_1.AssociationActiveGuard, roles_guard_1.RolesGuard)];
    var _classDescriptor;
    var _classExtraInitializers = [];
    var _classThis;
    var _instanceExtraInitializers = [];
    var _createTransaction_decorators;
    var _findTransactions_decorators;
    var _getSummary_decorators;
    var _exportCsv_decorators;
    var _exportXlsx_decorators;
    var FinancesController = _classThis = /** @class */ (function () {
        function FinancesController_1(financesService) {
            this.financesService = (__runInitializers(this, _instanceExtraInitializers), financesService);
        }
        FinancesController_1.prototype.createTransaction = function (req, dto) {
            return this.financesService.createTransaction(req.user, dto);
        };
        FinancesController_1.prototype.findTransactions = function (req) {
            return this.financesService.findTransactions(req.user);
        };
        FinancesController_1.prototype.getSummary = function (req) {
            return this.financesService.getSummary(req.user);
        };
        FinancesController_1.prototype.exportCsv = function (req) {
            return this.financesService.exportCsv(req.user);
        };
        FinancesController_1.prototype.exportXlsx = function (req) {
            return this.financesService.exportXlsx(req.user);
        };
        return FinancesController_1;
    }());
    __setFunctionName(_classThis, "FinancesController");
    (function () {
        var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
        _createTransaction_decorators = [(0, common_1.Post)('transactions'), (0, roles_decorator_1.Roles)('OWNER', 'ADMIN')];
        _findTransactions_decorators = [(0, common_1.Get)('transactions')];
        _getSummary_decorators = [(0, common_1.Get)('summary')];
        _exportCsv_decorators = [(0, common_1.Get)('export.csv'), (0, roles_decorator_1.Roles)('OWNER', 'ADMIN'), (0, common_1.Header)('Content-Type', 'text/csv'), (0, common_1.Header)('Content-Disposition', 'attachment; filename="transactions.csv"')];
        _exportXlsx_decorators = [(0, common_1.Get)('export.xlsx'), (0, roles_decorator_1.Roles)('OWNER', 'ADMIN'), (0, common_1.Header)('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'), (0, common_1.Header)('Content-Disposition', 'attachment; filename="transactions.xlsx"')];
        __esDecorate(_classThis, null, _createTransaction_decorators, { kind: "method", name: "createTransaction", static: false, private: false, access: { has: function (obj) { return "createTransaction" in obj; }, get: function (obj) { return obj.createTransaction; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _findTransactions_decorators, { kind: "method", name: "findTransactions", static: false, private: false, access: { has: function (obj) { return "findTransactions" in obj; }, get: function (obj) { return obj.findTransactions; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _getSummary_decorators, { kind: "method", name: "getSummary", static: false, private: false, access: { has: function (obj) { return "getSummary" in obj; }, get: function (obj) { return obj.getSummary; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _exportCsv_decorators, { kind: "method", name: "exportCsv", static: false, private: false, access: { has: function (obj) { return "exportCsv" in obj; }, get: function (obj) { return obj.exportCsv; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(_classThis, null, _exportXlsx_decorators, { kind: "method", name: "exportXlsx", static: false, private: false, access: { has: function (obj) { return "exportXlsx" in obj; }, get: function (obj) { return obj.exportXlsx; } }, metadata: _metadata }, null, _instanceExtraInitializers);
        __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
        FinancesController = _classThis = _classDescriptor.value;
        if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        __runInitializers(_classThis, _classExtraInitializers);
    })();
    return FinancesController = _classThis;
}();
exports.FinancesController = FinancesController;
