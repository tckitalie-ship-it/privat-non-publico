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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateEventDto = void 0;
var class_validator_1 = require("class-validator");
var CreateEventDto = function () {
    var _a;
    var _title_decorators;
    var _title_initializers = [];
    var _title_extraInitializers = [];
    var _description_decorators;
    var _description_initializers = [];
    var _description_extraInitializers = [];
    var _location_decorators;
    var _location_initializers = [];
    var _location_extraInitializers = [];
    var _startsAt_decorators;
    var _startsAt_initializers = [];
    var _startsAt_extraInitializers = [];
    var _endsAt_decorators;
    var _endsAt_initializers = [];
    var _endsAt_extraInitializers = [];
    return _a = /** @class */ (function () {
            function CreateEventDto() {
                this.title = __runInitializers(this, _title_initializers, void 0);
                this.description = (__runInitializers(this, _title_extraInitializers), __runInitializers(this, _description_initializers, void 0));
                this.location = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _location_initializers, void 0));
                this.startsAt = (__runInitializers(this, _location_extraInitializers), __runInitializers(this, _startsAt_initializers, void 0));
                this.endsAt = (__runInitializers(this, _startsAt_extraInitializers), __runInitializers(this, _endsAt_initializers, void 0));
                __runInitializers(this, _endsAt_extraInitializers);
            }
            return CreateEventDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _title_decorators = [(0, class_validator_1.IsString)()];
            _description_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _location_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsString)()];
            _startsAt_decorators = [(0, class_validator_1.IsDateString)()];
            _endsAt_decorators = [(0, class_validator_1.IsOptional)(), (0, class_validator_1.IsDateString)()];
            __esDecorate(null, null, _title_decorators, { kind: "field", name: "title", static: false, private: false, access: { has: function (obj) { return "title" in obj; }, get: function (obj) { return obj.title; }, set: function (obj, value) { obj.title = value; } }, metadata: _metadata }, _title_initializers, _title_extraInitializers);
            __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: function (obj) { return "description" in obj; }, get: function (obj) { return obj.description; }, set: function (obj, value) { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
            __esDecorate(null, null, _location_decorators, { kind: "field", name: "location", static: false, private: false, access: { has: function (obj) { return "location" in obj; }, get: function (obj) { return obj.location; }, set: function (obj, value) { obj.location = value; } }, metadata: _metadata }, _location_initializers, _location_extraInitializers);
            __esDecorate(null, null, _startsAt_decorators, { kind: "field", name: "startsAt", static: false, private: false, access: { has: function (obj) { return "startsAt" in obj; }, get: function (obj) { return obj.startsAt; }, set: function (obj, value) { obj.startsAt = value; } }, metadata: _metadata }, _startsAt_initializers, _startsAt_extraInitializers);
            __esDecorate(null, null, _endsAt_decorators, { kind: "field", name: "endsAt", static: false, private: false, access: { has: function (obj) { return "endsAt" in obj; }, get: function (obj) { return obj.endsAt; }, set: function (obj, value) { obj.endsAt = value; } }, metadata: _metadata }, _endsAt_initializers, _endsAt_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.CreateEventDto = CreateEventDto;
