"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BorrowerRepayerType = exports.Type = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const contact_1 = __importDefault(require("../models/contact"));
const currency_1 = __importDefault(require("../models/currency"));
const borrowing_1 = __importDefault(require("../models/borrowing"));
const repayment_1 = __importDefault(require("../models/repayment"));
const amount_1 = __importDefault(require("../models/amount"));
const loan_1 = __importDefault(require("../models/loan"));
const borrowing_2 = __importDefault(require("../assemblers/borrowing"));
const repayment_2 = __importDefault(require("../assemblers/repayment"));
var Type;
(function (Type) {
    Type["Borrowing"] = "Borrowing";
    Type["Repayment"] = "Repayment";
})(Type || (exports.Type = Type = {}));
var BorrowerRepayerType;
(function (BorrowerRepayerType) {
    BorrowerRepayerType["Contact"] = "Contact";
    BorrowerRepayerType["User"] = "User";
})(BorrowerRepayerType || (exports.BorrowerRepayerType = BorrowerRepayerType = {}));
class Loan {
    constructor(properties) {
        this.body = properties.body;
        this.type = properties.type;
        this.user = properties.user;
        this.bindedTransactionBaseId = properties.bindedTransactionBaseId;
    }
    async validateBody() {
        const { amount, contact, borrowerType, repayerType } = this.body;
        if (!mongoose_1.default.Types.ObjectId.isValid(contact)) {
            return {
                error: 'Invalid "contact" id:' + contact
            };
        }
        else if (!mongoose_1.default.Types.ObjectId.isValid(amount?.currency)) {
            return {
                error: 'Invalid "currency" id:' + amount?.currency
            };
        }
        this.currency = await currency_1.default.findOne({ _id: amount?.currency, user: this.user });
        this.contact = await contact_1.default.findOne({ _id: contact, user: this.user });
        if (!this.currency) {
            return {
                error: 'Currency not found with id:' + amount?.currency
            };
        }
        else if (!this.contact) {
            return {
                error: '"Contact" not found with id:' + contact
            };
        }
        if (this.type === Type.Borrowing) {
            if (!borrowerType || !Object.values(BorrowerRepayerType).includes(borrowerType)) {
                return {
                    error: '"BorrowerType" is not valid:' + borrowerType
                };
            }
        }
        else {
            if (!repayerType || !Object.values(BorrowerRepayerType).includes(repayerType)) {
                return {
                    error: '"RepayerType" is not valid:' + repayerType
                };
            }
        }
        return {
            error: null
        };
    }
    async calculateLoan() {
        let versionBefore = 0;
        let versionAfter = 0;
        let loanAmountsToUser = [];
        while (versionAfter != (versionBefore + 1)) {
            // Get the previous Version
            let loanBefore = await loan_1.default.findOne({ contact: this.contact?._id, user: this.user });
            if (!loanBefore) {
                loanBefore = await (new loan_1.default({ contact: this.contact?._id, user: this.user, loanAmountsToUser: [] })).save();
            }
            versionBefore = loanBefore?.version || 0;
            // End Get the previous Version
            // Clear the previous saved Amounts from db
            loanBefore.loanAmountsToUser = [];
            await loanBefore.save();
            await amount_1.default.deleteMany({ _id: { $in: loanAmountsToUser } });
            // End Clear the previous saved Amounts from db
            loanAmountsToUser = [];
            let loanAmountsObj = {};
            // Adding borrowings to loans in different currencies
            const borrowings = await borrowing_1.default.find({ contact: this.contact }).populate('amount');
            for (let borrowing of borrowings) {
                if (!loanAmountsObj[borrowing.amount.currency]) {
                    loanAmountsObj[borrowing.amount.currency] = 0;
                }
                if (borrowing.borrowerType === 'Contact') {
                    loanAmountsObj[borrowing.amount.currency] += +borrowing.amount.value;
                }
                else {
                    loanAmountsObj[borrowing.amount.currency] -= +borrowing.amount.value;
                }
            }
            // End Adding borrowings to loans in different currencies
            // Subtracting repayments
            const repayments = await repayment_1.default.find({ contact: this.contact }).populate('amount');
            for (let repayment of repayments) {
                if (!loanAmountsObj[repayment.amount.currency]) {
                    loanAmountsObj[repayment.amount.currency] = 0;
                }
                if (repayment.repayerType === 'Contact') {
                    loanAmountsObj[repayment.amount.currency] -= +repayment.amount.value;
                }
                else {
                    loanAmountsObj[repayment.amount.currency] += +repayment.amount.value;
                }
            }
            // End Subtracting repayments
            for (let currencyId in loanAmountsObj) {
                if (+(loanAmountsObj[currencyId]).toFixed(2) == 0) {
                    continue;
                }
                const savedAmount = await (new amount_1.default({
                    value: loanAmountsObj[currencyId],
                    currency: currencyId,
                    user: this.user
                })).save();
                loanAmountsToUser.push(savedAmount._id);
            }
            await loan_1.default.findOneAndUpdate({ _id: loanBefore._id }, {
                loanAmountsToUser,
                $inc: { version: 1 }
            });
            const loanAfter = await loan_1.default.findOne({ contact: this.contact?._id, user: this.user });
            versionAfter = loanAfter?.version || 0;
        }
    }
    async create() {
        const savedAmount = await (new amount_1.default({
            value: this.body.amount.value,
            currency: this.body.amount.currency,
            user: this.user
        })).save();
        const population = [
            {
                path: 'amount',
                populate: { path: 'currency' }
            },
            { path: 'contact' },
            { path: 'bindedTransactionBase' }
        ];
        if (this.type === Type.Borrowing) {
            const borrowingParams = {
                contact: this.body.contact,
                amount: savedAmount._id,
                description: this.body.description,
                bindedTransactionBase: this.bindedTransactionBaseId,
                borrowerType: this.body.borrowerType,
                borrowedAt: this.body.borrowedAt,
                repaymentExpectedAt: this.body.repaymentExpectedAt,
                user: this.user
            };
            const savedBorrowing = await (new borrowing_1.default(borrowingParams)).save();
            await this.calculateLoan();
            const foundBorrowing = await borrowing_1.default.findOne({ _id: savedBorrowing._id }).populate(population);
            if (!foundBorrowing) {
                return {
                    error: 'Unknown problem with borrowing'
                };
            }
            return {
                result: (0, borrowing_2.default)(foundBorrowing)
            };
        }
        else {
            // Check if there is a loan between the contact and the user
            const requiredLoanAmountToUser = this.body.repayerType === BorrowerRepayerType.Contact
                ? +this.body.amount.value
                : (-1 * +this.body.amount.value);
            let requiredAmountFound = false;
            const foundLoan = await loan_1.default.findOne({
                user: this.user,
                contact: this.contact?._id
            }).populate([
                {
                    path: 'loanAmountsToUser',
                    populate: { path: 'currency' }
                }
            ]);
            foundLoan?.loanAmountsToUser.forEach(e => {
                if (e.currency.id === this.body.amount.currency) {
                    if (requiredLoanAmountToUser < 0 && e.value <= requiredLoanAmountToUser) {
                        requiredAmountFound = true;
                    }
                    else if (requiredLoanAmountToUser > 0 && e.value >= requiredLoanAmountToUser) {
                        requiredAmountFound = true;
                    }
                }
            });
            if (!requiredAmountFound) {
                return {
                    error: 'Borrowing not found'
                };
            }
            // End Check if there is a loan between the contact and the user
            const repaymentParams = {
                contact: this.body.contact,
                amount: savedAmount._id,
                description: this.body.description,
                bindedTransactionBase: this.bindedTransactionBaseId,
                repayerType: this.body.repayerType,
                repaidAt: this.body.repaidAt,
                user: this.user
            };
            const savedRepayment = await (new repayment_1.default(repaymentParams)).save();
            this.calculateLoan();
            const foundRepayment = await repayment_1.default.findOne({ _id: savedRepayment._id }).populate(population);
            if (!foundRepayment) {
                return {
                    error: 'Unknown problem with repayment'
                };
            }
            return {
                result: (0, repayment_2.default)(foundRepayment)
            };
        }
    }
}
exports.default = Loan;
