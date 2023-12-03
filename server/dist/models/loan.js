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
exports.Loan = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const base_1 = __importDefault(require("./base"));
const contact_1 = require("./contact");
const amount_1 = require("./amount");
class Loan extends base_1.default {
}
exports.Loan = Loan;
__decorate([
    (0, typegoose_1.prop)({ ref: () => contact_1.Contact, required: true, unique: true }),
    __metadata("design:type", Object)
], Loan.prototype, "contact", void 0);
__decorate([
    (0, typegoose_1.prop)({ ref: () => amount_1.Amount, type: () => [amount_1.Amount], required: true }),
    __metadata("design:type", Array)
], Loan.prototype, "loanAmountsToUser", void 0);
__decorate([
    (0, typegoose_1.prop)({ default: 0 }),
    __metadata("design:type", Number)
], Loan.prototype, "version", void 0);
const LoanModel = (0, typegoose_1.getModelForClass)(Loan, {
    schemaOptions: {
        versionKey: false
    }
});
exports.default = LoanModel;
