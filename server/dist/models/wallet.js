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
exports.Wallet = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const amount_1 = require("./amount");
const base_1 = __importDefault(require("./base"));
class Wallet extends base_1.default {
}
exports.Wallet = Wallet;
__decorate([
    (0, typegoose_1.prop)({ required: true }),
    __metadata("design:type", String)
], Wallet.prototype, "name", void 0);
__decorate([
    (0, typegoose_1.prop)({ ref: () => amount_1.Amount, type: () => [amount_1.Amount], required: true }),
    __metadata("design:type", Array)
], Wallet.prototype, "initialAmounts", void 0);
__decorate([
    (0, typegoose_1.prop)({ default: true }),
    __metadata("design:type", Boolean)
], Wallet.prototype, "active", void 0);
const WalletModel = (0, typegoose_1.getModelForClass)(Wallet);
exports.default = WalletModel;
