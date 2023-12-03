"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const repaymentAssembler = (repayment) => {
    return {
        _id: repayment._id,
        contact: {
            _id: repayment.contact._id,
            name: repayment.contact.name
        },
        amount: {
            value: repayment.amount.value,
            currency: {
                _id: repayment.amount.currency._id,
                name: repayment.amount.currency.name,
            }
        },
        repayerType: repayment.repayerType,
        createdAt: repayment.createdAt,
        repaidAt: repayment.repaidAt,
        description: repayment.description,
        bindedTransactionBaseId: repayment.bindedTransactionBase?._id
    };
};
exports.default = repaymentAssembler;
