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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Repayment = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const base_1 = __importDefault(require("./base"));
const transactionBase_1 = require("./transactionBase");
const contact_1 = require("./contact");
const amount_1 = require("./amount");
var RepayerType;
(function (RepayerType) {
    RepayerType["Contact"] = "Contact";
    RepayerType["User"] = "User";
})(RepayerType || (RepayerType = {}));
class Repayment extends base_1.default {
}
exports.Repayment = Repayment;
__decorate([
    (0, typegoose_1.prop)({ ref: () => amount_1.Amount, required: true }),
    __metadata("design:type", Object)
], Repayment.prototype, "amount", void 0);
__decorate([
    (0, typegoose_1.prop)({ ref: () => contact_1.Contact, required: true }),
    __metadata("design:type", Object)
], Repayment.prototype, "contact", void 0);
__decorate([
    (0, typegoose_1.prop)({ enum: RepayerType, required: true }),
    __metadata("design:type", String)
], Repayment.prototype, "repayerType", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: Date, default: Date.now }),
    __metadata("design:type", Date)
], Repayment.prototype, "createdAt", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: Date }),
    __metadata("design:type", Date)
], Repayment.prototype, "repaidAt", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true }),
    __metadata("design:type", String)
], Repayment.prototype, "description", void 0);
__decorate([
    (0, typegoose_1.prop)({ ref: () => transactionBase_1.TransactionBase }),
    __metadata("design:type", Object)
], Repayment.prototype, "bindedTransactionBase", void 0);
const RepaymentModel = (0, typegoose_1.getModelForClass)(Repayment);
exports.default = RepaymentModel;
