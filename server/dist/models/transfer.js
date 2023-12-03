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
exports.Transfer = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const base_1 = __importDefault(require("./base"));
const transactionBase_1 = require("./transactionBase");
const wallet_1 = require("./wallet");
class Transfer extends base_1.default {
}
exports.Transfer = Transfer;
__decorate([
    (0, typegoose_1.prop)({ ref: () => transactionBase_1.TransactionBase, required: true }),
    __metadata("design:type", Object)
], Transfer.prototype, "transactionBase", void 0);
__decorate([
    (0, typegoose_1.prop)({ ref: () => wallet_1.Wallet, required: true }),
    __metadata("design:type", Object)
], Transfer.prototype, "from", void 0);
__decorate([
    (0, typegoose_1.prop)({ ref: () => wallet_1.Wallet, required: true }),
    __metadata("design:type", Object)
], Transfer.prototype, "to", void 0);
const TransferModel = (0, typegoose_1.getModelForClass)(Transfer);
exports.default = TransferModel;
