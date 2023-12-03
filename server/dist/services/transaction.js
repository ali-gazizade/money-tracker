"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Type = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const wallet_1 = __importDefault(require("../models/wallet"));
const contact_1 = __importDefault(require("../models/contact"));
const city_1 = __importDefault(require("../models/city"));
const currency_1 = __importDefault(require("../models/currency"));
const amount_1 = __importDefault(require("../models/amount"));
const transactionBase_1 = __importDefault(require("../models/transactionBase"));
const expense_1 = __importDefault(require("../models/expense"));
const transaction_1 = __importDefault(require("../assemblers/transaction"));
const income_1 = __importDefault(require("../models/income"));
const transfer_1 = __importDefault(require("../models/transfer"));
var Type;
(function (Type) {
    Type["Expense"] = "Expense";
    Type["Income"] = "Income";
    Type["Transfer"] = "Transfer";
})(Type || (exports.Type = Type = {}));
class Transaction {
    constructor(properties) {
        this.body = properties.body;
        this.type = properties.type;
        this.user = properties.user;
    }
    async validateBody() {
        const { from, to, amount, city } = this.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(city)) {
            return {
                error: 'Invalid "city" id:' + city
            };
        }
        else if (!mongoose_1.default.Types.ObjectId.isValid(amount?.currency)) {
            return {
                error: 'Invalid "currency" id:' + amount?.currency
            };
        }
        else if (!mongoose_1.default.Types.ObjectId.isValid(from)) {
            return {
                error: 'Invalid "from" id:' + from
            };
        }
        else if (!mongoose_1.default.Types.ObjectId.isValid(to)) {
            return {
                error: 'Invalid "to" id:' + to
            };
        }
        this.city = await city_1.default.findOne({ _id: city, user: this.user });
        this.currency = await currency_1.default.findOne({ _id: amount?.currency, user: this.user });
        if (this.type === Type.Expense) {
            this.from = await wallet_1.default.findOne({ _id: from, user: this.user });
            this.to = await contact_1.default.findOne({ _id: to, user: this.user });
        }
        else if (this.type === Type.Income) {
            this.from = await contact_1.default.findOne({ _id: from, user: this.user });
            this.to = await wallet_1.default.findOne({ _id: to, user: this.user });
        }
        else if (this.type === Type.Transfer) {
            this.from = await wallet_1.default.findOne({ _id: from, user: this.user });
            this.to = await wallet_1.default.findOne({ _id: to, user: this.user });
        }
        if (!this.city) {
            return {
                error: 'City not found with id:' + city
            };
        }
        else if (!this.currency) {
            return {
                error: 'Currency not found with id:' + amount?.currency
            };
        }
        else if (!this.from) {
            return {
                error: '"From" not found with id:' + from
            };
        }
        else if (!this.to) {
            return {
                error: '"To" not found with id:' + to
            };
        }
        return {
            error: null
        };
    }
    async createTransactionBase() {
        const savedAmount = await (new amount_1.default({
            value: this.body.amount.value,
            currency: this.body.amount.currency,
            user: this.user
        })).save();
        this.transactionBase = await (new transactionBase_1.default({
            amount: savedAmount._id,
            city: this.body.city,
            happenedAt: this.body.happenedAt,
            description: this.body.description,
            user: this.user
        })).save();
    }
    async create() {
        await this.createTransactionBase();
        const Model = (this.type === Type.Expense)
            ? expense_1.default
            : (this.type === Type.Income) ? income_1.default
                : transfer_1.default;
        const savedTransaction = await (new Model({
            transactionBase: this.transactionBase?._id,
            from: this.from,
            to: this.to,
            user: this.user
        })).save();
        const foundTransaction = await Model.findOne({ _id: savedTransaction._id }).populate([
            {
                path: 'transactionBase',
                populate: [
                    {
                        path: 'amount',
                        populate: { path: 'currency' }
                    },
                    { path: 'city' },
                ]
            },
            { path: 'from' },
            { path: 'to' }
        ]);
        if (!foundTransaction) {
            return {
                error: 'Unknown problem'
            };
        }
        return {
            result: (0, transaction_1.default)(foundTransaction)
        };
    }
}
exports.default = Transaction;
